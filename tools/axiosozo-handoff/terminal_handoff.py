#!/Volumes/AxioSozoBuild/toolchains/zen/python/bin/python3.11
"""Fixed, fake-only macOS terminal handoff. No browser or UI dependencies."""
import base64
import binascii
import fcntl
import ctypes
import errno
import hashlib
import json
import os
import re
import signal
import stat
import struct
import subprocess
import sys
import time
import urllib.parse

ROOT = '/Volumes/AxioSozoBuild/workstation/handoff-terminal'
PYTHON = '/Volumes/AxioSozoBuild/toolchains/zen/python/bin/python3.11'
OPEN = '/usr/bin/open'
TERMINAL = '/System/Applications/Utilities/Terminal.app'
GUI_FAKE_SHA256 = 'aab2d96322dc34dce456713d7a67efeb47709b003736ae057434c53c417f036d'
MAX_INPUT = 2 * 1024 * 1024
_MAY_HAVE_LAUNCHED = False
_CANCELLED = False
WRAPPER = b'#!/bin/sh\nexec /Volumes/AxioSozoBuild/toolchains/zen/python/bin/python3.11 -I -S -B "${0%/*}/driver.py" --driver\n'
NAMES = ('context.json', 'launch.json', 'driver.py', 'launch.command', 'launch.lock',
         'ready.json', 'started.json', 'proceed', 'received', 'cancel', 'consumed', 'fake.py')


class Rejected(Exception):
    def __init__(self, code):
        self.code = code
        self.may_have_launched = False


def reject(condition, code='INVALID_REQUEST'):
    if not condition:
        raise Rejected(code)


def now_ms():
    return int(time.time() * 1000)


def text(value, limit):
    if not isinstance(value, str) or '\0' in value:
        return False
    try:
        value.encode('utf-8')
        return len(value.encode('utf-16-le')) // 2 <= limit
    except UnicodeError:
        return False


def integer(value, low, high):
    return type(value) is int and low <= value <= high


def exact(value, keys):
    return isinstance(value, dict) and set(value) == set(keys)


def safe_url(value):
    if not text(value, 4096):
        return False
    try:
        parsed = urllib.parse.urlsplit(value)
        return (parsed.scheme in ('http', 'https') and bool(parsed.hostname)
                and parsed.username is None and parsed.password is None
                and not parsed.query and not parsed.fragment and parsed.port != 0
                and not any(ord(c) < 33 or ord(c) == 127 for c in value))
    except ValueError:
        return False


def validate_context(value, cwd):
    reject(exact(value, ('version', 'request_id', 'created_at', 'project', 'page', 'console_errors', 'task')))
    reject(value['version'] == 1 and type(value['version']) is int)
    reject(isinstance(value['request_id'], str) and re.fullmatch(r'hf_[0-9a-f]{16}', value['request_id']))
    reject(integer(value['created_at'], now_ms() - 300000, now_ms() + 60000))
    project = value['project']
    reject(exact(project, ('id', 'root')) and text(project['id'], 128)
           and re.fullmatch(r'p_[a-z0-9]{4,32}', project['id']) and project['root'] == cwd)
    page = value['page']
    reject(exact(page, ('url', 'title', 'selection', 'screen')) and safe_url(page['url'])
           and text(page['title'], 512) and (page['selection'] is None or text(page['selection'], 16384)))
    image = page['screen']
    if image is not None:
        reject(exact(image, ('mime', 'width', 'height', 'data_base64')) and image['mime'] == 'image/png'
               and integer(image['width'], 1, 1280) and integer(image['height'], 1, 1280)
               and text(image['data_base64'], 1398104))
        try:
            raw = base64.b64decode(image['data_base64'], validate=True)
        except (ValueError, binascii.Error):
            raise Rejected('INVALID_REQUEST')
        reject(len(raw) <= 1048576 and base64.b64encode(raw).decode('ascii') == image['data_base64']
               and len(raw) >= 24 and raw[:16] == b'\x89PNG\r\n\x1a\n\0\0\0\rIHDR'
               and struct.unpack('>II', raw[16:24]) == (image['width'], image['height']))
    errors = value['console_errors']
    reject(isinstance(errors, list) and len(errors) <= 50)
    for error in errors:
        reject(exact(error, ('level', 'text', 'source', 'line', 'at'))
               and error['level'] in ('error', 'warning') and text(error['text'], 1000)
               and (error['source'] is None or safe_url(error['source']))
               and (error['line'] is None or integer(error['line'], 0, 10000000))
               and integer(error['at'], 0, now_ms() + 60000))
    reject(text(value['task'], 8192))


