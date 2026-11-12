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

## Local preview revision — 2026-11-03

- `legendScales.js` transcribes the color-variable stops from each active published
  WebScene layer. These are continuous ramps, not five class bins. Energy and
  retrofit increase from dark orange to pale orange; solar increases from pale
  yellow to dark purple. Context buildings are outside these classifications.
- Renewable map units remain kWh/year (the actual source field). Definitions
  explain the popup's division by 1,000 to MWh/year, rather than relabeling the map.
- The editable annual solar comparison uses PV **electricity**, not incident roof
  resource. The input starts empty, so no example result can be mistaken for a selected
  building or a pilot total. Users manually enter a popup's estimated PV generation.
  Adjacent wording distinguishes annual energy totals from continuous supply.
- Starting annual comparison denominator: EIA's 2022 U.S. average residential
  electric-utility customer purchases of 10,791 kWh/year. This is not a Seattle
  household average, a forecast, or a building-specific demand figure.
  Source: https://www.eia.gov/tools/faqs/faq.php?id=97&t=7
- A read-only query of all 1,437 building-layer records returned no truncated
  results. For each of the 1,286 records with usable baseline/scenario EUI and
  savings, the recorded percentage agreed with `(baseline - scenario) / baseline
  * 100` within 0.05 percentage points for envelope, electrification and deep
  retrofit (consistent with rounding). This supports the displayed EUI savings
  definition; it does not validate simulation assumptions or measured performance.
- Apartment records include three distinct baseline EUI values. Identical values
  alone do not establish the same archetype/model configuration. Zero and equal
  savings remain unchanged; their modeling interpretation and priority-tier
  scoring still need confirmation from the model owner.
- `public/twin-popup-overrides.js` only formats the website's in-memory popup
  templates: construction years have no grouping/decimals, missing heating or
  construction year is "Not available", and the obsolete energy-profile link is
  removed. No source values, renderers, ArcGIS items, or services are updated.
- Existing native building popups are retained. No building-selection-to-sidebar
  synchronization or fabricated selection has been added.

The household comparison is now a default-collapsed optional reference below the
metric definitions. Estimated PV generation is listed first and its explanation
is initially expanded. Household equivalence is shown in ordinary text, without
a featured count or colored result card.
