import { useState } from "react";
import { Link } from "react-router-dom";
import studyAreaMap from "../assets/south-park-study-area-map.png";
import homepageDemo from "../assets/home/homepage_demo_2.png";
import vrConcord from "../assets/vr/concord-pm25-particle-view.png";
import paperCover from "../assets/research/energy-paper-cover.png";
import { PublicationRecord, SectionHeader, StatusLabel } from "../components";
import { modulePanels } from "../data/projectContent";
import { useLanguage } from "../i18n";

export default function Home(){
  const {t}=useLanguage();
  return <div className="home-page">
    <section className="home-hero page-container">
      {/* TODO: Replace with final exported VR walkthrough video. */}
      <div className="home-hero-media" aria-hidden="true"><img src={homepageDemo} alt=""/></div>
      <div className="hero-title"><h1>DecarbCity<span>Twin</span></h1></div>
      <div className="hero-statement"><h2>{t("A Platform for Health-Driven")}<br/>{t("& Equitable Decarbonization")}</h2><p>{t("DecarbCityTwin connects neighborhood air-quality data, building-energy simulation, health-driven retrofit analysis, renewable-energy scenarios, agentic decision support, and immersive VR for the South Park testbed.")}</p></div>
    </section>
    <ModuleExpandingPanels/>
    <StudyAreaSection/>
    <ImmersiveModeSection/>
    <AgenticAISection/>
    <PublicationsSection/>
  </div>
}

function ModuleExpandingPanels(){
  const {language,t}=useLanguage();
  const [activeModule,setActiveModule]=useState(null);
  const esPanels={energy:["Modelado energético urbano","Explore tipologías residenciales, rendimiento energético y registros basados en simulación."],air:["Evaluación de calidad del aire y exposición","Examine condiciones monitoreadas y modeladas a través del tiempo y el espacio."],retrofit:["Estrategias de rehabilitación y descarbonización","Compare intervenciones relacionadas con energía, ambiente interior y resiliencia térmica."],renewable:["Evaluación solar y de energía renovable","Explore el potencial solar de cubiertas y fachadas y futuros escenarios renovables."]};
  return <section className="study-section"><div className="study-inner page-container">
    <SectionHeader eyebrow={t("01 / Core Modules")} title={t("What we study")}/>
    <div className="editorial-modules">
      {modulePanels.map((m)=><article key={m.key} className={`editorial-module${activeModule===m.key?" active":""}`} onMouseEnter={()=>setActiveModule(m.key)} onMouseLeave={()=>setActiveModule(null)} onFocus={()=>setActiveModule(m.key)} onBlur={(event)=>{if(!event.currentTarget.contains(event.relatedTarget))setActiveModule(null)}}>
        <button type="button" aria-expanded={activeModule===m.key} aria-controls={`module-details-${m.key}`} onClick={()=>setActiveModule(activeModule===m.key?null:m.key)}>
          <span className="module-kicker">{m.label}</span><span className="module-background-number" aria-hidden="true">{m.number}</span><div className="module-copy"><h3>{language==="es"?esPanels[m.key][0]:m.title}</h3></div>
        </button>
        <div className="module-details" id={`module-details-${m.key}`}><p>{language==="es"?esPanels[m.key][1]:m.description}</p><Link className="module-link" to={m.path}>{t("View module ↗")}</Link></div>
      </article>)}
    </div>
  </div></section>
}

function StudyAreaSection(){
  return <section className="home-study-area">
    <div className="home-study-area-inner page-container">
      <div className="study-area-copy">
        <span className="eyebrow">02 / Current Prototype</span>
        <h2>South Park, Seattle</h2>
        <div className="study-area-body">
          <p>South Park is the current prototype implementation of DecarbCityTwin. The platform is designed as a modular framework that can be adapted to additional neighborhoods and cities in the future.</p>
        </div>
      </div>
      <figure className="study-area-map">
        <img src={studyAreaMap} alt="South Park study area in Seattle’s Duwamish Valley"/>
      </figure>
    </div>
  </section>
}

function ImmersiveModeSection(){
  return <section className="home-feature-section"><div className="home-feature page-container">
    <div className="home-feature-copy"><span className="eyebrow">03 / Immersive Mode</span><h2>Step inside the city’s atmosphere.</h2><p>Explore environmental conditions through interactive, browser-based, and headset-ready 3D experiences.</p><Link className="button home-feature-action" to="/vr">Enter Immersive Mode ↗</Link></div>
    <Link className="home-feature-media" to="/vr" aria-label="Enter Immersive Mode"><img src={vrConcord} alt="Immersive PM2.5 Concentration particle visualization around Concord International School"/></Link>
  </div></section>
}

function AgenticAISection(){
  return <section className="home-agentic-section"><div className="home-agentic page-container">
    <div><span className="eyebrow">04 / Agentic AI</span><StatusLabel>In Development</StatusLabel></div>
    <div><h2>Ask questions across project evidence.</h2><p>Use a guided interface to retrieve, compare, and explain available building, energy, air-quality, retrofit, and renewable-energy records.</p><Link className="button home-feature-action" to="/scenario-analysis">Explore Agentic AI ↗</Link></div>
  </div></section>
}

function PublicationsSection(){
  return <section className="home-publications"><div className="page-container">
    <SectionHeader eyebrow="05 / Publications" title="Research Publications"/>
    <PublicationRecord image={paperCover} href="https://doi.org/10.3390/architecture6020084"/>
  </div></section>
}
