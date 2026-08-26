import airMap from "../assets/air-quality/pm25-prediction-map.png";
import airDashboard from "../assets/air-quality/pm25-dashboard.png";
import energyArchetypes from "../assets/research/energy-archetypes.png";
import energyWorkflow from "../assets/research/energy-method-workflow.png";
import retrofitFigure from "../assets/retrofit/health-driven-retrofit-strategies.png";

export const modulePanels = [
  {
    number:"01",
    key:"energy",
    label:"Building Performance",
    title:"Urban Building Energy Modeling",
    path:"/energy",
    description:"Explore residential archetypes, building energy performance, and simulation-based energy records."
  },
  {
    number:"02",
    key:"air",
    label:"Environmental Sensing",
    title:"PM2.5 Concentration & Exposure Assessment",
    path:"/air-quality",
    description:"Examine monitored and modeled air-quality conditions across time and space."
  },
  {
    number:"03",
    key:"retrofit",
    label:"Building Intervention",
    title:"Health-Driven Retrofit & Decarbonization Strategies",
    path:"/retrofit",
    description:"Compare retrofit interventions related to energy performance, indoor environmental quality, and heat resilience."
  },
  {
    number:"04",
    key:"renewable",
    label:"Distributed Generation",
    title:"Solar & Renewable Energy Assessment",
    path:"/renewable",
    description:"Explore rooftop and façade solar potential and future renewable-energy scenarios."
  }
];

export const figures = {
  airMap: { src:airMap, title:"PM2.5 Concentration prediction visualization", detail:"Neighborhood and grid-scale model output · µg/m³", source:"DecarbCityTwin project materials", status:"Model integration in progress" },
  airDashboard: { src:airDashboard, title:"PM2.5 Concentration temporal dashboard", detail:"Interface view for examining PM2.5 Concentration variation · µg/m³", source:"DecarbCityTwin project materials", status:"Project visualization" },
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
