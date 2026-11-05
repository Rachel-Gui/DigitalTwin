// Match the sources displayed by Dashboard / Air / ClaritySensorMap.
export function locatedSources(payload) {
  return [...(payload?.sources || [])]
    .filter(source => Number.isFinite(source.latitude) && Number.isFinite(source.longitude))
    .sort((a,b) => sourceNumber(a.name) - sourceNumber(b.name));
}
function sourceNumber(name) { return Number(String(name ?? '').match(/^\s*(\d+)/)?.[1] || Number.MAX_SAFE_INTEGER); }
export function sensorName(source) { return 'DAISY · ' + String(source.name || source.datasourceId).split('(')[0].trim(); }
export function formatValue(value) {
  if (value === null || value === undefined || value === '' || !Number.isFinite(Number(value))) return '—';
  return Number(value).toLocaleString(undefined,{minimumFractionDigits:1,maximumFractionDigits:1});
}
export function observationTime(value) {
  if (!value || !Number.isFinite(new Date(value).getTime())) return 'Not available';
  return new Intl.DateTimeFormat('en-US',{timeZone:'America/Los_Angeles',month:'short',day:'numeric',hour:'numeric',minute:'2-digit',timeZoneName:'short'}).format(new Date(value));
}
