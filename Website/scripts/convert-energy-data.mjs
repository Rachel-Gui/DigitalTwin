import ExcelJS from "exceljs";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const sourceDirs=[path.join(projectRoot,"data-source"),path.join(projectRoot,"data_source")];
const outputDir=path.join(projectRoot,"public","data","energy");
const expectedSheets=["Measure and Buildings Overview","Package1","Package2","Package3","Compare Packages","Energy Data"];
const configs=[
  {id:"single-family",name:"Single Family",file:"energy-retrofit-single-family.xlsx",expectedSelection:"1,200 ft2 Single Family",energySite:"Single-Family",overviewRow:16,nominalArea:1200,description:"One-unit residential prototype represented in the source workbook."},
  {id:"duplex",name:"Duplex",file:"energy-retrofit-duplex.xlsx",expectedSelection:"2,400 ft2 Duplex",energySite:"Duplex",overviewRow:17,nominalArea:2400,description:"Two-unit residential prototype represented in the source workbook."},
  {id:"quadplex",name:"Quadplex",file:"energy-retrofit-quadplex.xlsx",expectedSelection:"3,400 ft2 Quadplex",energySite:"Quadplex",overviewRow:18,nominalArea:3400,description:"Four-unit residential prototype represented in the source workbook."},
  {id:"ten-unit-apartment",name:"Ten-Unit Apartment",file:"energy-retrofit-ten-unit.xlsx",expectedSelection:"8,100 ft2 10-Unit",energySite:"10-Unit",overviewRow:19,nominalArea:8100,description:"Ten-unit residential prototype represented in the source workbook."}
];
const report={generatedAt:new Date().toISOString(),workbooks:[],worksheets:{expected:expectedSheets,byWorkbook:{}},errors:[],warnings:[],stats:{}};
const addIssue=(level,code,message,context={})=>report[level].push({code,message,...context});
const hasValue=value=>value!==null&&value!==undefined&&value!=="";
const isNumber=value=>typeof value==="number"&&Number.isFinite(value);

function cachedValue(cell,{required=false,label="value",context={}}={}){
  const raw=cell.value;
  let value=raw;
  if(raw&&typeof raw==="object"&&("formula" in raw||"sharedFormula" in raw)){
    value=raw.result;
    if(value===undefined||value===null){
      addIssue(required?"errors":"warnings","missing-cached-formula-value",`${label} has no cached formula result.`,{...context,worksheet:cell.worksheet.name,cell:cell.address,formula:raw.formula||`shared:${raw.sharedFormula}`});
      return null;
    }
  }else if(raw&&typeof raw==="object")value=cell.text||null;
  if(value&&typeof value==="object"&&"error" in value){
    addIssue(required?"errors":"warnings","excel-error",`${label} contains ${value.error}.`,{...context,worksheet:cell.worksheet.name,cell:cell.address});
    return null;
  }
  if(!hasValue(value)||value==="-"){
    if(required)addIssue("errors","missing-required-value",`${label} is blank.`,{...context,worksheet:cell.worksheet.name,cell:cell.address});
    return null;
  }
  return value;
}
function numericCell(cell,options={}){
  const value=cachedValue(cell,options);
  if(value===null)return null;
  if(!isNumber(value)){
    addIssue(options.required?"errors":"warnings","invalid-number",`${options.label||"Value"} is not a valid number.`,{...(options.context||{}),worksheet:cell.worksheet.name,cell:cell.address,value:String(value)});
    return null;
  }
  return value;
}
function textCell(cell,options={}){const value=cachedValue(cell,options);return value===null?null:String(value).trim();}
async function locate(file){for(const dir of sourceDirs){const candidate=path.join(dir,file);try{await fs.access(candidate);return candidate;}catch{}}return null;}

