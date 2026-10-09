/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// The capture bar's extension point (registerCaptureExtension) in one
// synthetic window (support/capture-harness.mjs). Synthetic fakes only; not
// evidence of native mouse handling, pixels or the system clipboard.
import test from "node:test";
import assert from "node:assert/strict";
import "./support/chrome-modules.mjs";
import { HARBOR, PNG, captureWindow, flush, trusted } from "./support/capture-harness.mjs";

const { registerCaptureExtension, captureExtensionIds } = await import("../chrome/RegionCapture.sys.mjs");

const sectionOf = (h, id) => h.bar().querySelector(`.axiosozo-region-section[data-extension="${id}"]`);
const primaryLabels = h => h.stack.querySelectorAll(".axiosozo-region-primary").map(node => node.textContent);

test("with no extension the bar is the plain one: note, Copy image, Copy for agent (primary, focused)", async () => {
  const h = await captureWindow();
  const bar = await h.capture();
  assert.equal(bar.hasAttribute("data-extended"), false);
  assert.deepEqual(bar.querySelectorAll("button").map(node => node.textContent), ["", "Copy image", "Copy for agent"]);
  assert.deepEqual(primaryLabels(h), ["Copy for agent"]);
  assert.equal(h.document.activeElement, h.button("Copy for agent"));
  h.key(h.note(), "Enter");
  assert.equal(h.clipboard.writes.length, 1, "Return still copies for the agent");
});

test("an extension gets the capture's facts and adds a section and an action in their places", async () => {
  const h = await captureWindow();
  const seen = [];
  const unregister = registerCaptureExtension(h.window, { id: "probe", render(bar, capture) {
    seen.push({ bar, capture });
    bar.section({ label: "Probe" }).textContent = "Section text";
    bar.action({ label: "Probe action", onClick: () => seen.push("clicked") });
    return { dispose: () => seen.push("disposed") };
  } });
  const bar = await h.capture();
  const [{ capture }] = seen;
  assert.ok(capture.png instanceof Uint8Array);
  assert.deepEqual([...capture.png], PNG, "the PNG bytes in memory");
  assert.equal(capture.type, "image/png");
  assert.deepEqual([capture.width, capture.height], [600, 400]);
  assert.equal(capture.url, "http://localhost:5173/billing?session=abc#top");
  assert.equal(capture.title, "Harbor · Billing settings");
  assert.deepEqual({ ...capture.project }, { id: HARBOR.id, name: "Harbor", root: HARBOR.root, environment: "web" });
  assert.deepEqual({ ...capture.selection }, { x: 200, y: 190, width: 300, height: 200 });
  assert.equal(capture.browser, h.browser);
  h.note().value = "the retry button";
  assert.equal(capture.note, "the retry button", "the note is read live");
  assert.ok(Object.isFrozen(capture));
  // Section between the note and the buttons; the action right of Copy for agent.
  const children = bar.children.map(node => node.className);
  assert.deepEqual(children, ["axiosozo-region-meta", "axiosozo-region-note", "axiosozo-region-section", "axiosozo-region-actions"]);
  assert.equal(sectionOf(h, "probe").getAttribute("aria-label"), "Probe");
  assert.deepEqual(bar.querySelectorAll("button").map(node => node.textContent), ["", "Copy image", "Copy for agent", "Probe action"],
    "an extension's buttons come after Copy for agent, where the main action sits");
  assert.equal(bar.getAttribute("data-extended"), "true");
  h.click(h.button("Probe action"));
  assert.equal(seen.at(-1), "clicked");
  // The capture ends: the extension's signal aborts and its dispose runs.
  h.escape();
  assert.equal(h.overlay(), null);
  assert.equal(capture.signal.aborted, true);
  assert.equal(seen.at(-1), "disposed");
  unregister();
  assert.deepEqual(captureExtensionIds(h.window), []);
});

