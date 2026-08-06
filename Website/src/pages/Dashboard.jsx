import { lazy, Suspense, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import vrPreview from "../assets/vr/concord-pm25-particle-view.png";
import { ViewerPanel } from "../components";
import { modules, layers, externalPlatforms } from "../data/modules";

const AirQualityTableau = lazy(() => import("../components/AirQualityTableau"));
const spatialModes = new Set(["energy", "retrofit", "renewable"]);
const digitalTwinModules = modules.filter((module) => spatialModes.has(module.key));

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedMode = searchParams.get("module");
  const initialMode = digitalTwinModules.some((module) => module.key === requestedMode)
    ? requestedMode
    : "energy";
  const [mode, setMode] = useState(initialMode);

  const changeMode = (nextMode) => {
    setMode(nextMode);
    setSearchParams({ module: nextMode }, { replace: true });
  };

  return <div className="dashboard-page">
    <div className="dashboard-heading">
      <div><span className="eyebrow">Interactive research environment</span><h1>South Park Digital Twin</h1></div>
      <div className="prototype-badge"><i/> Frontend prototype</div>
    </div>
    <div className="module-switcher" role="tablist" aria-label="Digital Twin module">
      {digitalTwinModules.map((module) => <button
        key={module.key}
        role="tab"
        aria-selected={mode === module.key}
        className={mode === module.key ? "active" : ""}
        onClick={() => changeMode(module.key)}
      ><span>{module.icon}</span>{module.short}</button>)}
    </div>

    {mode === "air" && <AirQualityWorkspace />}
    {spatialModes.has(mode) && <SpatialWorkspace mode={mode} />}
    {mode === "scenario" && <AgenticWorkspace />}
    {mode === "vr" && <VRWorkspace />}
  </div>;
}

function AirQualityWorkspace() {
  return <section className="dashboard-special-workspace dashboard-tableau-workspace">
    <header className="workspace-intro">
      <span className="eyebrow">Air Quality analytics</span>
      <h2>PM2.5 Concentration Prediction and Visualization</h2>
      <p>The dashboard presents project PM2.5 Concentration model outputs and spatial patterns at neighborhood and grid scales.</p>
      <Link to="/air-quality">Open full Air Quality Dashboard ↗</Link>
    </header>
    <Suspense fallback={<div className="tableau-route-loading" role="status">Preparing the interactive dashboard…</div>}>
      <AirQualityTableau compact />
    </Suspense>
  </section>;
}

function SpatialWorkspace({ mode }) {
  const module = modules.find((item) => item.key === mode);
  return <>
    <div className="dashboard-grid spatial-workspace">
      <aside className="panel layer-panel">
        <div className="panel-title">
          <div><span className="eyebrow">{module.title}</span><h2>Planned layers</h2></div>
          <span className="status">Pending</span>
        </div>
        <p>These dataset fields are planned for the interface. They do not yet control the embedded ArcGIS Web Scene.</p>
        <div className="planned-layer-list">
          {layers[mode].map((label) => <div key={label}><span>{label}</span><small>Pending</small></div>)}
        </div>
        {mode === "renewable" && <p className="renewable-legend-help">Open the Layers panel in the map controls, then select the Legend tab to interpret the solar-potential colors.</p>}
      </aside>
      <ViewerPanel />
      <PendingBuildingPanel mode={mode} />
    </div>
  </>;
}

function PendingBuildingPanel({ mode }) {
  const messages = {
    energy: "Select a building in the map to view available energy and archetype records.",
    retrofit: "Select a building in the map to view available retrofit scenario records.",
    renewable: "Select a building in the map to view available roof and façade solar-potential records."
  };
  return <aside className="panel building-panel pending-building-panel">
    <div className="panel-title">
      <div><span className="eyebrow">Data connection pending</span><h2>Selected Building</h2></div>
      <span className="status">Pending</span>
    </div>
    <p>{messages[mode]}</p>
    <div className="pending-record">
      <span>Map-to-interface connection</span>
      <strong>Under development</strong>
    </div>
    <p className="data-note">No illustrative building values or scenario results are shown as connected project data.</p>
  </aside>;
}

function AgenticWorkspace() {
  const questions = [
    "Compare baseline and retrofit conditions.",
    "Explain which evidence supports a scenario.",
    "Summarize available energy and air-quality records.",
    "Identify missing data or uncertainty."
  ];
  return <section className="dashboard-special-workspace gateway-workspace">
    <header className="workspace-intro">
      <span className="eyebrow">Decision support</span>
      <h2>Agentic AI</h2>
      <p>Guided queries connect building, environmental, and scenario records to support comparison, interpretation, and evidence-grounded explanation.</p>
    </header>
    <div className="gateway-grid">
      <div className="integration-gateway">
        <span className="status">Integration gateway</span>
        <h3>Project agent connection</h3>
        <p>The working agent component has not yet been connected to this frontend. This gateway does not simulate a chat interface.</p>
        <a className="button" href={externalPlatforms.agentic} target="_blank" rel="noreferrer">Open Agentic Model ↗</a>
        <small>Configurable placeholder URL</small>
      </div>
      <div className="example-query-list">
        <span className="eyebrow">Example questions</span>
        {questions.map((question, index) => <div key={question}><b>{String(index + 1).padStart(2, "0")}</b><p>{question}</p></div>)}
      </div>
    </div>
  </section>;
}

function VRWorkspace() {
  return <section className="dashboard-special-workspace gateway-workspace vr-dashboard-workspace">
    <header className="workspace-intro">
      <span className="eyebrow">Immersive engagement</span>
      <h2>VR &amp; Community Engagement</h2>
      <p>The VR environment translates PM2.5 Concentration (µg/m³) data into time-based spatial experiences for community exploration and education.</p>
    </header>
    <div className="vr-gateway-layout">
      <img src={vrPreview} alt="Ground-level PM2.5 Concentration VR environment around Concord International School"/>
      <div>
        <ul>
          <li>Ground-level exploration</li>
          <li>Bird’s-eye neighborhood view</li>
          <li>High- and low-PM2.5-Concentration comparison</li>
          <li>Community engagement</li>
        </ul>
        <a className="button" href={externalPlatforms.vr} target="_blank" rel="noreferrer">Enter VR Experience ↗</a>
        <small>External experience URL pending confirmation</small>
      </div>
    </div>
  </section>;
}
