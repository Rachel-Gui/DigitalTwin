const BASE_URL = "https://clarity-data-api.clarity.io";
const CACHE_MS = 4.75 * 60 * 60 * 1000;

const METRICS = {
  pm1: "pm1ConcMassIndividual",
  pm25: "pm2_5ConcMassIndividual",
  pm10: "pm10ConcMassIndividual",
  no2: "no2ConcIndividual",
  temperature: "temperatureInternalIndividual",
  humidity: "relHumidInternalIndividual",
};

let cache;

function numberOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function average(values) {
  const valid = values.filter((value) => value !== null);
  return valid.length
    ? valid.reduce((total, value) => total + value, 0) / valid.length
    : null;
}

function max(values) {
  const valid = values.filter((value) => value !== null);
  return valid.length ? Math.max(...valid) : null;
}

function buildSnapshot(datasourcePayload, measurementPayload) {
  const byDatasource = new Map();
  const locationsByDatasource = new Map();

  for (const location of measurementPayload.locations || []) {
    const existing = locationsByDatasource.get(location.datasourceId);
    const existingChangedAt = existing?.changedAt ? new Date(existing.changedAt).getTime() : 0;
    const nextChangedAt = location.changedAt ? new Date(location.changedAt).getTime() : 0;
    if (!existing || nextChangedAt >= existingChangedAt) {
      locationsByDatasource.set(location.datasourceId, {
        latitude: numberOrNull(location.lat),
        longitude: numberOrNull(location.lon),
        changedAt: location.changedAt || null,
      });
    }
  }

  for (const measurement of measurementPayload.data || []) {
    const key = Object.entries(METRICS).find(([, metric]) => metric === measurement.metric)?.[0];
    if (!key) continue;
    const existing = byDatasource.get(measurement.datasourceId) || {
      latestAt: null,
      latitude: null,
      longitude: null,
      metrics: {},
    };
    const previous = existing.metrics[key];
    if (!previous || new Date(measurement.time) > new Date(previous.time)) {
      existing.metrics[key] = {
        value: numberOrNull(measurement.value ?? measurement.raw),
        time: measurement.time,
        status: measurement.status || null,
        qcAssessment: measurement.qcAssessment || null,
        qcFlags: measurement.qcFlags || [],
      };
    }
    if (!existing.latestAt || new Date(measurement.time) > new Date(existing.latestAt)) {
      existing.latestAt = measurement.time;
    }
    byDatasource.set(measurement.datasourceId, existing);
  }

  const sources = (datasourcePayload.datasources || []).map((datasource) => {
    const measurements = byDatasource.get(datasource.datasourceId) || {
      latestAt: null,
      metrics: {},
    };
    const location = locationsByDatasource.get(datasource.datasourceId);
    return {
      datasourceId: datasource.datasourceId,
      sourceId: datasource.currentSourceId,
      sourceType: datasource.sourceType,
      name: datasource.orgAnnotations?.name || datasource.datasourceId,
      group: datasource.orgAnnotations?.group || null,
      latestAt: measurements.latestAt,
      latitude: location?.latitude ?? null,
      longitude: location?.longitude ?? null,
      metrics: measurements.metrics,
    };
  });

  const values = (metric) => sources.map((source) => source.metrics[metric]?.value ?? null);
  const newestMeasurementAt = sources
    .map((source) => source.latestAt)
    .filter(Boolean)
    .sort()
    .at(-1) || null;

  return {
    period: "Latest minute measurements",
    fetchedAt: new Date().toISOString(),
    newestMeasurementAt,
    summary: {
      monitoringLocations: sources.length,
      reportingLocations: sources.filter((source) => source.latestAt).length,
      pm25Average: average(values("pm25")),
      pm25Maximum: max(values("pm25")),
      pm10Average: average(values("pm10")),
      no2Average: average(values("no2")),
      temperatureAverage: average(values("temperature")),
      humidityAverage: average(values("humidity")),
    },
    sources,
  };
}

export class ClarityConfigurationError extends Error {}

export async function getClarityData({ apiKey, org = "daisy4I1NK" } = {}) {
  if (!apiKey) {
    throw new ClarityConfigurationError(
      "CLARITY_API_KEY is not configured on the server.",
    );
  }

  if (cache && Date.now() - cache.createdAt < CACHE_MS) {
    return { ...cache.payload, cache: "hit" };
  }

  const headers = {
    Accept: "application/json",
    "Accept-Encoding": "gzip",
    "Content-Type": "application/json",
    "x-api-key": apiKey,
  };
  const datasourceResponse = await fetch(
    `${BASE_URL}/v2/datasources?org=${encodeURIComponent(org)}`,
    { headers },
  );
  if (!datasourceResponse.ok) {
    const error = new Error(`Clarity Air datasource request returned HTTP ${datasourceResponse.status}.`);
    error.status = datasourceResponse.status;
    throw error;
  }

  const measurementResponse = await fetch(
    `${BASE_URL}/v2/recent-datasource-measurements-query`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        org,
        allDatasources: true,
        outputFrequency: "minute",
        qcAssessment: true,
        qcFlags: true,
      }),
    },
  );
  if (!measurementResponse.ok) {
    const error = new Error(`Clarity Air measurement request returned HTTP ${measurementResponse.status}.`);
    error.status = measurementResponse.status;
    throw error;
  }

  const payload = buildSnapshot(
    await datasourceResponse.json(),
    await measurementResponse.json(),
  );
  cache = { createdAt: Date.now(), payload };
  return { ...payload, cache: "miss" };
}
