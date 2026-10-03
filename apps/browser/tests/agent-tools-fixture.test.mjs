/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Plan 4 step 8: the authored synthetic fixture (fixtures/agent-tools.html).
// Its own script runs here against a small in-memory DOM (support/mini-dom.mjs
// plus test-local template and shadow-root stand-ins) for every fixed mode.
// Static checks prove the closed mode set, field-free clean destinations, the
// fixed same-origin destinations and the absence of network, storage and
// clipboard code. Not evidence of Gecko parsing, rendering or native capture.
import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFileSync } from "node:fs";
import { parseHtml } from "./support/mini-dom.mjs";
import { CAPTURE_DENIED_ELEMENTS } from "../chrome/AgentCaptureChild.sys.mjs";

const HTML = readFileSync(new URL("./fixtures/agent-tools.html", import.meta.url), "utf8");
const CODE = HTML.replace(/<!--[\s\S]*?-->/gu, "");
const MODES = ["clean", "type", "password", "closed-shadow", "opaque-focus", "navigated", "opened"];
const templates = Object.fromEntries([...CODE.matchAll(/<template id="([a-z-]+)">([\s\S]*?)<\/template>/gu)].map(match => [match[1], match[2]]));
const SCRIPT = /<script>([\s\S]*?)<\/script>/u.exec(CODE)[1];
const tagsOf = html => [...html.matchAll(/<([a-zA-Z][\w-]*)/gu)].map(match => match[1].toLowerCase());

function clone(node, document) {
  if (node.localName === undefined) return document.createTextNode(node.textContent);
  const copy = document.createElement(node.localName);
  for (const [name, value] of node.attributes) copy.setAttribute(name, value);
  for (const child of node.childNodes) copy.append(clone(child, document));
  shadowable(copy, document);
  return copy;
}
// Test-local stand-ins for what mini-dom lacks: attachShadow and an
// about:blank frame document. They record what the fixture asks for.
function shadowable(element, document) {
  element.attachShadow = init => {
    if (element.shadow) throw new Error("already attached");
    const root = parseHtml("").documentElement;
    root.mode = init?.mode;
    element.shadow = root;
    document.shadows.push({ host: element.id, mode: init?.mode, root });
    return root;
  };
  if (element.localName === "iframe") element.contentDocument = Object.assign(parseHtml("<body></body>"), { isFrame: true });
}

function load(search) {
  const document = parseHtml("<body><main id=\"fixture\" data-mode=\"pending\"></main></body>");
  document.shadows = [];
  const live = new Map(Object.entries(templates).map(([id, html]) => [id, { id, removed: false, content: { cloneNode: () => {
    const fragment = parseHtml(html).documentElement;
    return fragment.childNodes.map(child => clone(child, document));
  } }, remove() { this.removed = true; live.delete(id); } }]));
  const timers = [];
  const script = { removed: false, remove() { this.removed = true; } };
  const fake = {
    get title() { return document.title; }, set title(value) { document.title = value; },
    currentScript: script,
    getElementById: id => live.get(id) ?? document.getElementById(id),
    querySelectorAll: selector => (selector === "template" ? [...live.values()] : document.querySelectorAll(selector)),
    createElement: tag => { const element = document.createElement(tag); shadowable(element, document); return element; },
  };
  const main = document.getElementById("fixture");
  const append = main.append.bind(main);
  main.append = (...nodes) => append(...nodes.flat());
  vm.runInNewContext(SCRIPT, { document: fake, location: { search }, URLSearchParams, Math, Object,
    setTimeout: (fn, ms) => { timers.push({ fn, ms }); return timers.length; } });
  const all = selector => main.querySelectorAll(selector);
  return { document, main, live, timers, script, all, mode: main.dataset.mode, text: () => main.textContent.replace(/\s+/gu, " ").trim() };
}
const click = element => element.click();