def open_dir(path, private=False):
    reject(isinstance(path, str) and path.startswith('/') and path == os.path.normpath(path), 'UNSAFE_PATH')
    fd = os.open('/', os.O_RDONLY | os.O_DIRECTORY)
    try:
        for part in path.split('/')[1:]:
            reject(part not in ('', '.', '..'), 'UNSAFE_PATH')
            following = os.open(part, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW, dir_fd=fd)
            os.close(fd)
            fd = following
            info = os.fstat(fd)
            reject(info.st_uid in (0, os.getuid()) and not stat.S_IMODE(info.st_mode) & 0o022, 'UNSAFE_PATH')
        if private:
            info = os.fstat(fd)
            reject(info.st_uid == os.getuid() and stat.S_IMODE(info.st_mode) == 0o700, 'UNSAFE_PATH')
        return fd
    except BaseException:
        os.close(fd)
        raise


def read_file_at(fd, name, limit, private=True):
    file_fd = os.open(name, os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK, dir_fd=fd)
    try:
        info = os.fstat(file_fd)
        valid = stat.S_ISREG(info.st_mode) and info.st_uid in (0, os.getuid()) and info.st_nlink == 1
        if private:
            valid = valid and info.st_uid == os.getuid() and stat.S_IMODE(info.st_mode) == 0o600
        else:
            valid = valid and not stat.S_IMODE(info.st_mode) & 0o022
        reject(valid, 'UNSAFE_PATH')
        reject(info.st_size <= limit, 'TOO_LARGE')
        data = bytearray()
        while len(data) <= limit:
            chunk = os.read(file_fd, min(65536, limit + 1 - len(data)))
            if not chunk:
                break
            data.extend(chunk)
        reject(len(data) <= limit, 'TOO_LARGE')
        return bytes(data)
    finally:
        os.close(file_fd)


def read_path(path, limit, private=True):
    parent_fd = open_dir(os.path.dirname(path), private=private)
    try:
        return read_file_at(parent_fd, os.path.basename(path), limit, private)
    finally:
        os.close(parent_fd)


def write_file(fd, name, value, mode=0o600):
    if not isinstance(value, bytes):
        value = json.dumps(value, ensure_ascii=False, separators=(',', ':'), allow_nan=False).encode('utf-8')
    temporary = '.pending-' + os.urandom(16).hex()
    file_fd = os.open(temporary, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, mode, dir_fd=fd)
    try:
        os.fchmod(file_fd, mode)
        view = memoryview(value)
        while view:
            written = os.write(file_fd, view)
            view = view[written:]
        os.fsync(file_fd)
    finally:
        os.close(file_fd)
    try:
        # Hard-link publication is atomic and refuses an existing destination.
        os.link(temporary, name, src_dir_fd=fd, dst_dir_fd=fd, follow_symlinks=False)
    finally:
        os.unlink(temporary, dir_fd=fd)


def json_data(raw):
    try:
        def pairs(items):
            result = {}
            for key, value in items:
                reject(key not in result)
                result[key] = value
            return result
        return json.loads(raw, object_pairs_hook=pairs, parse_constant=lambda _: (_ for _ in ()).throw(Rejected('INVALID_REQUEST')))
    except (ValueError, UnicodeError, RecursionError):
        raise Rejected('INVALID_REQUEST')


