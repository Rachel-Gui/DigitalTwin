import "./modeling-bridge.css";

export default function ModelingBridge({archetypes,locale}){
 const es=locale==="es";
 const labels=es?{
  title:"Simulación y modelado predictivo",inputs:"Arquetipos residenciales",physics:"Simulación EnergyPlus",physicsDetail:"Modelos energéticos basados en la física",data:"Datos sintéticos",prediction:"Modelado predictivo",predictionDetail:"Entrenamiento y prueba",evaluation:"Validación cruzada y análisis de rehabilitación"
 }:{title:"Simulation and predictive modeling",inputs:"Residential archetypes",physics:"EnergyPlus simulations",physicsDetail:"Physics-based building energy",data:"Synthetic data",prediction:"Predictive modeling",predictionDetail:"Training and testing",evaluation:"Cross-validation and retrofit analysis"};
 return <figure className="cap-modeling-bridge" aria-label={labels.title}>
  <svg viewBox="0 0 640 400" role="img" aria-label={labels.title}>
   <desc>{es?"Los arquetipos residenciales alimentan simulaciones EnergyPlus. Los datos sintéticos sirven para entrenar y probar modelos predictivos, con validación cruzada y análisis de rehabilitación.":"Residential archetypes inform EnergyPlus simulations. Synthetic simulation data support training and testing predictive models, followed by cross-validation and retrofit analysis."}</desc>
   {archetypes.map((item,i)=><image key={item.id} href={item.image} x={30+i*150} y="8" width="130" height="105" preserveAspectRatio="xMidYMid meet"/>)}
   <text className="bridge-label" x="320" y="138" textAnchor="middle">{labels.inputs}</text>
   <g className="bridge-connections" fill="none"><path d="M320 152V170H145V199"/><path d="M185 239H455"/><path d="M495 329V349H320V364"/></g>
   <g className="bridge-method" transform="translate(145 239)"><circle r="38"/><path d="M-16 17V-8L0-20 16-8V17ZM-5 17V5H5V17M-10-5H-5M5-5H10"/></g>
   <g className="bridge-method" transform="translate(495 239)"><circle r="38"/><path d="M-15-14L0 0 15-14M-15 14L0 0 15 14M-15-14V14M15-14V14"/>{[[-15,-14],[-15,14],[0,0],[15,-14],[15,14]].map(([cx,cy],i)=><circle className="bridge-network-node" key={i} cx={cx} cy={cy} r="3"/>)}</g>
   <rect className="bridge-label-ground" x="230" y="222" width="180" height="34"/>
   <text className="bridge-label" x="320" y="243" textAnchor="middle">{labels.data}</text>
   <text className="bridge-title" x="145" y="303" textAnchor="middle">{labels.physics}</text>
   <text className="bridge-detail" x="145" y="323" textAnchor="middle">{labels.physicsDetail}</text>
   <text className="bridge-title" x="495" y="303" textAnchor="middle">{labels.prediction}</text>
   <text className="bridge-detail" x="495" y="323" textAnchor="middle">{labels.predictionDetail}</text>
   <text className="bridge-label" x="320" y="386" textAnchor="middle">{labels.evaluation}</text>
  </svg>
 </figure>;
}
