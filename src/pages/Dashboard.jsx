import { useState } from "react";
import { BuildingInfoPanel, LayerToggle, ScenarioCard, ViewerPanel } from "../components";
import { modules, layers, legendConfig, externalPlatforms } from "../data/modules";
import { scenarios } from "../data/scenarios";

export default function Dashboard() {
  const [mode, setMode] = useState("energy");
  const [layersOpen, setLayersOpen] = useState(true);
  const [infoOpen, setInfoOpen] = useState(true);
  const [activeLayer, setActiveLayer] = useState(layers.energy[0]);
  const [notice, setNotice] = useState("");
  const active = modules.find(m => m.key === mode);
  const changeMode = (nextMode) => {
    setMode(nextMode);
    if (nextMode !== "vr") setActiveLayer(layers[nextMode][0]);
  };
  const legend = mode === "vr" ? null : legendConfig[mode][activeLayer];
  const resetView = () => {
    if (mode !== "vr") setActiveLayer(layers[mode][0]);
    setNotice("Prototype controls reset. The embedded ArcGIS camera is unchanged.");
  };
  return <div className="dashboard-page">
    <div className="dashboard-heading"><div><span className="eyebrow">Interactive research environment</span><h1>South Park Digital Twin</h1></div><div className="prototype-badge"><i/> Frontend prototype</div></div>
    <div className="module-switcher" role="tablist" aria-label="Dashboard module">
      {modules.map(m=><button key={m.key} id={`tab-${m.key}`} role="tab" aria-controls="dashboard-workspace" aria-selected={mode===m.key} tabIndex={mode===m.key?0:-1} className={mode===m.key?"active":""} onClick={()=>changeMode(m.key)}><span aria-hidden="true">{m.icon}</span>{m.short}</button>)}
    </div>
    <div className="mobile-panel-controls"><button aria-controls="layer-panel" aria-expanded={layersOpen} onClick={()=>setLayersOpen(!layersOpen)}>{mode === "vr" ? "VR Gateway" : "Data Layers"} {layersOpen ? "−" : "+"}</button><button aria-controls="building-information" aria-expanded={infoOpen} onClick={()=>setInfoOpen(!infoOpen)}>Building Info {infoOpen ? "−" : "+"}</button></div>
    <div id="dashboard-workspace" className="dashboard-grid" role="tabpanel" aria-labelledby={`tab-${mode}`}>
      <aside id="layer-panel" className={`panel layer-panel ${layersOpen?"":"collapsed"}`}>
        {mode === "vr" ? <VRGateway /> : <>
          <div className="panel-title"><div><span className="eyebrow">{active.title}</span><h2>Data Layers</h2></div><span className="status">Prototype controls</span></div>
          <p>Planned layers are shown for interface testing. They do not yet control the ArcGIS viewer.</p>
          <div className="layer-list">{layers[mode].map((l,i)=><LayerToggle key={`${mode}-${l}`} label={l} defaultOn={i < 2} active={activeLayer===l} onActivate={setActiveLayer}/>)}</div>
          <div className="legend"><span>Map Legend</span><strong>{legend[0]}</strong><div><i/><i/><i/><i/><i/></div><small>Lower <b>{legend[1]}</b><span>Higher</span></small></div>
          <button className="outline-button" onClick={resetView}>Reset prototype controls</button>
          <p className="sr-only" aria-live="polite">{notice}</p>
        </>}
      </aside>
      <ViewerPanel />
      <div id="building-information" className={infoOpen?"":"mobile-hidden"}><BuildingInfoPanel mode={mode}/></div>
    </div>
    <section className="scenario-panel"><div className="scenario-heading"><div><span className="eyebrow">Comparative analysis</span><h2>Scenario workspace</h2></div><p>Values below are labels only; no project findings are represented.</p></div><div className="scenario-scroll">{scenarios.map(s=><ScenarioCard key={s.name} scenario={s}/>)}</div></section>
  </div>;
}

function VRGateway() {
  return <div className="vr-gateway">
    <span className="module-icon">◉</span>
    <span className="eyebrow">Connected experience</span>
    <h2>VR Experience Gateway</h2>
    <p>VR is an immersive mode connected to the same DecarbCityTwin research system. It does not use building-layer switches in this prototype.</p>
    <ul><li>Neighborhood exploration</li><li>Community engagement</li><li>Environmental education</li></ul>
    <a className="button" href={externalPlatforms.vr} target="_blank" rel="noreferrer">Open VR dashboard <span>↗</span></a>
    <small>External URL placeholder</small>
  </div>;
}