const energyHeaders={index:1,simulationId:2,site:3,wallRValue:4,roofRValue:5,windowUFactor:6,infiltrationRate:7,ventilation:8,hvacSystem:9,waterHeatingSystem:10,heatingEui:11,coolingEui:12,interiorLightingEui:13,equipmentEui:14,fansEui:15,pumpsEui:16,hotWaterEui:17,totalEui:18,locationIndex:19,wallIndex:20,roofIndex:21,windowIndex:22,infiltrationIndex:23,ventilationIndex:24,hvacIndex:25,hotWaterIndex:26};
const energyUnits={wallRValue:"ft²·h·°F/Btu",roofRValue:"ft²·h·°F/Btu",windowUFactor:"Btu/(h·ft²·°F)",infiltrationRate:"m³/s per m² façade",heatingEui:"kBtu/ft²/year",coolingEui:"kBtu/ft²/year",interiorLightingEui:"kBtu/ft²/year",equipmentEui:"kBtu/ft²/year",fansEui:"kBtu/ft²/year",pumpsEui:"kBtu/ft²/year",hotWaterEui:"kBtu/ft²/year",totalEui:"kBtu/ft²/year"};
const stepRows={wallRValue:6,roofRValue:7,windowUFactor:8,infiltrationRate:9,ventilation:10,hvacSystem:11,waterHeatingSystem:12};
const indexRows={wallIndex:20,roofIndex:21,windowIndex:22,infiltrationIndex:23,ventilationIndex:24,hvacIndex:25,hotWaterIndex:26};
const endUseRows={heating:32,cooling:33,interiorLighting:34,equipment:35,fans:36,pumps:37,hotWater:38};
const canonicalSimulations=new Map();
const prototypes=[];
const packageOutputs={};

