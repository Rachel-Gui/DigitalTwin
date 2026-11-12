import { createSceneViewer } from "./scene/createSceneViewer";

// Vite bundles these ES modules with this site. No global AMD loader is needed.
createSceneViewer(() => Promise.all([
  import("@arcgis/core/WebScene.js"),
  import("@arcgis/core/views/SceneView.js"),
  import("@arcgis/core/Basemap.js"),
  import("@arcgis/core/layers/SceneLayer.js"),
  import("@arcgis/core/widgets/Home.js"),
  import("@arcgis/core/widgets/Legend.js"),
  import("@arcgis/core/widgets/Expand.js"),
]).then(modules => modules.map(module => module.default)));
