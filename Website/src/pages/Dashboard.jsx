import { lazy, Suspense, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import vrPreview from "../assets/vr/concord-pm25-particle-view.png";
import { ViewerPanel } from "../components";
import { modules, externalPlatforms } from "../data/modules";

const AirQualityTableau = lazy(() => import("../components/AirQualityTableau"));
const LiveAirQualityContent = lazy(() => import("../components/LiveAirQualityContent"));
const spatialModes = new Set(["energy", "retrofit", "renewable"]);
const digitalTwinModules = ["energy", "retrofit", "renewable", "air"].map((key) => modules.find((module) => module.key === key));
const spatialViewers = {
  energy: {
    src: "https://uw.maps.arcgis.com/apps/instant/3dviewer/index.html?appid=9754941f6944410e88f2b4777450925b",
    title: "South Park Energy Modeling 3D Viewer",
    description: "Explore modeled baseline energy use across South Park residential buildings."
  },
  retrofit: {
    src: "https://uw.maps.arcgis.com/apps/instant/3dviewer/index.html?appid=817bebb1f30b4ebfa3893d45555fa846",
    title: "South Park Retrofit Opportunities 3D Viewer",
    description: "Explore modeled retrofit opportunities and potential energy savings."
  },
  renewable: {
    src: "https://uw.maps.arcgis.com/apps/instant/3dviewer/index.html?appid=9d99a4a0c2e2482b912608249bf3248f",
    title: "South Park Solar Potential 3D Viewer",
    description: "Explore modeled rooftop and façade solar potential."
  }
};

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedMode = searchParams.get("module");
  const initialMode = digitalTwinModules.some((module) => module.key === requestedMode)
    ? requestedMode
    : "energy";
  const [mode, setMode] = useState(initialMode);
  const [airQualityView, setAirQualityView] = useState("live");

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
      ><span>{module.icon}</span>{module.key === "air" ? "Air Quality" : module.short}</button>)}
    </div>

    {mode === "air" && <AirQualityWorkspace view={airQualityView} onViewChange={setAirQualityView} />}
    {spatialModes.has(mode) && <SpatialWorkspace mode={mode} />}
    {mode === "scenario" && <AgenticWorkspace />}
    {mode === "vr" && <VRWorkspace />}
  </div>;
}

function AirQualityWorkspace({ view, onViewChange }) {
  const modeled = view === "modeled";
  return <section className="dashboard-special-workspace dashboard-tableau-workspace dashboard-air-workspace">
    <div className="air-quality-subtabs" role="tablist" aria-label="Air Quality view">
      <button type="button" role="tab" aria-selected={!modeled} className={!modeled ? "active" : ""} onClick={() => onViewChange("live")}>Live Sensors</button>
      <button type="button" role="tab" aria-selected={modeled} className={modeled ? "active" : ""} onClick={() => onViewChange("modeled")}>Modeled PM₂.₅</button>
    </div>
    <p className="air-quality-view-description">{modeled ? "Explore modeled neighborhood-scale PM₂.₅ patterns across South Park." : "View the latest available PM₂.₅ measurements from active community sensors."}</p>
    <div className="air-quality-viewer-label"><span>{modeled ? "MODELED ESTIMATE" : "SENSOR MEASUREMENTS · LATEST AVAILABLE"}</span><span>{modeled ? "Tableau visualization" : "Clarity monitoring network"}</span></div>
    <Suspense fallback={<div className="tableau-route-loading" role="status">Preparing the Air Quality visualization…</div>}>
      {modeled ? <AirQualityTableau compact /> : <div className="dashboard-live-air-content"><LiveAirQualityContent /></div>}
    </Suspense>
    <Link className="air-quality-module-link" to="/air-quality">Explore Air Quality Module →</Link>
  </section>;
}

function SpatialWorkspace({ mode }) {
  const viewer = spatialViewers[mode];
  return <div className="dashboard-grid spatial-workspace spatial-workspace-map-only">
    <ViewerPanel {...viewer} />
  </div>;
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
