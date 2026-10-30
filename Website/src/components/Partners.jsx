import { useLanguage } from "../i18n";
import uwPurple from "../assets/partners/uw-stacked-purple.png";
import uwGold from "../assets/partners/uw-stacked-gold.png";
import uwMarkPurple from "../assets/partners/uw-w-purple.png";
import uwMarkGold from "../assets/partners/uw-w-gold.png";
import siuLight from "../assets/partners/siu-color-light.png";
import siuDark from "../assets/partners/siu-color-dark.png";
import { useTheme } from "../theme";
import urbiPartner from "../assets/partners/urbiilab.png";
import seattlePartner from "../assets/partners/seattle-official.svg";
import drccLogo from "../assets/partners/drcc-official-white.png";
import silLogo from "../assets/brand/sustainable-intelligence-lab-logo.png";
import "./partners.css";

export default function Partners({contained=true}){
 const {language}=useLanguage();
 const es=language==="es";
 const {theme}=useTheme();
 const dark=theme==="dark";
 return (
  <section className={`partner-network${contained?" page-container":""}`} aria-labelledby="project-partners-title">
   <header className="team-network-heading"><h2 id="project-partners-title">{es?"Socios y colaboradores":"Partners & Collaborators"}</h2></header>
   <div className="partner-grid">
    <div className="partner-column partner-uw"><img className="partner-uw-signature partner-brand-color" src={dark?uwGold:uwPurple} alt="University of Washington"/><p className="partner-university-unit">Population Health Initiative</p><p className="partner-university-unit">Department of Architecture</p><p className="partner-university-unit">Electrical &amp; Computer Engineering</p></div>
    <div className="partner-column partner-research"><p className="partner-real">Renewable Energy<br/>Analysis Lab</p><div className="partner-lockup"><img className="partner-sil-mark" src={silLogo} alt=""/><p>Sustainable<br/>Intelligence Lab <span>[SIL]</span></p></div><div className="partner-idl"><div><strong>INTEGRATED<br/>DESIGN LAB</strong><img className="partner-brand-color" src={dark?uwMarkGold:uwMarkPurple} alt=""/></div><span>UNIVERSITY OF WASHINGTON</span></div></div>
    <div className="partner-column partner-institutions"><div className="partner-siu"><img className="partner-brand-color" src={dark?siuDark:siuLight} alt="Southern Illinois University Carbondale"/><p>College of Arts and Media</p></div><div className="partner-lockup partner-urbi"><img className="partner-brand-color partner-urbi-color" src={urbiPartner} alt=""/><p>Urban Intelligence &amp; Integrity Lab <span>[URBiiLAB]</span></p></div></div>
    <div className="partner-column partner-community"><div className="partner-lockup partner-seattle"><img src={seattlePartner} alt=""/><p>City of Seattle<span>Office of Sustainability &amp; Environment</span></p></div><div className="partner-lockup partner-drcc"><img src={drccLogo} alt=""/><p>Duwamish River<br/>Community Coalition</p></div></div>
   </div>
  </section>
 );
}
