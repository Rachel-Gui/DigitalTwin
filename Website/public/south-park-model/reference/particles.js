import * as THREE from 'three';
import { MAX_PARTICLES, initializeSouthParkParticle, interpolatePosition, makeExtrudedPolygonBoundary, particleRgb, stepSouthParkRoadParticle, targetParticleCount, windVectorXZ } from './particleModel.js';
function makeSoftParticleTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext("2d");
    if (context) {
        const gradient = context.createRadialGradient(32, 32, 2, 32, 32, 31);
        gradient.addColorStop(0, "rgba(255,255,255,1)");
        gradient.addColorStop(0.48, "rgba(255,255,255,.82)");
        gradient.addColorStop(1, "rgba(255,255,255,0)");
        context.fillStyle = gradient;
        context.fillRect(0, 0, 64, 64);
    }
    return new THREE.CanvasTexture(canvas);
}
function createSouthParkParticles(scene, mount, config, simulationSeed) {
    const geometry = new THREE.BufferGeometry();
    const buffer = new Float32Array(MAX_PARTICLES * 3);
    const attribute = new THREE.BufferAttribute(buffer, 3);
    attribute.setUsage(THREE.DynamicDrawUsage);
    geometry.setAttribute("position", attribute);
    const spriteTexture = makeSoftParticleTexture();
    const material = new THREE.PointsMaterial({
        color: 0x78c8ff,
        map: spriteTexture,
        size: config.cloudDisplay.sizePx,
        sizeAttenuation: false,
        transparent: true,
        opacity: config.cloudDisplay.opacity,
        depthWrite: false,
    });
    const points = new THREE.Points(geometry, material);
    points.frustumCulled = false;
    points.userData.referenceHistoricalParticles = true;
    scene.add(points);
    const states = [];
    const previousPositions = [];
    const random = makeRandom(simulationSeed);
    const inside = makeExtrudedPolygonBoundary(config.boundary.polygonsXZ, config.boundary.minY, config.boundary.maxY, config.boundary.toleranceM);
    const simulationStepMs = 1000 / config.motion.simulationHz;
    const simulationDt = config.integrationDt / config.motion.substepsPerGrasshopperStep;
    let active = 0;
    let lastRecordKey = "";
    let currentRecord = null;
    let currentWindDirection = [0, 0];
    let lastSimulationAt = performance.now();
    let stepCount = 0;
    function initializeParticle(index, record, windDirection) {
        let particle = initializeSouthParkParticle(config.seeds[index % config.seeds.length], windDirection, record.street_speed_m_s, config.windSpeedMultiplier, random);
        for (let attempt = 0; attempt < 10; attempt += 1) {
            const angle = random() * Math.PI * 2;
            const radius = Math.sqrt(random()) * config.motion.sourceSpreadM;
            const candidate = [
                particle.position[0] + Math.cos(angle) * radius,
                particle.position[1],
                particle.position[2] + Math.sin(angle) * radius,
            ];
            if (inside(candidate)) {
                particle = { ...particle, position: candidate };
                break;
            }
        }
        const warmupSteps = Math.floor(random() * (config.motion.warmupSteps + 1));
        for (let step = 0; step < warmupSteps; step += 1) {
            particle = stepSouthParkRoadParticle(particle, windDirection, record.street_speed_m_s, config.windSpeedMultiplier, simulationDt, random, inside);
        }
        return particle;
    }
    function advance(record) {
        if (!record || record.local_time === lastRecordKey)
            return;
        const nextActive = targetParticleCount(record.pm25_ug_m3);
        const windDirection = windVectorXZ(record.wind_u, record.wind_v, record.wind_direction_deg ?? 0);
        for (let index = 0; index < nextActive; index += 1) {
            if (!states[index]) {
                const initial = initializeParticle(index, record, windDirection);
                states[index] = initial;
                previousPositions[index] = [...initial.position];
            }
            else {
                previousPositions[index] = [...states[index].position];
            }
        }
        currentRecord = record;
        currentWindDirection = windDirection;
        active = nextActive;
        geometry.setDrawRange(0, active);
        material.color.setRGB(...particleRgb(record.pm25_ug_m3), THREE.SRGBColorSpace);
        mount.dataset.particleCount = String(active);
        mount.dataset.particlePm25 = record.pm25_ug_m3.toFixed(2);
        mount.dataset.particleMode = config.kind;
        lastRecordKey = record.local_time;
    }
    function simulateStep() {
        if (!currentRecord)
            return;
        for (let index = 0; index < active; index += 1) {
            previousPositions[index] = [...states[index].position];
            states[index] = stepSouthParkRoadParticle(states[index], currentWindDirection, currentRecord.street_speed_m_s, config.windSpeedMultiplier, simulationDt, random, inside);
        }
        mount.dataset.particleStepCount = String(stepCount += 1);
    }
    function render(now, simulate = true) {
        if (!simulate) lastSimulationAt = now;
        let catchUpSteps = 0;
        while (now - lastSimulationAt >= simulationStepMs && catchUpSteps < 4) {
            lastSimulationAt += simulationStepMs;
            simulateStep();
            catchUpSteps += 1;
        }
        if (catchUpSteps === 4 && now - lastSimulationAt >= simulationStepMs)
            lastSimulationAt = now;
        const alpha = Math.max(0, Math.min((now - lastSimulationAt) / simulationStepMs, 1));
        for (let index = 0; index < active; index += 1) {
            const position = interpolatePosition(previousPositions[index], states[index].position, alpha);
            const offset = index * 3;
            buffer[offset] = position[0];
            buffer[offset + 1] = position[1];
            buffer[offset + 2] = position[2];
        }
        attribute.needsUpdate = true;
    }
    return {
        advance,
        render,
        dispose() {
            scene.remove(points);
            geometry.dispose();
            material.dispose();
            spriteTexture.dispose();
        },
    };
}
export { createSouthParkParticles };

function makeRandom(seed) { let state=seed>>>0; return ()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;}; }
