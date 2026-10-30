# Dashboard sources and displayed functionality

The workspace uses existing project integrations. It does not add heat modeling,
greening scenarios, fabricated time series, or a simulated building selection.

Public scene metadata was checked on 2026-10-29:

| View | ArcGIS app | WebScene | Displayed field |
| --- | --- | --- | --- |
| Building energy | `9754941f6944410e88f2b4777450925b` | `93638c71042f4e7a84fd1a6762c3210b` | `eui_base`, kBtu/ft²·yr |
| Retrofit | `817bebb1f30b4ebfa3893d45555fa846` | `32d83750ea704ed4bfad6e2d4075a52a` | `priority_q`, tiers 1–5 |
| Solar | `9d99a4a0c2e2482b912608249bf3248f` | `d154dd70fd9242daa6d4542631ac3138` | `annual_roof`, kWh/year |

Scene configurations: `https://uw.maps.arcgis.com/sharing/rest/content/items/<WebScene>/data?f=pjson`.
The energy and retrofit building layer is `southpark_stock_energy/FeatureServer/0`;
the solar layer is `seattle_footprint_facade_roof_solar_potential/FeatureServer/0`,
both on `services.arcgis.com/JL4BwWcjcPuWhBm9/arcgis/rest/services/`.

The solar scene exposes roof resource in MWh/year, annual roof irradiation in
kWh/m²/year, and estimated PV generation in MWh/year. Its published expressions
convert annual roof resource by dividing by 1000, and estimate PV generation with
0.70 usable roof fraction × 0.20 module efficiency × 0.85 system performance.
These are distinct quantities, not interchangeable labels.

Building selection, saved viewpoints, navigation, and legends stay within the
published ArcGIS viewer. The surrounding panel describes actual available outputs;
it does not pretend to receive selections from a cross-origin iframe.

Sensor observations use the existing `/api/clarity` endpoint and `useClarityData`
hook. Locations, values, and timestamps come from its response. Sensor selection
uses actual records, with absent readings shown as an em dash. Successful server
responses may be cached for up to 4 hours 45 minutes. PM2.5 concentration color
bands are not presented as an hourly AQI or regulatory compliance assessment.

The existing Tableau dashboard at
https://public.tableau.com/views/LUR_predPM2_5_CB/Dashboard1
is titled "Predicted Annually-averaged PM2.5 Concentrations, Seattle, WA".
It is kept separate from latest sensor observations.

The expand control expands the application workspace within the browser and
supports Escape; it does not require the browser Fullscreen API.
