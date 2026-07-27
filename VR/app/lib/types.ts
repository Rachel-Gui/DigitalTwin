export type AirRecord = {
  local_time: string;
  latitude: number;
  longitude: number;
  pm25_ug_m3: number;
  wind_speed_m_s: number | null;
  wind_direction_deg: number | null;
  street_speed_m_s: number;
  wind_u: number;
  wind_v: number;
  quality_flag: "valid" | "suspect" | "missing";
  quality_notes: string[];
};

export type SceneId = "concord" | "south-park";

export type ParticleBox = {
  min: readonly [number, number, number];
  max: readonly [number, number, number];
};

export type ConcordPopulateConfig = {
  kind: "concord-populate";
  color: number;
  randomSeed: number;
  groups: readonly {
    id: string;
    label: string;
    role: "ambient" | "station";
    pmSeries: readonly number[];
    particleRange: readonly [number, number];
    box: ParticleBox;
    radius: number;
  }[];
};

export type SouthParkWindConfig = {
  kind: "south-park-wind";
  boundary: {
    role: "particle-boundary";
    assetUrl: string;
    polygonsXZ: readonly (readonly (readonly [number, number])[])[];
    minY: number;
    maxY: number;
    toleranceM: number;
  };
  seeds: readonly (readonly [number, number, number])[];
  windSpeedMultiplier: number;
  integrationDt: number;
  motion: {
    simulationHz: number;
    substepsPerGrasshopperStep: number;
    sourceSpreadM: number;
    warmupSteps: number;
  };
  cloudDisplay: { sizePx: number; opacity: number };
};

export type ParticleConfig = ConcordPopulateConfig | SouthParkWindConfig;

export type SceneConfig = {
  id: SceneId;
  label: string;
  manifestUrl: string;
  caption: string;
  detail: string;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  xrStart: [number, number, number];
  maxDistance: number;
  groundY: number;
  fogDensity: number;
  coordinateSystem: {
    rhinoOrigin: [number, number, number];
    sourceUnits: string;
    metersPerSourceUnit: number;
    axisTransform: string;
  };
  particles: ParticleConfig;
};

export type TourChapter = {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  sceneId: SceneId;
  startHour: number;
  transcript: string;
};

export type NarrationStatus = "off" | "playing" | "paused";