test("setDefault makes an extension the main action: Return runs it, Copy for agent becomes plain; release restores", async () => {
  const h = await captureWindow();
  const runs = [];
  let release = null, main = null;
  registerCaptureExtension(h.window, { id: "starter", render(bar) {
    main = bar.action({ label: "Start", primary: true, onClick: event => runs.push(event.type) });
    release = () => {};
  } });
  await h.capture();
  assert.deepEqual(primaryLabels(h), ["Start"]);
  assert.equal(h.document.activeElement, main, "focus starts on the main action");
  h.key(h.note(), "Enter");
  assert.deepEqual(runs, ["keydown"]);
  assert.equal(h.clipboard.writes.length, 0, "Return did not copy");
  h.click(h.button("Copy for agent"));
  assert.equal(h.clipboard.writes.length, 1, "Copy for agent keeps working alongside");
  assert.ok(release);
});

test("setDefault's release gives the main action back to Copy for agent", async () => {
  const h = await captureWindow();
  let release;
  registerCaptureExtension(h.window, { id: "starter", render(bar) {
    const button = bar.action({ label: "Start" });
    release = bar.setDefault(() => {}, { button });
  } });
  await h.capture();
  assert.deepEqual(primaryLabels(h), ["Start"]);
  release();
  assert.deepEqual(primaryLabels(h), ["Copy for agent"]);
  h.key(h.note(), "Enter");
  assert.equal(h.clipboard.writes.length, 1);
});

test("choose fills the note and focuses the main action; a chooser is never called (the user starts it)", async () => {
  const h = await captureWindow();
  const handed = [];
  let bar = null;
  registerCaptureExtension(h.window, { id: "proposer", order: 1, render(api) { bar = api; } });
  await h.capture();
  assert.equal(bar.chooseVerb, null);
  assert.equal(bar.choose(trusted(), "  Fix the  retry\nbutton "), false);
  assert.equal(h.note().value, "Fix the retry button");
  assert.equal(h.document.activeElement, h.button("Copy for agent"));
  h.click(h.button("Copy for agent"));
  assert.match(h.clipboard.writes[0].text, /Note: Fix the retry button/);

  registerCaptureExtension(h.window, { id: "starter", order: 2, render(api) {
    api.onChoose((event, text) => { handed.push([event.type, text]); return true; }, { verb: "Start" });
  } });
  await h.capture();
  assert.equal(bar.chooseVerb, "Start");
  assert.equal(bar.choose(trusted(), "Explain card_declined"), false);
  assert.deepEqual(handed, []);
  assert.equal(h.note().value, "Explain card_declined");
});

test("holdEscape: Escape closes an extension's menu first, the next Escape discards the capture", async () => {
  const h = await captureWindow();
  const closed = [];
  registerCaptureExtension(h.window, { id: "menu", render(bar) {
    const release = bar.holdEscape(() => { closed.push("menu"); release(); });
  } });
  await h.capture();
  const first = h.escape();
  assert.equal(first.defaultPrevented, true);
  assert.deepEqual(closed, ["menu"]);
  assert.ok(h.overlay(), "the capture stays");
  h.escape();
  assert.equal(h.overlay(), null);
});

test("unregistering while the bar is open removes everything it added and gives Return back", async () => {
  const h = await captureWindow();
  let signal = null;
  const unregister = registerCaptureExtension(h.window, { id: "temp", render(bar, capture) {
    signal = capture.signal;
    bar.section().textContent = "temp";
    bar.action({ label: "Temp", primary: true, onClick() {} });
  } });
  const bar = await h.capture();
  assert.ok(sectionOf(h, "temp"));
  unregister();
  assert.equal(sectionOf(h, "temp"), null);
  assert.equal(h.button("Temp"), null);
  assert.equal(signal.aborted, true);
  assert.equal(bar.hasAttribute("data-extended"), false);
  assert.deepEqual(primaryLabels(h), ["Copy for agent"]);
  h.key(h.note(), "Enter");
  assert.equal(h.clipboard.writes.length, 1);
});

