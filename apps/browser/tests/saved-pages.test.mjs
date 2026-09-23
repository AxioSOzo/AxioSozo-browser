import assert from "node:assert/strict";
import { test } from "node:test";
import { SavedPages } from "../chrome/SavedPages.sys.mjs";
import { routeInput } from "../chrome/BrowserExperience.sys.mjs";

function memoryStorage() {
  let text = null; let fail = false;
  return { read: async () => text, write: async value => { if (fail) throw new Error("disk full"); text = value; },
    setFailure(value) { fail = value; }, snapshot() { return text; } };
}

test("saved pages survive reload and keep identical URLs in separate environments", async () => {
  const storage = memoryStorage(); let serial = 1;
  const uuid = () => `00000000-0000-0000-0000-${String(serial++).padStart(12, "0")}`;
  const pages = new SavedPages(storage, uuid, () => 100);
  const a = await pages.add({ url: "https://example.test/page", title: "Research", userContextId: 1 });
  const b = await pages.add({ url: "https://example.test/page", title: "Research", userContextId: 2 });
  const afterRestart = new SavedPages(storage, uuid);
  assert.deepEqual((await afterRestart.search("research", 1)).map(item => item.id), [a.id]);
  assert.deepEqual((await afterRestart.search("example.test", 2)).map(item => item.id), [b.id]);
  await afterRestart.remove(a.id);
  assert.equal((await new SavedPages(storage, uuid).search("research", 1)).length, 0);
  assert.equal((await new SavedPages(storage, uuid).search("research", 2)).length, 1);
});

test("failed persistence leaves committed state unchanged and lets a later action succeed", async () => {
  const storage = memoryStorage();
  const pages = new SavedPages(storage, () => "00000000-0000-0000-0000-000000000001", () => 100);
  storage.setFailure(true);
  await assert.rejects(pages.add({ url: "https://example.test/", title: "Page" }), /disk full/);
  assert.equal(storage.snapshot(), null);
  assert.equal((await pages.search("Page", 0)).length, 0);
  storage.setFailure(false);
  await pages.add({ url: "https://example.test/", title: "Page" });
  assert.equal((await pages.search("Page", 0)).length, 1);
});

test("navigation distinguishes URL and configured web search without invoking a model", () => {
  globalThis.Ci = { nsIURIFixup: { FIXUP_FLAG_ALLOW_KEYWORD_LOOKUP: 1, FIXUP_FLAG_PRIVATE_CONTEXT: 4 } };
  const fixup = { getFixupURIInfo(input, flags) {
    assert.equal(flags, 5);
    return input.includes(" ")
      ? { preferredURI: { scheme: "https", spec: "https://search.test/?q=" + encodeURIComponent(input) }, keywordProviderId: "default" }
      : { preferredURI: { scheme: "https", spec: "https://example.test/" }, keywordProviderId: "" };
  } };
  assert.equal(routeInput("example.test", fixup, true).kind, "url");
  assert.equal(routeInput("two words", fixup, true).kind, "search");
  assert.throws(() => routeInput("", fixup, true), /INVALID_NAVIGATION_INPUT/);
  delete globalThis.Ci;
});
