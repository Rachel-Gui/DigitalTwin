import airMap from "../assets/air-quality/pm25-prediction-map.png";
import airDashboard from "../assets/air-quality/pm25-dashboard.png";
import energyArchetypes from "../assets/research/energy-archetypes.png";
import energyWorkflow from "../assets/research/energy-method-workflow.png";
import retrofitFigure from "../assets/retrofit/health-driven-retrofit-strategies.png";

export const modulePanels = [
  { number:"01", key:"air", title:"Air Quality", path:"/air-quality", description:"Sensor and geospatial data support neighborhood-scale PM2.5 prediction and visualization. The platform distinguishes measured observations from modeled and estimated conditions." },
  { number:"02", key:"energy", title:"Energy Modeling", path:"/energy", description:"Four residential archetypes support parametric simulation across envelope, HVAC, ventilation, and hot-water conditions. Model records connect defined inputs to building-energy outputs." },
  { number:"03", key:"retrofit", title:"Health-Driven Retrofit", path:"/retrofit", description:"The research compares envelope improvements, heat pumps, ventilation, filtration, and combined intervention packages. Energy and indoor-environment considerations are recorded together." },
  { number:"04", key:"renewable", title:"Renewable Energy", path:"/renewable", description:"This module links building geometry and energy demand with renewable-energy scenario records. Approved public outputs will be added with their source and status." },
  { number:"05", key:"scenario", title:"Agentic AI", path:"/scenario-analysis", description:"Guided querying, scenario comparison, and grounded explanation using project data, scenario records, and the knowledge graph." },
  { number:"06", key:"vr", title:"VR & Community Engagement", path:"/vr", description:"The immersive interface represents PM2.5 through a 24-hour cycle around Concord International School. Ground-level and bird’s-eye views support environmental communication." }
];

export const figures = {
  airMap: { src:airMap, title:"PM2.5 prediction visualization", detail:"Neighborhood and grid-scale model output", source:"DecarbCityTwin project materials", status:"Model integration in progress" },
  airDashboard: { src:airDashboard, title:"PM2.5 temporal dashboard", detail:"Interface view for examining time variation", source:"DecarbCityTwin project materials", status:"Project visualization" },
  energyArchetypes: { src:energyArchetypes, title:"Four residential archetypes", detail:"Single Family, Duplex, Quadplex, and Ten-Unit Apartment", source:"Abbasabadi et al., Architecture 2026, 6, 84", status:"Published research" },
  energyWorkflow: { src:energyWorkflow, title:"Energy modeling method workflow", detail:"Archetype definition, parametric simulation, and model-development sequence", source:"Abbasabadi et al., Architecture 2026, 6, 84", status:"Published research" },
  retrofit: { src:retrofitFigure, title:"Health-driven retrofit strategies", detail:"Modeled intervention sequence and indoor-environment considerations", source:"Abbasabadi et al., Architecture 2026, 6, 84", status:"Published research" }
};

export const frameworkStages = [
  ["Physical + Data Sources",["Building and energy records","Air-quality and exposure data","Weather and community input"]],
  ["Shared Backend + Cloud Infrastructure",["Data storage and APIs","Simulation services","Scenario records"]],
  ["Knowledge Graph + Semantic Layer",["Buildings, places, and people","Models and evidence","Relationships and provenance"]],
  ["Human-in-the-Loop Decision Support",["Scenario comparison","Evidence and uncertainty","Community evaluation"]],
  ["Interfaces + Outputs",["Web digital twin","VR experience","Research and policy records"]]
];
