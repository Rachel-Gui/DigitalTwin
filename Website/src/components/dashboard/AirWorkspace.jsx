import { lazy, Suspense, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import ClaritySensorMap from "../ClaritySensorMap";
import useClarityData from "../../hooks/useClarityData";
import { formatAirQualityValue } from "../../data/airQuality";
import { AIR_QUALITY_TABLEAU_URL } from "../../data/tableauEmbed";
import WorkspaceIcon from "./WorkspaceIcon";

const AirQualityTableau=lazy(()=>import("../AirQualityTableau"));
const dateLabel=value=>value&&Number.isFinite(new Date(value).getTime())?new Date(value).toLocaleString([], {dateStyle:"medium",timeStyle:"short"}):"Not available";
export default function AirWorkspace({infoOpen,controlsSlot,onInspect}){
  const [view,setView]=useState("sensors");
  const sourceControls=<div className="twin-air-tabs" role="tablist" aria-label="Air quality data source">
      <button type="button" role="tab" aria-selected={view==="sensors"} onClick={()=>setView("sensors")}>Latest sensor observations<span>Clarity · DAISY</span></button>
      <button type="button" role="tab" aria-selected={view==="modeled"} onClick={()=>setView("modeled")}>Modeled PM₂.₅<span>Tableau · spatial predictions</span></button>
    </div>;
  return <section className="twin-air-workspace">
    {controlsSlot?createPortal(sourceControls,controlsSlot):sourceControls}
    {view==="sensors"?<SensorWorkspace infoOpen={infoOpen} controlsSlot={controlsSlot} onInspect={onInspect}/>:<div className={`twin-spatial-layout twin-modeled-layout ${infoOpen?"":"without-info"}`}>
      <div className="twin-map-column"><div className="twin-model-strip"><div><span>Model outputs</span><h2>Predicted annual-average PM₂.₅</h2></div><span className="twin-unit">µg/m³</span></div><div className="twin-tableau-host"><Suspense fallback={<div className="twin-loading" role="status">Loading PM₂.₅ visualization…</div>}><AirQualityTableau compact/></Suspense></div><div className="twin-map-footer"><span>Seattle · annual-average model outputs</span><a href={AIR_QUALITY_TABLEAU_URL} target="_blank" rel="noopener noreferrer">Open Tableau</a></div></div>
      {infoOpen&&<aside className="twin-information" id="twin-view-info"><div className="twin-panel-heading"><WorkspaceIcon name="info"/><h2>Modeled air quality</h2></div><p className="twin-description">The published prediction map covers Seattle. Zoom to South Park to inspect the pilot area.</p><div className="twin-info-block"><span className="twin-label">Evidence type</span><h3>Annual-average spatial prediction</h3><p>The visualization presents model estimates, rather than sensor observations at every location.</p></div><div className="twin-info-block"><h3>Read the model context</h3><p>Use the visualization’s legend, filters, and time context when comparing areas. Results remain separate from the latest Clarity sensor observations.</p></div><p className="twin-evidence-note">The published Tableau dashboard provides its own model controls and chart legends.</p></aside>}
    </div>}
  </section>;
}
function SensorWorkspace({infoOpen,controlsSlot,onInspect}){
  const {state,load,sources}=useClarityData();
  const [selected,setSelected]=useState(null);
  const inspectSensor=useCallback(source=>{setSelected(source);onInspect?.(true)},[onInspect]);
  const source=sources.find(item=>item.datasourceId===selected?.datasourceId)||null;
  const summary=state.data?.summary;
  const pending=state.loading&&!state.data;
  const refreshControl=<div className="twin-air-refresh"><button type="button" className="twin-refresh" onClick={load} disabled={state.loading}><WorkspaceIcon name="refresh"/>{state.loading?"Refreshing…":"Refresh observations"}</button></div>;
  return <div className={`twin-spatial-layout twin-sensor-layout ${infoOpen?"":"without-info"}`}>
    <div className="twin-map-column">
      {controlsSlot?createPortal(refreshControl,controlsSlot):refreshControl}
      {state.error&&<div className="twin-air-error" role="alert"><strong>Sensor data is unavailable</strong><p>{state.error}</p><button type="button" onClick={load} disabled={state.loading}>Try again</button></div>}
      <div className="twin-sensor-summary" aria-busy={state.loading}>
        <div><span>Network mean PM₂.₅</span><strong>{pending?"…":formatAirQualityValue(summary?.pm25Average)} <small>µg/m³</small></strong></div>
        <div><span>Highest latest PM₂.₅</span><strong>{pending?"…":formatAirQualityValue(summary?.pm25Maximum)} <small>µg/m³</small></strong></div>
        <div><span>Reporting locations</span><strong>{summary?.reportingLocations??"—"}<small> / {summary?.monitoringLocations??"—"}</small></strong></div>
      </div>
      <div className="twin-sensor-map"><ClaritySensorMap sources={sources} onSelect={inspectSensor} showPopups={false}/>{!sources.length&&<div className="twin-map-notice" role="status">{pending?"Loading sensor locations…":"No sensor measurements to display."}</div>}</div>
      <div className="twin-map-footer"><span>Newest observation: {dateLabel(state.data?.newestMeasurementAt)}</span><a href="https://openmap.clarity.io/" target="_blank" rel="noopener noreferrer">Open Clarity</a></div>
    </div>
    {infoOpen&&<aside className="twin-information" id="twin-view-info">
      <div className="twin-panel-heading"><WorkspaceIcon name="air"/><h2>{source?"Selected monitoring location":"Monitoring information"}</h2></div>
      <label className="twin-sensor-select">Monitoring location<select value={source?.datasourceId||""} onChange={event=>setSelected(event.target.value?{datasourceId:event.target.value}:null)}><option value="">Select a monitoring location</option>{sources.map(item=><option key={item.datasourceId} value={item.datasourceId}>{`DAISY · ${item.name.split("(")[0].trim()}`}</option>)}</select></label>
      {source?<><h3 className="twin-sensor-name">DAISY · {source.name.split("(")[0].trim()}</h3><dl className="twin-sensor-readings">{[["pm25","PM₂.₅","µg/m³"],["pm10","PM₁₀","µg/m³"],["no2","NO₂","ppb"]].map(([key,label,unit])=><div key={key}><dt>{label}</dt><dd>{formatAirQualityValue(source.metrics[key]?.value)} <small>{unit}</small></dd></div>)}</dl><div className="twin-info-block"><span className="twin-label">Latest observation at this location</span><p>{dateLabel(source.latestAt)}</p></div><button className="twin-text-button" type="button" onClick={()=>setSelected(null)}>Clear selection</button></>:<><p className="twin-description">View the latest available pollutant measurements from the DAISY monitoring network.</p><div className="twin-info-block twin-map-guide"><WorkspaceIcon name="map"/><h3>Select a sensor</h3><p>Select a marker to see its available PM₂.₅, PM₁₀, and NO₂ measurements here.</p></div></>}
      <div className="twin-info-block"><span className="twin-label">Reading the map</span><p>Marker colors describe PM₂.₅ concentration bands. These latest readings are not a daily AQI or a 24-hour regulatory assessment.</p><ul className="twin-concentration-legend"><li><i style={{background:"#2f8d70"}}/>≤ 9 µg/m³</li><li><i style={{background:"#b18a18"}}/>&gt; 9–35.4 µg/m³</li><li><i style={{background:"#c65334"}}/>&gt; 35.4 µg/m³</li></ul></div>
      <p className="twin-evidence-note">Latest available observations, not a continuous live feed. Successful server responses may be cached for up to 4 hours 45 minutes. Missing values are shown as —.</p>
    </aside>}
  </div>;
}
