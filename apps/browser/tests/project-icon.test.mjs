/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
// Project icons (workstation-v1 §1.5): bytes from the containment reader become
// a data: URL only for supported images whose bytes match their type.
import test from "node:test";
import assert from "node:assert/strict";
import * as core from "../../../packages/contexts/src/index.mjs";
import { iconType, encodeBase64, iconDataUrl, readProjectIcon, MAX_ICON_BYTES } from "../chrome/ProjectIcon.sys.mjs";

const bytes = (...values) => new Uint8Array(values);
const text = value => new TextEncoder().encode(value);
const PNG = bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13);

test("image types follow the bytes and the extension together", () => {
  assert.equal(iconType(PNG, "a/icon.png"), "image/png");
  assert.equal(iconType(PNG, "a/icon.PNG"), "image/png");
  assert.equal(iconType(PNG, "a/icon.jpg"), null, "a PNG named .jpg is refused");
  assert.equal(iconType(bytes(0xff, 0xd8, 0xff, 0xe0), "logo.jpeg"), "image/jpeg");
  assert.equal(iconType(bytes(0, 0, 1, 0, 1, 0), "favicon.ico"), "image/x-icon");
  assert.equal(iconType(text("RIFF\u0000\u0000\u0000\u0000WEBPVP8 "), "icon.webp"), "image/webp");
  assert.equal(iconType(text('<?xml version="1.0"?>\n<!-- logo -->\n<svg xmlns="http://www.w3.org/2000/svg"><circle r="1"/></svg>'), "logo.svg"), "image/svg+xml");
  for (const svg of ['<svg><script>alert(1)</script></svg>', '<svg onload="x()"></svg>', '<!DOCTYPE svg [<!ENTITY a "b">]><svg/>',
    '<svg><image href="https://tracker.example/x.png"/></svg>', '<svg><foreignObject/></svg>', '<html><svg/></html>']) {
    assert.equal(iconType(text(svg), "logo.svg"), null, svg);
  }
  assert.equal(iconType(text('<svg><use href="#a"/><image href="data:image/png;base64,AAAA"/></svg>'), "logo.svg"), "image/svg+xml");
  assert.equal(iconType(bytes(0xff, 0xfe, 0x00, 0x3c), "logo.svg"), null, "not UTF-8");
  assert.equal(iconType(new Uint8Array(MAX_ICON_BYTES + 1), "icon.png"), null);
  assert.equal(iconType(PNG, "icon.gif"), null);
});

test("base64 matches the platform encoder", () => {
  for (const sample of [[], [0], [0, 1], [0, 1, 2], [255, 254, 253, 252], Array.from({ length: 300 }, (_, i) => (i * 37) % 256)]) {
    assert.equal(encodeBase64(new Uint8Array(sample)), Buffer.from(sample).toString("base64"));
  }
  assert.equal(iconDataUrl(PNG, "icon.png"), `data:image/png;base64,${Buffer.from(PNG).toString("base64")}`);
});

test("reading goes through exact identities and the core's icon policy; refusals are null, never a fallback", async () => {
  const calls = [];
  const file = { type: "regular", size: PNG.byteLength, identity: { device: "1", inode: "3" } };
  const reader = (over = {}) => ({
    rootMetadata: async root => { calls.push(["root", root]); return { type: "directory", size: 0, identity: { device: "1", inode: "2" } }; },
    fileMetadata: async request => { calls.push(["file", request.relative]); return over.file === undefined ? file : over.file; },
    readContained: async request => { calls.push(["read", request.relative, request.maxBytes, request.expectedFile.inode]); return over.bytes ?? PNG; },
  });
  const url = await readProjectIcon({ reader: reader(), core, canonicalRoot: "/work/app", path: "public/icon.png" });
  assert.match(url, /^data:image\/png;base64,/u);
  assert.deepEqual(calls, [["root", "/work/app"], ["file", "public/icon.png"], ["read", "public/icon.png", MAX_ICON_BYTES + 1, "3"]]);
  calls.length = 0;
  assert.equal(await readProjectIcon({ reader: reader({ file: { ...file, size: MAX_ICON_BYTES + 1 } }), core, canonicalRoot: "/work/app", path: "icon.png" }), null);
  assert.equal(await readProjectIcon({ reader: reader({ file: { ...file, type: "directory" } }), core, canonicalRoot: "/work/app", path: "icon.png" }), null);
  assert.equal(await readProjectIcon({ reader: reader({ file: null }), core, canonicalRoot: "/work/app", path: "icon.png" }), null);
  assert.ok(!calls.some(([kind]) => kind === "read"), "refused files are never read");
  assert.equal(await readProjectIcon({ reader: reader({ bytes: text("not an image") }), core, canonicalRoot: "/work/app", path: "icon.png" }), null);
  assert.equal(await readProjectIcon({ reader: reader(), core, canonicalRoot: "/work/app", path: ".env.png" }), null);
  const unavailable = { rootMetadata: async () => { throw Object.assign(new Error("x"), { code: "READ_CONTAINMENT_UNAVAILABLE" }); } };
  await assert.rejects(readProjectIcon({ reader: unavailable, core, canonicalRoot: "/work/app", path: "icon.png" }), { code: "READ_CONTAINMENT_UNAVAILABLE" });
});
