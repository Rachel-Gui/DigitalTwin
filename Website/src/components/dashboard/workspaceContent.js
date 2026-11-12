// Public ArcGIS app and WebScene metadata verified 2026-10-29.
// Keep scientific labels and units aligned with each published scene's popup fields.
export const spatialModels = {
  energy: {
    title: "Building energy", short: "Energy", icon: "building", badge: "Modeled baseline",
    appId: "9754941f6944410e88f2b4777450925b", sceneId: "93638c71042f4e7a84fd1a6762c3210b",
    description: "Explore modeled baseline energy use across South Park residential buildings.",
    metric: "Baseline energy use intensity", unit: "kBtu/ft²·yr", field: "eui_base",
    fields: ["Building type", "Heating source", "Year built", "Modeled baseline EUI"],
    guide: "Select a residential building in the scene to read its modeled baseline EUI and building attributes.",
    note: "Model estimates describe building energy use, not utility-meter observations.",
    action: "Explore building-energy scenarios", href: null
  },
  retrofit: {
    title: "Retrofit opportunities", short: "Retrofit", icon: "home", badge: "Modeled opportunities",
    appId: "817bebb1f30b4ebfa3893d45555fa846", sceneId: "32d83750ea704ed4bfad6e2d4075a52a",
    description: "Explore modeled retrofit opportunities and potential energy savings.",
    metric: "Modeled retrofit opportunity", unit: "Priority tier · 1–5", field: "priority_q",
    fields: ["Retrofit opportunity tier", "Deep retrofit savings (%)", "Electrification savings (%)", "Envelope upgrade savings (%)", "Modeled baseline EUI"],
    guide: "Select a residential building to inspect its opportunity tier and modeled savings for the available intervention types.",
    note: "Tier 5 indicates the highest modeled opportunity. Savings compare each scenario with modeled baseline energy use.",
    action: "Compare residential retrofit strategies", href: null
  },
  renewable: {
    title: "Solar potential", short: "Renewable", icon: "sun", badge: "Modeled solar resource",
    appId: "9d99a4a0c2e2482b912608249bf3248f", sceneId: "d154dd70fd9242daa6d4542631ac3138",
    description: "Explore modeled rooftop solar resource and estimated PV generation.",
    metric: "Annual roof solar potential", unit: "kWh/year · solar resource", field: "annual_roof",
    fields: ["Roof solar potential (MWh/year)", "Annual roof irradiation (kWh/m²/year)", "Estimated PV generation (MWh/year)"],
    guide: "Select a building to inspect the published scene’s solar-resource and estimated PV outputs.",
    note: "Solar resource and PV electricity are different quantities. The scene’s PV estimate assumes 70% usable roof area, 20% module efficiency, and 85% system performance.",
    action: "Open solar scene in ArcGIS", href: null
  }
};
export const arcgisUrl = model=>`https://uw.maps.arcgis.com/apps/instant/3dviewer/index.html?appid=${model.appId}`;
