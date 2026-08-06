import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import "../analytics.css";
import { useLanguage } from "../i18n";

const metrics = {
  pm25: { label: "PM2.5", unit: "µg/m³", summary: "pm25Average" },
  pm10: { label: "PM10", unit: "µg/m³", summary: "pm10Average" },
  no2: { label: "NO₂", unit: "ppb", summary: "no2Average" },
};

function formatValue(value, decimals = 1) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) return "—";
  return Number(value).toLocaleString(undefined, {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  });
}

function sourceNumber(name) {
  return Number(name.match(/^\s*(\d+)/)?.[1] || Number.MAX_SAFE_INTEGER);
}

function pm25Level(value) {
  if (value === null || value === undefined) return { label: "No data", tone: "muted" };
  if (value <= 9) return { label: "Good", tone: "good" };
  if (value <= 35.4) return { label: "Moderate", tone: "moderate" };
  return { label: "Elevated", tone: "elevated" };
}

function AnimatedNumber({ value, decimals = 1, suffix = "", duration = 900 }) {
  const numericValue = Number(value);
  const valid = value !== null && value !== undefined && Number.isFinite(numericValue);
  const previous = useRef(0);
  const [display, setDisplay] = useState(valid ? previous.current : null);

  useEffect(() => {
    if (!valid) {
      setDisplay(null);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      previous.current = numericValue;
      setDisplay(numericValue);
      return;
    }
    const startValue = previous.current;
    const difference = numericValue - startValue;
    const startedAt = performance.now();
    let frame;
    const tick = (now) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(startValue + difference * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
      else previous.current = numericValue;
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [numericValue, valid, duration]);

  return <span className="animated-number" aria-label={valid ? `${formatValue(numericValue, decimals)}${suffix}` : "No data"}>
    {display === null ? "—" : formatValue(display, decimals)}{suffix}
  </span>;
}

function ClaritySensorMap({ sources }) {
  const mapElement = useRef(null);
  const mappableSources = useMemo(
    () => sources.filter((source) => Number.isFinite(source.latitude) && Number.isFinite(source.longitude)),
    [sources],
  );

  useEffect(() => {
    if (!mapElement.current) return undefined;
    let map;
    let cancelled = false;
    import("leaflet").then((module) => {
      if (cancelled || !mapElement.current) return;
      const L = module.default || module;
      map = L.map(mapElement.current, { zoomControl: true, scrollWheelZoom: false, preferCanvas: true })
        .setView([47.53, -122.32], 12);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);
      const bounds = [];
      mappableSources.forEach((source) => {
        const value = source.metrics.pm25?.value;
        const level = pm25Level(value);
        const color = level.tone === "good" ? "#2f8d70" : level.tone === "moderate" ? "#b18a18" : level.tone === "elevated" ? "#c65334" : "#77807d";
        const location = [source.latitude, source.longitude];
        bounds.push(location);
        const popup = document.createElement("div");
        popup.className = "air-map-popup";
        const title = document.createElement("strong");
        title.textContent = source.name.split("(")[0].trim();
        const reading = document.createElement("span");
        reading.textContent = value === null || value === undefined ? "No recent PM2.5 data" : `${formatValue(value)} µg/m³ PM2.5`;
        const status = document.createElement("small");
        status.textContent = level.label;
        popup.append(title, reading, status);
        const label = document.createElement("span");
        label.className = "air-map-marker-label";
        label.textContent = `${source.name.split("(")[0].trim()} · ${value === null || value === undefined ? "—" : formatValue(value)}`;
        L.circleMarker(location, {
          radius: 18,
          stroke: false,
          fillColor: color,
          fillOpacity: .2,
          interactive: false,
        }).addTo(map);
        L.circleMarker(location, {
          radius: 11,
          color: "#ffffff",
          weight: 2,
          fillColor: color,
          fillOpacity: .94,
        }).bindPopup(popup)
          .bindTooltip(label, { permanent: true, direction: "top", offset: [0, -12], className: "air-map-sensor-tooltip" })
          .addTo(map);
      });
      if (bounds.length) map.fitBounds(bounds, { padding: [55, 55], maxZoom: 14 });
    });
    return () => {
      cancelled = true;
      if (map) map.remove();
    };
  }, [mappableSources]);

  return <div className="clarity-sensor-map" ref={mapElement} aria-label={`Interactive map of ${mappableSources.length} Clarity monitoring locations`}/>;
}

export default function Analytics() {
  const {language,t}=useLanguage();
  const [state, setState] = useState({ loading: true, data: null, error: null });
  const [metric, setMetric] = useState("pm25");

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const response = await fetch("/api/clarity");
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.detail || payload.error || "Unable to load air-quality data.");
      setState({ loading: false, data: payload, error: null });
    } catch (error) {
      setState({ loading: false, data: null, error: error.message });
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const sources = useMemo(
    () => [...(state.data?.sources || [])].sort((a, b) => sourceNumber(a.name) - sourceNumber(b.name)),
    [state.data],
  );
  const rankedSources = useMemo(
    () => sources
      .filter((source) => source.metrics[metric]?.value !== null && source.metrics[metric]?.value !== undefined)
      .sort((a, b) => b.metrics[metric].value - a.metrics[metric].value),
    [sources, metric],
  );
  const summary = state.data?.summary || {};
  const selectedMetric = metrics[metric];
  const chartMax = Math.max(1, ...rankedSources.map((source) => Number(source.metrics[metric]?.value) || 0));
  const currentLevel = pm25Level(summary.pm25Average);
  const updated = state.data?.newestMeasurementAt
    ? new Date(state.data.newestMeasurementAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })
    : t("Waiting for data");
  const reportingRate = summary.monitoringLocations
    ? Math.round((summary.reportingLocations / summary.monitoringLocations) * 100)
    : 0;
  const distribution = sources.reduce((result, source) => {
    result[pm25Level(source.metrics.pm25?.value).tone] += 1;
    return result;
  }, { good: 0, moderate: 0, elevated: 0, muted: 0 });

  return (
    <div className={`analytics-page ${state.loading ? "is-syncing" : "is-live"}`}>
      <section className="air-dashboard-header">
        <div className="page-container">
          <div className="air-dashboard-toolbar">
            <div>
              <span className="eyebrow">{t("DAISY monitoring network / South Park")}</span>
              <h1>{t("Latest Available PM2.5 Concentration")}</h1>
            </div>
            <div className="air-dashboard-connection">
              <span className={`analytics-health ${state.error ? "error" : ""}`}><i />{t(state.error ? "Connection error" : state.loading ? "Syncing data" : "Network online")}</span>
              <button type="button" onClick={load} disabled={state.loading}>{t(state.loading ? "Syncing…" : "Refresh data")}</button>
            </div>
          </div>
          <div className="air-dashboard-context">
            <p>{t("Latest available PM2.5 Concentration observations returned by the Clarity API. This is not a continuously updating live feed; successful server responses may be cached for up to 4 hours 45 minutes.")}</p>
            <dl><div><dt>{t("Last updated")}</dt><dd>{updated}</dd></div><div><dt>{t("Reporting")}</dt><dd>{reportingRate}% {language==="es"?"de la red":"of network"}</dd></div></dl>
          </div>
        </div>
      </section>

      <main className="air-dashboard-main">
        <div className="page-container">
          {state.error && <div className="analytics-notice" role="alert"><strong>{t("Live data is unavailable.")}</strong><p>{state.error}</p></div>}

          <section className="air-kpi-grid" aria-busy={state.loading}>
            <article className="air-kpi-primary">
              <div><span>{t("Network average")}</span><b className={`air-status ${currentLevel.tone}`}>{t(currentLevel.label)}</b></div>
              <strong>{state.loading ? "···" : <AnimatedNumber value={summary.pm25Average}/>}</strong>
              <small>µg/m³ PM2.5</small>
              <p>{t("Average of the latest reporting locations.")}</p>
            </article>
            <article><span>Peak reading</span><strong>{state.loading ? "···" : <AnimatedNumber value={summary.pm25Maximum}/>}</strong><small>µg/m³ PM2.5</small><div className="kpi-rule"><i style={{ width: `${Math.min(100, (summary.pm25Maximum || 0) / 55 * 100)}%` }}/></div></article>
            <article><span>Active locations</span><strong>{state.loading ? "···" : <AnimatedNumber value={summary.reportingLocations} decimals={0}/>}</strong><small>of {summary.monitoringLocations ?? "—"} sensors</small><div className="kpi-rule"><i style={{ width: `${reportingRate}%` }}/></div></article>
            <article><span>Sensor conditions</span><strong>{state.loading ? "···" : <AnimatedNumber value={summary.temperatureAverage}/>}</strong><small>°C internal temperature</small><p><AnimatedNumber value={summary.humidityAverage} suffix="%"/> relative humidity</p></article>
          </section>

          <section className="air-map-panel">
            <header>
              <div><span className="eyebrow">DAISY live sensor network</span><h2>Clarity monitoring map</h2></div>
              <div><span><i/> {sources.filter((source) => Number.isFinite(source.latitude) && Number.isFinite(source.longitude)).length} locations mapped</span><a href="https://dashboard.clarity.io/daisy4I1NK/live-data" target="_blank" rel="noreferrer">Compare with Clarity ↗</a></div>
            </header>
            <div className="air-map-frame">
              <ClaritySensorMap sources={sources}/>
              <div className="air-map-legend" aria-label="PM2.5 map legend"><span><i className="good"/>Good</span><span><i className="moderate"/>Moderate</span><span><i className="elevated"/>Elevated</span></div>
            </div>
            <footer><span>Live monitoring locations</span><p>Marker position and latest PM2.5 reading come directly from the Clarity API. Select a marker to inspect its current value and status.</p><a href="https://dashboard.clarity.io/daisy4I1NK/live-data" target="_blank" rel="noreferrer">Open source dashboard ↗</a></footer>
          </section>

          <section className="air-dashboard-grid">
            <article className="air-chart-panel">
              <header>
                <div><span className="eyebrow">Latest network profile</span><h2>Measurements by location</h2></div>
                <div className="metric-tabs" aria-label="Select air-quality metric">
                  {Object.entries(metrics).map(([key, item]) => <button type="button" key={key} className={metric === key ? "active" : ""} aria-pressed={metric === key} onClick={() => setMetric(key)}>{item.label}</button>)}
                </div>
              </header>
              <div className="air-bar-chart" role="img" aria-label={`${selectedMetric.label} readings by monitoring location`}>
                {rankedSources.length ? rankedSources.map((source) => {
                  const value = source.metrics[metric].value;
                  return <div className="air-bar-row" key={source.datasourceId}>
                    <span title={source.name}>{source.name.split("(")[0].trim()}</span>
                    <div><i style={{ width: `${Math.max(2, value / chartMax * 100)}%` }}/></div>
                    <strong><AnimatedNumber value={value}/> <small>{selectedMetric.unit}</small></strong>
                  </div>;
                }) : <p className="air-empty">No recent {selectedMetric.label} measurements.</p>}
              </div>
              <footer><span>Latest available reading per location</span><span>Scale: 0 — {formatValue(chartMax)} {selectedMetric.unit}</span></footer>
            </article>

            <aside className="air-distribution-panel">
              <span className="eyebrow">PM2.5 distribution</span>
              <h2>Network status</h2>
              <div className="air-distribution-total"><strong><AnimatedNumber value={sources.length} decimals={0}/></strong><span>monitored<br/>locations</span></div>
              <div className="air-distribution-list">
                {[
                  ["good", "Good", "0–9 µg/m³"],
                  ["moderate", "Moderate", "9.1–35.4 µg/m³"],
                  ["elevated", "Elevated", ">35.4 µg/m³"],
                  ["muted", "No recent data", "Not reporting"],
                ].map(([tone, label, range]) => <div key={tone}><i className={tone}/><span><strong>{label}</strong><small>{range}</small></span><b><AnimatedNumber value={distribution[tone]} decimals={0}/></b></div>)}
              </div>
              <p>Categories are simplified concentration bands for dashboard communication, not an official AQI calculation.</p>
            </aside>
          </section>

          <section className="air-table-section">
            <header><div><span className="eyebrow">Sensor detail</span><h2>Monitoring locations</h2></div><span>{sources.length} locations</span></header>
            <div className="monitoring-table" role="table" aria-label="Latest Clarity air-quality measurements">
              <div className="monitoring-row monitoring-header" role="row"><span>Location</span><span>Status</span><span>PM2.5</span><span>PM10</span><span>NO₂</span><span>Reading time</span></div>
              {sources.map((source) => {
                const level = pm25Level(source.metrics.pm25?.value);
                return <div className="monitoring-row" role="row" key={source.datasourceId}>
                  <strong>{source.name.split("(")[0].trim()}</strong>
                  <span><b className={`air-status ${level.tone}`}>{level.label}</b></span>
                  <span>{formatValue(source.metrics.pm25?.value)}</span>
                  <span>{formatValue(source.metrics.pm10?.value)}</span>
                  <span>{formatValue(source.metrics.no2?.value)}</span>
                  <time dateTime={source.latestAt || undefined}>{source.latestAt ? new Date(source.latestAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "No recent data"}</time>
                </div>;
              })}
            </div>
          </section>

          <div className="analytics-footnote">
            <p>Values are the latest measurements returned by Clarity Air. Sensor temperature and humidity describe internal device conditions, not calibrated ambient weather.</p>
            <a href="https://dashboard.clarity.io/daisy4I1NK/live-data" target="_blank" rel="noreferrer">Open Clarity Live Data ↗</a>
          </div>
        </div>
      </main>
    </div>
  );
}
