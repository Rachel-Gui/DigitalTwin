import { useEffect, useMemo, useRef } from "react";
import "leaflet/dist/leaflet.css";
import { formatAirQualityValue, pm25Level } from "../data/airQuality";

export default function ClaritySensorMap({ sources, onSelect }) {
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
        reading.textContent = value === null || value === undefined ? "No recent PM2.5 data" : `${formatAirQualityValue(value)} µg/m³ PM2.5`;
        const status = document.createElement("small");
        status.textContent = level.label;
        popup.append(title, reading, status);
        const label = document.createElement("span");
        label.className = "air-map-marker-label";
        label.textContent = `${source.name.split("(")[0].trim()} · ${value === null || value === undefined ? "—" : formatAirQualityValue(value)}`;
        L.circleMarker(location, { radius: 18, stroke: false, fillColor: color, fillOpacity: .2, interactive: false }).addTo(map);
        L.circleMarker(location, { radius: 11, color: "#ffffff", weight: 2, fillColor: color, fillOpacity: .94 })
          .bindPopup(popup)
          .bindTooltip(label, { permanent: true, direction: "top", offset: [0, -12], className: "air-map-sensor-tooltip" })
          .on("click", () => onSelect?.(source))
          .addTo(map);
      });
      if (bounds.length) map.fitBounds(bounds, { padding: [55, 55], maxZoom: 14 });
    });
    return () => {
      cancelled = true;
      if (map) map.remove();
    };
  }, [mappableSources, onSelect]);

  return <div className="clarity-sensor-map" ref={mapElement} aria-label={`Interactive map of ${mappableSources.length} Clarity monitoring locations`}/>;
}
