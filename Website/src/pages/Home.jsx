import { useState } from "react";
import { Link } from "react-router-dom";
import arcgisPreview from "../assets/home/south-park-arcgis-preview.png";
import studyAreaMap from "../assets/south-park-study-area-map.png";
import airMap from "../assets/air-quality/pm25-prediction-map.png";
import vrCity from "../assets/vr/city-scale-pollution-view.png";
import paperCover from "../assets/research/energy-paper-cover.png";
import { SectionHeader, ViewerPreview } from "../components";
import { modulePanels } from "../data/projectContent";
import { useLanguage } from "../i18n";

export default function Home(){
  const {t}=useLanguage();
  return <div className="home-page">
    <section className="home-hero page-container">
      <div className="hero-title"><h1>DecarbCityTwin</h1></div>
      <div className="hero-statement"><h2>{t("A Platform for Health-Driven")}<br/>{t("& Equitable Decarbonization")}</h2><p>{t("DecarbCityTwin connects neighborhood air-quality data, building-energy simulation, health-driven retrofit analysis, renewable-energy scenarios, agentic decision support, and immersive VR for the South Park testbed.")}</p></div>
      <div className="hero-preview"><ViewerPreview src={arcgisPreview}/></div>
    </section>
    <ModuleExpandingPanels/>
    <StudyAreaSection/>
    <SharedView/>
    <ResearchInPractice/>
    <ExpertiseGroups/>
    <MediaShowcase/>
    <HomeCallToAction/>
  </div>
}

function ModuleExpandingPanels(){
  const {language,t}=useLanguage();
  const [activeModule,setActiveModule]=useState(null);
  const esPanels={air:["Calidad del aire","Los sensores y datos geoespaciales apoyan la predicción y visualización de PM2.5 a escala barrial."],energy:["Modelado energético","Cuatro tipologías residenciales permiten simular envolvente, climatización, ventilación y agua caliente."],retrofit:["Rehabilitación saludable","Compara mejoras de envolvente, bombas de calor, ventilación, filtración y paquetes combinados."],renewable:["Energía renovable","Vincula la geometría y demanda de los edificios con escenarios de energía renovable."],scenario:["IA agéntica","Consultas guiadas, comparación de escenarios y explicaciones basadas en los datos del proyecto."],vr:["VR y participación comunitaria","Una interfaz inmersiva representa el PM2.5 durante un ciclo de 24 horas."]};
  return <section className="study-section"><div className="study-inner page-container">
    <SectionHeader eyebrow={t("02 / Modules")} title={t("What we study")}/>
    <div className="editorial-modules">
      {modulePanels.map((m)=><article
        key={m.key}
        className={`editorial-module${activeModule===m.key?" active":""}`}
        onMouseEnter={()=>setActiveModule(m.key)}
        onMouseLeave={()=>setActiveModule(null)}
        onFocus={()=>setActiveModule(m.key)}
        onBlur={(event)=>{
          if(!event.currentTarget.contains(event.relatedTarget)){
            setActiveModule(null);
          }
        }}
      >
        <button
          type="button"
          aria-expanded={activeModule===m.key}
          aria-controls={`module-details-${m.key}`}
          onClick={()=>setActiveModule(activeModule===m.key?null:m.key)}
        >
          <span className="module-kicker">{m.label}</span>
          <span className="module-background-number" aria-hidden="true">{m.number}</span>
          <div className="module-copy">
            <h3>{language==="es"?esPanels[m.key][0]:m.title}</h3>
          </div>
        </button>
        <div className="module-details" id={`module-details-${m.key}`}>
          <p>{language==="es"?esPanels[m.key][1]:m.description}</p>
          <Link className="module-link" to={m.path}>{t("View module ↗")}</Link>
        </div>
      </article>)}
    </div>
  </div></section>
}

function StudyAreaSection(){
  return <section className="home-study-area">
    <div className="home-study-area-inner page-container">
      <div className="study-area-copy">
        <span className="eyebrow">03 / Where we study</span>
        <h2>South Park,<br/>Duwamish Valley,<br/>Seattle.</h2>
        <div className="study-area-body">
          <p>South Park is the initial DecarbCityTwin study area within Seattle’s Duwamish Valley. The neighborhood is shaped by industrial land uses, pollution exposure, older residential buildings, and long-standing environmental and health inequities.</p>
          <p>Many homes lack modern ventilation, cooling, and high-performance envelope systems, making residents more vulnerable to poor indoor air quality, overheating, and inefficient energy performance. These conditions make South Park a critical testbed for health-driven retrofit, air-quality analysis, renewable-energy assessment, and community-centered decarbonization.</p>
        </div>
        <ul className="study-area-keywords" aria-label="Study area focus">
          <li>Air quality</li>
          <li>Housing vulnerability</li>
          <li>Heat risk</li>
        </ul>
      </div>
      <figure className="study-area-map">
        <img src={studyAreaMap} alt="South Park study area in Seattle’s Duwamish Valley"/>
      </figure>
    </div>
  </section>
}

