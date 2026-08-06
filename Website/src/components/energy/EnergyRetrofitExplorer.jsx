import { useEffect, useMemo, useState } from "react";

const dataRoot=`${import.meta.env.BASE_URL}data/energy`;
const endUseConfig=[
  ["heating","Heating","#8fbfb3"],
  ["cooling","Cooling","#72a6c4"],
  ["interiorLighting","Interior Lighting","#d6b66f"],
  ["equipment","Equipment","#b28fc1"],
  ["fans","Fans","#cf846f"],
  ["pumps","Pumps","#7d9b75"],
  ["hotWater","Hot Water","#caa17d"]
];

const isNumber=value=>typeof value==="number"&&Number.isFinite(value);
const number=(value,digits=1)=>isNumber(value)?new Intl.NumberFormat("en-US",{maximumFractionDigits:digits}).format(value):"Not cached";
const currency=value=>isNumber(value)?new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(value):"Not cached";
const energyPrice=value=>isNumber(value)?`$${number(value,4)}`:"Not cached";
const percent=value=>isNumber(value)?`${number(value,1)}%`:"Not cached";

export function useEnergyRetrofitData(){
  const [state,setState]=useState({loading:true,error:null,prototypes:[],packagesByArchetype:{},report:null});
  useEffect(()=>{
    let active=true;
    Promise.all([
      fetch(`${dataRoot}/prototypes.json`).then(response=>response.ok?response.json():Promise.reject(new Error("Prototype data is unavailable."))),
      ...["single-family","duplex","quadplex","ten-unit-apartment"].map(id=>fetch(`${dataRoot}/${id}-packages.json`).then(response=>response.ok?response.json():null).then(data=>[id,data])),
      fetch(`${dataRoot}/conversion-report.json`).then(response=>response.ok?response.json():Promise.reject(new Error("Conversion report is unavailable.")))
    ]).then(([prototypeData,...rest])=>{
      const report=rest.pop();
      if(active)setState({loading:false,error:null,prototypes:prototypeData.prototypes||[],packagesByArchetype:Object.fromEntries(rest.filter(([,data])=>data)),report});
    }).catch(error=>{if(active)setState({loading:false,error:error.message,prototypes:[],packagesByArchetype:{},report:null});});
    return()=>{active=false;};
  },[]);
  return state;
}

export function PrototypeSelector({prototypes,images,selectedId,onSelect}){
  return <div className="energy-choice-grid" aria-label="Residential prototype selection">
    {prototypes.map((prototype,index)=><button type="button" className={`energy-choice${selectedId===prototype.id?" is-selected":""}`} aria-pressed={selectedId===prototype.id} onClick={()=>onSelect(prototype.id)} key={prototype.id}>
      <span className="energy-choice-image"><img src={images[prototype.id]} alt={`${prototype.name} residential building archetype`}/></span>
      <span className="energy-choice-copy"><span>{String(index+1).padStart(2,"0")}</span><span><strong>{prototype.name}</strong><small>{number(prototype.nominalFloorAreaFt2??prototype.floorAreaFt2,0)} ft²</small><em>{prototype.scenarioStatus==="available"?"Interactive modeled scenarios":"Scenario data in preparation"}</em></span></span>
    </button>)}
  </div>
}

function DataValue({label,value,unit}){
  return <div><dt>{label}</dt><dd>{value}{value!=="Not cached"&&unit?<small>{unit}</small>:null}</dd></div>
}

export function SelectedPrototypeSummary({prototype,baseline,buildingId}){
  if(!prototype||!baseline)return null;
  const inputs=baseline.inputs||{};
  return <section className="energy-selected-summary" aria-labelledby="selected-prototype-title">
    <header><div><span className="eyebrow">Selected Prototype</span><h3 id="selected-prototype-title">{prototype.name}</h3></div><span className="energy-data-status">Interactive modeled scenarios</span></header>
    {buildingId?<p className="energy-building-context">Building context: <strong>{buildingId}</strong> · No building-level values are connected in this phase.</p>:null}
    <dl>
      <DataValue label="Modeled floor area" value={number(prototype.floorAreaFt2,0)} unit="ft²"/>
      <DataValue label="Wall insulation" value={number(inputs.wallRValue,2)} unit="R-value"/>
      <DataValue label="Roof insulation" value={number(inputs.roofRValue,2)} unit="R-value"/>
      <DataValue label="Window U-factor" value={number(inputs.windowUFactor,4)} unit="Btu/(h·ft²·°F)"/>
      <DataValue label="Infiltration" value={number(inputs.infiltrationRate,5)} unit="m³/s·m² façade"/>
      <DataValue label="Ventilation" value={inputs.ventilation||"Not cached"}/>
      <DataValue label="Heating & cooling" value={inputs.hvacSystem||"Not cached"}/>
      <DataValue label="Water heating" value={inputs.waterHeatingSystem||"Not cached"}/>
      <DataValue label="Baseline EUI" value={number(baseline.totalEui,2)} unit="kBtu/ft²/year"/>
      <DataValue label="Annual energy" value={number(baseline.annualEnergyKBTU,0)} unit="kBtu/year"/>
      <DataValue label="Annual energy cost" value={currency(baseline.annualEnergyCost)} unit="modeled/year"/>
    </dl>
  </section>
}

