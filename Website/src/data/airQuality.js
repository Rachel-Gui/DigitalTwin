export function formatAirQualityValue(value, decimals = 1) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) return "—";
  return Number(value).toLocaleString(undefined, {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  });
}

export function pm25Level(value) {
  if (value === null || value === undefined) return { label: "No data", tone: "muted" };
  if (value <= 9) return { label: "Good", tone: "good" };
  if (value <= 35.4) return { label: "Moderate", tone: "moderate" };
  return { label: "Elevated", tone: "elevated" };
}

export function claritySourceNumber(name) {
  return Number(name.match(/^\s*(\d+)/)?.[1] || Number.MAX_SAFE_INTEGER);
}
