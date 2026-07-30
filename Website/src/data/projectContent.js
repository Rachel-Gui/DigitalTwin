import airMap from "../assets/air-quality/pm25-prediction-map.png";
import airDashboard from "../assets/air-quality/pm25-dashboard.png";
import energyArchetypes from "../assets/research/energy-archetypes.png";
import energyWorkflow from "../assets/research/energy-method-workflow.png";
import retrofitFigure from "../assets/retrofit/health-driven-retrofit-strategies.png";

export const modulePanels = [
  {
    number:"01",
    key:"air",
    label:"Environmental Sensing",
    title:"Air Quality",
    path:"/air-quality",
    description:"Sensor records, geospatial variables, and prediction models are used to examine neighborhood-scale PM2.5 patterns across Seattle and the South Park testbed."
  },
  {
    number:"02",
    key:"energy",
    label:"Building Performance",
    title:"Energy Modeling",
    path:"/energy",
    description:"Four residential archetypes and EnergyPlus simulations characterize energy use under different envelope, HVAC, ventilation, and hot-water conditions."
  },
  {
    number:"03",
    key:"retrofit",
    label:"Building Intervention",
    title:"Health-Driven Retrofit",
    path:"/retrofit",
    description:"Compare envelope upgrades, heat pumps, ventilation, filtration, and combined retrofit packages in relation to energy use, indoor conditions, and decarbonization."
  },
  {
    number:"04",
    key:"renewable",
    label:"Distributed Generation",
    title:"Renewable Energy",
    path:"/renewable",
    description:"Monthly and annual roof and façade solar-potential results are linked to building footprints for building- and neighborhood-scale renewable-energy analysis."
  },
  {
    number:"05",
    key:"scenario",
    label:"Decision Support",
    title:"Agentic AI",
    path:"/scenario-analysis",
    description:"Guided queries connect building, environmental, and scenario records to support comparison, interpretation, and evidence-grounded explanation."
  },
  {
    number:"06",
    key:"vr",
    label:"Immersive Engagement",
    title:"VR & Community Engagement",
    path:"/vr",
    description:"An immersive interface translates PM2.5 data into time-based spatial experiences for community exploration around Concord International School and South Park."
  }
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
