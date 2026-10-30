import "./vr-refinement.css";
import PageScrollRuler from "../components/home/PageScrollRuler";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import airMap from "../assets/air-quality/pm25-prediction-map.png";
import clarityScreenshot from "../assets/air-quality/clarity-screenshot.png";
import vrConcord from "../assets/vr/concord-pm25-particle-view.png";
import vrCity from "../assets/vr/south-park-neighborhood-visualization.png";
import vrDashboard from "../assets/vr/concord-vr-hero.png";
import vrGuideArtwork from "../assets/vr/concord-immersive-guide.png";
import liveDataArchitecture from "../assets/vr/live-data-architecture-updated.png";
import liveDataArchitectureDark from "../assets/vr/live-data-architecture-dark.png";
import { useTheme } from "../theme";
import renewableMap from "../assets/home/south-park-arcgis-preview.png";
import { PublicationRecord, SectionHeader, SourceCaption, StatusLabel } from "../components";
import { Link } from "react-router-dom";
import { externalPlatforms } from "../data/modules";

const AirQualityTableau = lazy(() => import("../components/AirQualityTableau"));

export default function ModulePage({type}){
  return ({vr:<VRPage/>,scenario:<ScenarioPage/>})[type]||null;
}
function ModuleHero({index,status,title,subtitle,children,className="",heroImage}){
  const heroStyle=heroImage ? {backgroundImage:`linear-gradient(90deg,rgba(5,5,5,.96) 0%,rgba(5,5,5,.82) 42%,rgba(5,5,5,.38) 100%),url(${heroImage})`} : undefined;
  return <section className={`module-editorial-hero ${className}`} style={heroStyle}><div><span>{index} / MODULE</span>{status&&<StatusLabel>{status}</StatusLabel>}</div><h1>{title}</h1><p>{subtitle}</p>{children}</section>
}
function Figure({src,title,detail,source,status}){return <figure className="research-figure"><div className="figure-image"><img src={src} alt={title}/></div><SourceCaption title={title} detail={detail} source={source} status={status}/></figure>}

