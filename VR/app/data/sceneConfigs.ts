import concordManifest from "../../public/runtime-assets/scene-manifest.json";
import southParkManifest from "../../public/runtime-assets/south-park-scene-manifest.json";
import southParkBoundary from "../../public/runtime-assets/boundaries/south-park-road-volume.json";
import { CONCORD_PARTICLE_GROUPS, SOUTH_PARK_SEEDS } from "./experienceData";
import type { SceneConfig, SceneId } from "../lib/types";

type RuntimeManifest = {
  runtime: {
    rhino_origin: number[];
    source_units: string;
    meters_per_source_unit: number;
    axis_transform: string;
    ground_y: number;
    camera_position: number[];
    camera_target: number[];
    xr_start: number[];
    max_distance: number;
    fog_density: number;
  };
};

function tuple3(values: number[]): [number, number, number] {
  if (values.length !== 3) throw new Error("Scene manifest requires a three-number coordinate");
  return [values[0], values[1], values[2]];
}

function runtime(manifest: RuntimeManifest) {
  const value = manifest.runtime;
  return {
    cameraPosition: tuple3(value.camera_position),
    cameraTarget: tuple3(value.camera_target),
    xrStart: tuple3(value.xr_start),
    maxDistance: value.max_distance,
    groundY: value.ground_y,
    fogDensity: value.fog_density,
    coordinateSystem: {
      rhinoOrigin: tuple3(value.rhino_origin),
      sourceUnits: value.source_units,
      metersPerSourceUnit: value.meters_per_source_unit,
      axisTransform: value.axis_transform,
    },
  };
}

export const SCENE_CONFIGS: Record<SceneId, SceneConfig> = {
  concord: {
    id: "concord",
    label: "Concord School",
    manifestUrl: "/runtime-assets/scene-manifest.json",
    caption: "Concord International School",
    detail: "Six-zone PM2.5 Concentration profile",
    ...runtime(concordManifest),
    particles: {
      kind: "concord-populate",
      groups: CONCORD_PARTICLE_GROUPS,
      color: 0x3d3535,
      randomSeed: 1,
    },
  },
  "south-park": {
    id: "south-park",
    label: "South Park",
    manifestUrl: "/runtime-assets/south-park-scene-manifest.json",
    caption: "South Park",
    detail: "Road-network PM2.5 Concentration flow · restored GIS ground",
    ...runtime(southParkManifest),
    particles: {
      kind: "south-park-wind",
      boundary: {
        role: "particle-boundary",
        assetUrl: southParkManifest.particle_boundary.url,
        polygonsXZ: southParkBoundary.polygons_xz as [number, number][][],
        minY: southParkBoundary.min_y,
        maxY: southParkBoundary.max_y,
        toleranceM: 4,
      },
      seeds: SOUTH_PARK_SEEDS,
      windSpeedMultiplier: 10,
      integrationDt: 0.8,
      motion: {
        simulationHz: 8,
        substepsPerGrasshopperStep: 20,
        sourceSpreadM: 12,
        warmupSteps: 24,
      },
      cloudDisplay: { sizePx: 8, opacity: 0.82 },
    },
  },
};
