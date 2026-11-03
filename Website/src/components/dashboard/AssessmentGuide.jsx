import { useState } from "react";
import { useLanguage } from "../../i18n";
import { legendScales } from "./legendScales";
import "./assessment-guide.css";

const copy = {
  energy: {
    takeaway: ["Compare annual energy use per square foot, rather than total building size.", "Compara el consumo anual por pie cuadrado, en lugar del tamaño total del edificio."],
    meaning: ["EUI is a building’s annual energy use divided by its floor area. A higher EUI means more energy used per square foot; it does not by itself explain why.", "El EUI es el consumo anual de energía dividido por la superficie del edificio. Un EUI mayor indica más energía por pie cuadrado; por sí solo no explica la causa."],
    fields: [
      [["Baseline EUI", "EUI de referencia"], ["Annual modeled energy per unit of floor area, in kBtu/ft²·yr. Compare buildings with similar uses.", "Energía anual modelada por unidad de superficie, en kBtu/ft²·año. Compara edificios con usos similares."]],
      [["Building type", "Tipo de edificio"], ["Residential archetype assigned to the building, such as single-family, duplex, quadplex, or apartment. It is a model category.", "Arquetipo residencial asignado al edificio: vivienda unifamiliar, dúplex, cuádruplex o apartamento. Es una categoría del modelo."]],
      [["Heating source", "Fuente de calefacción"], ["Recorded heating fuel or system. Missing information means unavailable, not no heating.", "Combustible o sistema de calefacción registrado. Un dato ausente significa no disponible, no ausencia de calefacción."]],
      [["Year built", "Año de construcción"], ["Recorded construction year, shown as a year rather than a decimal measurement.", "Año de construcción registrado, mostrado como año y no como una medición decimal."]]
    ],
    limitation: ["Energy values are modeled estimates rather than utility bills. Buildings with shared archetypes and model inputs may have matching EUI values.", "Los valores energéticos son estimaciones modeladas, no facturas. Los edificios con arquetipos y entradas compartidos pueden tener el mismo EUI."]
  },
  retrofit: {
    takeaway: ["Explore where modeled interventions may reduce building energy use.", "Explora dónde las intervenciones modeladas podrían reducir el consumo energético."],
    meaning: ["The map shows opportunity tiers from 1 (lowest) to 5 (highest). A tier is a relative priority label, not a percentage of energy saved.", "El mapa muestra niveles de oportunidad de 1 (menor) a 5 (mayor). El nivel indica prioridad relativa, no un porcentaje de ahorro energético."],
    fields: [
      [["Opportunity tier", "Nivel de oportunidad"], ["A relative ranking of modeled retrofit opportunity: Tier 1 is lowest and Tier 5 is highest. The tier is separate from the energy-savings percentage.", "Clasificación relativa de la oportunidad modelada de rehabilitación: el nivel 1 es el menor y el 5 el mayor. El nivel es distinto del porcentaje de ahorro energético."]],
      [["Envelope upgrade", "Mejora de envolvente"], ["Measures affecting the building’s exterior, such as insulation or windows. The popup reports the modeled savings for this scenario.", "Medidas sobre el exterior, como aislamiento o ventanas. La ventana muestra los ahorros modelados de este escenario."]],
      [["Electrification", "Electrificación"], ["A scenario that replaces fuel-based equipment with electric systems. Read its savings against the model’s baseline.", "Escenario que sustituye equipos de combustibles por sistemas eléctricos. Compara sus ahorros con la referencia del modelo."]],
      [["Deep retrofit", "Rehabilitación profunda"], ["A broader intervention scenario for improving building energy performance. Its savings are compared with the same modeled baseline.", "Escenario de intervención más amplio para mejorar el rendimiento energético. Sus ahorros se comparan con la misma referencia modelada."]],
      [["Savings (%)", "Ahorro (%)"], ["Reduction in scenario EUI compared with baseline EUI. For example, 20% means one fifth less modeled energy per floor area. This does not directly report bill or emissions savings.", "Reducción del EUI del escenario respecto al EUI de referencia. Por ejemplo, un 20% significa una quinta parte menos de energía modelada por superficie. No indica directamente ahorro de factura o emisiones."]]
    ],
    limitation: ["Savings describe modeled energy reductions relative to baseline conditions. They do not directly represent utility-bill or emissions savings.", "Los ahorros describen reducciones de energía modeladas respecto a la referencia. No representan directamente ahorros de factura ni de emisiones."]
  },
  renewable: {
    takeaway: ["Read estimated annual PV electricity output and the assumptions behind it.", "Consulta la producción eléctrica FV anual estimada y sus supuestos."],
    meaning: ["The map colors show solar energy reaching roofs. Estimated PV generation is the smaller amount converted into electricity under the model’s assumptions.", "Los colores muestran la energía solar que llega a las cubiertas. La generación FV estimada es la cantidad menor convertida en electricidad según los supuestos del modelo."],
    fields: [
      [["Roof solar potential · MWh/year", "Potencial solar de cubierta · MWh/año"], ["Total annual solar energy incident on the roof, before conversion to electricity. The source field is in kWh; the popup divides by 1,000.", "Energía solar anual que incide sobre la cubierta, antes de convertirse en electricidad. El campo de origen está en kWh; la ventana divide entre 1.000."]],
      [["Roof irradiation · kWh/m²/year", "Irradiación de cubierta · kWh/m²/año"], ["Annual solar energy per square meter of roof. This helps compare solar exposure independently of roof size.", "Energía solar anual por metro cuadrado de cubierta. Permite comparar la exposición sin depender del tamaño de la cubierta."]],
      [["Estimated PV generation · MWh/year", "Generación FV estimada · MWh/año"], ["Estimated annual electricity output, using 70% usable roof area × 20% module efficiency × 85% system performance.", "Electricidad anual estimada: 70% de cubierta utilizable × 20% de eficiencia del módulo × 85% de rendimiento del sistema."]]
    ],
    limitation: ["Annual electricity equivalence does not guarantee hourly supply, financial savings, or coverage of a building’s demand. Demand coverage requires matching annual electricity-use data.", "La equivalencia anual no garantiza suministro horario, ahorro económico ni cobertura de la demanda. La cobertura requiere datos compatibles de consumo eléctrico anual."]
  }
};
const choose = (value, language) => value[language === "es" ? 1 : 0];
export function AssessmentTakeaway({ mode }) {
  const { language } = useLanguage();
  return <p className="assessment-takeaway">{choose(copy[mode].takeaway, language)}</p>;
}
export function AssessmentLegend({ mode }) {
  const { language } = useLanguage();
  const es = language === "es";
  const scale = legendScales[mode];
  const first = scale.stops[0].value, last = scale.stops.at(-1).value;
  const gradient = `linear-gradient(to right, ${scale.stops.map(s => `${s.color} ${(s.value-first)/(last-first)*100}%`).join(", ")})`;
  const number = n => n.toLocaleString(es ? "es-ES" : "en-US", { maximumFractionDigits: 2 });
  return <section className="assessment-legend" aria-label={es ? "Leyenda del mapa" : "Map legend"}>
    <h3>{es ? "Leyenda del mapa" : "Map legend"}</h3>
    <p>{es ? "Escala continua publicada" : "Published continuous scale"}</p>
    <div className="assessment-color-bar" style={{ background: gradient }} />
    <div className="assessment-color-labels"><span>≤ {number(first)}</span><span>{number(scale.stops[2].value)}</span><span>≥ {number(last)}</span></div>
    <small>{mode === "energy" ? "kBtu/ft²·yr" : mode === "renewable" ? (es ? "kWh/año · recurso solar" : "kWh/year · solar resource") : (es ? "Nivel de oportunidad · 1–5" : "Opportunity tier · 1–5")}</small>
    <p>{mode === "renewable" ? (es ? "Claro → oscuro: mayor recurso solar." : "Light → dark: more solar resource.") : (es ? "Oscuro → claro: valores más altos." : "Dark → light: higher values.")}</p>
    <small>{es ? "Colores verificados el 3 nov. 2026. Los edificios de contexto no están clasificados en esta escala." : "Colors checked Nov 3, 2026. Context buildings are not classified on this scale."}</small>
  </section>;
}
export function AssessmentSteps() {
  const { language } = useLanguage();
  const es = language === "es";
  return <section className="assessment-steps"><h3>{es ? "Empieza aquí" : "Start here"}</h3><ol>
    <li>{es ? "Elige un módulo y consulta su leyenda." : "Choose a module and read its legend."}</li>
    <li>{es ? "Acerca la vista y selecciona un edificio para consultar sus valores." : "Zoom in and select a building to read its values."}</li>
    <li>{es ? "Consulta las definiciones y supuestos en Datos y métodos." : "Use Data & methods for definitions and assumptions."}</li>
  </ol></section>;
}
export default function AssessmentDefinitions({ mode }) {
  const { language } = useLanguage();
  const es = language === "es";
  const content = copy[mode];
  const fields = mode === "renewable" ? [content.fields[2], content.fields[0], content.fields[1]] : content.fields;
  return <>
    <p className="assessment-meaning">{choose(content.meaning, language)}</p>
    <section className="assessment-definitions"><h3>{es ? "Qué significan los indicadores" : "What the indicators mean"}</h3>{fields.map(([title, description]) => <details key={title[0]} open={mode === "renewable" && title[0].startsWith("Estimated PV") ? true : undefined}><summary>{choose(title, language)}<span aria-hidden="true">+</span></summary><p>{choose(description, language)}</p></details>)}</section>
    <p className="assessment-limitation">{choose(content.limitation, language)}</p>
    {mode === "renewable" && <SolarEquivalence />}
  </>;
}
export function solarEquivalence(pvMWh, annualKWh) {
  if (pvMWh === "" || annualKWh === "") return null;
  const pv = Number(pvMWh), annual = Number(annualKWh);
  return Number.isFinite(pv) && pv >= 0 && Number.isFinite(annual) && annual > 0 ? pv * 1000 / annual : null;
}
function SolarEquivalence() {
  const { language } = useLanguage();
  const es = language === "es";
  const [pv, setPv] = useState("");
  const [annual, setAnnual] = useState("10791");
  const homes = solarEquivalence(pv, annual);
  return <details className="solar-equivalence">
    <summary>{es ? "Referencia opcional: electricidad de hogares" : "Optional reference: household electricity"}</summary>
    <div className="solar-equivalence-content">
    <p>{es ? "Solo como referencia de escala. No mide la cobertura de la demanda de este edificio. Utiliza la generación FV estimada, no el recurso solar de la cubierta." : "For a sense of scale only. This does not measure this building’s demand coverage. Use estimated PV generation, not roof solar resource."}</p>
    <p>{es ? "Copia la generación FV estimada de la ventana del edificio. Este cálculo usa el valor que introduces; no se actualiza al seleccionar un edificio." : "Copy Estimated PV Generation from the building popup. This calculation uses your entered value; selecting a building does not update it."}</p>
    <label htmlFor="solar-pv-input">{es ? "Generación FV · MWh/año" : "PV generation · MWh/year"}</label>
    <input id="solar-pv-input" placeholder={es ? "Introduce la generación FV" : "Enter popup PV generation"} type="number" min="0" step="any" value={pv} onChange={e => setPv(e.target.value)} />
    <p className="solar-equivalence-result" aria-live="polite">{homes === null ? (es ? "Introduce la generación FV para comparar los totales anuales." : "Enter PV generation to compare annual totals.") : (es ? `Equivalente anual aproximado: electricidad de ${homes.toLocaleString("es-ES", { maximumFractionDigits: 1 })} hogares de referencia durante un año.` : `Approximate annual-total equivalent: ${homes.toLocaleString("en-US", { maximumFractionDigits: 1 })} reference households’ electricity over one year.`)}</p>
    <p>{es ? "Esta comparación de totales anuales no indica cuántos hogares pueden recibir suministro continuo. La producción varía según la hora y la estación." : "This annual-total comparison does not show how many homes could receive a continuous supply. Output varies by time of day and season."}</p>
    <details><summary>{es ? "Referencia y cálculo" : "Reference & calculation"}</summary>
      <label htmlFor="solar-annual-input">{es ? "Electricidad de referencia · kWh/hogar/año" : "Reference electricity · kWh/home/year"}</label><input id="solar-annual-input" type="number" min="1" step="any" value={annual} onChange={e => setAnnual(e.target.value)} />
      <p>{es ? "Generación FV × 1.000 ÷ electricidad anual de referencia. Referencia inicial: compras medias anuales por cliente residencial de EE. UU., EIA 2022, 10.791 kWh. No es una media de Seattle ni el consumo de este edificio." : "PV generation × 1,000 ÷ annual reference electricity. Starting reference: EIA 2022 U.S. average residential customer purchases, 10,791 kWh/year. This is not a Seattle average or this building’s electricity use."}</p>
      <a href="https://www.eia.gov/tools/faqs/faq.php?id=97&t=7" target="_blank" rel="noopener noreferrer">{es ? "Ver fuente EIA" : "View EIA source"} ↗</a>
    </details>
    {homes === null && pv !== "" && <p role="status">{es ? "Introduce una generación no negativa y una referencia mayor que cero." : "Enter nonnegative generation and a reference greater than zero."}</p>}
    </div>
  </details>;
}