test("the closed mode set: exactly seven fixed modes plus the refusal, each its own inert template", () => {
  assert.deepEqual(Object.keys(templates).sort(), [...MODES.map(mode => `mode-${mode}`), "mode-refused"].sort());
  assert.match(SCRIPT, /const MODES = \["clean", "type", "password", "closed-shadow", "opaque-focus", "navigated", "opened"\];/u);
  for (const mode of MODES) {
    const page = load(`?mode=${mode}`);
    assert.equal(page.mode, mode);
    assert.equal(page.live.size, 0, `${mode}: every template is removed after instantiation`);
    assert.equal(page.script.removed, true);
    assert.match(page.document.title, /^Agent tools · .+ · synthetic fixture$/u);
  }
  assert.equal(load("").mode, "clean", "no mode means clean");
});

test("unknown keys, repeated, empty or unknown modes refuse and show nothing else", () => {
  for (const search of ["?mode=evil", "?mode=", "?mode=clean&mode=type", "?mode=clean&x=1", "?x=1", "?Mode=clean",
    "?mode=CLEAN", "?mode=clean%20", "?mode=../clean", "?mode=%3Cscript%3E"]) {
    const page = load(search);
    assert.equal(page.mode, "refused", search);
    assert.equal(page.all("input, button, iframe").length, 0, search);
    assert.match(page.text(), /^Unknown fixture mode/u, search);
    assert.equal(page.document.shadows.length, 0);
  }
});

test("clean, navigated and opened are field-free and frame-free; the clean page is in the capture scope by tag", () => {
  for (const id of ["mode-clean", "mode-navigated", "mode-opened", "mode-refused"]) {
    const tags = tagsOf(templates[id]);
    assert.deepEqual(tags.filter(tag => CAPTURE_DENIED_ELEMENTS.includes(tag)), [], id);
    assert.equal(tags.some(tag => ["svg", "math", "script", "template", "label"].includes(tag)), false, id);
    assert.doesNotMatch(templates[id], /contenteditable|tabindex|autofocus|on[a-z]+=|style=|href=|src=/u, id);
  }
  const clean = load("");
  assert.equal(clean.all("input, textarea, select, iframe, object, embed").length, 0);
  assert.equal(clean.all("button").length, 1, "exactly one inert click target");
  assert.deepEqual(clean.all(".band span").length, 3, "a fixed colour band for comparing a screenshot");
  assert.match(clean.text(), /\/agent-tools\?mode=navigated/u);
  assert.match(clean.text(), /\/agent-tools\?mode=opened/u);
  for (const mode of ["navigated", "opened"]) {
    const page = load(`?mode=${mode}`);
    assert.equal(page.all("input, button, iframe").length, 0, mode);
    assert.equal(page.all(`.band[data-band="${mode}"]`).length, 1, mode);
  }
});

test("clean: the click target's visible result counts to 99 at most and changes nothing else", () => {
  const page = load("?mode=clean");
  const button = page.document.getElementById("agent-click");
  const result = page.document.getElementById("agent-click-result");
  assert.equal(result.textContent, "Not clicked yet.");
  assert.equal(result.getAttribute("role"), "status");
  click(button);
  assert.equal(result.textContent, "Clicked 1 time.");
  for (let i = 0; i < 150; i++) click(button);
  assert.equal(result.textContent, "Clicked 99 times.");
  assert.equal(page.all("input").length, 0);
  assert.equal(page.timers.length, 0, "no timers in the clean page");
});

test("type: one ordinary text field, no password anywhere; the visible echo is bounded to 80 characters", () => {
  const page = load("?mode=type");
  const inputs = page.all("input");
  assert.equal(inputs.length, 1);
  assert.equal(inputs[0].type, "text");
  assert.equal(inputs[0].getAttribute("autocomplete"), "off");
  assert.equal(page.all('input[type="password"]').length, 0);
  assert.doesNotMatch(templates["mode-type"], /type="password"|id="[^"]*password/u);
  const result = page.document.getElementById("agent-text-result");
  inputs[0].value = "Synthetic note";
  inputs[0].dispatchEvent({ type: "input" });
  assert.equal(result.textContent, "Text now: “Synthetic note” (14 characters).");
  inputs[0].value = "é".repeat(120);
  inputs[0].dispatchEvent({ type: "input" });
  assert.equal(result.textContent, `Text now: “${"é".repeat(80)}…” (120 characters).`);
  inputs[0].value = "";
  inputs[0].dispatchEvent({ type: "input" });
  assert.equal(result.textContent, "The field is empty.");
});