def policy_data(path):
    reject(isinstance(path, str) and re.fullmatch(re.escape(ROOT) + r'/config-[0-9a-f]{32}/policy\.json', path), 'INVALID_POLICY')
    raw = read_path(path, 32768)
    policy = json_data(raw)
    reject(exact(policy, ('version', 'fake_script', 'fake_script_sha256', 'projects', 'timeout_s'))
           and type(policy['version']) is int and policy['version'] == 1, 'INVALID_POLICY')
    reject(text(policy['fake_script'], 4096) and os.path.dirname(policy['fake_script']) == os.path.dirname(path)
           and policy['fake_script'].endswith('.py') and isinstance(policy['fake_script_sha256'], str)
           and re.fullmatch(r'[0-9a-f]{64}', policy['fake_script_sha256']), 'INVALID_POLICY')
    reject(isinstance(policy['projects'], list) and 1 <= len(policy['projects']) <= 32
           and all(text(p, 4096) for p in policy['projects'])
           and len(set(policy['projects'])) == len(policy['projects'])
           and integer(policy['timeout_s'], 1, 60), 'INVALID_POLICY')
    script = read_path(policy['fake_script'], 65536)
    reject(hashlib.sha256(script).hexdigest() == policy['fake_script_sha256'], 'POLICY_CHANGED')
    return policy, hashlib.sha256(raw).hexdigest(), script



def validate_gui_policy(path, policy, digest):
    # Only this fixed metadata operation is exposed to the native constructor.
    # It does not create launch state, read context, open Terminal or run a fixture.
    config = os.path.dirname(path)
    identity = os.path.basename(config)[7:]
    own = os.path.abspath(__file__)
    reject(os.path.dirname(own) == config and re.fullmatch(r'terminal-handoff-[0-9a-f]{64}\.py', os.path.basename(own)), 'INVALID_POLICY')
    parent_fd = open_dir(config, private=True)
    try:
        source = read_file_at(parent_fd, os.path.basename(own), 65536, private=False)
        info = os.stat(os.path.basename(own), dir_fd=parent_fd, follow_symlinks=False)
        reject(info.st_uid == os.getuid() and stat.S_IMODE(info.st_mode) == 0o400 and info.st_nlink == 1, 'UNSAFE_PATH')
        reject(hashlib.sha256(source).hexdigest() == os.path.basename(own)[17:-3], 'POLICY_CHANGED')
    finally:
        os.close(parent_fd)
    reject(policy['fake_script'] == config + '/fixture.py' and policy['fake_script_sha256'] == GUI_FAKE_SHA256, 'INVALID_POLICY')
    project_base = '/Volumes/AxioSozoBuild/workstation/gui-fixtures/handoff-' + identity
    for candidate in (ROOT, config, project_base, project_base + '/projects'):
        fd = open_dir(candidate, private=True)
        os.close(fd)
    for project in policy['projects']:
        reject(re.fullmatch(re.escape(project_base) + r'/projects/[a-z0-9][a-z0-9-]{0,63}', project), 'PROJECT_DENIED')
        fd = open_dir(project, private=True)
        os.close(fd)


def verify_gui_policy(path):
    policy, digest, _ = policy_data(path)
    validate_gui_policy(path, policy, digest)
    return {'version': 1, 'status': 'verified', 'policy_sha256': digest,
            'fixture_sha256': GUI_FAKE_SHA256}


def ensure_root():
    parent_fd = open_dir(os.path.dirname(ROOT))
    try:
        try:
            os.mkdir(os.path.basename(ROOT), 0o700, dir_fd=parent_fd)
        except FileExistsError:
            pass
    finally:
        os.close(parent_fd)
    return open_dir(ROOT, private=True)


def marker(fd, name):
    try:
        return read_file_at(fd, name, 0) == b''
    except FileNotFoundError:
        return False


def clean_state(root_fd, name, fd):
    pending = tuple(item for item in os.listdir(fd) if re.fullmatch(r'\.pending-[0-9a-f]{32}', item))
    for item in NAMES + pending:
        try:
            info = os.stat(item, dir_fd=fd, follow_symlinks=False)
            if stat.S_ISREG(info.st_mode) and info.st_uid == os.getuid():
                os.unlink(item, dir_fd=fd)
        except FileNotFoundError:
            pass
    try:
        actual = os.stat(name, dir_fd=root_fd, follow_symlinks=False)
        opened = os.fstat(fd)
        if (actual.st_dev, actual.st_ino) == (opened.st_dev, opened.st_ino):
            os.rmdir(name, dir_fd=root_fd)
            return True
    except (FileNotFoundError, OSError):
        pass
    return False


def request_cancel(_signum, _frame):
    # No exceptions, waits, filesystem work or nested process operations here.
    global _CANCELLED
    _CANCELLED = True


