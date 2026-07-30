import { lazy, Suspense } from "react";
import energyArchetypes from "../assets/research/energy-archetypes.png";
import paperCover from "../assets/research/energy-paper-cover.png";
import airMap from "../assets/air-quality/pm25-prediction-map.png";
import clarityScreenshot from "../assets/air-quality/clarity-screenshot.png";
import vrConcord from "../assets/vr/concord-pm25-particle-view.png";
import vrCity from "../assets/vr/city-scale-pollution-view.png";
import vrChart from "../assets/vr/high-low-pollution-chart.png";
import { PublicationRecord, ResearchFigure, SectionHeader, SolarDiagram, SourceCaption, StatusLabel } from "../components";
import { Link } from "react-router-dom";
import { externalPlatforms } from "../data/modules";
import { figures } from "../data/projectContent";

const AirQualityTableau = lazy(() => import("../components/AirQualityTableau"));

export default function ModulePage({type}){
  return ({energy:<EnergyPage/>,retrofit:<RetrofitPage/>,air:<AirPage/>,vr:<VRPage/>,renewable:<RenewablePage/>,scenario:<ScenarioPage/>})[type];
}
function ModuleHero({index,status,title,subtitle,children}){
  return <section className="module-editorial-hero"><div><span>{index} / MODULE</span><StatusLabel>{status}</StatusLabel></div><h1>{title}</h1><p>{subtitle}</p>{children}</section>
}
function NumberedRecords({items}){return <div className="numbered-records">{items.map((x,i)=><article key={x[0]}><span>{String(i+1).padStart(2,"0")}</span><h3>{x[0]}</h3><p>{x[1]}</p></article>)}</div>}
function Figure({src,title,detail,source,status}){return <figure className="research-figure"><div className="figure-image"><img src={src} alt={title}/></div><SourceCaption title={title} detail={detail} source={source} status={status}/></figure>}
function DigitalTwinAction({mode,children}){return <div className="module-action-band"><Link className="button" to={`/dashboard?module=${mode}`}>{children}</Link></div>}

