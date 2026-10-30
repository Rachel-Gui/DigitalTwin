import { useLanguage } from "../i18n";
import Partners from "../components/Partners";
import "./team.css";

export default function Team(){
 const {language,t}=useLanguage();
 const es=language==="es";
 return <div className="team-page">
  <header className="team-intro page-container"><span className="platform-eyebrow">{t("Team")}</span><h1>{t("Team")}</h1><p>{es?"Agradecemos sinceramente a todos nuestros socios y colaboradores por su apoyo.":"We sincerely thank all our partners and collaborators for their support."}</p></header>
  <Partners/>
 </div>;
}
