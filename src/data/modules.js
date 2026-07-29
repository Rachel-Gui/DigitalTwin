export const modules = [
  { key: "air", title: "Air Quality", short: "Air Quality", path: "/air-quality", icon: "≈", tag: "Model integration", description: "Sensor and geospatial data support neighborhood-scale PM2.5 prediction and visualization." },
  { key: "energy", title: "Energy Modeling", short: "Energy", path: "/energy", icon: "▥", tag: "Published research", description: "Four residential archetypes support parametric building-energy simulation." },
  { key: "retrofit", title: "Health-Driven Retrofit", short: "Retrofit", path: "/retrofit", icon: "⌂", tag: "Published research", description: "Compare envelope, heat-pump, ventilation, filtration, and combined interventions." },
  { key: "renewable", title: "Renewable Energy", short: "Renewable", path: "/renewable", icon: "☼", tag: "In development", description: "Connect building geometry, energy demand, and renewable scenario records." },
  { key: "scenario", title: "Agentic AI", short: "Agentic AI", path: "/scenario-analysis", icon: "✦", tag: "Planned platform layer", description: "Guided querying, scenario comparison, and grounded explanation using project records and the knowledge graph." },
  { key: "vr", title: "VR & Community Engagement", short: "VR", path: "/vr", icon: "◉", tag: "Working prototype", description: "Represent PM2.5 across a 24-hour cycle around Concord International School." }
];

export const layers = {
  energy: ["Building Archetypes", "Annual EUI", "Heating Demand", "Cooling Demand", "Carbon Emissions"],
  retrofit: ["Retrofit Priority", "Envelope Upgrade", "Heat Pump", "Ventilation", "Combined Retrofit"],
  renewable: ["Solar Radiation", "Suitable Roof Area", "PV Potential", "Annual Generation", "Demand Coverage"],
  air: ["PM2.5", "Sensor Locations", "Exposure Hotspots", "Real-Time Conditions"],
  scenario: ["Scenario Boundaries", "Equity Indicators", "Resilience Factors", "Evidence Layers"],
  vr: ["Experience Locations", "Community Stories", "Learning Stations", "Return Portals"]
};

export const legendConfig = {
  energy: {
    "Building Archetypes": ["Building type", "Category"],
    "Annual EUI": ["Annual EUI", "kBtu/ft²·yr"],
    "Heating Demand": ["Heating demand", "kWh/yr"],
    "Cooling Demand": ["Cooling demand", "kWh/yr"],
    "Carbon Emissions": ["Operational carbon", "kg CO₂e/yr"]
  },
  retrofit: {
    "Retrofit Priority": ["Retrofit priority", "Low → High"],
    "Envelope Upgrade": ["Envelope savings", "%"],
    "Heat Pump": ["Heat-pump impact", "%"],
    "Ventilation": ["Ventilation impact", "%"],
    "Combined Retrofit": ["Combined savings", "%"]
  },
  renewable: {
    "Solar Radiation": ["Solar radiation", "kWh/m²·yr"],
    "Suitable Roof Area": ["Suitable roof area", "m²"],
    "PV Potential": ["PV capacity potential", "kW"],
    "Annual Generation": ["Annual generation", "kWh/yr"],
    "Demand Coverage": ["Demand coverage", "%"]
  },
  air: {
    "PM2.5": ["PM2.5 concentration", "µg/m³"],
    "Sensor Locations": ["Monitoring locations", "Sensor status"],
    "Exposure Hotspots": ["Exposure potential", "Lower → Higher"],
    "Real-Time Conditions": ["Current conditions", "Air-quality index"]
  },
  scenario: {
    "Scenario Boundaries": ["Scenario boundary", "Included areas"],
    "Equity Indicators": ["Equity indicator", "Relative index"],
    "Resilience Factors": ["Resilience factor", "Relative index"],
    "Evidence Layers": ["Evidence coverage", "Sources"]
  }
};

export const externalPlatforms = {
  airQuality: "https://example.com/air-quality-platform",
  vr: "https://example.com/vr-experience"
};