def check_cancelled():
    reject(not _CANCELLED, 'CANCELLED')


class DarwinSigInfo(ctypes.Structure):
    # Exact LP64 Darwin SDK sys/signal.h layout, not Linux siginfo_t.
    _fields_ = [('si_signo', ctypes.c_int), ('si_errno', ctypes.c_int),
                ('si_code', ctypes.c_int), ('si_pid', ctypes.c_int),
                ('si_uid', ctypes.c_uint), ('si_status', ctypes.c_int),
                ('si_addr', ctypes.c_void_p), ('si_value', ctypes.c_void_p),
                ('si_band', ctypes.c_long), ('padding', ctypes.c_ulong * 7)]


class DarwinChildObserver:
    # Python os.waitid is unavailable on macOS before 3.13. This fixed C adapter
    # obtains current direct-child authority without reaping it. No PATH lookup,
    # generic dynamic library, actor configuration or PID-file evidence is used.
    def __init__(self, library=None):
        reject(sys.platform == 'darwin' and ctypes.sizeof(ctypes.c_void_p) == 8
               and ctypes.sizeof(ctypes.c_int) == 4 and ctypes.sizeof(ctypes.c_long) == 8
               and ctypes.sizeof(DarwinSigInfo) == 104 and DarwinSigInfo.si_pid.offset == 12
               and DarwinSigInfo.si_status.offset == 20, 'HELPER_UNAVAILABLE')
        try:
            self.library = library if library is not None else ctypes.CDLL('/usr/lib/libSystem.B.dylib', use_errno=True)
            self.function = self.library.waitid
            self.function.argtypes = [ctypes.c_int, ctypes.c_uint, ctypes.POINTER(DarwinSigInfo), ctypes.c_int]
            self.function.restype = ctypes.c_int
        except (OSError, AttributeError):
            raise Rejected('HELPER_UNAVAILABLE')

    def observe(self, pid):
        reject(integer(pid, 1, 2147483647), 'HELPER_UNAVAILABLE')
        # P_PID=1; WEXITED=4 | WNOHANG=1 | WNOWAIT=32 (Darwin sys/wait.h).
        for _ in range(4):
            information = DarwinSigInfo()
            ctypes.set_errno(0)
            result = self.function(1, pid, ctypes.byref(information), 0x25)
            if result != 0:
                if ctypes.get_errno() == errno.EINTR:
                    continue
                raise Rejected('HELPER_UNAVAILABLE')
            if information.si_pid == 0:
                # Darwin leaves siginfo untouched for a running child. Reject an
                # unknown partial result instead of interpreting it as authority.
                reject(bytes(information) == bytes(ctypes.sizeof(DarwinSigInfo)), 'HELPER_UNAVAILABLE')
                return False  # Direct child exists, no exit status; never reaped.
            # XNU returns child identity/status, but does not populate si_uid.
            # P_PID's direct-child relation, not UID metadata, supplies authority.
            reject(information.si_pid == pid and information.si_signo == signal.SIGCHLD
                   and information.si_errno == 0 and information.si_code in (1, 2, 3), 'HELPER_UNAVAILABLE')
            return True  # Exited but WNOWAIT preserves PID/group authority.
        raise Rejected('HELPER_UNAVAILABLE')