test("password: a present field, a type change that keeps its history, and removal", () => {
  const page = load("?mode=password");
  const field = page.document.getElementById("agent-password");
  assert.equal(field.type, "password");
  assert.equal(page.document.getElementById("agent-text").type, "text");
  const [toText, remove] = page.all("#fixture-actions button");
  click(toText);
  assert.equal(field.type, "text");
  assert.match(page.document.getElementById("fixture-result").textContent, /former password field/u);
  click(remove);
  assert.equal(page.document.getElementById("agent-password"), null);
  assert.equal(page.document.getElementById("password-slot"), null);
  click(remove);
  assert.equal(page.all("input").length, 1, "only the ordinary note field stays");
});

test("closed-shadow: field-free at first; a password inside the existing closed root; a new closed root with a short-lived field", () => {
  const page = load("?mode=closed-shadow");
  assert.equal(page.all("input").length, 0);
  assert.deepEqual(page.document.shadows.map(shadow => [shadow.host, shadow.mode]), [["closed-host", "closed"]]);
  const existing = page.document.shadows[0].root;
  assert.match(existing.textContent, /no field inside/u);
  const [add, attach] = page.all("#fixture-actions button");
  click(add);
  assert.equal(existing.querySelectorAll('input[type="password"]').length, 1);
  click(add);
  assert.equal(existing.querySelectorAll("input").length, 1, "added once");
  click(attach);
  assert.deepEqual(page.document.shadows.map(shadow => [shadow.host, shadow.mode]), [["closed-host", "closed"], ["late-host", "closed"]]);
  const late = page.document.shadows[1].root;
  assert.equal(late.querySelectorAll('input[type="password"]').length, 1);
  assert.deepEqual(page.timers.map(timer => timer.ms), [400]);
  page.timers[0].fn();
  assert.equal(late.querySelectorAll("input").length, 0, "the field is gone, the root stays");
  assert.equal(page.document.getElementById("late-host").shadow, late);
  click(attach);
  assert.equal(page.document.shadows.length, 2, "a second attach is not attempted");
});

test("opaque-focus: an about:blank frame (no src) with its own field; focus moves into it only on request", () => {
  const page = load("?mode=opaque-focus");
  const frame = page.document.getElementById("agent-frame");
  assert.equal(frame.getAttribute("src"), null);
  assert.equal(frame.getAttribute("title"), "Synthetic embedded document");
  const inner = frame.contentDocument.getElementById("inner");
  assert.ok(inner);
  assert.equal(frame.contentDocument.activeElement, null);
  click(page.all("#fixture-actions button")[0]);
  assert.equal(frame.contentDocument.activeElement, inner);
});

test("no network, storage, clipboard or markup injection; only the inline icon is a URL", () => {
  assert.match(CODE, /Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'"/u);
  const urls = [...CODE.matchAll(/(?:href|src)="([^"]*)"/gu)].map(match => match[1]);
  assert.equal(urls.length, 1);
  assert.match(urls[0], /^data:image\/svg\+xml,/u);
  assert.doesNotMatch(CODE.replace(urls[0], ""), /https?:\/\//u);
  for (const pattern of [/fetch\s*\(/u, /XMLHttpRequest/u, /WebSocket/u, /EventSource/u, /sendBeacon/u, /localStorage/u, /sessionStorage/u,
    /indexedDB/u, /document\.cookie/u, /clipboard/u, /execCommand/u, /window\.open/u, /postMessage/u, /\beval\s*\(/u, /new Function/u,
    /innerHTML/u, /outerHTML/u, /insertAdjacentHTML/u, /document\.write/u, /location\.(?:href|assign|replace)\s*[=(]/u, /<form/u, /<a\s/u]) {
    assert.doesNotMatch(CODE, pattern, String(pattern));
  }
  assert.doesNotMatch(SCRIPT, /setInterval/u, "finite: no repeating timers");
});
