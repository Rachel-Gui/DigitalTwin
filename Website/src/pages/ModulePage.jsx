import { lazy, Suspense } from "react";
import energyArchetypes from "../assets/research/energy-archetypes.png";
import paperCover from "../assets/research/energy-paper-cover.png";
import airMap from "../assets/air-quality/pm25-prediction-map.png";
import clarityScreenshot from "../assets/air-quality/clarity-screenshot.png";
import vrConcord from "../assets/vr/concord-pm25-particle-view.png";
import vrCity from "../assets/vr/city-scale-pollution-view.png";
import vrChart from "../assets/vr/high-low-pollution-chart.png";
import { PublicationRecord, SectionHeader, SolarDiagram, SourceCaption, StatusLabel } from "../components";
import { Link } from "react-router-dom";
import { externalPlatforms } from "../data/modules";

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
  const process=[
    ["01 / Define","Four representative residential archetypes establish the building geometry used in the published study."],
    ["02 / Parameterize","Envelope, HVAC, ventilation, and domestic hot-water conditions are varied across the modeled study set."],
    ["03 / Simulate","EnergyPlus produces physics-based energy records for each modeled condition."],
    ["04 / Model","The simulation records support machine-learning surrogate modeling and recorded energy outputs."]
  ];
  const archetypes=[["01","Single Family","1,200 ft²"],["02","Duplex","2,400 ft²"],["03","Quadplex","3,400 ft²"],["04","Ten-Unit Apartment","8,100 ft²"]];
  const conditions=[["01","Envelope","Insulation and window conditions."],["02","HVAC","System configurations represented in simulation."],["03","Ventilation","Outdoor-air and mechanical ventilation conditions."],["04","Hot Water","Domestic hot-water system conditions."]];
  const workflow=[
    ["Archetype definitions","Four residential building forms define the geometry and scale of the study set."],
    ["Parametric conditions","Envelope, HVAC, ventilation, and hot-water conditions are varied."],
    ["EnergyPlus simulation","Physics-based simulations generate the modeled energy records."],
    ["Surrogate-model training","Machine-learning models learn relationships between conditions and outputs."],
    ["Recorded outputs","Energy-use and end-use records remain linked to their method and source."]
  ];
  const records=[["01","Energy Use","Whole-building energy performance records."],["02","End-Use Demand","Modeled heating, cooling, and related end-use records."],["03","Simulation Records","Outputs produced directly through EnergyPlus."],["04","Surrogate Estimates","Model estimates trained from the simulation dataset."]];
  return <div className="module-page energy-page">
    <section className="energy-hero"><div className="page-container">
      <div className="energy-hero-meta"><span className="eyebrow">Energy Modeling</span></div>
      <h1>Four housing types.<br/>5,832 simulated conditions.</h1>
      <p>The Energy Modeling module documents a published workflow that combines defined residential archetypes, parametric EnergyPlus simulations, and machine-learning surrogate modeling for health-driven retrofit analysis.</p>
      <Link className="button light-button" to="/dashboard?module=energy">Explore in the Digital Twin ↗</Link>
    </div></section>

    <section className="energy-process"><div className="page-container"><SectionHeader eyebrow="Module Process" title="From archetypes to model outputs."/><div className="energy-process-grid">{process.map(([title,text])=><article key={title}><span>{title}</span><p>{text}</p></article>)}</div></div></section>

    <section className="energy-archetypes"><div className="page-container">
      <SectionHeader eyebrow="01 / Archetype Set" title="A defined residential study set." text="The published modeling workflow uses four residential archetypes to represent a range of housing forms and scales."/>
      <div className="energy-archetype-list">{archetypes.map(([number,name,area])=><article key={name}><span>{number}</span><h3>{name}</h3><p>{area}</p></article>)}</div>
      <figure className="energy-archetype-figure"><div><img src={energyArchetypes} alt="Single Family, Duplex, Quadplex, and Ten-Unit Apartment residential archetypes"/></div><figcaption><div><strong>Four residential archetypes</strong><span>Defined building geometries used in the published simulation workflow.</span></div><dl><div><dt>Source</dt><dd>Abbasabadi et al., Architecture 2026, 6, 84</dd></div><div><dt>Status</dt><dd>Published research</dd></div></dl></figcaption></figure>
    </div></section>

    <section className="energy-conditions"><div className="page-container"><SectionHeader eyebrow="02 / Modeled Conditions" title="What changes in the simulations."/><div className="energy-line-records">{conditions.map(([number,title,text])=><article key={title}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>

    <section className="energy-workflow"><div className="page-container"><SectionHeader eyebrow="03 / Modeling Workflow" title={<>Physics first.<br/>Surrogate model second.</>} text="EnergyPlus simulations create the physics-based training record used for machine-learning surrogate modeling."/><div className="energy-workflow-steps">{workflow.map(([step,description],index)=><article key={step} tabIndex="0"><span>{String(index+1).padStart(2,"0")}</span><div><h3>{step}</h3><p>{description}</p></div>{index<workflow.length-1&&<b aria-hidden="true">→</b>}</article>)}</div></div></section>

    <section className="energy-records"><div className="page-container"><SectionHeader eyebrow="04 / Model Records" title="Simulation and surrogate outputs remain traceable to their source." text="The module distinguishes physics-based EnergyPlus records from machine-learning surrogate estimates. Each output remains associated with its archetype, modeled conditions, method, and source."/><div className="energy-record-grid">{records.map(([number,title,text])=><article key={title}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div><p className="energy-connection-note">Map-connected building values will be displayed after the Digital Twin data connection is completed.</p></div></section>

    <section className="energy-publication"><div className="page-container"><SectionHeader eyebrow="05 / Publication" title="Published research."/><article className="energy-publication-record"><div className="energy-cover-frame"><img src={paperCover} alt="Cover of the published Energy Modeling research article"/></div><div><span className="eyebrow">Architecture 2026, 6, 84 · CC BY 4.0</span><h2>AI-Enhanced Urban Building Energy Modeling for Health-Driven Decarbonization in Vulnerable Communities</h2><a className="text-link" href="https://doi.org/10.3390/architecture6020084" target="_blank" rel="noopener noreferrer">Read the published article ↗</a></div></article></div></section>
  </div>
}
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
      <Link className="button light-button" to="/dashboard?module=retrofit">Open in Digital Twin — Retrofit ↗</Link>
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
      <div className="retrofit-actions"><Link className="button light-button" to="/dashboard?module=retrofit">Explore Retrofit in the Digital Twin ↗</Link><Link className="button retrofit-secondary-action" to="/scenario-analysis">Ask about retrofit scenarios ↗</Link></div>
    </div></section>
  </div>
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
      {approvedAgentUrl?<a className="button light-button" href={externalPlatforms.agentic} target="_blank" rel="noreferrer">Open Agentic Model ↗</a>:<span className="button agentic-disabled-action" aria-disabled="true">Open Agentic Model ↗</span>}
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