class OwnedChild:
    """One retained unreaped Popen child, created with start_new_session=True.

    This helper is single-threaded, installs SIGCHLD default, and never calls
    poll/wait before the final release. Its flag-only signal handlers cannot
    reenter cleanup. Each group signal requires a fresh WNOWAIT observation.
    Descendants that leave this child's session/group are not claimed or killed.
    """
    def __init__(self, process, observer, clock=time.monotonic, sleep=time.sleep, send=None):
        self.process = process
        self.pid = process.pid
        self.observer = observer
        self.clock, self.sleep = clock, sleep
        self.send = os.killpg if send is None else send
        self.authority = True
        self.cleaning = False
        self.cleaned = False
        self.failed = False

    def exited(self):
        if not self.authority or self.process.returncode is not None:
            self.authority = False
            self.failed = True
            raise Rejected('HELPER_UNAVAILABLE')
        try:
            return self.observer.observe(self.pid)
        except (Rejected, OSError):
            self.authority = False
            self.failed = True
            raise Rejected('HELPER_UNAVAILABLE')

    def _signal(self, signum):
        # PID remains allocated to this direct child, including an exited zombie.
        # No code between this observation and send can reap the child; handlers
        # only set flags and there are no competing waiters/threads in the helper.
        self.exited()
        try:
            self.send(self.pid, signum)
        except ProcessLookupError:
            pass  # Owned leader retained, but its group can already be empty.

    def stop(self, grace=0.5):
        if self.cleaned:
            return True
        if self.failed or not self.authority or self.cleaning:
            return False
        self.cleaning = True
        try:
            self._signal(signal.SIGTERM)
            deadline = self.clock() + max(0, min(grace, 2.5))
            # Retain even an exited leader for the entire group grace interval.
            # Reaping on leader exit would remove authority over its descendants.
            while self.clock() < deadline:
                self.exited()
                self.sleep(min(0.01, max(0, deadline - self.clock())))
            self._signal(signal.SIGKILL)
            deadline = self.clock() + 0.5
            while not self.exited():
                if self.clock() >= deadline:
                    self.failed = True
                    self.authority = False
                    return False
                self.sleep(0.01)
            # No future group signal is allowed, even if this final wait fails.
            self.authority = False
            self.process.wait(timeout=0)
            self.cleaned = True
            return True
        except (Rejected, OSError, subprocess.SubprocessError):
            self.authority = False
            self.failed = True
            return False
        finally:
            self.cleaning = False

    def release(self):
        # A successfully acknowledged independent driver belongs to its session.
        # Abandon signal authority before allowing Popen's own destructor/reaper.
        self.authority = False


# Authority is constructor-local, never a JSON field or caller-supplied flag.
_GUI_LEAF_AUTHORITY = object()


class OwnedFixtureLeaf(OwnedChild):
    """Only the immutable, checksum-pinned GUI fake, which creates no children.

    Unlike a generic session owner, this owner signals only its exact direct
    child. A fresh non-reaping exit permits final reap without a group signal.
    """
    def __init__(self, process, observer, authority, **kwargs):
        reject(authority is _GUI_LEAF_AUTHORITY, 'HELPER_UNAVAILABLE')
        kwargs.setdefault('send', os.kill)
        super().__init__(process, observer, **kwargs)

    def _signal(self, signum):
        # The fixed leaf can exit between checks, but cannot be reaped here.
        # Do not signal an already-exited child or any process group.
        if self.exited():
            return
        try:
            self.send(self.pid, signum)
        except ProcessLookupError:
            pass

    def stop(self, grace=0.5):
        if self.cleaned:
            return True
        if self.failed or not self.authority or self.cleaning:
            return False
        self.cleaning = True
        try:
            if not self.exited():
                self._signal(signal.SIGTERM)
                deadline = self.clock() + max(0, min(grace, 2.5))
                while not self.exited() and self.clock() < deadline:
                    self.sleep(min(0.01, max(0, deadline - self.clock())))
                if not self.exited():
                    self._signal(signal.SIGKILL)
                deadline = self.clock() + 0.5
                while not self.exited():
                    if self.clock() >= deadline:
                        self.failed = True
                        self.authority = False
                        return False
                    self.sleep(0.01)
            self.authority = False
            self.process.wait(timeout=0)
            self.cleaned = True
            return True
        except (Rejected, OSError, subprocess.SubprocessError):
            self.authority = False
            self.failed = True
            return False
        finally:
            self.cleaning = False


def spawn_gui_leaf(source, pointer, observer):
    # Execute the exact immutable bytes verified here through -c. Reopening a
    # mutable script pathname after verification could invalidate leaf authority.
    check_cancelled()
    reject(type(source) is bytes and hashlib.sha256(source).hexdigest() == GUI_FAKE_SHA256,
           'POLICY_CHANGED')
    reject(text(pointer, 4096), 'INVALID_REQUEST')
    value = json_data(pointer)
    reject(exact(value, ('version', 'context_file')) and type(value['version']) is int
           and value['version'] == 1 and isinstance(value['context_file'], str)
           and re.fullmatch(re.escape(ROOT) + r'/launch-[0-9a-f]{32}/context\.json', value['context_file']),
           'INVALID_REQUEST')
    reject(signal.getsignal(signal.SIGCHLD) == signal.SIG_DFL, 'HELPER_UNAVAILABLE')
    arguments = [PYTHON, '-I', '-S', '-B', '-c', source.decode('utf-8'), pointer]
    process = subprocess.Popen(arguments, env=child_env(), stdin=subprocess.DEVNULL,
                               stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                               start_new_session=True, close_fds=True)
    return OwnedFixtureLeaf(process, observer, _GUI_LEAF_AUTHORITY)


