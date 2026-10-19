#!/usr/bin/env python3
"""Self-test of gecko_profile.py and zen_profile.py's hook analysis on synthetic data.

usage: python3 tools/engine-bench/profile/test_gecko_profile.py
"""
import gzip
import importlib.util
import json
from pathlib import Path
import sys
import tempfile
import unittest

HERE = Path(__file__).resolve().parent


def module(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


gp = module('gecko_profile', HERE / 'gecko_profile.py')


def thread(name, pid, samples, process_type='default'):
    strings = ['GeckoMain', 'bgraToRGBA (resource:///modules/axiosozo/CEFPresenter.sys.mjs:10:1)',
               'checkPendingReads (resource://gre/modules/subprocess/subprocess_common.sys.mjs:380:5)',
               '0x1100', 'PresShell::Paint', 'AxioSozoPixelRead']
    return dict(name=name, pid=pid, tid=pid, processType=process_type, stringTable=strings,
                frameTable=dict(schema=dict(location=0, relevantForJS=1, innerWindowID=2, implementation=3, line=4, column=5,
                                            category=6, subcategory=7),
                                data=[[1, False, 0, None, 10, 1, 2, 0],   # 0 bgraToRGBA (JS)
                                      [2, False, 0, None, 380, 5, 2, 0],  # 1 subprocess (JS)
                                      [3, False, 0, None, None, None, None, None],  # 2 native 0x1100
                                      [4, False, 0, None, None, None, 3, 0]]),      # 3 label PresShell::Paint (Layout)
                stackTable=dict(schema=dict(prefix=0, frame=1), data=[[None, 1], [0, 2], [None, 0], [None, 3]]),
                samples=dict(schema=dict(stack=0, time=1, eventDelay=2, threadCPUDelta=3), data=samples),
                markers=dict(schema=dict(name=0, startTime=1, endTime=2, phase=3, category=4, data=5),
                             data=[[5, 10.0, 12.5, 1, 0, None]]))


def profile():
    meta = dict(version=29, interval=1.0, startTime=1000.0, sampleUnits=dict(time='ms', eventDelay='ms', threadCPUDelta='ns'),
                categories=[dict(name='Idle'), dict(name='Other'), dict(name='JavaScript'), dict(name='Layout')])
    # stack 1 = subprocess -> native (native under JS), stack 2 = bgraToRGBA, stack 3 = PresShell::Paint; 1 ms CPU each
    main = [[1, t, 0, 1_000_000] for t in range(0, 10)] + [[2, t, 0, 1_000_000] for t in range(10, 15)] + [[3, 15, 0, 1_000_000]]
    child = dict(meta=dict(meta, startTime=1500.0), libs=[], threads=[thread('GeckoMain', 2, [[2, 0, 0, 2_000_000]], 'tab')])
    return dict(meta=meta, libs=[dict(start=0x1000, end=0x2000, offset=0, name='libfake.so', path='/nonexistent/libfake.so')],
                threads=[thread('GeckoMain', 1, main)], processes=[child])


class GeckoProfileTest(unittest.TestCase):
    def test_summary(self):
        s = gp.summarize(profile(), window=[1000.0, 1020.0], parent_pid=1, symbolicate=False)
        parent = s['processes'][0]
        self.assertTrue(parent['is_parent'])
        main = parent['threads'][0]
        self.assertEqual(main['samples'], 16)
        self.assertAlmostEqual(main['cpu_ms'], 16.0)
        self.assertEqual(main['categories']['JavaScript'], 15.0)
        self.assertEqual(main['categories']['Layout'], 1.0)
        self.assertEqual(main['js_split']['native_under_js'], 10.0)
        self.assertEqual(main['js_split']['js_leaf'], 5.0)
        self.assertEqual(main['js_split']['native_no_js'], 1.0)
        self.assertEqual(main['buckets_inclusive_ms']['subprocess_pipe_io'], 10.0)
        self.assertEqual(main['buckets_inclusive_ms']['bgra_to_rgba'], 5.0)
        self.assertEqual(main['buckets_inclusive_ms']['paint_layout'], 1.0)
        self.assertEqual(main['top_self'][0]['frame'], '[libfake.so]')
        self.assertEqual(main['markers']['AxioSozoPixelRead']['total_ms'], 2.5)
        # the child's only sample (1500 ms) lies outside the window
        self.assertEqual(len(s['processes']), 1)

    def test_trim(self):
        with tempfile.TemporaryDirectory() as tmp:
            out = Path(tmp) / 't.json.gz'
            report = gp.trim(profile(), [1000.0, 1005.0], 1, out, 4.5)
            self.assertEqual(report['steps'], ['full'])
            self.assertTrue(json.loads(gzip.decompress(out.read_bytes()))['threads'])


class HookAnalysisTest(unittest.TestCase):
    def setUp(self):
        sys.path.insert(0, str(HERE.parent.parents[1] / 'scripts'))
        try:
            self.zp = module('zen_profile', HERE / 'zen_profile.py')
        except ImportError as error:  # the GUI harness needs the repo's scripts/
            self.skipTest(str(error))

    def events(self):
        # key at 100; key request written at 101; frame header at 110, metadata, pixels done at 114;
        # ImageData at 116, put 116.5-117, chrome paint 125.
        return [['key', 100.0, 100.5], ['write', 1, 'key', 101.0],
                ['read', 1, 16, 102.0, 110.0, 16], ['read', 1, 300, 110.1, 110.2, 300],
                ['read', 1, 2_340_000, 110.2, 114.0, 2_340_000],
                ['imagedata', 116.0], ['put', 116.5, 117.0, 585000], ['paint', 125.0]]

    def test_key_breakdown(self):
        k = self.zp.key_breakdown(self.events())
        self.assertEqual(k['keys_with_frame'], 1)
        self.assertEqual(k['keydown_to_send_ms']['median'], 1.0)
        self.assertEqual(k['send_to_frame_header_ms']['median'], 9.0)
        self.assertEqual(k['pixel_transport_ms']['median'], 4.0)
        self.assertEqual(k['convert_ms']['median'], 2.0)
        self.assertEqual(k['keydown_to_chrome_paint_ms']['median'], 25.0)

    def test_frames(self):
        f = self.zp.frame_summary(self.events(), 1.0)
        self.assertEqual(f['frames_received'], 1)
        self.assertEqual(f['pixel_read_ms']['median'], 3.8)
        self.assertEqual(f['put_ms']['median'], 0.5)


if __name__ == '__main__':
    unittest.main()
