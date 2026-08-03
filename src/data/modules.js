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
  renewable: ["Annual Roof Solar Potential", "Annual Façade Solar Potential", "Monthly Roof Results", "Monthly Façade Results"]
};

export const externalPlatforms = {
  airQuality: "https://openmap.clarity.io/",
  agentic: "https://example.com/decarbcitytwin-agent",
  vr: import.meta.env.VITE_VR_URL || "http://localhost:3000"
};