function PackageSelector({selected,onSelect}){
  const choices=[["baseline","Baseline"],["package-1","Package 1"],["package-2","Package 2"],["package-3","Package 3"]];
  return <div className="energy-package-tabs" role="tablist" aria-label="Retrofit package selection">{choices.map(([id,label])=><button type="button" role="tab" aria-selected={selected===id} className={selected===id?"is-active":""} onClick={()=>onSelect(id)} key={id}>{label}</button>)}</div>
}

function RetrofitPathway({steps,selectedStepId,onSelect}){
  return <div className="retrofit-pathway" aria-label="Cumulative retrofit pathway">{steps.map((step,index)=><div key={step.id}><button type="button" className={selectedStepId===step.id?"is-active":""} aria-pressed={selectedStepId===step.id} onClick={()=>onSelect(step.id)}><span>{String(index).padStart(2,"0")}</span>{step.label}</button>{index<steps.length-1?<b aria-hidden="true">→</b>:null}</div>)}</div>
}

function PackageMetrics({step,target}){
  const targetState=isNumber(step.totalEui)?step.totalEui<=target.value?step.totalEui===target.value?"Meeting target":"Below target":"Above target":"Target status unavailable";
  const items=[
    ["Current-step EUI",number(step.totalEui,2),"kBtu/ft²/year"],
    ["Annual energy",number(step.annualEnergyKBTU,0),"kBtu/year"],
    ["Modeled annual cost",currency(step.annualEnergyCost),"per year"],
    ["Incremental measure cost",currency(step.incrementalCost),"modeled estimate"],
    ["Incremental annual savings",currency(step.incrementalAnnualSavings),"modeled/year"],
    ["Cumulative annual savings",currency(step.cumulativeAnnualSavings),"modeled/year"]
  ];
  return <div className="energy-metrics">
    <div className="energy-metric-grid">{items.map(([label,value,unit])=><article key={label}><span>{label}</span><strong>{value}</strong><small>{unit}</small></article>)}</div>
    <div className="energy-target-note"><span>Study EUI target · {target.value} {target.unit}</span><strong>{targetState}</strong></div>
  </div>
}

function Assumptions({step}){
  const rows=[
    ["Wall insulation",number(step.inputs.wallRValue,2),"R-value"],
    ["Roof insulation",number(step.inputs.roofRValue,2),"R-value"],
    ["Window U-factor",number(step.inputs.windowUFactor,4),"Btu/(h·ft²·°F)"],
    ["Infiltration",number(step.inputs.infiltrationRate,5),"m³/s·m² façade"],
    ["Ventilation",step.inputs.ventilation||"Not cached",""],
    ["Heating & cooling",step.inputs.hvacSystem||"Not cached",""],
    ["Water heating",step.inputs.waterHeatingSystem||"Not cached",""]
  ];
  return <details className="energy-assumptions"><summary>View modeled assumptions</summary><div><h4>Current modeled assumptions</h4><dl>{rows.map(([label,value,unit])=><DataValue key={label} label={label} value={value} unit={unit}/>)}</dl><p>Simulation ID: {step.simulationId??"Not matched"}</p></div></details>
}

