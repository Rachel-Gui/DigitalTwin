import { AIR_QUALITY_DAYS, AIR_QUALITY_ROWS, AIR_QUALITY_SOURCE } from "./airQualityData.ts";
import type { AirRecord, ParticleBox } from "../lib/types.ts";

export { AIR_QUALITY_DAYS, AIR_QUALITY_SOURCE };

export function airRecordAt(index: number): AirRecord {
  const row = AIR_QUALITY_ROWS[Math.max(0, Math.min(index, AIR_QUALITY_ROWS.length - 1))];
  const key = String(row[0]);
  const localTime = `${key.slice(0, 4)}-${key.slice(4, 6)}-${key.slice(6, 8)}T${key.slice(8, 10)}:00:00`;
  const qualityNotes: string[] = [];
  if (row[2] === null || row[3] === null) qualityNotes.push("missing_wind");
  else if (row[3] === 0) qualityNotes.push("zero_wind_unverified");
  return {
    local_time: localTime,
    latitude: AIR_QUALITY_SOURCE.latitude,
    longitude: AIR_QUALITY_SOURCE.longitude,
    pm25_ug_m3: row[1],
    wind_direction_deg: row[2],
    wind_speed_m_s: row[3],
    street_speed_m_s: row[4],
    wind_u: row[5],
    wind_v: row[6],
    quality_flag: qualityNotes.length ? "suspect" : "valid",
    quality_notes: qualityNotes,
  };
}

export function dayForRecord(index: number) {
  return AIR_QUALITY_DAYS.find((day) => index >= day.start && index < day.start + day.count) ?? AIR_QUALITY_DAYS[0];
}

export function recordIndexFor(date: string, hour = 0) {
  const day = AIR_QUALITY_DAYS.find((candidate) => candidate.date === date) ?? AIR_QUALITY_DAYS[0];
  const offset = Array.from({ length: day.count }, (_, index) => index).find((index) => {
    const key = String(AIR_QUALITY_ROWS[day.start + index][0]);
    return Number(key.slice(8, 10)) === hour;
  });
  return day.start + (offset ?? 0);
}

export const DEFAULT_AIR_RECORD_INDEX = recordIndexFor("2025-01-29", 9);

export type ConcordParticleGroup = {
  id: string;
  label: string;
  role: "ambient" | "station";
  pmSeries: readonly number[];
  particleRange: readonly [number, number];
  box: ParticleBox;
  radius: number;
};

const CONCORD_ORIGIN_M = [6059.186222463267, 995.5268058669392, 4361.765752099738] as const;

function concordBox(min: readonly [number, number, number], max: readonly [number, number, number]): ParticleBox {
  return {
    min: [min[0] - CONCORD_ORIGIN_M[0], min[2] - CONCORD_ORIGIN_M[1], -(max[1] - CONCORD_ORIGIN_M[2])],
    max: [max[0] - CONCORD_ORIGIN_M[0], max[2] - CONCORD_ORIGIN_M[1], -(min[1] - CONCORD_ORIGIN_M[2])],
  };
}

export const CONCORD_PM_SERIES = [
  [21.64,18.25,18.61,18.03,20,26.61,27.11,29.75,29.14,22.06,20.56,15.36,10.75,9.33,4.75,3.36,3.61,14.06,14.06,6.53,9.03,8.39,9.92,13.81],
  [9.79,9.54,11.99,12.88,14.64,15.09,14.72,16.3,18.37,18.98,16.49,16.88,17.95,21.32,20.52,20.68,19.31,20.03,21.87,23.05,17.16,12.94,10.63,10.67],
  [13.51,11.98,15.39,17.64,17.35,17.44,16.09,19.39,22.42,20.48,18.58,20.65,21.15,23.99,23.45,24.84,21.04,23.77,24.31,25.38,19.41,15.92,13.22,13.73],
  [10.44,9.29,12.02,12.13,12.6,12.75,13.38,13.49,14.22,11.85,12.39,14.16,20.09,20.82,24.19,24.16,20.49,19.93,23.67,19.55,18.3,12.56,12.39,13.14],
  [8.91,9.81,9.37,9.48,10.9,10.48,10.84,14,12.84,12.01,13.15,13.05,14.93,17.88,18.36,16.19,16.52,16.46,18.8,18.57,15.3,12.43,9.99,10.35],
  [10.44,9.29,12.02,12.13,12.6,12.75,13.38,13.49,14.22,11.85,12.39,14.16,20.09,20.82,24.19,24.16,20.49,19.93,23.67,19.55,18.3,12.56,12.39,13.14],
] as const;

// Exact PHI EarthDay.gh regions and profiles. Particle counts are intentionally
// calculated at runtime from the PM series instead of stored as a copied table.
export const CONCORD_PARTICLE_GROUPS: readonly ConcordParticleGroup[] = [
  {
    id: "ambient",
    label: "Neighborhood air",
    role: "ambient",
    pmSeries: CONCORD_PM_SERIES[0],
    particleRange: [100, 10000],
    box: concordBox([5955.742447700501,4280.815566114224,995.0130116201437], [6195.22434082031,4454.763745893274,1019.0130116201437]),
    radius: 0.3,
  },
  {
    id: "station-1", label: "Station 1", role: "station", pmSeries: CONCORD_PM_SERIES[1], particleRange: [100, 2000],
    box: concordBox([6059.555447723857,4359.618853699755,995.9798159891106], [6062.235334890853,4360.835820704271,996.9798159891106]),
    radius: 0.01,
  },
  {
    id: "station-2", label: "Station 2", role: "station", pmSeries: CONCORD_PM_SERIES[2], particleRange: [100, 2000],
    box: concordBox([6058.138858537628,4359.617838233136,995.9798159891106], [6059.599959150371,4360.978022662015,996.9798159891106]),
    radius: 0.01,
  },
  {
    id: "station-3", label: "Station 3", role: "station", pmSeries: CONCORD_PM_SERIES[3], particleRange: [100, 2000],
    box: concordBox([6058.138858537628,4360.781562446862,995.9798159891106], [6060.157453395904,4362.172066580988,996.9798159891106]),
    radius: 0.01,
  },
  {
    id: "station-4", label: "Station 4", role: "station", pmSeries: CONCORD_PM_SERIES[4], particleRange: [100, 2000],
    box: concordBox([6060.154036703827,4359.620774747853,995.9798159891106], [6062.235334890853,4363.033544039639,996.9798159891106]),
    radius: 0.01,
  },
  {
    id: "station-5", label: "Station 5", role: "station", pmSeries: CONCORD_PM_SERIES[5], particleRange: [100, 2000],
    box: concordBox([6058.138858537628,4361.535583159573,995.9798159891106], [6060.427209061281,4365.011838233135,996.9798159891106]),
    radius: 0.01,
  },
] as const;

export function concordPmAt(hour: number) {
  const values = CONCORD_PM_SERIES.slice(1).map((series) => series[hour % 24]);
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export const SOUTH_PARK_SEEDS = [
  [-19.96, 0.2, 270.77], [-19.65, 0.2, 460.65], [-105.56, 0, 841.45],
  [-380.38, 0.2, 949.37], [582.17, 0.2, 455.05],
] as const;
