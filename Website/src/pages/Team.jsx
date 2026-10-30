import { useLanguage } from "../i18n";
import uwPartner from "../assets/partners/uw-stacked-white.png";
import uwMark from "../assets/partners/uw-w.svg";
import siuPartner from "../assets/partners/siu-white.png";
import urbiPartner from "../assets/partners/urbiilab.png";
import seattlePartner from "../assets/partners/seattle-official.svg";
import drccLogo from "../assets/partners/drcc-official-white.png";
import silLogo from "../assets/brand/sustainable-intelligence-lab-logo.png";
import "./team.css";

export default function Team(){
 const {language,t}=useLanguage();
 const es=language==="es";
 return <div className="team-page">
  <header className="team-intro page-container"><span className="platform-eyebrow">{t("Team")}</span><h1>{t("Team")}</h1><p>{es?"Agradecemos sinceramente a todos nuestros socios y colaboradores por su apoyo.":"We sincerely thank all our partners and collaborators for their support."}</p></header>
  <section className="page-container team-network" aria-labelledby="project-partners-title">
   <header className="team-network-heading"><h2 id="project-partners-title">{es?"Socios y colaboradores":"Partners & Collaborators"}</h2></header>
   <div className="partner-grid">
    <div className="partner-column partner-uw"><img className="partner-uw-signature" src={uwPartner} alt="University of Washington"/><p className="partner-university-unit">Population Health Initiative</p><p className="partner-university-unit">Department of Architecture</p><p className="partner-university-unit">Electrical &amp; Computer Engineering</p></div>
    <div className="partner-column partner-research"><p className="partner-real">Renewable Energy<br/>Analysis Lab</p><div className="partner-lockup"><img className="partner-sil-mark" src={silLogo} alt=""/><p>Sustainable<br/>Intelligence Lab <span>[SIL]</span></p></div><div className="partner-idl"><div><strong>INTEGRATED<br/>DESIGN LAB</strong><img src={uwMark} alt=""/></div><span>UNIVERSITY OF WASHINGTON</span></div></div>
    <div className="partner-column partner-institutions"><div className="partner-siu"><img src={siuPartner} alt="Southern Illinois University Carbondale"/><p>College of Arts and Media</p></div><div className="partner-lockup partner-urbi"><img src={urbiPartner} alt=""/><p>Urban Intelligence &amp; Integrity Lab <span>[URBiiLAB]</span></p></div></div>
    <div className="partner-column partner-community"><div className="partner-lockup partner-seattle"><img src={seattlePartner} alt=""/><p>City of Seattle<span>Office of Sustainability &amp; Environment</span></p></div><div className="partner-lockup partner-drcc"><img src={drccLogo} alt=""/><p>Duwamish River<br/>Community Coalition</p></div></div>
   </div>
  </section>
 </div>;
}
