import { lazy, Suspense, useState } from "react";
import singleFamilyImage from "../assets/energy/single-family.jpg";
import duplexImage from "../assets/energy/duplex.jpg";
import quadplexImage from "../assets/energy/quadplex.jpg";
import tenUnitImage from "../assets/energy/ten-unit-apartment.jpg";
import airMap from "../assets/air-quality/pm25-prediction-map.png";
import clarityScreenshot from "../assets/air-quality/clarity-screenshot.png";
import vrConcord from "../assets/vr/concord-pm25-particle-view.png";
import vrCity from "../assets/vr/city-scale-pollution-view.png";
import renewableMap from "../assets/home/south-park-arcgis-preview.png";
import { PublicationRecord, SectionHeader, SourceCaption, StatusLabel } from "../components";
import { Link } from "react-router-dom";
import { externalPlatforms } from "../data/modules";

const AirQualityTableau = lazy(() => import("../components/AirQualityTableau"));

export default function ModulePage({type}){
  return ({energy:<EnergyPage/>,retrofit:<RetrofitPage/>,air:<AirPage/>,vr:<VRPage/>,renewable:<RenewablePage/>,scenario:<ScenarioPage/>})[type];
}
function ModuleHero({index,status,title,subtitle,children}){
  return <section className="module-editorial-hero"><div><span>{index} / MODULE</span><StatusLabel>{status}</StatusLabel></div><h1>{title}</h1><p>{subtitle}</p>{children}</section>
}
function Figure({src,title,detail,source,status}){return <figure className="research-figure"><div className="figure-image"><img src={src} alt={title}/></div><SourceCaption title={title} detail={detail} source={source} status={status}/></figure>}

