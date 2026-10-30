import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTheme } from "../theme";
import WorkspaceIcon from "../components/dashboard/WorkspaceIcon";
import { spatialModels, arcgisUrl } from "../components/dashboard/workspaceContent";
import "./dashboard-workspace.css";
import "./dashboard-refinement.css";

const AirWorkspace = lazy(()=>import("../components/dashboard/AirWorkspace"));
const availableModes=["energy","retrofit","renewable","air"];
const navigation=[...Object.entries(spatialModels).map(([id,model])=>({id,label:model.short,icon:model.icon})),{id:"air",label:"Air Quality",icon:"air"}];

export default function Dashboard(){
  const [params,setParams]=useSearchParams();
  const requested=params.get("module");
  const mode=availableModes.includes(requested)?requested:"energy";
  const [infoOpen,setInfoOpen]=useState(()=>window.matchMedia("(min-width: 901px)").matches);
  const [controlsOpen,setControlsOpen]=useState(true);
  const [airControlSlot,setAirControlSlot]=useState(null);
  useEffect(()=>{
    const originalOverflow=document.body.style.overflow;
    document.body.style.overflow="hidden";
    return()=>{document.body.style.overflow=originalOverflow};
  },[]);
  const changeMode=next=>{const updated=new URLSearchParams(params);updated.set("module",next);setParams(updated)};
  const model=mode==="air"?null:spatialModels[mode];
  return <div className="dashboard-page twin-workspace-page twin-immersive twin-refined">
    <div className="twin-app">
      <aside id="twin-assessment-controls" className="twin-control-dock" aria-label="Assessment controls" hidden={!controlsOpen}>
        <div className="twin-analysis-card">
          <div className="twin-study-picker"><WorkspaceIcon name="map"/><div><h1>South Park</h1><span>Seattle, Washington</span></div><span className="twin-study-tag">PILOT STUDY</span></div>
          <nav className="twin-rail" aria-label="Digital Twin module">{navigation.map(item=><button type="button" key={item.id} aria-pressed={mode===item.id} onClick={()=>changeMode(item.id)}><WorkspaceIcon name={item.icon}/><span>{item.label}</span></button>)}</nav>
          <div className="twin-assessment-summary"><span className="twin-source-tag">{model?model.badge:"Observations & model outputs"}</span><h2>{model?model.title:"Air quality"}</h2><p>{model?model.description:"Explore the latest DAISY sensor observations and modeled annual-average PM₂.₅ across Seattle."}</p>
            {model&&<div className="twin-active-measure"><span>Map measure</span><strong>{model.metric}</strong><small>{model.unit}</small></div>}
          </div>
          <div className="twin-air-control-slot" ref={setAirControlSlot}/>
        </div>
      </aside>
      <div className="twin-content">
        <div className="twin-toolbar-actions"><button type="button" aria-label={controlsOpen?"Hide assessment controls":"Show assessment controls"} aria-expanded={controlsOpen} aria-controls="twin-assessment-controls" onClick={()=>setControlsOpen(!controlsOpen)}><WorkspaceIcon name="layers"/><span>Analysis</span></button><button type="button" aria-label={infoOpen?"Hide data and methods":"Show data and methods"} aria-expanded={infoOpen} aria-controls="twin-view-info" onClick={()=>setInfoOpen(!infoOpen)}><WorkspaceIcon name="info"/><span>Data & methods</span></button></div>
        {mode==="air"?<Suspense fallback={<div className="twin-loading" role="status">Loading air-quality workspace…</div>}><AirWorkspace infoOpen={infoOpen} controlsSlot={airControlSlot} onInspect={setInfoOpen}/></Suspense>:<SpatialWorkspace key={mode} mode={mode} infoOpen={infoOpen} controlsOpen={controlsOpen}/>}
      </div>
    </div>
  </div>;

}

function SpatialWorkspace({mode,infoOpen,controlsOpen}){
  const model=spatialModels[mode];
  const {theme}=useTheme();
  const [reload,setReload]=useState(0);
  const [frameLoaded,setFrameLoaded]=useState(false);
  const [frameError,setFrameError]=useState(false);
  const frame=useRef(null);
  const src=`/twin-scene.html?scene=${model.sceneId}`;
  const syncTheme=()=>frame.current?.contentWindow?.postMessage({type:"decarb-theme",theme},window.location.origin);
  useEffect(()=>{syncTheme()},[theme]);
  useEffect(()=>{
    const onMessage=event=>{if(event.origin!==window.location.origin||event.source!==frame.current?.contentWindow||event.data?.sceneId!==model.sceneId)return;if(["decarb-scene-ready","decarb-scene-error"].includes(event.data.type)){setFrameLoaded(true);setFrameError(event.data.type==="decarb-scene-error")}};
    window.addEventListener("message",onMessage);
    return()=>window.removeEventListener("message",onMessage);
  },[model.sceneId]);
  useEffect(()=>{frame.current?.contentWindow?.postMessage({type:"decarb-panels",controlsOpen,infoOpen},window.location.origin)},[controlsOpen,infoOpen,frameLoaded]);
  const reloadScene=()=>{setFrameLoaded(false);setFrameError(false);setReload(value=>value+1)};
  return <section className={`twin-spatial-layout ${infoOpen?"":"without-info"}`} aria-label={model.title}>
    <div className="twin-map-column">
      <div className="twin-map-stage">
        {!frameLoaded&&<div className="twin-map-loading" role="status"><span/>Loading South Park 3D scene…</div>}
        <iframe ref={frame} key={`${mode}-${reload}`} src={src} title={`South Park ${model.title} interactive 3D scene`} onLoad={syncTheme} allowFullScreen/>
      </div>
      <div className="twin-map-footer"><span><i/>Published South Park model · ArcGIS</span></div>
      <details className="twin-map-options"><summary aria-label="Map options"><WorkspaceIcon name="more"/></summary><div><button type="button" onClick={reloadScene}><WorkspaceIcon name="refresh"/>Reload scene</button><a href={arcgisUrl(model)} target="_blank" rel="noopener noreferrer">Open in ArcGIS</a></div></details>
      {frameError&&<div className="twin-recovery" role="alert"><strong>The scene could not load.</strong><button type="button" onClick={reloadScene}>Try again</button><a href={arcgisUrl(model)} target="_blank" rel="noopener noreferrer">Open in ArcGIS </a></div>}
    </div>
    {infoOpen&&<aside className="twin-information" id="twin-view-info">
      <div className="twin-panel-heading"><WorkspaceIcon name="info"/><h2>Data & methods</h2></div>
      <div className="twin-info-block"><span className="twin-label">Available in building details</span><ul>{model.fields.map(field=><li key={field}><i/>{field}</li>)}</ul></div>
      <details className="twin-guide-details"><summary>How to explore the scene</summary><p>{model.guide}</p><p>Use zoom, rotation, saved views, and the legend inside the map.</p></details>
      {model.href&&<Link className="twin-primary-link" to={model.href}>{model.action}</Link>}
      <p className="twin-evidence-note">{model.note}</p>
    </aside>}
  </section>;
}