function EnergyEndUseChart({steps,selectedStepId}){
  return <section className="energy-chart-panel" aria-labelledby="end-use-chart-title">
    <header><div><span className="eyebrow">Annual End Uses</span><h3 id="end-use-chart-title">Cumulative package pathway</h3></div><span>kBtu/year</span></header>
    <div className="energy-chart-legend">{endUseConfig.map(([key,label,color])=><span key={key}><i style={{background:color}}/>{label}</span>)}</div>
    <div className="energy-stacked-chart">{steps.map(step=>{
      const available=endUseConfig.map(([key])=>step.endUses[key]).filter(isNumber);
      const total=available.reduce((sum,value)=>sum+value,0);
      return <div className={`energy-stack-row${selectedStepId===step.id?" is-current":""}`} key={step.id}><span title={step.label}>{step.chartLabel||step.label}{selectedStepId===step.id?<small>Selected step</small>:null}</span><div className="energy-stack" aria-label={`${step.label}: ${number(total,0)} kBtu per year`}>
        {endUseConfig.map(([key,label,color])=>{const value=step.endUses[key];return isNumber(value)&&total>0?<i key={key} tabIndex="0" style={{width:`${value/total*100}%`,background:color}} aria-label={`${label}: ${number(value,0)} kBtu/year`}><span className="energy-segment-tooltip" role="tooltip">{label}: {number(value,0)} kBtu/year</span></i>:null;})}
      </div><strong>{number(step.annualEnergyKBTU,0)}</strong></div>})}</div>
    <p className="energy-chart-note">Blank Cooling or Pumps segments indicate formula cells without cached workbook results; no zero value was substituted.</p>
  </section>
}

function EuiComparisonChart({baseline,packages,target}){
  const rows=[{id:"baseline",name:"Baseline",eui:baseline.totalEui},...packages.map(item=>({id:item.id,name:item.name,eui:item.summary.finalEui}))];
  const max=Math.max(target.value,...rows.map(row=>row.eui||0))*1.08;
  return <section className="energy-chart-panel" aria-labelledby="eui-chart-title">
    <header><div><span className="eyebrow">EUI Comparison</span><h3 id="eui-chart-title">Final package EUI</h3></div><span>kBtu/ft²/year</span></header>
    <p className="energy-target-explainer" title={target.note}>Study EUI Target · {target.value} {target.unit} <span aria-hidden="true">ⓘ</span></p>
    <div className="energy-eui-chart" style={{"--target-position":`${target.value/max*100}%`}}>{rows.map(row=>{const status=row.eui<=target.value?(row.eui===target.value?"Meeting target":"Below target"):"Above target";return <div key={row.id}><span>{row.name}</span><div><i style={{width:`${row.eui/max*100}%`}}/><b aria-hidden="true"/></div><strong>{number(row.eui,2)}<small>{status}</small></strong></div>})}</div>
    <p className="energy-target-note-copy">{target.note}</p>
  </section>
}

function PackageComparison({baseline,packages,selectedPackageId}){
  const rows=[{id:"baseline",name:"Baseline",description:"Existing modeled condition",finalEui:baseline.totalEui,reduction:0,annualCost:baseline.annualEnergyCost,savings:null,cost:null,payback:null},...packages.map(item=>({id:item.id,name:item.name,description:item.description,finalEui:item.summary.finalEui,reduction:item.summary.euiReductionPercent,annualCost:item.summary.modeledAnnualEnergyCost,savings:item.summary.annualSavings,cost:item.summary.totalPackageCost,payback:item.summary.simplePaybackYears}))];
  return <section className="energy-comparison-panel" aria-labelledby="package-comparison-title"><header><span className="eyebrow">Package Comparison</span><h3 id="package-comparison-title">Baseline and final package results</h3></header><div className="energy-table-scroll"><table><thead><tr><th>Package</th><th>Description</th><th>Final EUI</th><th>EUI reduction</th><th>Annual cost</th><th>Annual savings</th><th>Package cost</th><th>Simple payback</th></tr></thead><tbody>{rows.map(row=><tr className={selectedPackageId===row.id?"is-selected":""} key={row.id}><th scope="row">{row.name}{selectedPackageId===row.id?<small>Selected</small>:null}</th><td>{row.description}</td><td>{number(row.finalEui,2)}</td><td>{row.id==="baseline"?"Reference":percent(row.reduction)}</td><td>{currency(row.annualCost)}</td><td>{currency(row.savings)}</td><td>{currency(row.cost)}</td><td>{isNumber(row.payback)?`${number(row.payback,1)} years`:"—"}</td></tr>)}</tbody></table></div></section>
}

function FinalPackageSummary({activePackage,target}){
  if(!activePackage)return null;
  const summary=activePackage.summary;
  const targetStatus=isNumber(summary.finalEui)&&summary.finalEui<=target.value?summary.finalEui===target.value?"Meeting target":"Below target":"Above target";
  return <section className="energy-final-summary"><header><div><span className="eyebrow">Final Package Summary</span><h3>{activePackage.name}</h3></div><span className="energy-data-status">{targetStatus}</span></header><div>{[
    ["Final EUI",number(summary.finalEui,2),"kBtu/ft²/year"],["EUI reduction",percent(summary.euiReductionPercent),"from baseline"],["Modeled annual cost",currency(summary.modeledAnnualEnergyCost),"per year"],["Modeled annual savings",currency(summary.annualSavings),"per year"],["Total package cost",currency(summary.totalPackageCost),"modeled estimate"],["Simple payback",`${number(summary.simplePaybackYears,1)} years`,"simple payback"]
  ].map(([label,value,unit])=><article key={label}><span>{label}</span><strong>{value}</strong><small>{unit}</small></article>)}</div></section>
}