function EnergyPage(){
  const [selectedArchetype,setSelectedArchetype]=useState("Single Family");
  const archetypes=[
    {number:"01",name:"Single Family",area:"1,200 ft²",image:singleFamilyImage},
    {number:"02",name:"Duplex",area:"2,400 ft²",image:duplexImage},
    {number:"03",name:"Quadplex",area:"3,400 ft²",image:quadplexImage},
    {number:"04",name:"Ten-Unit Apartment",area:"8,100 ft²",image:tenUnitImage}
  ];
  const conditions=[
    ["Building Envelope","Windows, wall insulation, roof insulation, and air leakage."],
    ["Heating & Cooling","Existing systems and heat-pump alternatives."],
    ["Ventilation","Exhaust ventilation and energy-recovery ventilation."],
    ["Water Heating","Gas, electric, and heat-pump water-heating systems."]
  ];
  const packages=["Baseline","Package 1","Package 2","Package 3"];
  const results=["Annual energy use","Heating","Cooling","Hot water","Retrofit cost"];
  const connection=["Neighborhood Building","Assigned Archetype","Energy Scenario","Retrofit Comparison"];
  return <div className="module-page energy-page">
    <style>{`
      .energy-page section{padding:clamp(72px,9vw,132px) 0}.energy-page .energy-hero{padding-top:clamp(96px,12vw,170px)}
      .energy-page h1{max-width:980px}.energy-supporting-meta{display:flex;flex-wrap:wrap;gap:12px 28px;margin:36px 0 0;color:#a3a3a3;font-size:11px;letter-spacing:.14em;text-transform:uppercase}
      .energy-choice-grid,.energy-condition-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin-top:48px}
      .energy-choice{appearance:none;width:100%;padding:0;text-align:left;color:inherit;background:#0b0b0b;border:1px solid #2b2b2b;border-radius:14px;overflow:hidden;cursor:pointer;transition:border-color 220ms ease,background-color 220ms ease,transform 220ms ease}
      .energy-choice:hover,.energy-choice:focus-visible{background:#151515;border-color:#606060;transform:translateY(-3px);outline:none}.energy-choice.is-selected{border-color:#8fbfb3;background:#151515;box-shadow:inset 0 0 0 1px #8fbfb3}
      .energy-choice-image{display:flex;align-items:center;justify-content:center;height:230px;padding:18px;background:#111}.energy-choice-image img{display:block;width:100%;height:100%;object-fit:contain;object-position:center}
      .energy-choice-copy{display:grid;grid-template-columns:auto 1fr;gap:16px;padding:20px}.energy-choice-copy>span{color:#707070;font-size:12px}.energy-choice-copy strong,.energy-choice-copy small{display:block}.energy-choice-copy strong{margin:0 0 6px;color:#f5f5f2;font-size:20px;font-weight:500;letter-spacing:-.02em}.energy-choice-copy small{color:#a3a3a3;font-size:14px}.energy-development-note{margin:24px 0 0;color:#707070;font-size:13px}
      .energy-condition-card{min-height:190px;padding:24px;border:1px solid #2b2b2b;border-radius:14px;background:#0b0b0b}.energy-condition-card h3{margin:0 0 48px;font-size:15px;letter-spacing:.08em;text-transform:uppercase}.energy-condition-card p{margin:0;color:#a3a3a3;line-height:1.55}
      .energy-scenario-layout{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(280px,.7fr);gap:56px;margin-top:44px}.energy-package-list{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.energy-package-list span,.energy-result-list li{border:1px solid #2b2b2b;border-radius:999px;padding:12px 16px;color:#d2d2cf;font-size:14px}.energy-result-list{display:grid;gap:10px;margin:0;padding:0;list-style:none}.energy-scenario-copy{max-width:720px;color:#a3a3a3;line-height:1.65}
      .energy-connection-flow{display:grid;grid-template-columns:repeat(7,auto);align-items:center;justify-content:start;gap:18px;margin:44px 0}.energy-connection-flow span{padding:18px 20px;border:1px solid #2b2b2b;border-radius:12px;background:#0b0b0b}.energy-connection-flow b{color:#707070;font-weight:400}.energy-source{margin-top:28px;color:#707070;font-size:13px}
      @media(max-width:900px){.energy-choice-grid,.energy-condition-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.energy-scenario-layout{grid-template-columns:1fr}.energy-connection-flow{grid-template-columns:1fr;justify-items:stretch}.energy-connection-flow b{transform:rotate(90deg);justify-self:center}}
      @media(max-width:560px){.energy-choice-grid,.energy-condition-grid,.energy-package-list{grid-template-columns:1fr}.energy-choice-image{height:210px}}
      @media(prefers-reduced-motion:reduce){.energy-choice{transition:none}.energy-choice:hover,.energy-choice:focus-visible{transform:none}}
    `}</style>
    <section className="energy-hero"><div className="page-container">
      <div className="energy-hero-meta"><span className="eyebrow">Urban Building Energy Modeling</span></div>
      <h1>Explore energy performance across representative housing types.</h1>
      <p>Select a residential archetype and compare modeled energy conditions and retrofit scenarios derived from EnergyPlus simulations.</p>
      <Link className="button light-button" to="/dashboard?module=energy">Explore in the Digital Twin ↗</Link>
      <div className="energy-supporting-meta"><span>4 Residential Archetypes</span><span>5,832 Modeled Conditions</span></div>
    </div></section>

    <section className="energy-archetypes"><div className="page-container">
      <SectionHeader eyebrow="Select a Building Type" title="Choose the housing type closest to your building."/>
      <div className="energy-choice-grid">{archetypes.map(({number,name,area,image})=><button type="button" className={`energy-choice${selectedArchetype===name?" is-selected":""}`} aria-pressed={selectedArchetype===name} onClick={()=>setSelectedArchetype(name)} key={name}><span className="energy-choice-image"><img src={image} alt={`${name} residential building archetype`}/></span><span className="energy-choice-copy"><span>{number}</span><span><strong>{name}</strong><small>{area}</small></span></span></button>)}</div>
      <p className="energy-development-note">Selected: {selectedArchetype} · Scenario connection in development.</p>
      <p className="energy-source">Source: Abbasabadi et al., Architecture 2026, 6, 84.</p>
    </div></section>

    <section className="energy-conditions"><div className="page-container"><SectionHeader eyebrow="Modeled Conditions" title="What can change in the simulations."/><div className="energy-condition-grid">{conditions.map(([title,text])=><article className="energy-condition-card" key={title}><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>

    <section className="energy-scenarios"><div className="page-container"><SectionHeader eyebrow="Scenario Comparison" title="Compare energy and retrofit packages."/><p className="energy-scenario-copy">Existing EnergyPlus records support comparisons among baseline conditions and user-defined efficiency packages for each residential archetype.</p><div className="energy-scenario-layout"><div><div className="energy-package-list" aria-label="Retrofit package states">{packages.map(item=><span key={item}>{item}</span>)}</div><p className="energy-development-note">Interactive web version in development.</p></div><ul className="energy-result-list">{results.map(item=><li key={item}>{item}</li>)}</ul></div></div></section>

    <section className="energy-digital-twin"><div className="page-container"><SectionHeader eyebrow="Digital Twin Connection" title="From archetypes to neighborhood buildings." text="Buildings in the current prototype will be grouped by shared characteristics and connected to the closest residential archetype. Users will then be able to select a building and explore its available energy and retrofit scenarios."/><div className="energy-connection-flow">{connection.map((item,index)=><span key={item}>{item}{index<connection.length-1&&<b aria-hidden="true">→</b>}</span>)}</div><p className="energy-development-note">Connection in development.</p><Link className="button light-button" to="/dashboard?module=energy">Open Energy View ↗</Link></div></section>

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
      <span className="eyebrow">PM2.5 Concentration</span>
      <h1>Monitoring and modeling neighborhood PM2.5 Concentration.</h1>
      <p>The PM2.5 Concentration module brings together sensor measurements, geospatial variables, and prediction models to examine how PM2.5 Concentration (µg/m³) varies across time and space in South Park and the wider Seattle area.</p>
      <a className="button light-button" href="#air-quality-dashboard">Explore the dashboard ↓</a>
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
        <a className="button" href={externalPlatforms.airQuality} target="_blank" rel="noreferrer">Open monitoring platform ↗</a>
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
    {index:"01",label:"SCHOOL-SCALE PM2.5 CONCENTRATION MODEL",title:"Concord International School",description:"Explore the six-zone PM2.5 Concentration profile (µg/m³), hourly replay, changing sunlight, and local particle-zone readings.",date:"2024-04-23 · Tuesday",time:"00:00–23:00",type:"Historical PurpleAir data visualized as a modeled particle profile",source:"PurpleAir · 23 April 2024 · PHI EarthDay.gh",image:vrConcord,href:`${vrBase}/#concord`},
    {index:"02",label:"NEIGHBORHOOD-SCALE PM2.5 CONCENTRATION MODEL",title:"South Park, Seattle",description:"Explore modeled road-network PM2.5 Concentration (µg/m³) using observed weather conditions and the restored GIS model.",date:"Selectable historical dates · default 2025-01-29 (Wednesday)",time:"00:00–23:00 · America/Los_Angeles",type:"Historical observations driving a modeled particle simulation",source:"pm25_with_wind.xlsx · Sheet1",image:vrCity,href:`${vrBase}/#south-park`}
  ];
  const interfaceElements=[
    ["01","3D environment","The buildings, streets, landscape, and sky establish the spatial context for understanding where exposure occurs."],
    ["02","PM2.5 Concentration particles","Animated particles make changing PM2.5 Concentration (µg/m³) visible through their density, movement, and distribution. They are visual symbols—not physical particles at actual size or count."],
    ["03","Time and sunlight","The hourly control and moving sun connect each environmental reading to a time in the 24-hour cycle."],
    ["04","PM2.5 Concentration data","The right panel shows the hourly PM2.5 Concentration (µg/m³), 24-hour mean, peak, trend, and monitoring context."],
    ["05","Air-quality standard","EPA color bands show whether the current condition is Good, Moderate, Unhealthy, or more severe."],
    ["06","Immersive controls","Scene controls switch locations, while Enter VR opens the headset-ready WebXR view on compatible devices."]
  ];
  const glossary=[
    ["VR","Virtual Reality — an immersive, spatial experience viewed on a screen or through a headset."],
    ["WebXR","A browser standard that enables virtual and augmented reality experiences without a separate native application."],
    ["PM2.5 Concentration","The amount of fine particulate matter, 2.5 micrometers or smaller, measured in a volume of air."],
    ["µg/m³","Micrograms per cubic meter — the concentration unit used for PM2.5 Concentration."],
    ["AQI","Air Quality Index — a public health scale that converts pollutant concentration into six air-quality categories."],
    ["24H AVG","The 24-hour average PM2.5 Concentration used to calculate the displayed daily AQI."],
    ["Concord / South Park","The school-scale particle model and neighborhood-scale digital-twin scenes available in this prototype."]
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
    <ModuleHero index="06" status="WORKING WEBXR PROTOTYPE" title={<>Step inside the<br/><em>city&apos;s atmosphere.</em></>} subtitle="Choose a scene below to move from the DecarbCityTwin research platform into its interactive 3D and headset-ready WebXR environment."/>
    <section className="vr-interface-guide">
      <div className="vr-interface-guide-inner">
        <header className="vr-guide-heading"><span>01 / INSIDE THE EXPERIENCE</span><h2>Read the environment before you enter.</h2><p>This guide explains how the visible scene, time controls, particles, and PM2.5 Concentration information work together inside the VR experience.</p></header>
        <figure className="vr-overview-figure"><div className="vr-overview-image"><img src={vrConcord} alt="Concord International School VR experience showing PM2.5 Concentration particles and hourly conditions"/><span className="vr-overview-badge">VR EXPERIENCE PREVIEW</span></div><figcaption>Concord International School · School-scale PM2.5 Concentration visualization · Working WebXR prototype</figcaption></figure>
        <div className="vr-element-grid">{interfaceElements.map(([number,title,text])=><article key={number}><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div>
        <section className="vr-aqi-explainer"><header><span>PM2.5 CONCENTRATION IN THE VR VIEW</span><h2>How to read the PM2.5 Concentration 24-hour trend.</h2><p>The solid curve contains hourly PM2.5 Concentration readings in µg/m³. The dashed 35 µg/m³ line identifies the U.S. EPA primary 24-hour PM2.5 NAAQS for context. It is not an hourly limit. The interface compares the displayed 24-hour PM2.5 Concentration mean—not an individual hour—with that reference.</p><a className="vr-aqi-source" href="https://www.epa.gov/criteria-air-pollutants/naaqs-table" target="_blank" rel="noreferrer">Source: U.S. EPA NAAQS Table · PM2.5 Concentration · 2024 ↗</a></header><div className="vr-aqi-standard-list">{airQualityStandards.map(([key,label,aqi,pm,text])=><article className={`vr-aqi-${key}`} key={key}><i/><div><span>AQI {aqi} · 24-HOUR PM2.5 CONCENTRATION BREAKPOINT</span><h3>{label}</h3><strong>{pm}</strong><p>{text}</p></div></article>)}</div><p className="vr-aqi-method-note">The 35 µg/m³ PM2.5 NAAQS has a regulatory form: the annual 98th percentile of 24-hour PM2.5 Concentrations, averaged over three years. The VR display is contextual and is not an attainment determination. AQI categories also use 24-hour PM2.5 Concentration; they are not one-hour standards.</p></section>
        <section className="vr-model-scope"><header><span>MODEL SCOPE</span><h2>What the particles represent.</h2><p>These notes are provided here so the immersive interface can remain focused on the scene, time controls, and current PM2.5 Concentration.</p></header><div><article><span>CONCORD SCHOOL</span><h3>Six modeled particle zones</h3><p>The scene reproduces six particle zones from the Grasshopper profile. It does not use an hour-by-hour wind field and is not a full atmospheric dispersion model.</p></article><article><span>SOUTH PARK</span><h3>Wind-driven visual simulation</h3><p>Historical wind direction and speed influence particle motion along the restored road volume. The animation is a simplified visualization—not CFD or a complete atmospheric dispersion model—and does not fully represent emissions, temperature, turbulence, chemistry, or every building-scale airflow effect.</p></article></div></section>
        <div className="vr-glossary-block"><header><span>KEY NAMES / DEFINITIONS</span><h2>What the terms mean.</h2></header><dl>{glossary.map(([term,definition])=><div key={term}><dt>{term}</dt><dd>{definition}</dd></div>)}</dl></div>
      </div>
    </section>
    <section className="vr-entry-section">
      <header className="vr-entry-heading"><div><span>02 / IMMERSIVE SCENES</span><h2>Choose an environment.</h2></div><p>Each scene opens the working 3D application directly. Explore on desktop with a mouse and keyboard, or select Enter VR inside the scene with a compatible browser and headset.</p></header>
      <div className="vr-scene-grid">{scenes.map(scene=><a className="vr-scene-card" href={scene.href} target="_blank" rel="noreferrer" key={scene.index}><span className="vr-scene-index">{scene.index}</span><div className="vr-scene-image"><img src={scene.image} alt={`${scene.title} interactive VR scene preview`}/><span>OPEN INTERACTIVE SCENE ↗</span></div><div className="vr-scene-copy"><small>{scene.label}</small><h3>{scene.title}</h3><p>{scene.description}</p><dl className="vr-scene-provenance"><div><dt>Date represented</dt><dd>{scene.date}</dd></div><div><dt>Time range</dt><dd>{scene.time}</dd></div><div><dt>Pollutant</dt><dd>PM2.5 Concentration (µg/m³)</dd></div><div><dt>Data type</dt><dd>{scene.type}</dd></div><div><dt>Source</dt><dd>{scene.source}</dd></div><div><dt>Simulation</dt><dd>Yes · particle behavior is simulated</dd></div></dl></div></a>)}</div>
    </section>
    <section className="vr-editorial"><div className="vr-intro"><span>03 / PM2.5 CONCENTRATION MODEL</span><h2>Time is visible.<br/>PM2.5 Concentration changes.</h2><p>The moving sun marks the passage of time through a 24-hour cycle. PM2.5 Concentration (µg/m³) is represented through changes in particle number, size, motion, and density.</p></div><article className="vr-concentration-summary"><span>DISPLAYED POLLUTANT</span><h3>PM2.5 Concentration</h3><dl><div><dt>Unit</dt><dd>µg/m³</dd></div><div><dt>Time scale</dt><dd>Hourly · 00:00–23:00</dd></div><div><dt>Visual encoding</dt><dd>Particle number · size · motion · density</dd></div></dl><p>Every value and particle pattern in this experience refers specifically to PM2.5 Concentration.</p></article></section>
    <section className="vr-cta"><span>COMMUNITY ENGAGEMENT / IMMERSIVE MODE</span><h2>Two scales. One environmental story.</h2><p>Begin at Concord International School or move across the South Park neighborhood.</p><a className="button light-button" href={`${vrBase}/#concord`} target="_blank" rel="noreferrer">Enter Concord VR ↗</a></section>
  </div>
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
      <Link className="button light-button" to="/dashboard?module=renewable">Explore in the Digital Twin ↗</Link>
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
      <Link className="button light-button" to="/dashboard?module=renewable">Open Renewable View ↗</Link>
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