function RetrofitPage(){
  const dimensions=[
    ["Energy Performance",["Heating and cooling demand","Electrification","Whole-building energy use"]],
    ["Indoor Environment",["Ventilation and filtration","Thermal comfort","Indoor particle exposure"]],
    ["Resilience + Equity",["Heat-event resilience","Vulnerable households","Access to healthy indoor conditions"]]
  ];
  const interventions=[
    ["01 / Baseline","Existing condition","Reference building condition used for comparison."],
    ["02 / Envelope","Envelope upgrade","Changes insulation, windows, and air sealing."],
    ["03 / Heat Pump","Electric heating and cooling","Changes the space-conditioning system and introduces mechanical cooling."],
    ["04 / Ventilation","ERV + filtered outdoor air","Introduces mechanical ventilation, filtration, and heat recovery."],
    ["05 / Hot Water","Efficient water heating","Changes domestic hot-water system type and efficiency."],
    ["06 / Combined","Integrated package","Evaluates multiple interventions as one coordinated scenario."]
  ];
  const matrix=[
    ["Envelope","Evaluated","Evaluated","Indirect","Not assessed"],
    ["Heat pump","Evaluated","Evaluated","Indirect","Included"],
    ["ERV / filtered ventilation","Included","Indirect","Evaluated","Indirect"],
    ["Hot-water system","Evaluated","Not assessed","Not assessed","Included"],
    ["Combined package","Evaluated","Evaluated","Evaluated","Included"]
  ];
  return <div className="module-page retrofit-page">
    <section className="retrofit-hero"><div className="page-container">
      <div className="retrofit-hero-meta"><span className="eyebrow">Health-Driven Retrofit</span><StatusLabel>Published Research · Platform Integration in Progress</StatusLabel></div>
      <h1>Retrofitting for energy, indoor air quality, and heat resilience.</h1>
      <p>This module presents the research basis, intervention strategies, and energy and indoor-environment co-benefits examined through the DecarbCityTwin project. It connects building retrofit scenarios with thermal comfort, ventilation, filtration, electrification, and energy performance.</p>
      <Link className="button light-button" to="/dashboard?module=retrofit">Open in Digital Twin — Retrofit </Link>
    </div></section>

    <section className="retrofit-section"><div className="page-container">
      <SectionHeader eyebrow="01 / Research Context" title="Retrofit is more than energy reduction." text="Older housing may face overlapping challenges related to energy performance, overheating, ventilation, filtration, and indoor environmental quality. Health-driven retrofit evaluates these conditions together rather than treating energy, comfort, and exposure as separate questions."/>
      <div className="retrofit-dimensions">{dimensions.map(([title,items])=><article key={title}><h3>{title}</h3><ul>{items.map(item=><li key={item}>{item}</li>)}</ul></article>)}</div>
      <p className="retrofit-scope-note">These categories describe evaluation dimensions, not guaranteed project outcomes.</p>
    </div></section>

    <section className="retrofit-section"><div className="page-container">
      <SectionHeader eyebrow="02 / Intervention Scenarios" title="From existing conditions to combined retrofit packages."/>
      <div className="retrofit-interventions">{interventions.map(([label,title,text])=><article key={label}><span>{label}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div>
    </div></section>

    <section className="retrofit-section"><div className="page-container">
      <SectionHeader eyebrow="03 / Evaluation Framework" title="What each intervention is designed to evaluate."/>
      <div className="retrofit-matrix-wrap" tabIndex="0" role="region" aria-label="Retrofit co-benefit comparison matrix">
        <table className="retrofit-matrix"><thead><tr>{["Scenario","Energy Performance","Thermal Comfort","Ventilation + Filtration","Electrification"].map(column=><th key={column} scope="col">{column}</th>)}</tr></thead><tbody>{matrix.map(([scenario,...statuses])=><tr key={scenario}><th scope="row">{scenario}</th>{statuses.map((status,index)=><td key={`${scenario}-${index}`}>{status}</td>)}</tr>)}</tbody></table>
      </div>
      <p className="retrofit-scope-note">The matrix describes the intended analytical scope of each intervention. Detailed values should only be shown after validated scenario records are connected.</p>
    </div></section>

    <section className="retrofit-section retrofit-evidence"><div className="page-container">
      <SectionHeader eyebrow="04 / Research Evidence" title="Published and ongoing research."/>
      <PublicationRecord href="https://doi.org/10.3390/architecture6020084"/>
      <article className="retrofit-review-record"><StatusLabel>Under Review</StatusLabel><h3>Additional project research</h3><p>The approved title, authors, visualization, and preprint link will be added after author approval.</p></article>
    </div></section>

    <section className="retrofit-section retrofit-platform"><div className="page-container">
      <SectionHeader eyebrow="05 / Platform Connection" title="From research scenarios to spatial exploration." text="Retrofit scenarios are planned for connection to building and archetype records in the Digital Twin, where users can examine intervention packages alongside energy, environmental, and building information."/>
      <div className="retrofit-actions"><Link className="button light-button" to="/dashboard?module=retrofit">Explore Retrofit in the Digital Twin </Link><Link className="button retrofit-secondary-action" to="/scenario-analysis">Ask about retrofit scenarios </Link></div>
    </div></section>
  </div>
}

function AirPage(){
  return <div className="module-page editorial-page air-quality-page">
    <section className="air-hero"><div className="page-container">
      <span className="eyebrow">PM2.5 Concentration</span>
      <h1>Monitoring and modeling neighborhood PM2.5 Concentration.</h1>
      <p>The PM2.5 Concentration module brings together sensor measurements, geospatial variables, and prediction models to examine how PM2.5 Concentration (µg/m³) varies across time and space in South Park and the wider Seattle area.</p>
      <a className="button light-button" href="#air-quality-dashboard">Explore the dashboard </a>
    </div></section>

    <section className="air-process"><div className="page-container">
      <SectionHeader eyebrow="Module process" title="From observations to spatial estimates."/>
      <div className="air-process-steps">
        {[
          ["01 / Observe","Sensors record time-based PM2.5 Concentration measurements in µg/m³ at monitoring locations."],
          ["02 / Model","Geospatial variables and prediction models estimate PM2.5 Concentration between monitoring locations."],
          ["03 / Explore","Interactive dashboards and project figures make spatial and temporal patterns available for interpretation."]
        ].map(([title,text])=><article key={title}><span>{title}</span><p>{text}</p></article>)}
      </div>
    </div></section>

    <section className="air-monitoring"><div className="page-container">
      <div className="air-monitoring-copy">
        <span className="eyebrow">Live monitoring</span>
        <h2>Sensor observations over time.</h2>
        <p>The Clarity platform provides access to PM2.5 Concentration monitoring locations and time-based measurements in µg/m³ associated with the South Park and Duwamish Valley study area. These records represent observed PM2.5 Concentration at specific sensor locations.</p>
        <a className="button" href={externalPlatforms.airQuality} target="_blank" rel="noreferrer">Open monitoring platform </a>
      </div>
      <figure className="clarity-figure">
        <img src={clarityScreenshot} alt="Clarity platform map, PM2.5 Concentration sensor locations, and time-series measurements in micrograms per cubic meter"/>
        <figcaption>Clarity monitoring interface · Observed measurements at sensor locations</figcaption>
      </figure>
    </div></section>

    <section className="air-spatial-section">
      <div className="air-spatial-intro page-container">
        <span className="eyebrow">Spatial prediction</span>
        <h2>Predicted PM2.5 Concentration patterns across Seattle.</h2>
        <p>The prediction dashboard presents modeled PM2.5 Concentration (µg/m³) across neighborhood and grid scales. It complements point-based monitoring records by showing estimated spatial variation between sensor locations.</p>
      </div>
      <Suspense fallback={<div className="tableau-route-loading" role="status">Preparing the interactive dashboard…</div>}><AirQualityTableau compact showGuidance/></Suspense>
    </section>

    <section className="air-model-output"><div className="page-container">
      <div className="air-output-copy">
        <span className="eyebrow">Model output</span>
        <h2>Annual mean PM2.5 Concentration prediction.</h2>
        <p>A project model output showing predicted annual mean PM2.5 Concentration across the study domain. The figure provides a static research record that complements the interactive Tableau view.</p>
      </div>
      <Figure src={airMap} title="Annual mean PM2.5 Concentration prediction" detail="Static Random Forest model output showing predicted PM2.5 Concentration across the study domain · µg/m³." source="DecarbCityTwin PM2.5 Concentration project materials" status="Modeled project output"/>
    </div></section>

  </div>
}
function VRPage(){
  const vrBase=externalPlatforms.vr.replace(/\/+$/g,"");
  const scenes=[
    {index:"01",label:"SCHOOL-SCALE PM2.5 CONCENTRATION MODEL",title:"Concord International School",description:"Explore the six-zone PM2.5 Concentration profile (µg/m³), hourly replay, changing sunlight, and local particle-zone readings.",date:"2024-04-23 · Tuesday",time:"00:00–23:00",type:"Historical PurpleAir data visualized as a modeled particle profile",source:"PurpleAir · 23 April 2024 · PHI EarthDay.gh",image:vrGuideArtwork,href:`${vrBase}/#concord`},
    {index:"02",label:"NEIGHBORHOOD-SCALE PM2.5 CONCENTRATION MODEL",title:"South Park, Seattle",description:"Explore modeled road-network PM2.5 Concentration (µg/m³) using observed weather conditions and the restored GIS model.",date:"Selectable historical dates · default 2025-01-29 (Wednesday)",time:"00:00–23:00 · America/Los_Angeles",type:"Historical observations driving a modeled particle simulation",source:"pm25_with_wind.xlsx · Sheet1",image:vrCity,href:`${vrBase}/#south-park`}
  ];
  const interfaceElements=[
    ["01","Time / hourly reading","Select an hour to view its PM2.5 reading and daylight condition."],
    ["02","PM2.5 concentration","Fine-particle concentration in µg/m³; visible particles are not to physical scale."],
    ["03","24-hour average","Mean of the daily profile: 16.1 µg/m³ in the example."],
    ["04","Hourly peak","Highest hourly reading: 22.5 µg/m³ in the example."],
    ["05","24-hour reference","EPA comparison benchmark; not an hourly limit or attainment finding."],
    ["06","24-hour AQI","Daily concentration expressed as a health category: 64, Moderate, in the example."],
    ["07","24-hour trend","Hourly changes shown against the reference line."],
    ["08","Local concentration zones","Compare modeled values around the school at the same hour."],
    ["09","Scene and data context","Check the scene, date, source, and simulation label."],
    ["10","Immersive controls","Select scenes, replay time, start the tour, or enter VR on a compatible headset."]
  ];
  const knowledgeQuestions=[
    ["SCENE / CONCORD SCHOOL","Why are there six particle zones around the school?","The Concord scene reproduces six modeled particle zones from the Grasshopper profile. They help compare local differences around the school, but they are not a complete hour-by-hour atmospheric dispersion model."],
    ["SCENE / SOUTH PARK","Why do the particles move along the roads?","South Park uses historical wind direction and speed to influence particle motion along a restored road volume. This is a simplified visual simulation—not CFD—and does not represent every emission, turbulence, temperature, or chemistry process."],
    ["BASIC CONCEPT","What exactly is PM2.5?","PM2.5 means fine particulate matter with a diameter of 2.5 micrometers or smaller. It is measured as a mass concentration in the air and can penetrate deeply into the respiratory system."],
    ["BASIC CONCEPT","What does µg/m³ mean?","It means micrograms per cubic meter—the amount of PM2.5 mass contained in one cubic meter of air. This is the unit used by the values in the VR interface."],
    ["READING THE PANEL","What is the 24-hour average?","It is the mean PM2.5 concentration across the displayed 24-hour profile. It gives a broader daily view than a single hourly reading and is used for the displayed AQI context."],
    ["READING THE PANEL","What does AQI tell me?","The Air Quality Index translates pollutant concentration into a public-health category, from Good through Hazardous. It is a communication scale, not a direct measurement or diagnosis."],
    ["READING THE PANEL","Why is there an EPA reference line?","The reference line helps compare the displayed daily concentration with a 24-hour benchmark. It is contextual in this prototype, not an hourly legal limit or an attainment determination."],
    ["TECHNOLOGY","What is VR in this project?","VR means Virtual Reality: a spatial experience that surrounds the viewer and can be explored on a monitor or through a compatible headset."],
    ["TECHNOLOGY","What does WebXR do?","WebXR is a browser standard that lets the same web scene enter an immersive headset session without requiring a separate native application."],
    ["EXPERIENCE","What should I look at first?","Start with the scene and particle density, then check the time, hourly reading, 24-hour average, peak, trend, and local zones. Together they connect the visible atmosphere to the data behind it."]
  ];
  const airQualityStandards=[
    ["good","Good","0–50","0.0–9.0 µg/m³","Air quality is satisfactory, with little or no health risk."],
    ["moderate","Moderate","51–100","9.1–35.4 µg/m³","Air quality is acceptable; unusually sensitive people may be at risk."],
    ["sensitive","Unhealthy for Sensitive Groups","101–150","35.5–55.4 µg/m³","Sensitive groups may experience health effects."],
    ["unhealthy","Unhealthy","151–200","55.5–125.4 µg/m³","Some members of the general public may experience health effects."],
    ["very-unhealthy","Very Unhealthy","201–300","125.5–225.4 µg/m³","Health alert: the risk of health effects is increased for everyone."],
    ["hazardous","Hazardous","301–500","225.5+ µg/m³","Health warning of emergency conditions; everyone is more likely to be affected."]
  ];
  return <div className="vr-page">
    <PageScrollRuler/>
    <section className="vr-research-hero">
      <div className="vr-research-intro"><h1>Making the<br/>invisible <em>spatial.</em></h1><div><p>Explore urban air quality through immersive environments. Two scales connect PM2.5 data with the places we inhabit.</p></div></div>
      <figure className="vr-research-cover"><img src={vrDashboard} alt="Concord School VR scene showing historical PM2.5 particle visualization, time controls, and concentration readings"/><figcaption><span>FIG. 01 / AIR QUALITY AS A SPATIAL EXPERIENCE</span><span>Desktop + WebXR · Simulated particles</span></figcaption></figure>
      <dl className="vr-research-facts"><div><dt>RESEARCH CONTEXT</dt><dd>Urban air quality</dd></div><div><dt>STUDY AREA</dt><dd>South Park, Seattle</dd></div><div><dt>SPATIAL SCALES</dt><dd>School / Neighborhood</dd></div></dl>
    </section>
    <section className="vr-entry-section" id="vr-scenes">
      <header className="vr-entry-heading"><div><span>01 / IMMERSIVE SCENES</span><h2>Choose an environment.</h2></div><p>Each scene opens the working 3D application directly. Explore on desktop with a mouse and keyboard, or select Enter VR inside the scene with a compatible browser and headset.</p></header>
      <div className="vr-scene-grid">{scenes.map(scene=><article className="vr-scene-card" key={scene.index}>
        <div className="vr-scene-image"><img src={scene.image} alt={scene.index==="02"?"South Park neighborhood concept visualization with white building models and a colored environmental layer":`${scene.title} interactive VR scene preview`} loading="lazy"/></div>
        <div className="vr-scene-copy"><h3>{scene.title}</h3><p>{scene.description}</p>
          <a className="vr-scene-launch" href={scene.href} target="_blank" rel="noopener noreferrer"><span>{scene.index==="01"?"Enter Concord VR":"Enter South Park VR"}</span></a>
        </div>
        <details className="vr-scene-data"><summary>Scene data &amp; sources <span aria-hidden="true">+</span></summary><dl className="vr-scene-provenance"><div><dt>Date represented</dt><dd>{scene.date}</dd></div><div><dt>Time range</dt><dd>{scene.time}</dd></div><div><dt>Pollutant</dt><dd>PM2.5 Concentration (µg/m³)</dd></div><div><dt>Data type</dt><dd>{scene.type}</dd></div><div><dt>Source</dt><dd>{scene.source}</dd></div><div><dt>Simulation</dt><dd>Yes · particle behavior is simulated</dd></div></dl></details>
      </article>)}</div>
    </section>
    <section className="vr-interface-guide" id="vr-guide">
      <div className="vr-interface-guide-inner">
        <header className="vr-guide-heading"><span>02 / INSIDE THE EXPERIENCE</span><h2>Read the environment before you enter.</h2><p>This guide explains the scene, position and viewing-direction tracking, time controls, particles, and PM2.5 Concentration information inside the VR experience.</p></header>
        <div className="vr-guide-layout">
          <figure className="vr-overview-figure"><div className="vr-overview-image vr-guide-artwork"><img src={vrGuideArtwork} width="1320" height="1192" alt="Concord School immersive VR concept with illustrative PM2.5 particles and a time-of-day sequence"/></div><figcaption>Concord School · Illustrative immersive environment and time-of-day sequence</figcaption></figure>
          <aside className="vr-indicator-panel"><header><span>SCENE READING GUIDE</span><strong>10 indicators</strong></header><div className="vr-element-grid">{interfaceElements.map(([number,title,text])=><article key={number}><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div></aside>
        </div>
        <section className="vr-aqi-explainer"><header><span>PM2.5 CONCENTRATION IN THE VR VIEW</span><h2>How to read the PM2.5 Concentration 24-hour trend.</h2><p>The solid curve contains hourly PM2.5 Concentration readings in µg/m³. The dashed 35 µg/m³ line identifies the U.S. EPA primary 24-hour PM2.5 NAAQS for context. It is not an hourly limit. The interface compares the displayed 24-hour PM2.5 Concentration mean—not an individual hour—with that reference.</p><a className="vr-aqi-source" href="https://www.epa.gov/criteria-air-pollutants/naaqs-table" target="_blank" rel="noreferrer">Source: U.S. EPA NAAQS Table · PM2.5 Concentration · 2024 </a></header><div className="vr-aqi-standard-list">{airQualityStandards.map(([key,label,aqi,pm,text])=><article className={`vr-aqi-${key}`} key={key}><i/><div><span>AQI {aqi} · 24-HOUR PM2.5 CONCENTRATION BREAKPOINT</span><h3>{label}</h3><strong>{pm}</strong><p>{text}</p></div></article>)}</div><p className="vr-aqi-method-note">The 35 µg/m³ PM2.5 NAAQS has a regulatory form: the annual 98th percentile of 24-hour PM2.5 Concentrations, averaged over three years. The VR display is contextual and is not an attainment determination. AQI categories also use 24-hour PM2.5 Concentration; they are not one-hour standards.</p></section>
        <section className="vr-qa-block"><header><span>04 / ASK THE SCENE</span><h2>What are you seeing?</h2><p>Open a question to understand how the scene, particles, indicators, and headset experience connect. Start with the highlighted question, then explore at your own pace.</p></header><div className="vr-qa-list">{knowledgeQuestions.map(([category,question,answer],index)=><details className="vr-qa-card" open={index===0} key={question}><summary><span>{String(index+1).padStart(2,"0")} · {category}</span><strong>{question}</strong><i aria-hidden="true"/></summary><p>{answer}</p></details>)}</div></section>
      </div>
    </section>
    <section className="vr-editorial"><VRLiveAirSnapshot/></section>
  </div>
}

function VRLiveAirSnapshot(){
  const {theme}=useTheme();
  const [state,setState]=useState({loading:true,data:null,error:null});
  const load=async()=>{
    setState((current)=>({...current,loading:true,error:null}));
    try{
      const response=await fetch("/api/clarity");
      const payload=await response.json();
      if(!response.ok)throw new Error(payload.detail||payload.error||"Unable to load the latest air-quality snapshot.");
      setState({loading:false,data:payload,error:null});
    }catch(error){setState({loading:false,data:null,error:error.message})}
  };
  useEffect(()=>{load()},[]);
  const summary=state.data?.summary||{};
  const updated=state.data?.newestMeasurementAt?new Date(state.data.newestMeasurementAt).toLocaleString([], {dateStyle:"medium",timeStyle:"short"}):"—";
  const value=(number,decimals=1)=>Number.isFinite(number)?number.toFixed(decimals):"—";
  return <div className="vr-live-air" aria-busy={state.loading}>
    <div className="vr-live-air-inner">
      <figure className="vr-live-architecture"><img src={theme==="dark"?liveDataArchitectureDark:liveDataArchitecture} alt="DecarbCityTwin VR and live-data system architecture connecting sensors, cloud services, Unity, and Seattle models"/><figcaption className="vr-architecture-caption"><h3>How the system connects</h3><dl><div><dt>Sensing</dt><dd>Building-mounted sensors represent the environmental observations entering the system.</dd></div><div><dt>Cloud services</dt><dd>The cloud groups messaging, data ingestion, and time-series storage, with InfluxDB shown as the database.</dd></div><div><dt>Spatial experience</dt><dd>The diagram connects Unity with the Seattle model and a VR headset to place environmental information in a navigable 3D setting.</dd></div></dl><p>This diagram presents the system architecture. In the current web prototype, Clarity snapshots are displayed separately from the historical data used in the VR scenes.</p></figcaption></figure>
      <header><div><span>LIVE AIR REFERENCE · DAISY / SOUTH PARK</span><h2>Current conditions, beside the model.</h2></div><p>The latest available Clarity sensor snapshot adds present-day context. It remains separate from the historical and modeled values driving the VR scenes.</p></header>
      {state.error?<div className="vr-live-error"><div><strong>Latest snapshot unavailable</strong><span>{state.error}</span></div><button type="button" onClick={load}>Try again</button></div>:<div className="vr-live-dashboard"><VRClarityMap sources={state.data?.sources||[]}/><div className="vr-live-metrics">
        <article className="primary"><span>Network average</span><strong>{state.loading?"···":value(summary.pm25Average)}</strong><small>µg/m³ PM2.5</small></article>
        <article><span>Peak reading</span><strong>{state.loading?"···":value(summary.pm25Maximum)}</strong><small>µg/m³ PM2.5</small></article>
        <article><span>Reporting locations</span><strong>{state.loading?"···":value(summary.reportingLocations,0)}</strong><small>of {summary.monitoringLocations??"—"} sensors</small></article>
        <article><span>Latest observation</span><strong className="time">{state.loading?"Syncing…":updated}</strong><small>Latest available · may be cached</small></article>
      </div></div>}
      <footer><span>Not a continuously updating data stream · successful responses may be cached for up to 4 h 45 min</span><a href="https://dashboard.clarity.io/daisy4I1NK/live-data" target="_blank" rel="noreferrer">Open Clarity source </a></footer>
    </div>
  </div>
}

function VRClarityMap({sources}){
  const mapElement=useRef(null);
  const locations=useMemo(()=>sources.filter((source)=>Number.isFinite(source.latitude)&&Number.isFinite(source.longitude)),[sources]);
  useEffect(()=>{
    if(!mapElement.current||!locations.length)return undefined;
    let map,cancelled=false;
    import("leaflet").then((module)=>{
      if(cancelled||!mapElement.current)return;
      const L=module.default||module;
      map=L.map(mapElement.current,{zoomControl:true,scrollWheelZoom:false,preferCanvas:true}).setView([47.53,-122.32],12);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap",maxZoom:19}).addTo(map);
      const bounds=[];
      locations.forEach((source)=>{
        const reading=source.metrics?.pm25?.value;
        const color=!Number.isFinite(reading)?"#77807d":reading<=9?"#2f8d70":reading<=35.4?"#b18a18":"#c65334";
        const point=[source.latitude,source.longitude];
        bounds.push(point);
        const popup=document.createElement("div");
        const title=document.createElement("strong");
        const measurement=document.createElement("span");
        title.textContent=source.name.split("(")[0].trim();
        measurement.textContent=`${Number.isFinite(reading)?reading.toFixed(1):"—"} µg/m³ PM2.5`;
        popup.append(title,document.createElement("br"),measurement);
        L.circleMarker(point,{radius:9,color:"#fff",weight:2,fillColor:color,fillOpacity:.95}).bindPopup(popup).addTo(map);
      });
      map.fitBounds(bounds,{padding:[35,35],maxZoom:14});
    });
    return()=>{cancelled=true;if(map)map.remove()};
  },[locations]);
  return <div className="vr-live-map"><div className="vr-live-map-label"><span>MONITORING MAP</span><small>{locations.length} locations</small></div><div className="vr-clarity-map" ref={mapElement} aria-label={`Map of ${locations.length} Clarity monitoring locations`}/></div>;
}
function RenewablePage(){
  const process=[
    ["01 / Identify","Identify available rooftop and façade surfaces from building geometry."],
    ["02 / Assess","Assess modeled solar potential across building surfaces and locations."],
    ["03 / Compare","Compare future baseline, photovoltaic, and combined renewable-energy scenarios."]
  ];
  const available=[
    ["Building geometry","Building footprints provide the spatial structure for rooftop and façade analysis."],
    ["Rooftop potential","Annual rooftop solar-potential values are available for buildings in the current prototype."],
    ["Façade potential","Annual façade solar-potential values are available for buildings in the current prototype."]
  ];
  return <div className="module-page renewable-page">
    <section className="renewable-hero"><div className="page-container">
      <div className="renewable-hero-meta"><span className="eyebrow">Solar &amp; Renewable Energy</span><StatusLabel>In Development</StatusLabel></div>
      <h1>From building surfaces to renewable-energy opportunity.</h1>
      <p>This module connects building geometry, rooftop and façade solar potential, and future renewable-energy scenarios within DecarbCityTwin.</p>
      <Link className="button light-button" to="/dashboard?module=renewable">Explore in the Digital Twin </Link>
    </div></section>

    <section className="renewable-section renewable-process"><div className="page-container">
      <SectionHeader eyebrow="Module Process" title="From building surfaces to renewable-energy scenarios."/>
      <div className="renewable-process-grid">{process.map(([title,text])=><article key={title}><span>{title}</span><p>{text}</p></article>)}</div>
    </div></section>

    <section className="renewable-section renewable-available"><div className="page-container">
      <SectionHeader eyebrow="Available Data" title="What is currently available."/>
      <div className="renewable-available-layout"><div className="renewable-data-list">{available.map(([title,text])=><article key={title}><h3>{title}</h3><p>{text}</p></article>)}</div><figure className="renewable-map-figure"><img src={renewableMap} alt="South Park ArcGIS building geometry view"/><figcaption>Representative Digital Twin building-geometry view · Current prototype interface</figcaption></figure></div>
    </div></section>

    <section className="renewable-section renewable-exploration"><div className="page-container">
      <span className="eyebrow">Interactive Exploration</span>
      <h2>Explore solar potential in the Digital Twin.</h2>
      <p>Select Renewable in the Digital Twin to view rooftop and façade solar-potential records for individual buildings.</p>
      <p className="renewable-helper">Open the Layers panel in the map controls, then select the Legend tab to interpret the building colors.</p>
      <Link className="button light-button" to="/dashboard?module=renewable">Open Renewable View </Link>
    </div></section>

    <section className="renewable-section renewable-next"><div className="page-container">
      <SectionHeader eyebrow="Next Connections" title="Connecting renewable supply with building demand." text="Future development will link renewable-generation estimates with modeled building energy demand and scenario records, including baseline, photovoltaic, and combined strategies."/>
      <div className="renewable-tags" aria-label="Future scenario types"><span>Baseline</span><span>PV</span><span>Combined</span></div>
      <p className="renewable-note">Detailed numerical outputs will be added after the corresponding records are reviewed and approved.</p>
    </div></section>
  </div>
}

function ScenarioPage(){
  const supports=[
    ["01 / Retrieve","Retrieve available project records across buildings, energy, air quality, retrofit, and renewable energy."],
    ["02 / Compare","Compare baseline and intervention scenarios when validated scenario records are available."],
    ["03 / Explain","Explain which evidence, source, method, and assumptions support an interpretation."],
    ["04 / Identify Gaps","Identify unavailable records, uncertainty, and incomplete data connections."]
  ];
  const domains=["Buildings","Energy","Air Quality","Retrofit","Renewable Energy","Scenarios"];
  const queries=["Compare baseline and retrofit conditions.","Explain which evidence supports a scenario.","Summarize available energy and air-quality records.","Identify missing data or uncertainty."];
  const approvedAgentUrl=externalPlatforms.agentic&&!externalPlatforms.agentic.includes("example.com");
  return <div className="module-page agentic-page">
    <section className="agentic-hero"><div className="page-container">
      <div className="agentic-hero-meta"><span className="eyebrow">Agentic AI</span><StatusLabel>Integration in Development</StatusLabel></div>
      <h1>Ask questions across project evidence.</h1>
      <p>Agentic AI is planned as a guided interface for retrieving, comparing, and explaining building, energy, environmental, retrofit, renewable-energy, and scenario records.</p>
      {approvedAgentUrl?<a className="button light-button" href={externalPlatforms.agentic} target="_blank" rel="noreferrer">Open Agentic Model </a>:<span className="button agentic-disabled-action" aria-disabled="true">Open Agentic Model </span>}
      {!approvedAgentUrl&&<small className="agentic-url-note">No approved production agent URL is configured.</small>}
    </div></section>

    <section className="agentic-section"><div className="page-container">
      <SectionHeader eyebrow="01 / Guided Interaction" title="From project records to grounded explanations."/>
      <div className="agentic-support-grid">{supports.map(([title,text])=><article key={title}><span>{title}</span><p>{text}</p></article>)}</div>
    </div></section>

    <section className="agentic-section agentic-domains"><div className="page-container">
      <SectionHeader eyebrow="02 / Connected Domains" title="One interface across multiple project layers."/>
      <div className="agentic-domain-diagram">
        <div className="agentic-interpretation-layer"><strong>Agentic AI</strong><span>Interpretation layer</span></div>
        <div className="agentic-domain-grid">{domains.map((domain,index)=><div key={domain}><span>{String(index+1).padStart(2,"0")}</span><strong>{domain}</strong></div>)}</div>
      </div>
      <div className="agentic-domain-footer"><p>The agent is intended to retrieve project-specific records through shared platform services and a knowledge-graph-enabled semantic layer.</p><StatusLabel>Planned Connections · Not Yet Live</StatusLabel></div>
    </div></section>

    <section className="agentic-section"><div className="page-container">
      <SectionHeader eyebrow="03 / Example Queries" title="Questions the interface is designed to support."/>
      <div className="agentic-query-list">{queries.map((query,index)=><article key={query}><span>{String(index+1).padStart(2,"0")}</span><p>{query}</p></article>)}</div>
      <p className="agentic-shared-note">These examples describe intended query patterns. Production retrieval and response generation remain under development.</p>
    </div></section>

    <section className="agentic-section agentic-evidence"><div className="page-container">
      <SectionHeader eyebrow="04 / Evidence + Limitations" title="Answers remain tied to their sources." text="Evidence records should preserve source, method, status, assumptions, spatial and temporal scope, and uncertainty. No generated response should be presented as a project result until the relevant records and services are connected and validated."/>
      <div className="agentic-status-grid">
        <div><h3>Currently Represented</h3><ul><li>Intended query patterns</li><li>Connected-domain framework</li><li>Evidence and provenance requirements</li></ul></div>
        <div><h3>Under Development</h3><ul><li>Approved agent URL</li><li>Retrieval services</li><li>Knowledge-graph connection</li><li>Validated scenario records</li></ul></div>
      </div>
    </div></section>
  </div>
}