test("an extension that throws is left out; the others and Copy for agent carry on", async () => {
  const h = await captureWindow();
  const errors = [];
  const original = console.error;
  console.error = (...args) => errors.push(args.join(" "));
  try {
    registerCaptureExtension(h.window, { id: "broken", order: 1, render(bar) { bar.section().textContent = "half"; throw new Error("boom"); } });
    registerCaptureExtension(h.window, { id: "fine", order: 2, render(bar) { bar.section().textContent = "fine"; } });
    await h.capture();
  } finally { console.error = original; }
  assert.equal(sectionOf(h, "broken"), null, "what it added before failing is removed");
  assert.equal(sectionOf(h, "fine").textContent, "fine");
  assert.match(errors.join("\n"), /capture extension broken failed/);
  assert.equal(h.runtime.diagnostics().extension_failures, 1);
  h.click(h.button("Copy for agent"));
  assert.equal(h.clipboard.writes.length, 1);
});

test("sections keep extension order even when an earlier one adds its section later", async () => {
  const h = await captureWindow();
  let late = null;
  registerCaptureExtension(h.window, { id: "second", order: 20, render(bar) { bar.section().textContent = "second"; } });
  registerCaptureExtension(h.window, { id: "first", order: 10, render(bar) { late = bar; } });
  await h.capture();
  late.section().textContent = "first";
  assert.deepEqual(h.bar().querySelectorAll(".axiosozo-region-section").map(node => node.textContent), ["first", "second"]);
  assert.deepEqual(captureExtensionIds(h.window), ["first", "second"]);
});

test("stillValid ends the capture with the usual refusal when the page changed; finish ends it without copying", async () => {
  const h = await captureWindow();
  let bar = null;
  registerCaptureExtension(h.window, { id: "probe", render(api) { bar = api; } });
  await h.capture();
  assert.equal(bar.stillValid(), true);
  h.browser.currentURI = { spec: "https://bank.example/" };
  assert.equal(bar.stillValid(), false);
  assert.equal(h.overlay(), null);
  assert.equal(bar.isOpen, false);
  assert.equal(bar.section(), null, "a closed bar takes nothing");

  h.browser.currentURI = { spec: "http://localhost:5173/billing" };
  await h.capture();
  bar.finish();
  assert.equal(h.overlay(), null);
  assert.equal(h.clipboard.writes.length, 0);
  assert.equal(h.runtime.diagnostics().handed_off, 1);
});

test("registerCaptureExtension checks its input, replaces an id, and is per window", async () => {
  const h = await captureWindow();
  const other = await captureWindow();
  assert.throws(() => registerCaptureExtension(null, { id: "x", render() {} }), TypeError);
  assert.throws(() => registerCaptureExtension(h.window, { id: "Not ok", render() {} }), TypeError);
  assert.throws(() => registerCaptureExtension(h.window, { id: "x" }), TypeError);
  assert.throws(() => registerCaptureExtension(h.window, { id: "x", order: Number.NaN, render() {} }), TypeError);
  const disposed = [];
  registerCaptureExtension(h.window, { id: "same", render(bar) { bar.section().textContent = "one"; }, dispose: () => disposed.push("one") });
  registerCaptureExtension(h.window, { id: "same", render(bar) { bar.section().textContent = "two"; } });
  assert.deepEqual(disposed, ["one"], "the earlier registration is disposed");
  await h.capture();
  assert.equal(sectionOf(h, "same").textContent, "two");
  await other.capture();
  assert.equal(other.bar().hasAttribute("data-extended"), false, "another window's bar is untouched");
});

test("disposing area capture ends the extensions' part of an open bar", async () => {
  const h = await captureWindow();
  let signal = null;
  registerCaptureExtension(h.window, { id: "probe", render(bar, capture) { signal = capture.signal; } });
  await h.capture();
  h.runtime.dispose();
  assert.equal(signal.aborted, true);
  assert.equal(h.overlay(), null);
  await flush();
});