def spawn_owned(arguments, observer):
    check_cancelled()
    reject(signal.getsignal(signal.SIGCHLD) == signal.SIG_DFL, 'HELPER_UNAVAILABLE')
    # Flag-only handlers cannot raise between successful Popen and ownership.
    process = subprocess.Popen(arguments, env=child_env(), stdin=subprocess.DEVNULL,
                               stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                               start_new_session=True, close_fds=True)
    return OwnedChild(process, observer)


def stop_owned(child, grace=0.5):
    if child is None:
        return True
    # A raw Popen/PID or receipt is deliberately insufficient for group signals.
    return isinstance(child, OwnedChild) and child.stop(grace)


def child_env():
    return {'PATH': '/usr/bin:/bin:/usr/sbin:/sbin', 'LANG': 'C', 'AXIOSOZO_HANDOFF_FAKE': '1'}


def driver():
    path = os.path.dirname(os.path.abspath(__file__))
    name = os.path.basename(path)
    reject(os.path.dirname(path) == ROOT and re.fullmatch(r'launch-[0-9a-f]{32}', name), 'UNSAFE_PATH')
    observer = DarwinChildObserver()  # Fail before acquiring descriptors or spawning.
    root_fd = open_dir(ROOT, private=True)
    fd = None
    child = None
    lock_fd = None
    lock_acquired = False
    try:
        fd = open_dir(path, private=True)
        check_cancelled()
        lock_fd = os.open('launch.lock', os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK, dir_fd=fd)
        lock_info = os.fstat(lock_fd)
        reject(stat.S_ISREG(lock_info.st_mode) and lock_info.st_uid == os.getuid()
               and stat.S_IMODE(lock_info.st_mode) == 0o600, 'UNSAFE_PATH')
        fcntl.flock(lock_fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
        lock_acquired = True
        launch = json_data(read_file_at(fd, 'launch.json', 8192))
        reject(exact(launch, ('version', 'policy_path', 'policy_sha256', 'cwd', 'cwd_identity', 'expires_ms'))
               and type(launch['version']) is int and launch['version'] == 1
               and integer(launch['expires_ms'], now_ms() + 1, now_ms() + 30000), 'EXPIRED')
        reject(not marker(fd, 'cancel'), 'CANCELLED')
        policy, digest, fake_source = policy_data(launch['policy_path'])
        reject(hashlib.sha256(fake_source).hexdigest() == GUI_FAKE_SHA256, 'POLICY_CHANGED')
        reject(digest == launch['policy_sha256'] and launch['cwd'] in policy['projects'], 'POLICY_CHANGED')
        context = json_data(read_file_at(fd, 'context.json', MAX_INPUT))
        validate_context(context, launch['cwd'])
        cwd_fd = open_dir(launch['cwd'])
        try:
            current = os.fstat(cwd_fd)
            reject(launch['cwd_identity'] == [current.st_dev, current.st_ino], 'PROJECT_CHANGED')
            check_cancelled()
            write_file(fd, 'consumed', b'')
            write_file(fd, 'fake.py', fake_source)
            write_file(fd, 'ready.json', {'version': 1, 'status': 'prepared'})
            deadline = time.monotonic() + 5
            while not marker(fd, 'proceed'):
                check_cancelled()
                reject(not marker(fd, 'cancel') and now_ms() < launch['expires_ms']
                       and time.monotonic() < deadline, 'CANCELLED')
                time.sleep(0.01)
            check_cancelled()
            reject(not marker(fd, 'cancel') and now_ms() < launch['expires_ms'], 'CANCELLED')
            # A held directory descriptor prevents cwd symlink replacement between validation and launch.
            os.fchdir(cwd_fd)
            pointer = json.dumps({'version': 1, 'context_file': path + '/context.json'}, separators=(',', ':'))
            child = spawn_gui_leaf(fake_source, pointer, observer)
            check_cancelled()
            write_file(fd, 'started.json', {'version': 1, 'status': 'started'})
            deadline = time.monotonic() + policy['timeout_s']
            while not child.exited():
                check_cancelled()
                if marker(fd, 'cancel') or time.monotonic() >= deadline:
                    break
                time.sleep(0.01)
            # Only the pinned leaf is owned here; reap it without group claims.
            reject(stop_owned(child), 'HELPER_UNAVAILABLE')
            deadline = time.monotonic() + 3
            while not marker(fd, 'received') and time.monotonic() < deadline:
                check_cancelled()
                time.sleep(0.01)
        finally:
            os.close(cwd_fd)
    finally:
        child_cleaned = stop_owned(child)
        if lock_acquired and child_cleaned and fd is not None:
            clean_state(root_fd, name, fd)
        if lock_fd is not None:
            os.close(lock_fd)
        if fd is not None:
            os.close(fd)
        os.close(root_fd)


def wait_record(fd, filename, deadline):
    while time.monotonic() < deadline:
        check_cancelled()
        try:
            value = json_data(read_file_at(fd, filename, 128))
            reject(exact(value, ('version', 'status')) and value['version'] == 1, 'DRIVER_FAILED')
            check_cancelled()
            return value
        except FileNotFoundError:
            time.sleep(0.01)
    raise Rejected('LAUNCH_TIMEOUT')


def launch(request, policy_path, expected_policy_digest=None):
    global _MAY_HAVE_LAUNCHED
    reject(isinstance(request, dict), 'INVALID_REQUEST')
    if request.get('agent') in ('codex', 'claude-code') or request.get('live_authorized') is not False:
        raise Rejected('NOT_AUTHORIZED')
    reject(exact(request, ('version', 'agent', 'mode', 'cwd', 'context', 'live_authorized', 'test_only'))
           and type(request['version']) is int and request['version'] == 1
           and request['agent'] == 'fake' and request['test_only'] is True
           and request['mode'] in ('terminal', 'headless'), 'INVALID_REQUEST')
    policy, digest, _ = policy_data(policy_path)
    if expected_policy_digest is not None:
        reject(isinstance(expected_policy_digest, str) and re.fullmatch(r'[0-9a-f]{64}', expected_policy_digest)
               and digest == expected_policy_digest, 'POLICY_CHANGED')
        validate_gui_policy(policy_path, policy, digest)
    reject(text(request['cwd'], 4096) and request['cwd'] in policy['projects'], 'PROJECT_DENIED')
    validate_context(request['context'], request['cwd'])
    check_cancelled()
    observer = DarwinChildObserver()
    cwd_fd = open_dir(request['cwd'])
    current = os.fstat(cwd_fd)
    cwd_identity = [current.st_dev, current.st_ino]
    os.close(cwd_fd)
    root_fd = None
    name = None
    fd = None
    owned_driver = None
    started = False
    proceeded = False
    cleanup_lock_fd = None
    try:
        root_fd = ensure_root()
        name = 'launch-' + os.urandom(16).hex()
        os.mkdir(name, 0o700, dir_fd=root_fd)
        fd = os.open(name, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW, dir_fd=root_fd)
        path = ROOT + '/' + name
        write_file(fd, 'context.json', request['context'])
        write_file(fd, 'launch.json', {'version': 1, 'policy_path': policy_path, 'policy_sha256': digest,
                                     'cwd': request['cwd'], 'cwd_identity': cwd_identity, 'expires_ms': now_ms() + 30000})
        own_source = read_path(os.path.abspath(__file__), 65536, private=False)
        write_file(fd, 'driver.py', own_source)
        write_file(fd, 'launch.command', WRAPPER, 0o700)
        write_file(fd, 'launch.lock', b'')
        cleanup_lock_fd = os.open('launch.lock', os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK, dir_fd=fd)
        deadline = time.monotonic() + 8
        if request['mode'] == 'headless':
            owned_driver = spawn_owned([PYTHON, '-I', '-S', '-B', path + '/driver.py', '--driver'], observer)
            check_cancelled()
        else:
            check_cancelled()
            dispatched = subprocess.run([OPEN, '-a', TERMINAL, path + '/launch.command'],
                                        env=child_env(), stdin=subprocess.DEVNULL,
                                        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                                        timeout=3, close_fds=True)
            check_cancelled()
            reject(dispatched.returncode == 0, 'TERMINAL_UNAVAILABLE')
        reject(wait_record(fd, 'ready.json', deadline)['status'] == 'prepared', 'DRIVER_FAILED')
        check_cancelled()
        # Conservatively latch possibility before permission becomes visible.
        proceeded = True
        _MAY_HAVE_LAUNCHED = True
        write_file(fd, 'proceed', b'')
        check_cancelled()
        reject(wait_record(fd, 'started.json', deadline)['status'] == 'started', 'DRIVER_FAILED')
        check_cancelled()
        write_file(fd, 'received', b'')
        check_cancelled()
        started = True
        return {'version': 1, 'status': 'handed_off', 'agent': 'fake', 'may_have_launched': True, 'launch_id': name[7:]}
    except (Rejected, OSError, ValueError, subprocess.SubprocessError) as error:
        if proceeded:
            uncertain = Rejected('LAUNCH_UNCERTAIN')
            uncertain.may_have_launched = True
            raise uncertain from error
        raise
    finally:
        if not started and root_fd is not None:
            if fd is None and name is not None:
                try:
                    fd = os.open(name, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW, dir_fd=root_fd)
                except OSError:
                    pass
            try:
                if fd is not None:
                    write_file(fd, 'cancel', b'')
            except OSError:
                pass
            driver_cleaned = stop_owned(owned_driver, grace=2.5)
            try:
                if cleanup_lock_fd is not None:
                    fcntl.flock(cleanup_lock_fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
                if fd is not None and driver_cleaned:
                    clean_state(root_fd, name, fd)
            except OSError:
                # An owning driver observes cancel; already removed state needs no cleanup.
                pass
        if started and owned_driver is not None:
            owned_driver.release()
        if cleanup_lock_fd is not None:
            os.close(cleanup_lock_fd)
        if fd is not None:
            os.close(fd)
        if root_fd is not None:
            os.close(root_fd)


def main():
    os.umask(0o077)
    for signum in (signal.SIGTERM, signal.SIGINT, signal.SIGHUP):
        signal.signal(signum, request_cancel)
    signal.signal(signal.SIGCHLD, signal.SIG_DFL)
    if sys.argv[1:] == ['--driver']:
        try:
            driver()
            return 0
        except (Rejected, OSError, ValueError, subprocess.SubprocessError):
            return 1
    try:
        if len(sys.argv) == 3 and sys.argv[1] == '--verify-policy':
            check_cancelled()
            result = verify_gui_policy(sys.argv[2])
            check_cancelled()
            print(json.dumps(result, separators=(',', ':'), allow_nan=False))
            return 0
        gui = len(sys.argv) == 4 and sys.argv[1] == '--gui-policy'
        reject(gui or len(sys.argv) == 3 and sys.argv[1] == '--policy', 'INVALID_REQUEST')
        raw = sys.stdin.buffer.read(MAX_INPUT + 1)
        reject(len(raw) <= MAX_INPUT, 'TOO_LARGE')
        check_cancelled()
        result = launch(json_data(raw), sys.argv[2], sys.argv[3] if gui else None)
        check_cancelled()
    except Rejected as error:
        possible = _MAY_HAVE_LAUNCHED or error.may_have_launched
        result = {'version': 1, 'status': 'denied',
                  'reason': 'LAUNCH_UNCERTAIN' if possible else error.code,
                  'may_have_launched': possible}
    except (OSError, ValueError, TypeError, subprocess.SubprocessError):
        result = {'version': 1, 'status': 'denied',
                  'reason': 'LAUNCH_UNCERTAIN' if _MAY_HAVE_LAUNCHED else 'HELPER_UNAVAILABLE',
                  'may_have_launched': _MAY_HAVE_LAUNCHED}
    print(json.dumps(result, separators=(',', ':'), allow_nan=False))
    return 0 if result['status'] == 'handed_off' else 1


if __name__ == '__main__':
    sys.exit(main())
