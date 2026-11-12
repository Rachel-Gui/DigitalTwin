import { readFile } from "node:fs/promises";
import vm from "node:vm";
import test from "node:test";
import assert from "node:assert/strict";

const source = await readFile(new URL("../../src/scene/createSceneViewer.js", import.meta.url), "utf8");
const code = source.replace("export function createSceneViewer", "function createSceneViewer") + "\ncreateSceneViewer(loadModules);";
const sceneId = "93638c71042f4e7a84fd1a6762c3210b";
const origin = "http://localhost:5176";
const pending = () => new Promise(() => {});
const collection = values => ({
  filter: predicate => collection(values.filter(predicate)),
  toArray: () => values,
  add: value => values.push(value),
  forEach: callback => values.forEach(callback),
});

function viewer(options = {}) {
  let now = 0, nextTimer = 0;
  const timers = new Map(), messages = [], listeners = new Map();
  const state = { basemaps: [], views: [], moduleRequests: 0, popupCalls: 0 };
  const elements = Object.fromEntries(["message", "scene", "arcgis-theme"].map(id => [id, {
    hidden: false, textContent: "", dataset: {}, style: {}, setAttribute() {},
  }]));
  const root = { dataset: {}, style: { setProperty() {} } };
  const publishedBasemap = { baseLayers: collection([]) };
  class WebScene {
    constructor() { this.basemap = publishedBasemap; this.presentation = {}; state.scene = this; }
    load() { return options.scenePending ? pending() : Promise.resolve(this); }
  }
  class SceneView {
    constructor() { this.environment = {}; this.ui = { add() {} }; state.views.push(this); }
    when() {
      if (options.viewError) return Promise.reject(new Error("SceneView rejected"));
      return options.viewPending ? pending() : Promise.resolve(this);
    }
    destroy() { this.destroyed = true; }
  }
  class SceneLayer {
    constructor(properties) { Object.assign(this, properties, { type: "scene" }); }
    clone() { return new SceneLayer(this); }
  }
  class Widget {}
  const Basemap = {
    fromId(id) {
      state.basemaps.push(id);
      return {
        baseLayers: collection([]),
        load: () => options.basemapPending ? pending() : Promise.resolve(),
      };
    },
  };
  const parent = {
    document: { documentElement: root },
    postMessage: message => messages.push(message),
  };
  const context = {
    URLSearchParams, location: { origin, search: `?scene=${options.invalidScene ? "invalid" : sceneId}` }, parent,
    setTimeout: (callback, delay) => { const id = ++nextTimer; timers.set(id, { callback, at: now + delay }); return id; },
    clearTimeout: id => timers.delete(id), console: { warn() {}, error() {} },
    addEventListener: (type, callback) => listeners.set(type, callback),
    document: {
      documentElement: root, body: { style: {}, classList: { toggle() {} } },
      getElementById: id => elements[id],
      createElement: tag => tag === "canvas" ? {
        getContext: () => options.noWebGL ? null : { getExtension: () => ({ loseContext() {} }) },
      } : {},
    },
    // Regression: no global require or $arcgis loader exists in this environment.
    loadModules: () => {
      state.moduleRequests++;
      if (options.modulesPending) return pending();
      if (options.moduleError) return Promise.reject(new Error("module download failed"));
      return Promise.resolve([WebScene, SceneView, Basemap, SceneLayer, Widget, Widget, Widget]);
    },
    applyCityTwinPopupFormatting: () => { state.popupCalls++; return options.popupPending ? pending() : Promise.resolve(); },
  };
  context.window = context;
  vm.runInNewContext(code, context);
  const flush = async () => { for (let i = 0; i < 30; i++) await Promise.resolve(); };
  return {
    state, messages, elements, publishedBasemap, flush,
    send: data => listeners.get("message")({ origin, source: parent, data }),
    advance: async milliseconds => {
      const end = now + milliseconds;
      await flush();
      while (true) {
        const next = [...timers.entries()].filter(([, timer]) => timer.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
        if (!next) break;
        now = next[1].at; timers.delete(next[0]); next[1].callback(); await flush();
      }
      now = end;
    },
  };
}

test("the scene starts without waiting for popup formatting or themed basemaps", async () => {
  const h = viewer({ popupPending: true, basemapPending: true });
  await h.flush();
  assert.equal(h.messages.at(-1).type, "decarb-scene-ready");
  assert.equal(h.state.views.length, 1);
  assert.equal(h.state.popupCalls, 1);
  assert.equal(h.elements.message.hidden, true);
  assert.deepEqual(h.state.basemaps, ["gray-vector"]);
  await h.advance(65000);
  assert.equal(h.messages.at(-1).type, "decarb-scene-ready");
  assert.equal(h.state.scene.basemap, h.publishedBasemap);
});

test("missing WebGL2 fails immediately before downloading the engine", async () => {
  const h = viewer({ noWebGL: true }); await h.flush();
  assert.equal(h.messages.at(-1).type, "decarb-scene-error");
  assert.match(h.messages.at(-1).message, /WebGL2/);
  assert.equal(h.state.moduleRequests, 0);
});

for (const [name, options, duration, message] of [
  ["module download failure", { moduleError: true }, 0, /map engine could not be loaded/],
  ["stalled module request", { modulesPending: true }, 60000, /took too long/],
  ["stalled scene metadata", { scenePending: true }, 20000, /scene data took too long/],
  ["stalled SceneView", { viewPending: true }, 30000, /3D map could not start/],
  ["rejected SceneView", { viewError: true }, 0, /SceneView rejected/],
]) {
  test(name + " exits the loading state", async () => {
    const h = viewer(options); await h.advance(duration);
    assert.equal(h.messages.at(-1).type, "decarb-scene-error");
    assert.match(h.messages.at(-1).message, message);
    if (h.state.views.length) assert.equal(h.state.views[0].destroyed, true);
  });
}

test("the load handshake replays readiness if the first message was missed", async () => {
  const h = viewer(); await h.flush();
  h.messages.length = 0;
  h.send({ type: "decarb-scene-status" });
  assert.equal(h.messages.at(-1).type, "decarb-scene-ready");
  assert.equal(h.messages.at(-1).sceneId, sceneId);
});

test("switching theme loads the selected basemap on demand", async () => {
  const h = viewer(); await h.flush();
  assert.deepEqual(h.state.basemaps, ["gray-vector"]);
  h.send({ type: "decarb-theme", theme: "dark" }); await h.flush();
  assert.deepEqual(h.state.basemaps, ["gray-vector", "dark-gray-vector"]);
  assert.equal(h.elements.scene.dataset.basemap, "dark-gray");
});

test("the renderer starts without global require or $arcgis loaders", async () => {
  const h = viewer(); await h.flush();
  assert.equal(h.state.moduleRequests, 1);
  assert.equal(h.messages.at(-1).type, "decarb-scene-ready");
});