function EnergyPage(){
  return <div className="module-page editorial-page"><ModuleHero index="02" status="PUBLISHED RESEARCH · DATA AVAILABLE" title={<>Four housing types.<br/><em>5,832 simulated conditions.</em></>} subtitle="Physics-based energy simulation and machine-learning surrogate modeling for health-driven retrofit analysis."><Figure src={energyArchetypes} title="Four residential archetypes" detail="Single Family, Duplex, Quadplex, and Ten-Unit Apartment" source="Abbasabadi et al., Architecture 2026, 6, 84" status="Published research"/></ModuleHero>
    <DigitalTwinAction mode="energy">Open in Digital Twin — Energy ↗</DigitalTwinAction>
    <section className="paper-section"><SectionHeader eyebrow="01 / Why these four archetypes" title="A defined residential study set." text="The archetypes establish the four housing forms used in the published modeling workflow."/><div className="archetype-editorial">{["Single Family","Duplex","Quadplex","Ten-Unit Apartment"].map((x,i)=><article key={x}><span>0{i+1}</span><h3>{x}</h3></article>)}</div></section>
    <section className="paper-section split-research"><div><span className="section-index">02 / ARCHETYPE GEOMETRY</span><h2>Geometry anchors the simulation record.</h2><p>Each archetype establishes a defined building form for parametric analysis.</p></div><ResearchFigure figure={figures.energyArchetypes}/></section>
    <section className="paper-section"><SectionHeader eyebrow="03 / Simulation Parameters" title="Conditions represented in the model"/><NumberedRecords items={[["Envelope","Insulation and window conditions."],["HVAC","System configurations represented in simulation."],["Ventilation","Outdoor-air and mechanical ventilation conditions."],["Hot water","Domestic hot-water system conditions."]]}/></section>
    <section className="paper-section method-band"><SectionHeader eyebrow="04 / EnergyPlus Workflow" title="Physics first. Surrogate model second." text="EnergyPlus simulations create the training record for machine-learning surrogate modeling."/><div className="method-line">{["Archetype definitions","Parametric conditions","EnergyPlus simulation","Model training","Recorded outputs"].map((x,i)=><div key={x}><b>0{i+1}</b><span>{x}</span></div>)}</div><p className="asset-note">The approved energy-method workflow image is not present in the supplied assets. No draft figure has been substituted.</p></section>
    <section className="paper-section"><SectionHeader eyebrow="05 / Model Outputs" title="Outputs remain attached to method and source." text="This interface does not reproduce unverified values or decorative result charts."/><div className="output-record"><span>MODEL OUTPUT CATEGORIES</span><p>Energy use · End-use demand · Simulation records · Surrogate-model estimates</p></div></section>
    <section className="paper-section"><SectionHeader eyebrow="06 / Publication Record" title="Published research"/><PublicationRecord image={paperCover}/></section></div>
}
function RetrofitPage(){
  const stages=[["Existing condition","Reference building condition","Baseline parameters","Reference for energy comparison","Reference for indoor environmental comparison"],["Envelope","Insulation, windows, and air sealing","Envelope properties","Changes heating and cooling loads","Changes infiltration pathways"],["Heat pump","Heating and cooling system","HVAC system type","Electrifies space conditioning","Changes thermal control"],["ERV / filtered ventilation","Mechanical ventilation and filtration","Airflow and filtration conditions","Adds fan and conditioning loads","Addresses ventilation and particle removal"],["Hot-water system","Domestic hot-water equipment","System type and efficiency","Changes water-heating demand","Supports whole-building comparison"],["Combined package","Multiple interventions together","Combined parameter set","Assessed as an integrated scenario","Assessed across energy and indoor conditions"]];
  return <div className="module-page editorial-page"><ModuleHero index="03" status="PUBLISHED RESEARCH · PROTOTYPE" title={<>Health-driven<br/><em>retrofit sequence.</em></>} subtitle="Interventions are recorded by what changes, the modeled parameter, and their energy and indoor-environment relevance."/><DigitalTwinAction mode="retrofit">Open in Digital Twin — Retrofit ↗</DigitalTwinAction><section className="paper-section"><ResearchFigure figure={figures.retrofit}/></section><section className="paper-section retrofit-sequence"><SectionHeader eyebrow="Intervention sequence" title="Existing condition to combined package"/>{stages.map((s,i)=><article key={s[0]}><span>{String(i+1).padStart(2,"0")}</span><h3>{s[0]}</h3><dl>{[["What changes",s[1]],["Modeled parameter",s[2]],["Energy relevance",s[3]],["Indoor environmental relevance",s[4]],["Data status","Published method / platform integration pending"]].map(x=><div key={x[0]}><dt>{x[0]}</dt><dd>{x[1]}</dd></div>)}</dl></article>)}</section></div>
}
function AirPage(){
  return <div className="module-page editorial-page air-quality-page">
    <section className="air-hero"><div className="page-container">
      <span className="eyebrow">Air Quality</span>
      <h1>Monitoring and modeling neighborhood PM2.5.</h1>
      <p>The Air Quality module brings together sensor measurements, geospatial variables, and prediction models to examine how PM2.5 conditions vary across time and space in South Park and the wider Seattle area.</p>
      <a className="button light-button" href="#air-quality-dashboard">Explore the dashboard ↓</a>
    </div></section>

    <section className="air-process"><div className="page-container">
      <SectionHeader eyebrow="Module process" title="From observations to spatial estimates."/>
      <div className="air-process-steps">
        {[
          ["01 / Observe","Air-quality sensors record time-based PM2.5 measurements at monitoring locations."],
          ["02 / Model","Geospatial variables and prediction models estimate PM2.5 conditions between monitoring locations."],
          ["03 / Explore","Interactive dashboards and project figures make spatial and temporal patterns available for interpretation."]
        ].map(([title,text])=><article key={title}><span>{title}</span><p>{text}</p></article>)}
      </div>
    </div></section>

    <section className="air-monitoring"><div className="page-container">
      <div className="air-monitoring-copy">
        <span className="eyebrow">Live monitoring</span>
        <h2>Sensor observations over time.</h2>
        <p>The Clarity platform provides access to PM2.5 monitoring locations and time-based measurements associated with the South Park and Duwamish Valley study area. These records represent observed conditions at specific sensor locations.</p>
        <a className="button" href={externalPlatforms.airQuality} target="_blank" rel="noreferrer">Open monitoring platform ↗</a>
      </div>
      <figure className="clarity-figure">
        <img src={clarityScreenshot} alt="Clarity platform map, PM2.5 sensor locations, and time-series measurements"/>
        <figcaption>Clarity monitoring interface · Observed measurements at sensor locations</figcaption>
      </figure>
    </div></section>

    <section className="air-spatial-section">
      <div className="air-spatial-intro page-container">
        <span className="eyebrow">Spatial prediction</span>
        <h2>Predicted PM2.5 patterns across Seattle.</h2>
        <p>The prediction dashboard presents modeled PM2.5 concentrations across neighborhood and grid scales. It complements point-based monitoring records by showing estimated spatial variation between sensor locations.</p>
      </div>
      <Suspense fallback={<div className="tableau-route-loading" role="status">Preparing the interactive dashboard…</div>}><AirQualityTableau compact showGuidance/></Suspense>
    </section>

    <section className="air-model-output"><div className="page-container">
      <div className="air-output-copy">
        <span className="eyebrow">Model output</span>
        <h2>Annual mean PM2.5 prediction.</h2>
        <p>A project model output showing predicted annual mean PM2.5 concentrations across the study domain. The figure provides a static research record that complements the interactive Tableau view.</p>
      </div>
      <Figure src={airMap} title="Annual mean PM2.5 prediction" detail="Static Random Forest model output showing predicted concentrations across the study domain." source="DecarbCityTwin Air Quality project materials" status="Modeled project output"/>
    </div></section>

  </div>
}
function VRPage(){
  return <div className="vr-page"><ModuleHero index="06" status="WORKING PROTOTYPE" title={<>PM2.5 through<br/><em>a 24-hour cycle.</em></>} subtitle="The experience includes a ground-level scene around Concord International School and a bird’s-eye neighborhood environment."/><section className="vr-editorial"><div className="vr-intro"><span>01 / CONCORD INTERNATIONAL SCHOOL</span><h2>Time is visible.<br/>Exposure conditions change.</h2><p>The moving sun marks the passage of time through a 24-hour cycle. PM2.5 is represented through changes in particle number, size, motion, and density.</p></div><Figure src={vrConcord} title="Concord PM2.5 particle view" detail="Ground-level environment around Concord International School" source="DecarbCityTwin VR project materials" status="Working prototype"/></section><section className="vr-gallery"><Figure src={vrChart} title="Highest- and lowest-pollution conditions" detail="Comparison across the represented 00:00–23:00 cycle" source="DecarbCityTwin VR project materials" status="Working prototype"/><Figure src={vrCity} title="City-scale pollution view" detail="Bird’s-eye neighborhood environment" source="DecarbCityTwin VR project materials" status="Working prototype"/></section><section className="vr-cta"><span>COMMUNITY ENGAGEMENT / IMMERSIVE MODE</span><h2>Enter the VR experience</h2><p>The final external dashboard URL is pending.</p><a className="button light-button" href={externalPlatforms.vr} target="_blank" rel="noreferrer">Enter VR Experience ↗</a></section></div>
}
function RenewablePage(){
  return <div className="module-page editorial-page"><ModuleHero index="04" status="IN DEVELOPMENT" title={<>Geometry, demand,<br/><em>and renewable records.</em></>} subtitle="This module is being developed to connect building geometry, renewable-energy potential, and building energy demand within the South Park digital twin."><SolarDiagram/></ModuleHero><DigitalTwinAction mode="renewable">Open in Digital Twin — Renewable ↗</DigitalTwinAction><section className="paper-section"><NumberedRecords items={[["Research question","How can building geometry and energy demand be connected to renewable-energy scenario records?"],["Available building geometry","The digital twin provides the spatial structure for future approved analysis."],["Rooftop and façade opportunity","Candidate surfaces will be represented without unpublished material or numerical claims."],["Connection to energy demand","Future records will link generation estimates to modeled building demand."],["Scenario records","Baseline, PV, and combined scenarios will retain source and status metadata."],["Future approved outputs","Public figures will be added only after approval."]]}/></section></div>
}
function ScenarioPage(){
  const queries=["Compare baseline and retrofit conditions.","Explain which evidence supports a scenario.","Summarize available energy and air-quality records.","Identify missing data or uncertainty."];
  return <div className="module-page editorial-page agentic-page">
    <ModuleHero index="05" status="INTEGRATION IN DEVELOPMENT" title="Agentic AI" subtitle="Guided queries connect building, environmental, and scenario records to support comparison, interpretation, and evidence-grounded explanation."/>
    <section className="paper-section agent-gateway-section">
      <SectionHeader eyebrow="01 / Agent interaction" title="Project agent gateway" text="The production agent is not yet embedded in this frontend. This gateway does not imitate a working chat interface."/>
      <a className="button" href={externalPlatforms.agentic} target="_blank" rel="noreferrer">Open Agentic Model ↗</a>
      <p className="asset-note">Configurable placeholder URL pending the approved project agent link.</p>
    </section>
    <section className="paper-section"><SectionHeader eyebrow="02 / Connected project data" title="Records intended for connection" text="The agent is planned to retrieve building, energy, air-quality, retrofit, renewable, and scenario records through shared platform services."/></section>
    <section className="paper-section"><SectionHeader eyebrow="03 / Example queries" title="Questions the interface is designed to support"/><NumberedRecords items={queries.map((query)=>[query,"Query pattern · Agent integration pending"])}/></section>
    <section className="paper-section"><SectionHeader eyebrow="04 / Evidence and provenance" title="Answers remain tied to their sources" text="Evidence records should preserve source, method, status, assumptions, spatial and temporal scope, and uncertainty."/></section>
    <section className="paper-section">
      <SectionHeader eyebrow="05 / Scenario interpretation" title="Scenario interpretation and comparison" text="Scenario comparison is one capability within the broader decision-support workflow."/>
      <div className="scenario-record-table"><div>Scenario</div><div>Source</div><div>Status</div><div>Evidence record</div>{["Baseline","Envelope","Electrification","PV","Combined"].map(x=><div className="scenario-record-row" key={x}><strong>{x}</strong><span>Pending</span><span>Planned</span><span>Not yet connected</span></div>)}</div>
    </section>
    <section className="paper-section"><SectionHeader eyebrow="06 / Known limitations" title="Integration status" text="The agent URL, retrieval services, knowledge-graph connection, and project scenario records remain under development. No generated answer should be treated as a project result until those sources are connected and validated."/></section>
  </div>
}
