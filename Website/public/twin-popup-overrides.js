/* Presentation-only overrides for the website viewer. No ArcGIS items or data are saved.
 * Keep original model values and published solar conversion expressions unchanged.
 */
async function applyCityTwinPopupFormatting(scene) {
  const layers = scene.allLayers.toArray().filter(layer => layer.visible && (/southpark_stock_energy\/FeatureServer\/0/.test(layer.url || "") || /seattle_footprint_facade_roof_solar_potential\/FeatureServer\/0/.test(layer.url || "")));
  for (const layer of layers) {
    await layer.load();
    if (!layer.popupTemplate) continue;
    const template = layer.popupTemplate.clone();
    const energy = /southpark_stock_energy/.test(layer.url);
    const expressions = [...(template.expressionInfos || [])];
    const replace = {};
    if (energy) {
      expressions.push({ name: "dct_year", title: "Year Built", expression: 'var v = $feature.year_built; if (IsEmpty(v)) { return "Not available"; } return Text(v, "0");', returnType: "string" });
      expressions.push({ name: "dct_heat", title: "Heating Source", expression: 'var v = $feature.heat_source; if (IsEmpty(v)) { return "Not available"; } return v;', returnType: "string" });
      replace.year_built = "expression/dct_year";
      replace.heat_source = "expression/dct_heat";
    }
    const formatFields = fields => (fields || []).map(field => {
      const formatted = field.toJSON ? field.toJSON() : { ...field };
      if (replace[formatted.fieldName]) {
        formatted.fieldName = replace[formatted.fieldName];
        delete formatted.format;
      }
      return formatted;
    });
    template.fieldInfos = formatFields(template.fieldInfos);
    if (Array.isArray(template.content)) {
      template.content = template.content.filter(part => !(energy && part.type === "text" && /Explore Energy Profile/.test(part.text || ""))).map(part => {
        if (part.type !== "fields") return part;
        const updated = part.toJSON ? part.toJSON() : { ...part };
        if (updated.fieldInfos) updated.fieldInfos = formatFields(updated.fieldInfos);
        return updated;
      });
    }
    template.expressionInfos = expressions;
    layer.popupTemplate = template;
  }
}
