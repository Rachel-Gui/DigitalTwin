"use client";

import { lazy, Suspense, useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import type { AirRecord, NarrationStatus, SceneId } from "../lib/types";
import {
  AIR_QUALITY_DAYS,
  AIR_QUALITY_SOURCE,
  airRecordAt,
  CONCORD_PARTICLE_GROUPS,
  concordPmAt,
  dayForRecord,
  DEFAULT_AIR_RECORD_INDEX,
  recordIndexFor,
} from "../data/experienceData";
import { SCENE_CONFIGS } from "../data/sceneConfigs";
import { chapterAt, chapterHour, TOUR_CHAPTERS, TOUR_DURATION_SECONDS } from "../data/tourData";
import { INITIAL_TOUR_STATE, tourReducer } from "../lib/tourModel";

const SceneCanvas = lazy(() => import("./SceneCanvas").then((module) => ({ default: module.SceneCanvas })));
const VR_BUTTON_HOST_ID = "vr-button-host";

function pmBand(value: number) {
  if (value <= 9) return "LOW";
  if (value <= 15) return "MODERATE";
  return "ELEVATED";
}

const PM25_AQI_BREAKPOINTS = [
  [0, 9, 0, 50],
  [9.1, 35.4, 51, 100],
  [35.5, 55.4, 101, 150],
  [55.5, 125.4, 151, 200],
  [125.5, 225.4, 201, 300],
  [225.5, 325.4, 301, 500],
] as const;

function pm25Aqi(value: number) {
  const concentration = Math.round(Math.max(0, value) * 10) / 10;
  const breakpoint = PM25_AQI_BREAKPOINTS.find(([low, high]) => concentration >= low && concentration <= high);
  if (!breakpoint) return concentration > 325.4 ? 500 : 0;
  const [low, high, lowAqi, highAqi] = breakpoint;
  return Math.round(((highAqi - lowAqi) / (high - low)) * (concentration - low) + lowAqi);
}

function experienceSeed() {
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) return crypto.getRandomValues(new Uint32Array(1))[0];
  return (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
}

export function PhiExperience() {
  const [sceneId, setSceneId] = useState<SceneId>("concord");
  const [southParkRecordIndex, setSouthParkRecordIndex] = useState(DEFAULT_AIR_RECORD_INDEX);
  const [concordHour, setConcordHour] = useState(9);
  const [replayPlaying, setReplayPlaying] = useState(true);
  const [tour, dispatchTour] = useReducer(tourReducer, INITIAL_TOUR_STATE);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const [mobileLayout, setMobileLayout] = useState(false);
  const [, setVrSupported] = useState(false);
  const setSceneStatus = useCallback(() => {}, []);
  const [simulationSeed] = useState(experienceSeed);
  const audioRef = useRef<HTMLAudioElement>(null);
  const guideFollowingRef = useRef(false);
  const onVrSupport = useCallback((supported: boolean) => setVrSupported(supported), []);
  const sceneConfig = SCENE_CONFIGS[sceneId];
  const tourStarted = tour.started;
  const guideFollowing = tour.following;
  const audioPlaying = tour.playing;
  const audioTime = tour.time;
  const narrationStatus: NarrationStatus = audioPlaying ? "playing" : tourStarted ? "paused" : "off";

  const southParkRecord = useMemo(() => airRecordAt(southParkRecordIndex), [southParkRecordIndex]);
  const southParkHour = Number(southParkRecord.local_time.slice(11, 13));
  const hour = sceneId === "concord" ? concordHour : southParkHour;
  const record: AirRecord = useMemo(() => {
    if (sceneId === "south-park") return southParkRecord;
    return {
      ...southParkRecord,
      local_time: `concord-profile-${String(concordHour).padStart(2, "0")}`,
      pm25_ug_m3: concordPmAt(concordHour),
      wind_speed_m_s: null,
      wind_direction_deg: null,
      street_speed_m_s: 0,
      wind_u: 0,
      wind_v: 0,
      quality_flag: "valid",
      quality_notes: [],
    };
  }, [concordHour, sceneId, southParkRecord]);
  const activeDay = dayForRecord(southParkRecordIndex);
  const activeDayOffset = southParkRecordIndex - activeDay.start;
  const concordStations = useMemo(() => CONCORD_PARTICLE_GROUPS
    .filter((group) => group.role === "station")
    .map((group) => ({
      id: group.id,
      label: group.label,
      pm25: group.pmSeries[concordHour % group.pmSeries.length],
    })), [concordHour]);
  const dashboardStats = useMemo(() => {
    const values = sceneId === "concord"
      ? Array.from({ length: 24 }, (_, index) => concordPmAt(index))
      : Array.from({ length: activeDay.count }, (_, index) => airRecordAt(activeDay.start + index).pm25_ug_m3);
    const average = values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1);
    const peak = Math.max(...values);
    const min = Math.min(...values);
    const range = Math.max(peak - min, 0.01);
    const points = values.map((value, index) => {
      const x = values.length === 1 ? 0 : (index / (values.length - 1)) * 240;
      const y = 58 - ((value - min) / range) * 48;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");
    return { average, peak, aqi: pm25Aqi(average), points };
  }, [activeDay.count, activeDay.start, sceneId]);
  const replayProgress = sceneId === "concord"
    ? concordHour / 23
    : activeDayOffset / Math.max(activeDay.count - 1, 1);
  const sunHeight = Math.sin(Math.PI * replayProgress) * 48;

  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);

  useEffect(() => {
    const openSceneFromHash = () => {
      const requestedScene = window.location.hash.slice(1);
      if (requestedScene === "concord" || requestedScene === "south-park") {
        setSceneId(requestedScene);
      }
    };
    openSceneFromHash();
    window.addEventListener("hashchange", openSceneFromHash);
    return () => window.removeEventListener("hashchange", openSceneFromHash);
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 760px)");
    const updateLayout = () => setMobileLayout(query.matches);
    updateLayout();
    query.addEventListener("change", updateLayout);
    return () => query.removeEventListener("change", updateLayout);
  }, []);

  useEffect(() => {
    if (!replayPlaying || guideFollowing) return;
    const timer = window.setInterval(() => {
      if (sceneId === "concord") setConcordHour((value) => (value + 1) % 24);
      else setSouthParkRecordIndex((value) => (value + 1) % AIR_QUALITY_SOURCE.recordCount);
    }, 1800);
    return () => window.clearInterval(timer);
  }, [guideFollowing, replayPlaying, sceneId]);

  const setFollowing = useCallback((value: boolean) => {
    guideFollowingRef.current = value;
    dispatchTour({ type: value ? "resume" : "detach" });
  }, []);

  const syncGuide = useCallback((time: number) => {
    const chapter = chapterAt(time);
    const nextHour = chapterHour(chapter, time);
    setSceneId(chapter.sceneId);
    if (chapter.sceneId === "concord") setConcordHour(nextHour);
    else setSouthParkRecordIndex(recordIndexFor("2025-01-29", nextHour));
  }, []);

  const detachGuide = useCallback(() => {
    if (tourStarted) setFollowing(false);
  }, [setFollowing, tourStarted]);

  const startTour = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    dispatchTour({ type: "start" });
    setReplayPlaying(false);
    setFollowing(true);
    syncGuide(0);
    try {
      await audio.play();
    } catch {
      dispatchTour({ type: "pause" });
    }
  };

  const toggleNarration = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!tourStarted) {
      await startTour();
      return;
    }
    if (audio.paused) {
      try { await audio.play(); } catch { dispatchTour({ type: "pause" }); }
    } else audio.pause();
  };

  const restartTour = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    dispatchTour({ type: "restart" });
    setFollowing(true);
    syncGuide(0);
    try { await audio.play(); } catch { dispatchTour({ type: "pause" }); }
  };

  const resumeGuide = () => {
    const time = audioRef.current?.currentTime ?? audioTime;
    setFollowing(true);
    syncGuide(time);
  };

  const jumpToSceneChapter = () => {
    const chapter = TOUR_CHAPTERS.find((candidate) => candidate.sceneId === sceneId) ?? TOUR_CHAPTERS[0];
    if (audioRef.current) audioRef.current.currentTime = chapter.startTime;
    dispatchTour({ type: "time", time: chapter.startTime });
    setFollowing(true);
    syncGuide(chapter.startTime);
  };

  const seekNarration = (time: number) => {
    if (audioRef.current) audioRef.current.currentTime = time;
    dispatchTour({ type: "time", time });
    if (guideFollowingRef.current) syncGuide(time);
  };

  const chooseScene = (next: SceneId) => {
    detachGuide();
    setSceneId(next);
  };

  return (
    <main className="experience-shell">
      <section className="scene-panel">
        <Suspense fallback={<div className="scene-loading">Loading scene</div>}>
          <SceneCanvas
            record={record}
            hour={hour}
            narrationStatus={narrationStatus}
            simulationSeed={simulationSeed}
            vrButtonHostId={VR_BUTTON_HOST_ID}
            onVrSupport={onVrSupport}
            sceneConfig={sceneConfig}
            onSceneStatus={setSceneStatus}
          />
        </Suspense>
        <button className="mobile-panel-launcher" onClick={() => setMobilePanelOpen(true)} aria-expanded={mobilePanelOpen} aria-controls="experience-controls">
          Controls
        </button>
      </section>

      <aside
        id="experience-controls"
        className={`control-panel ${mobilePanelOpen ? "is-open" : ""}`}
        inert={mobileLayout && !mobilePanelOpen}
        aria-hidden={mobileLayout && !mobilePanelOpen}
      >
        <section className="replay-control">
          <div className="sun-time-header">
            <span>TIME</span>
            <strong>{String(hour).padStart(2, "0")}:00</strong>
            <span>{replayPlaying ? "PLAYING" : "PAUSED"}</span>
          </div>
          <div className="sun-dial" aria-label={`Sun position at ${String(hour).padStart(2, "0")}:00`}>
            <div className="sun-arc" />
            <div className="sun-icon" style={{ left: `${replayProgress * 100}%`, bottom: `${sunHeight + 3}px` }}><i /></div>
            <span className="sunrise-label">SUNRISE</span>
            <span className="noon-label">NOON</span>
            <span className="sunset-label">SUNSET</span>
            <input
              className="sun-range"
              type="range"
              min="0"
              max={sceneId === "concord" ? 23 : activeDay.count - 1}
              value={sceneId === "concord" ? concordHour : activeDayOffset}
              onChange={(event) => {
                detachGuide();
                const value = Number(event.target.value);
                if (sceneId === "concord") setConcordHour(value);
                else setSouthParkRecordIndex(activeDay.start + value);
              }}
              aria-label="Set time by moving the sun"
            />
          </div>
          <div className="replay-row">
            <button onClick={() => { detachGuide(); setReplayPlaying((value) => !value); }} aria-label={replayPlaying ? "Pause replay" : "Play replay"}>{replayPlaying ? "Ⅱ" : "▶"}</button>
          </div>
        </section>

        <section className="narration-control">
          {!tourStarted ? (
            <button className="start-tour" onClick={startTour}><span aria-hidden="true">▶</span> Start Guided Tour</button>
          ) : (
            <>
              <div className="audio-buttons">
                <button className="audio-primary" onClick={toggleNarration}><span aria-hidden="true">{audioPlaying ? "Ⅱ" : "▶"}</span>{audioPlaying ? "Pause" : "Play"}</button>
                <button onClick={restartTour}><span aria-hidden="true">↻</span>Restart</button>
                <button onClick={jumpToSceneChapter}><span aria-hidden="true">◇</span>Scene Chapter</button>
              </div>
              <input type="range" min="0" max={TOUR_DURATION_SECONDS} step="0.1" value={audioTime} onChange={(event) => seekNarration(Number(event.target.value))} aria-label="Narration progress" />
              {!guideFollowing && <button className="resume-guide" onClick={resumeGuide}><span aria-hidden="true">◎</span>Resume Guide</button>}
            </>
          )}
          <audio
            ref={audioRef}
            preload="metadata"
            src="/audio/phi-vr-narration.mp3"
            onPlay={() => dispatchTour({ type: "play" })}
            onPause={() => dispatchTour({ type: "pause" })}
            onTimeUpdate={(event) => {
              const time = event.currentTarget.currentTime;
              dispatchTour({ type: "time", time });
              if (guideFollowingRef.current) syncGuide(time);
            }}
            onSeeked={(event) => {
              const time = event.currentTarget.currentTime;
              dispatchTour({ type: "time", time });
              if (guideFollowingRef.current) syncGuide(time);
            }}
            onEnded={() => { guideFollowingRef.current = false; dispatchTour({ type: "end" }); }}
          />
        </section>

        <div className="panel-column panel-right">
          <header className="panel-header data-header">
            <div><span className="panel-kicker">LIVE ENVIRONMENT</span><h2>City Data</h2></div>
            <div className="panel-header-actions">
              <span className="live-indicator">LIVE</span>
              <button className="mobile-panel-close" onClick={() => setMobilePanelOpen(false)} aria-label="Collapse controls">×</button>
            </div>
          </header>

          <label className="field-control">
            <span>SCENE</span>
            <select value={sceneId} onChange={(event) => chooseScene(event.target.value as SceneId)}>
              {Object.values(SCENE_CONFIGS).map((scene) => <option key={scene.id} value={scene.id}>{scene.label}</option>)}
            </select>
          </label>

          {sceneId === "south-park" && (
            <label className="field-control">
              <span>DATE</span>
              <select value={activeDay.date} onChange={(event) => { detachGuide(); setSouthParkRecordIndex(recordIndexFor(event.target.value)); }}>
                {AIR_QUALITY_DAYS.map((day) => <option key={day.date} value={day.date}>{day.date}</option>)}
              </select>
            </label>
          )}

          <section className="primary-reading">
            <div className="section-line"><span>PM2.5</span><span>{pmBand(record.pm25_ug_m3)}</span></div>
            <div className="pm-value"><strong>{record.pm25_ug_m3.toFixed(1)}</strong><span>µg/m³</span></div>
            <div className="reading-meta">{sceneId === "south-park" && <span>{activeDay.date}</span>}<strong>{String(hour).padStart(2, "0")}:00</strong></div>
          </section>

          <section className="air-dashboard" aria-label="Air quality summary">
            <div className="dashboard-metrics">
              <div><span>24H AQI</span><strong>{dashboardStats.aqi}</strong><small>US EPA</small></div>
              <div><span>DAILY AVG</span><strong>{dashboardStats.average.toFixed(1)}</strong><small>µg/m³</small></div>
              <div><span>DAILY PEAK</span><strong>{dashboardStats.peak.toFixed(1)}</strong><small>µg/m³</small></div>
            </div>
            <div className="trend-chart">
              <div className="section-line"><span>24 HOUR TREND</span><span>{sceneId === "concord" ? "PROFILE" : "OBSERVED"}</span></div>
              <svg viewBox="0 0 240 64" role="img" aria-label="PM2.5 24-hour trend">
                <path d="M0 12H240M0 35H240M0 58H240" />
                <polyline points={dashboardStats.points} />
              </svg>
            </div>
            <div className="last-update"><span>LAST UPDATE</span><strong>{sceneId === "concord" ? `${String(hour).padStart(2, "0")}:00 profile` : record.local_time.replace("T", " ")}</strong></div>
          </section>

          {sceneId === "concord" ? (
            <section className="station-readings" aria-label="Concord monitoring stations">
              <div className="section-line"><span>LOCAL STATIONS</span></div>
              <div className="station-grid">
                {concordStations.map((station) => (
                  <div key={station.id}>
                    <span>{station.label}</span>
                    <strong>{station.pm25.toFixed(2)}</strong>
                  </div>
                ))}
              </div>
            </section>
          ) : (
            <div className="wind-grid">
              <div><span>WIND</span><strong>{record.wind_speed_m_s?.toFixed(1) ?? "—"}</strong><small>m/s</small></div>
              <div><span>DIRECTION</span><strong>{record.wind_direction_deg?.toFixed(0) ?? "—"}</strong><small>degrees</small></div>
            </div>
          )}

          <section className="system-status">
            <div className="section-line"><span>IMMERSIVE MODE</span><span>WEBXR</span></div>
            <div id={VR_BUTTON_HOST_ID} className="vr-button-host" />
          </section>
        </div>
      </aside>
    </main>
  );
}