export function DevelopmentStatus({prototype}){
  return <div className="energy-development-state"><span className="energy-data-status">Scenario data in preparation</span><h3>{prototype.name} · {number(prototype.floorAreaFt2,0)} ft²</h3><p>{prototype.description}</p><strong>Retrofit scenario data for this archetype is being prepared.</strong><p>Single Family scenarios are currently available for exploration.</p></div>
}

export function RetrofitExplorer({prototype,packageData,report,buildingId}){
  const [selectedPackageId,setSelectedPackageId]=useState("baseline");
  const [selectedStepId,setSelectedStepId]=useState("baseline");
  useEffect(()=>{setSelectedPackageId("baseline");setSelectedStepId("baseline");},[prototype?.id]);
  const activePackage=useMemo(()=>packageData?.packages.find(item=>item.id===selectedPackageId)||null,[packageData,selectedPackageId]);
  const steps=useMemo(()=>!packageData?[]:selectedPackageId==="baseline"?[packageData.baseline]:(activePackage?.steps||[packageData.baseline]),[activePackage,packageData,selectedPackageId]);
  useEffect(()=>{if(!steps.some(step=>step.id===selectedStepId))setSelectedStepId(steps.at(-1)?.id||"baseline");},[selectedPackageId,selectedStepId,steps]);
  const selectedStep=steps.find(step=>step.id===selectedStepId)||steps.at(-1)||packageData?.baseline||null;
  if(prototype.scenarioStatus!=="available"||!packageData)return <DevelopmentStatus prototype={prototype}/>;
  return <div className="retrofit-explorer">
    <div className="retrofit-explorer-heading"><div><span className="eyebrow">Retrofit Explorer</span><h3>Explore cumulative {prototype.name} strategies.</h3></div></div>
    {packageData.developmentDataNotice?<p className="energy-quality-notice"><strong>Development data notice.</strong> {packageData.developmentDataNotice}</p>:null}
    <PackageSelector selected={selectedPackageId} onSelect={id=>{setSelectedPackageId(id);setSelectedStepId(id==="baseline"?"baseline":packageData.packages.find(item=>item.id===id)?.steps.at(-1)?.id||"baseline");}}/>
    <div className="energy-package-intro"><div><span>Selected package</span><h4>{activePackage?.name||"Baseline"}</h4><p>{activePackage?.description||"Existing modeled condition used as the reference for package comparisons."}</p></div>{activePackage?<ul>{activePackage.steps.slice(1).map(step=><li key={step.id}>{step.measure}</li>)}</ul>:null}</div>
    <RetrofitPathway steps={steps} selectedStepId={selectedStep.id} onSelect={setSelectedStepId}/>
    <div className="energy-step-layout"><PackageMetrics step={selectedStep} target={packageData.euiTarget}/><Assumptions step={selectedStep}/></div>
    <EnergyEndUseChart steps={steps} selectedStepId={selectedStep.id}/>
    <FinalPackageSummary activePackage={activePackage} target={packageData.euiTarget}/>
    <div className="energy-comparison-layout"><EuiComparisonChart baseline={packageData.baseline} packages={packageData.packages} target={packageData.euiTarget}/><div className="energy-cost-note"><span className="eyebrow">Cost Assumptions</span><p>{packageData.costNote}</p><details><summary>Workbook price assumptions</summary><dl><DataValue label="Electricity" value={energyPrice(packageData.packages[0].assumptions.electricityPricePerKWh)} unit="per kWh"/><DataValue label="Gas" value={energyPrice(packageData.packages[0].assumptions.gasPricePerTherm)} unit="per therm"/></dl><small>Study assumptions; not current utility rates.</small></details><span className="energy-data-status">Advanced scenario builder — in development</span></div></div>
    <PackageComparison baseline={packageData.baseline} packages={packageData.packages} selectedPackageId={selectedPackageId}/>
    <footer className="energy-explorer-footer"><span>Evidence type · Modeled</span><span>Source · {packageData.packages[0]?.sourceWorkbook||"Workbook unavailable"}</span><span>Validation · {report?.errors?.length||0} errors / {report?.warnings?.length||0} warnings</span></footer>
  </div>
}