function SharedView(){
  const outcomes=[
    ["01","Cleaner air","Connect neighborhood sensing, PM2.5 prediction, and spatial visualization."],
    ["02","Lower carbon","Compare building performance, retrofit pathways, and renewable-energy opportunities."],
    ["03","Healthier communities","Translate technical evidence into understandable, place-based decisions."]
  ];
  return <section className="home-shared-section"><div className="page-container">
    <SectionHeader eyebrow="04 / Shared View" title={<>From fragmented data to<br/>collective insight.</>} text="One research platform connects environmental conditions, building systems, scenarios, and community-facing interfaces."/>
    <div className="home-outcome-grid">{outcomes.map(([number,title,text])=><article key={title}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
  </div></section>
}

function ResearchInPractice(){
  const records=[
    ["Urban digital twins","Connect urban form, energy, environmental exposure, and public health."],
    ["Neighborhood evidence","Make air quality and building-performance patterns visible at a local scale."],
    ["Community engagement","Use web and immersive interfaces to make climate evidence explorable."]
  ];
  return <section className="home-research-section"><div className="page-container">
    <SectionHeader eyebrow="05 / Research in Practice" title={<>Rigorous methods.<br/>Open collaboration.</>} text="Research questions remain connected to their methods, sources, and development status."/>
    <div className="home-research-list">{records.map(([label,title],index)=><Link to="/research" key={label}><span>{String(index+1).padStart(2,"0")}</span><div><small>{label}</small><h3>{title}</h3></div><b aria-hidden="true">↗</b></Link>)}</div>
  </div></section>
}

function ExpertiseGroups(){
  const groups=[
    {initials:"AE",title:"Air & Energy Team",role:"Environmental & Building Intelligence",text:"Air-quality prediction, simulation, and machine learning.",tags:["Air Quality","EnergyPlus","Machine Learning"]},
    {initials:"RE",title:"Renewables Team",role:"Solar & Computer Vision",text:"Renewable-energy data, computer vision, and solar analysis.",tags:["Renewables","Computer Vision","Solar"]},
    {initials:"SI",title:"Platform Team",role:"Integration & Immersive Systems",text:"Retrofit, scenarios, platform integration, and WebXR.",tags:["Retrofit","Scenarios","WebXR"]}
  ];
  return <section className="home-expertise-section"><div className="page-container">
    <SectionHeader eyebrow="06 / Shared Expertise" title={<>Research built through<br/>shared expertise.</>} text="Environmental data, building science, renewable-energy analysis, and immersive visualization contribute to one platform."/>
    <div className="expertise-group-grid">{groups.map((group,index)=><article key={group.title}><div className="expertise-group-top"><span>{group.initials}</span><small>{String(index+1).padStart(2,"0")}</small></div><h3>{group.title}</h3><strong>{group.role}</strong><p>{group.text}</p><div>{group.tags.map(tag=><span key={tag}>{tag}</span>)}</div></article>)}</div>
    <Link className="text-link" to="/research#team">View team structure ↗</Link>
  </div></section>
}

function MediaShowcase(){
  const media=[
    {index:"01",label:"Air quality",title:"Making pollution visible",text:"Explore neighborhood-scale PM2.5 prediction and temporal records.",image:airMap,to:"/air-quality"},
    {index:"02",label:"Immersive mode",title:"Enter the virtual city",text:"See environmental conditions through a city-scale immersive interface.",image:vrCity,to:"/vr"},
    {index:"03",label:"Published research",title:"Methods behind the platform",text:"Review the modeling workflow, study context, and published output.",image:paperCover,to:"/research"}
  ];
  return <section className="home-media-section"><div className="page-container">
    <SectionHeader eyebrow="07 / Media and Demonstrations" title={<>Explore the work<br/>in motion.</>} text="Project visuals connect research methods with interactive and immersive experiences."/>
    <div className="home-media-grid">{media.map(item=><Link to={item.to} key={item.title}><div className="home-media-image"><img src={item.image} alt=""/></div><span>{item.index} / {item.label}</span><h3>{item.title}</h3><p>{item.text}</p><b>Explore ↗</b></Link>)}</div>
  </div></section>
}

function HomeCallToAction(){
  return <section className="home-cta-section"><div className="page-container"><span className="eyebrow">08 / Explore the platform</span><h2>The city is already speaking.<br/>Let’s make its data actionable.</h2><p>Open the South Park digital twin, enter the immersive experience, or contact the research team.</p><div><Link className="button light-button" to="/dashboard">Explore the digital twin ↗</Link><Link className="text-link dark-link" to="/vr">Enter VR</Link><a className="text-link dark-link" href="mailto:info@silab.org">Contact us</a></div></div></section>
}
