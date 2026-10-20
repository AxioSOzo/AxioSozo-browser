// TEST-ONLY timing hooks for tools/engine-bench/profile/zen_profile.py.
//
// Executed by the harness in the Zen browser window's privileged chrome scope over
// Marionette (the GUI harness's test-only -marionette/--remote-allow-system-access
// session). Nothing here is packaged or shipped, and no product file is changed: the
// hooks wrap, at runtime and in that one window, the generic platform entry points the
// engine adapters and presenters call, and only add timestamps:
//
//   SubprocessImpl.call           spawn time of every child process (basename only) and,
//                                 per spawned process, instance wrappers of
//   process.stdin.write           the request `method` of each JSON line (nothing else of
//                                 the line is read: it carries the host token)
//   process.stdout.read(n)        call and resolve time and byte count of each read (the
//                                 AXCF header, metadata and pixel reads)
//   ImageData constructor         end of the BGRA->RGBA conversion (its argument)
//   putImageData                  canvas upload start/end and pixel count
//   MozAfterPaint, keydown        chrome paints and chrome key events
//
// Every wrapper returns exactly what the original returns (the same promise object for
// reads), so adapter behaviour is unchanged. When the Gecko profiler is running, each
// pixel read and upload is also an `AxioSozo*` profiler marker.
//
// usage (chrome context): arguments = [command, value]
//   install | enable | disable | drain (returns and clears the events) | status
const [command, value] = arguments;
const win = window;
let S = win.__axioProfileHooks;
if (!S) {
  S = win.__axioProfileHooks = { enabled: false, events: [], max: 400000, dropped: 0, spawns: 0, installed: [] };
  const now = () => win.performance.now();
  const push = event => {
    if (!S.enabled) return;
    if (S.events.length < S.max) S.events.push(event); else S.dropped++;
  };
  const marker = (name, start, text) => {
    try { if (Services.profiler?.IsActive()) ChromeUtils.addProfilerMarker(name, { startTime: start, category: "Other" }, text); }
    catch {}
  };
  const bytes = buffer => { try { return buffer.byteLength; } catch { return -1; } };

  // Subprocess.sys.mjs's `Subprocess` is Object.freeze()d; its call() delegates at call time to
  // the platform SubprocessImpl (subprocess_unix.sys.mjs on Linux), which is a plain object.
  const url = "resource://gre/modules/subprocess/subprocess_unix.sys.mjs";
  let impl;
  try { ({ SubprocessImpl: impl } = ChromeUtils.importESModule(url, { global: "shared" })); S.module = "shared"; }
  catch { ({ SubprocessImpl: impl } = ChromeUtils.importESModule(url)); S.module = "default"; }
  const Subprocess = impl;
  const originalCall = Subprocess.call;
  Subprocess.call = function (options, ...rest) {
    const t0 = now();
    const tag = ++S.spawns;
    const name = String(options?.command ?? "").split("/").pop().slice(0, 64);
    const promise = originalCall.call(this, options, ...rest);
    promise.then(proc => {
      push(["spawn", tag, name, t0, now()]);
      const stdout = proc?.stdout, stdin = proc?.stdin;
      if (stdout && typeof stdout.read === "function") {
        const read = stdout.read;
        stdout.read = function (length, ...more) {
          const t = now();
          const result = read.call(this, length, ...more);
          if (S.enabled) result.then(buffer => {
            const done = now(), n = bytes(buffer);
            push(["read", tag, length ?? null, t, done, n]);
            if (n >= 65536) marker("AxioSozoPixelRead", t, `${n} B`);
          }, () => {});
          return result;
        };
      }
      if (stdin && typeof stdin.write === "function") {
        const write = stdin.write;
        stdin.write = function (data, ...more) {
          if (S.enabled) {
            const match = typeof data === "string" ? /"method":"([a-z_]{1,32})"/.exec(data) : null;
            push(["write", tag, match ? match[1] : null, now()]);
          }
          return write.call(this, data, ...more);
        };
      }
    }, () => {});
    return promise;
  };
  S.installed.push(Object.isFrozen(Subprocess) || Subprocess.call === originalCall ? "SubprocessImpl.call FAILED" : "SubprocessImpl.call");

  const OriginalImageData = win.ImageData;
  const WrappedImageData = new Proxy(OriginalImageData, {
    construct(target, args, newTarget) {
      push(["imagedata", now()]);
      return Reflect.construct(target, args, newTarget === WrappedImageData ? target : newTarget);
    },
  });
  win.ImageData = WrappedImageData;
  S.installed.push("ImageData");

  const proto = win.CanvasRenderingContext2D.prototype;
  const putImageData = proto.putImageData;
  proto.putImageData = function (imageData, ...rest) {
    if (!S.enabled) return putImageData.call(this, imageData, ...rest);
    const t = now();
    try { return putImageData.call(this, imageData, ...rest); }
    finally {
      const done = now();
      push(["put", t, done, imageData?.width * imageData?.height || 0]);
      marker("AxioSozoPutImageData", t, `${imageData?.width}x${imageData?.height}`);
    }
  };
  S.installed.push("putImageData");

  win.addEventListener("MozAfterPaint", () => push(["paint", now()]));
  win.addEventListener("keydown", event => push(["key", event.timeStamp, now()]), true);
  S.installed.push("MozAfterPaint", "keydown");
}
if (command === "enable") { S.events = []; S.dropped = 0; S.enabled = true; }
if (command === "disable") S.enabled = false;
if (command === "drain") {
  const out = { events: S.events, dropped: S.dropped, now: win.performance.now() };
  S.events = []; S.dropped = 0;
  return out;
}
return { enabled: S.enabled, installed: S.installed, module: S.module, spawns: S.spawns, profiler: !!Services.profiler,
         now: win.performance.now(), value: value ?? null };