await fs.mkdir(outputDir,{recursive:true});
for(const config of configs){
  const inputPath=await locate(config.file);
  if(!inputPath){
    addIssue("warnings","missing-workbook",`${config.file} was not found.`,{archetypeId:config.id});
    prototypes.push({id:config.id,name:config.name,floorAreaFt2:config.nominalArea,nominalFloorAreaFt2:config.nominalArea,description:config.description,scenarioStatus:"in-development",sourceWorkbook:null});
    continue;
  }
  const workbook=new ExcelJS.Workbook();
  await workbook.xlsx.readFile(inputPath);
  const workbookName=path.basename(inputPath);
  report.workbooks.push({archetypeId:config.id,file:path.relative(projectRoot,inputPath)});
  const found=workbook.worksheets.map(sheet=>sheet.name);
  report.worksheets.byWorkbook[workbookName]=found;
  let structuralError=false;
  for(const name of expectedSheets)if(!workbook.getWorksheet(name)){addIssue("errors","missing-required-worksheet",`Required worksheet '${name}' is missing.`,{archetypeId:config.id,workbook:workbookName,worksheet:name});structuralError=true;}
  for(const name of found)if(!expectedSheets.includes(name))addIssue("warnings","unexpected-worksheet",`Unexpected worksheet '${name}' was not exported.`,{archetypeId:config.id,workbook:workbookName,worksheet:name});
  if(structuralError){prototypes.push({id:config.id,name:config.name,floorAreaFt2:config.nominalArea,nominalFloorAreaFt2:config.nominalArea,description:config.description,scenarioStatus:"in-development",sourceWorkbook:workbookName});continue;}

  const context={archetypeId:config.id,workbook:workbookName};
  const overview=workbook.getWorksheet("Measure and Buildings Overview");
  const energySheet=workbook.getWorksheet("Energy Data");
  const compareSheet=workbook.getWorksheet("Compare Packages");
  const modelArea=numericCell(overview.getCell(config.overviewRow,2),{required:true,label:`${config.name} modeled floor area`,context});
  prototypes.push({id:config.id,name:config.name,floorAreaFt2:modelArea??config.nominalArea,nominalFloorAreaFt2:config.nominalArea,description:config.description,scenarioStatus:"available",sourceWorkbook:workbookName,sourceWorksheet:overview.name,sourceRow:config.overviewRow});
  const measureDefinitions={};
  for(let row=3;row<=12;row++){const name=textCell(overview.getCell(row,1),{required:true,label:"Measure name",context});if(name)measureDefinitions[name]={name,description:textCell(overview.getCell(row,2),{label:`${name} description`,context}),sourceCell:`A${row}:B${row}`};}

  const simulationByIndex=new Map();
  for(let row=2;row<=energySheet.actualRowCount;row++){
    if(energySheet.getCell(row,3).text!==config.energySite)continue;
    const record={archetypeId:config.id};
    for(const [field,column] of Object.entries(energyHeaders)){const cell=energySheet.getCell(row,column);record[field]=["index","site","ventilation","hvacSystem","waterHeatingSystem"].includes(field)?textCell(cell,{required:true,label:`Energy Data ${field}`,context}):numericCell(cell,{required:true,label:`Energy Data ${field}`,context});}
    record.sourceRow=row;
    const key=`${config.id}:${record.simulationId}`;
    const existing=canonicalSimulations.get(key);
    if(existing&&JSON.stringify({...existing,sourceWorkbook:undefined,sourceRow:undefined})!==JSON.stringify({...record,sourceWorkbook:undefined,sourceRow:undefined}))addIssue("warnings","conflicting-simulation-row",`Conflicting duplicate simulation '${record.simulationId}' was found. The first record was retained.`,{...context,worksheet:energySheet.name,row});
    else if(!existing)canonicalSimulations.set(key,{...record,sourceWorkbook:workbookName});
    if(simulationByIndex.has(record.index))addIssue("errors","duplicate-simulation-index",`Duplicate source index '${record.index}' within ${config.name}.`,{...context,worksheet:energySheet.name,row});
    simulationByIndex.set(record.index,record);
    const endUseSum=[record.heatingEui,record.coolingEui,record.interiorLightingEui,record.equipmentEui,record.fansEui,record.pumpsEui,record.hotWaterEui].reduce((sum,value)=>sum+(isNumber(value)?value:0),0);
    if(isNumber(record.totalEui)&&Math.abs(endUseSum-record.totalEui)>0.001)addIssue("warnings","inconsistent-eui-total","Energy Data end-use values do not sum to stored total EUI.",{...context,worksheet:energySheet.name,row,simulationId:record.simulationId,storedTotal:record.totalEui,calculatedTotal:endUseSum});
  }

  function packageFromSheet(number){
    const sheet=workbook.getWorksheet(`Package${number}`);
    const selection=textCell(sheet.getCell("B2"),{required:true,label:`Package ${number} prototype`,context});
    if(selection!==config.expectedSelection)addIssue("errors","unexpected-package-prototype",`Package ${number} is not set to '${config.expectedSelection}'.`,{...context,worksheet:sheet.name,cell:"B2",value:selection});
    const steps=[];
    for(let column=2;column<=7;column++){
      const measure=column===2?null:textCell(sheet.getCell(5,column),{label:`Package ${number} measure`,context});
      if(column>2&&(!measure||measure==="None"))continue;
      const label=column===2?"Baseline":measure;
      const inputs={};for(const [field,row] of Object.entries(stepRows))inputs[field]=["ventilation","hvacSystem","waterHeatingSystem"].includes(field)?textCell(sheet.getCell(row,column),{required:true,label:`${sheet.name} ${label} ${field}`,context}):numericCell(sheet.getCell(row,column),{required:true,label:`${sheet.name} ${label} ${field}`,context});
      const sourceIndices={};for(const [field,row] of Object.entries(indexRows))sourceIndices[field]=numericCell(sheet.getCell(row,column),{required:true,label:`${sheet.name} ${label} ${field}`,context});
      const endUses={};for(const [field,row] of Object.entries(endUseRows))endUses[field]=numericCell(sheet.getCell(row,column),{label:`${sheet.name} ${label} ${field} annual energy`,context});
      const sourceIndex=textCell(sheet.getCell(27,column),{required:true,label:`${sheet.name} ${label} source index`,context});
      const simulation=sourceIndex?simulationByIndex.get(sourceIndex):null;
      if(sourceIndex&&!simulation)addIssue("errors","unmatched-package-step",`${sheet.name} ${label} could not be matched to Energy Data.`,{...context,worksheet:sheet.name,cell:sheet.getCell(27,column).address,sourceIndex});
      const step={id:column===2?"baseline":`step-${column-1}`,label,measure,chartLabel:column===2?"Baseline":shortMeasure(measure),measureDescription:measureDefinitions[measure]?.description||null,inputs,endUses,totalEui:numericCell(sheet.getCell(14,column),{required:true,label:`${sheet.name} ${label} EUI`,context}),annualEnergyKBTU:numericCell(sheet.getCell(39,column),{required:true,label:`${sheet.name} ${label} annual energy`,context}),annualEnergyCost:numericCell(sheet.getCell(52,column),{required:true,label:`${sheet.name} ${label} annual cost`,context}),incrementalCost:numericCell(sheet.getCell(56,column),{label:`${sheet.name} ${label} incremental cost`,context}),incrementalAnnualSavings:numericCell(sheet.getCell(53,column),{label:`${sheet.name} ${label} incremental annual savings`,context}),cumulativeAnnualSavings:numericCell(sheet.getCell(54,column),{label:`${sheet.name} ${label} cumulative annual savings`,context}),simplePaybackYears:numericCell(sheet.getCell(58,column),{label:`${sheet.name} ${label} simple payback`,context}),sourceIndex,simulationId:simulation?.simulationId??null,sourceIndices,sourceCells:{measure:sheet.getCell(5,column).address,eui:sheet.getCell(14,column).address,annualEnergy:sheet.getCell(39,column).address,annualCost:sheet.getCell(52,column).address}};
      const available=Object.values(endUses).filter(isNumber);if(available.length===Object.keys(endUses).length){const calculated=available.reduce((a,b)=>a+b,0);if(Math.abs(calculated-step.annualEnergyKBTU)>0.01)addIssue("warnings","inconsistent-package-energy-total",`${sheet.name} ${label} end uses do not sum to stored annual energy.`,{...context,worksheet:sheet.name,column:sheet.getColumn(column).letter,storedTotal:step.annualEnergyKBTU,calculatedTotal:calculated});}
      steps.push(step);
    }
    if(!steps.length||steps[0].id!=="baseline")addIssue("errors","missing-package-baseline",`${sheet.name} does not contain a readable baseline.`,{...context,worksheet:sheet.name});
    if(steps.length<2)addIssue("warnings","missing-package-steps",`${sheet.name} contains no readable retrofit steps.`,{...context,worksheet:sheet.name});
    const compareColumn=number+1;const baselineEui=steps[0]?.totalEui??null;const finalEui=numericCell(compareSheet.getCell(4,compareColumn),{required:true,label:`Package ${number} final EUI`,context});
    return {id:`package-${number}`,archetypeId:config.id,name:textCell(sheet.getCell("B1"),{required:true,label:`Package ${number} name`,context}),description:textCell(compareSheet.getCell(3,compareColumn),{required:true,label:`Package ${number} description`,context})?.replace(/,\s*$/,""),measures:steps.slice(1).map(step=>step.measure),steps,summary:{finalEui,euiReductionPercent:baselineEui&&finalEui!==null?(baselineEui-finalEui)/baselineEui*100:null,modeledAnnualEnergyCost:steps.at(-1)?.annualEnergyCost??null,totalPackageCost:numericCell(compareSheet.getCell(5,compareColumn),{required:true,label:`Package ${number} total cost`,context}),annualSavings:numericCell(compareSheet.getCell(6,compareColumn),{required:true,label:`Package ${number} annual savings`,context}),simplePaybackYears:numericCell(compareSheet.getCell(7,compareColumn),{required:true,label:`Package ${number} simple payback`,context})},assumptions:{electricityPricePerKWh:numericCell(sheet.getCell("B44"),{required:true,label:`Package ${number} electricity price`,context}),gasPricePerTherm:numericCell(sheet.getCell("B45"),{required:true,label:`Package ${number} gas price`,context})},units:{eui:"kBtu/ft²/year",annualEnergy:"kBtu/year",annualEnergyCost:"USD/year",cost:"USD",simplePayback:"years",electricityPrice:"USD/kWh",gasPrice:"USD/therm"},evidenceType:"Modeled",sourceWorkbook:workbookName,sourceWorksheet:sheet.name,status:"prototype"};
  }
  const packages=[1,2,3].map(packageFromSheet);
  const signatures=new Map();for(const item of packages){const signature=JSON.stringify({description:item.description,summary:item.summary});if(signatures.has(signature))addIssue("warnings","duplicate-package",`${item.name} has the same description and summary values as ${signatures.get(signature)}. Source values were preserved.`,{...context,packages:[signatures.get(signature),item.name]});else signatures.set(signature,item.name);}
  packageOutputs[`${config.id}-packages.json`]={archetypeId:config.id,euiTarget:{value:32,unit:"kBtu/ft²/year",sourceCell:"Package1!E1",note:"Target value provided in the source workbook. It is used as a study reference and is not presented as a current building-code requirement."},baseline:packages[0]?.steps[0]||null,packages,costNote:"Modeled estimates based on the energy-price assumptions used in the study.",developmentDataNotice:report.warnings.some(issue=>issue.code==="duplicate-package"&&issue.archetypeId===config.id)?"Package 1 and Package 2 currently contain identical source descriptions and summary values.":null};
}

