export function createSceneViewer(loadModules) {
  const allowedScenes = new Set([
    "93638c71042f4e7a84fd1a6762c3210b",
    "32d83750ea704ed4bfad6e2d4075a52a",
    "d154dd70fd9242daa6d4542631ac3138",
  ]);
  const sceneId = new URLSearchParams(location.search).get("scene");
  const message = document.getElementById("message");
  let activeTheme = "light";
  let applyTheme;
  let view;
  let status = { type: "decarb-scene-progress", message: "Loading map engine…" };
  const watchdog = setTimeout(() => fail("The map engine or scene took too long to load. Check your connection and try again."), 60000);

  function report() {
    parent.postMessage({ ...status, sceneId }, location.origin);
  }
  function progress(text) {
    status = { type: "decarb-scene-progress", message: text };
    message.textContent = text;
    report();
  }
  function fail(text) {
    if (status.type === "decarb-scene-error") return;
    clearTimeout(watchdog);
    status = { type: "decarb-scene-error", message: text };
    message.textContent = text;
    message.hidden = false;
    message.setAttribute("role", "alert");
    view?.destroy();
    report();
  }
  function deadline(promise, milliseconds, text) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(text)), milliseconds);
      Promise.resolve(promise).then(
        value => { clearTimeout(timer); resolve(value); },
        error => { clearTimeout(timer); reject(error); },
      );
    });
  }
  function paintChrome(theme) {
    document.documentElement.dataset.theme = theme;
    document.body.classList.toggle("calcite-mode-dark", theme === "dark");
    document.getElementById("arcgis-theme").href = `https://js.arcgis.com/4.34/esri/themes/${theme}/main.css`;
    document.body.style.background = theme === "dark" ? "#152025" : "#f5f6f5";
    document.getElementById("scene").style.background = document.body.style.background;
  }
  try { activeTheme = parent.document.documentElement.dataset.theme === "dark" ? "dark" : "light"; } catch { /* Use the light default. */ }
  paintChrome(activeTheme);
  addEventListener("message", event => {
    if (event.origin !== location.origin || event.source !== parent) return;
    if (event.data?.type === "decarb-theme") {
      activeTheme = event.data.theme === "dark" ? "dark" : "light";
      paintChrome(activeTheme);
      applyTheme?.(activeTheme);
    } else if (event.data?.type === "decarb-panels") {
      document.documentElement.style.setProperty("--scene-tools-left", event.data.controlsOpen ? "336px" : "16px");
      document.documentElement.style.setProperty("--scene-tools-right", event.data.infoOpen ? "312px" : "16px");
    } else if (event.data?.type === "decarb-scene-status") {
      report();
    }
  });

  if (!allowedScenes.has(sceneId)) {
    fail("The requested 3D scene is unavailable.");
    return;
  }
  // Detect unsupported rendering before downloading the 3D engine.
  const canvas = document.createElement("canvas");
  let gl;
  try { gl = canvas.getContext("webgl2"); } catch { /* Report the same capability error. */ }
  if (!gl) {
    fail("This browser cannot start WebGL2. Enable hardware acceleration or try another browser.");
    return;
  }
  gl.getExtension("WEBGL_lose_context")?.loseContext();
  progress("Loading map engine…");
  Promise.resolve().then(loadModules).then(async ([WebScene, SceneView, Basemap, SceneLayer, Home, Legend, Expand]) => {
      try {
        if (status.type === "decarb-scene-error") return;
        progress("Loading scene data…");
        const scene = new WebScene({ portalItem: { id: sceneId } });
        await deadline(scene.load(), 20000, "The published scene data took too long to load. Check your connection to ArcGIS and try again.");
        if (status.type === "decarb-scene-error") return;
        progress("Starting the 3D map…");
        // Render with the published basemap first. Popup formatting and theme
        // downloads are optional and must never prevent SceneView from starting.
        view = new SceneView({
          container: "scene", map: scene, qualityProfile: "medium",
          popup: { dockEnabled: true, dockOptions: { position: "bottom-center", buttonEnabled: true, breakpoint: false } },
        });
        await deadline(view.when(), 30000, "The 3D map could not start in time. Check WebGL2 and hardware acceleration, then try again.");
        if (status.type === "decarb-scene-error") return;
        message.hidden = true;
        clearTimeout(watchdog);
        status = { type: "decarb-scene-ready", message: "" };
        report();

        // A missing or slow formatting helper leaves the original popups usable.
        Promise.resolve().then(() => window.applyCityTwinPopupFormatting?.(scene))
          .catch(error => console.warn("Using published popup templates", error));

        const contextBuildings = scene.basemap.baseLayers
          .filter(layer => layer.type === "scene" && /Buildings/i.test(layer.title)).toArray();
        if (!contextBuildings.length) contextBuildings.push(new SceneLayer({
          url: "https://basemaps3d.arcgis.com/arcgis/rest/services/Esri3D_Buildings_v1/SceneServer/layers/0",
          title: "Buildings", popupEnabled: false, listMode: "hide",
        }));
        const basemaps = new Map();
        let themeRequest = 0;
        applyTheme = async theme => {
          const request = ++themeRequest;
          view.environment.background = { type: "color", color: theme === "light" ? "#f5f6f5" : "#152025" };
          try {
            if (!basemaps.has(theme)) {
              const basemap = Basemap.fromId(theme === "light" ? "gray-vector" : "dark-gray-vector");
              basemaps.set(theme, deadline(basemap.load(), 8000, "The themed basemap took too long to load.").then(() => {
                contextBuildings.forEach(layer => basemap.baseLayers.add(layer.clone()));
                return basemap;
              }).catch(error => { basemaps.delete(theme); throw error; }));
            }
            const basemap = await basemaps.get(theme);
            if (request !== themeRequest || status.type !== "decarb-scene-ready") return;
            scene.basemap = basemap;
            basemap.baseLayers.forEach(layer => {
              if (layer.type === "scene" && /Buildings/i.test(layer.title)) layer.renderer = {
                type: "simple", symbol: { type: "mesh-3d", symbolLayers: [{
                  type: "fill", material: { color: theme === "light" ? "#e1e5e5" : "#454b52", colorMixMode: "replace" },
                }] },
              };
            });
            document.getElementById("scene").dataset.basemap = theme === "light" ? "light-gray" : "dark-gray";
          } catch (error) { console.warn("Keeping the published basemap", error); }
        };
        applyTheme(activeTheme);
        view.ui.add(new Home({ view }), "top-left");
        view.ui.add(new Expand({ view, content: new Legend({ view }), expandTooltip: "Map legend" }), "top-right");
        const slides = scene.presentation?.slides;
        if (slides?.length) {
          const select = document.createElement("select");
          select.setAttribute("aria-label", "Saved scene views");
          select.style.cssText = "max-width:160px;padding:9px;border:1px solid #bbc8c9;border-radius:6px;background:var(--esri-widget-background-color);color:var(--esri-widget-text-color);font:12px Arial";
          select.add(new Option("Saved views", ""));
          slides.forEach((slide, index) => select.add(new Option(slide.title.text || `View ${index + 1}`, String(index))));
          select.addEventListener("change", async () => {
            if (select.value === "") return;
            try { await slides.getItemAt(Number(select.value)).applyTo(view); applyTheme(activeTheme); }
            catch (error) { console.warn("Could not open saved view", error); }
          });
          view.ui.add(select, "top-right");
        }
      } catch (error) {
        console.error("South Park scene initialization failed", error);
        // Optional widgets or theme setup must not tear down a working scene.
        if (status.type !== "decarb-scene-ready") {
          fail(error.message || "The 3D scene could not load. Reload the scene or open it in ArcGIS.");
        }
      }
  }).catch(error => {
    console.error("ArcGIS module loading failed", error);
    fail("The ArcGIS map engine could not be loaded. Check your connection or content blocker and try again.");
  });
}
