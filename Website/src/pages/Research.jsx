import studyArea from "../assets/research/south-park-study-area.png";
import paperCover from "../assets/research/energy-paper-cover.png";
import frameworkReference from "../assets/framework/integrated-platform-framework.png";
import { PublicationRecord, ResearchFigure, SectionHeader, SourceCaption } from "../components";
import { figures, frameworkStages } from "../data/projectContent";
import { teamPlaceholders } from "../data/team";

export default function Research(){
  return <div className="research-page editorial-page">
    <section className="research-intro"><div className="page-container"><h1>Research</h1><p>DecarbCityTwin brings together environmental sensing, building-energy simulation, retrofit analysis, renewable-energy scenarios, knowledge-graph reasoning, agentic decision support, and immersive interfaces. This page documents the study context, methods, platform framework, and research outputs supporting the South Park testbed.</p></div></section>
    <section className="paper-section"><div className="page-container"><SectionHeader eyebrow="01 / Project Context" title="Why South Park" text="South Park is studied at the intersection of environmental exposure, building performance, energy burden, health, renewable-energy opportunity, and neighborhood resilience."/><div className="context-list"><article><b>01</b><h3>Air pollution and exposure</h3></article><article><b>02</b><h3>Building energy performance</h3></article><article><b>03</b><h3>Renewable-energy opportunity</h3></article></div></div></section>
    <section className="paper-section"><div className="page-container"><SectionHeader eyebrow="02 / Study Area" title="South Park, Duwamish Valley" text="South Park is the initial DecarbCityTwin testbed. The neighborhood is examined as a connected building, energy, environmental, health, and social system."/><figure className="research-figure"><div className="figure-image"><img src={studyArea} alt="South Park study area map"/></div><SourceCaption title="South Park study area" detail="Initial DecarbCityTwin testbed in Seattle’s Duwamish Valley" source="DecarbCityTwin project materials" status="Study-area reference"/></figure></div></section>
    <IntegratedFramework reference={frameworkReference}/>
    <section className="paper-section methods-section"><div className="page-container"><SectionHeader eyebrow="04 / Methods" title="Energy modeling workflow" text="The published workflow links residential archetypes, parametric EnergyPlus simulation, surrogate modeling, and recorded outputs."/><ResearchFigure figure={figures.energyWorkflow}/><ResearchFigure figure={figures.energyArchetypes}/></div></section>
    <section className="paper-section outputs-section"><div className="page-container"><SectionHeader eyebrow="05 / Research Outputs" title="Published research"/><PublicationRecord image={paperCover}/></div></section>
    <section className="paper-section team-section" id="team"><div className="page-container">
      <SectionHeader eyebrow="06 / Team and Partners" title="Research team and collaborators" text="Role-based placeholders show the intended level of detail. Names, portraits, links, and partner marks will replace them after approval."/>
      <div className="team-grid">{teamPlaceholders.map((member,index)=><article className="team-card" key={member.role}>
        <div className="team-avatar" aria-hidden="true"><span>{member.initials}</span></div>
        <div className="team-number">{String(index+1).padStart(2,"0")} / PROFILE PLACEHOLDER</div>
        <h3>{member.role}</h3>
        <p>{member.focus}</p>
        <footer><span>{member.group}</span><span>NAME PENDING</span></footer>
      </article>)}</div>
      <div className="partner-record"><div><span>LEAD LAB</span><strong>Sustainable Intelligence Lab</strong></div><div><span>INSTITUTION</span><strong>University of Washington</strong></div><div><span>COMMUNITY + PROJECT PARTNERS</span><strong>Approved records pending</strong></div></div>
    </div></section>
  </div>
}

function IntegratedFramework({reference}){
  return <section className="paper-section framework-section"><div className="page-container"><SectionHeader eyebrow="03 / Platform Framework" title="Integrated Platform Framework" text="Five connected stages organize sources, infrastructure, semantic relationships, decision support, and interfaces."/><div className="framework-flow">{frameworkStages.map(([title,items],i)=><article key={title}><span>{String(i+1).padStart(2,"0")}</span><h3>{title}</h3><ul>{items.map(x=><li key={x}>{x}</li>)}</ul>{i<4&&<b aria-hidden="true">→</b>}</article>)}</div><blockquote>The web platform is the primary digital twin interface, while VR operates as an immersive mode connected to the same data, models, scenarios, knowledge graph, cloud services, and agentic reasoning layer.</blockquote><details><summary>Reference architecture diagram</summary><img src={reference} alt="Integrated platform framework structural reference"/></details></div></section>
}