function shortMeasure(measure=""){
  if(/ERV/i.test(measure)&&/Heat Pump Combo/i.test(measure))return "ERV + Heat Pump";
  if(/ERV/i.test(measure))return "ERV";
  if(/Windows|Siding/i.test(measure))return "Windows + Siding";
  if(/Heating\/Cooling|Heating.*Cooling/i.test(measure))return "HVAC Heat Pump";
  if(/Water Heater/i.test(measure))return "HP Water Heater";
  return measure;
}

report.stats={prototypeCount:prototypes.length,availablePrototypeCount:prototypes.filter(item=>item.scenarioStatus==="available").length,packageCount:Object.values(packageOutputs).reduce((sum,item)=>sum+item.packages.length,0),packageStepCount:Object.values(packageOutputs).reduce((sum,item)=>sum+item.packages.reduce((n,p)=>n+p.steps.length,0),0),simulationCount:canonicalSimulations.size,missingWorkbookCount:report.warnings.filter(item=>item.code==="missing-workbook").length};
const outputs={"prototypes.json":{prototypes},...packageOutputs,"simulations.json":{sourceWorksheets:[...new Set(report.workbooks.map(item=>item.file))],units:energyUnits,records:[...canonicalSimulations.values()]},"conversion-report.json":report};
for(const [name,data] of Object.entries(outputs))await fs.writeFile(path.join(outputDir,name),`${JSON.stringify(data,null,2)}\n`);
console.log(`Energy conversion completed: ${report.stats.availablePrototypeCount}/${configs.length} archetypes, ${report.stats.simulationCount} simulations, ${report.stats.packageStepCount} package steps.`);
console.log(`Validation: ${report.errors.length} errors, ${report.warnings.length} warnings.`);
for(const issue of report.errors)console.error(`[${issue.code}] ${issue.archetypeId?`${issue.archetypeId}: `:""}${issue.message}${issue.worksheet?` (${issue.worksheet}${issue.cell?`!${issue.cell}`:""})`:""}`);
for(const issue of report.warnings)console.warn(`[${issue.code}] ${issue.archetypeId?`${issue.archetypeId}: `:""}${issue.message}${issue.worksheet?` (${issue.worksheet}${issue.cell?`!${issue.cell}`:""})`:""}`);
if(report.errors.length)process.exitCode=1;
