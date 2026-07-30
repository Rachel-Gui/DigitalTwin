import assert from "node:assert/strict";
import fs from "node:fs/promises";
import test from "node:test";

const source = await fs.readFile(new URL("../public/sw.js", import.meta.url), "utf8");

test("service worker refreshes the application shell while retaining heavy assets", () => {
  assert.match(source, /durableAsset \? cacheFirst\(event\.request\) : networkFirst\(event\.request\)/);
  assert.match(source, /response\.ok/);
  assert.match(source, /request\.mode === "navigate" \? caches\.match\("\/"\)/);
});

test("runtime no longer caches or fetches generated data JSON", () => {
  assert.doesNotMatch(source, /\/data\//);
  assert.match(source, /phi-webxr-v19/);
  assert.match(source, /\/assets\/boundaries\//);
  assert.match(source, /\/assets\/instances\//);
  assert.match(source, /\/assets\/models\//);
});
