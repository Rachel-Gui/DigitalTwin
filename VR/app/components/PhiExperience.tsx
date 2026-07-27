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

function timeLabel(seconds: number) {
  const whole = Math.max(0, Math.floor(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
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

  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => undefined);
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
        <header className="scene-topbar">
          <span className="brand-mark">PHI</span>
        </header>
        <div className="scene-caption">
          <strong>{sceneConfig.caption}</strong>
        </div>
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
        <header className="panel-header">
          <h1>Air Pollution</h1>
          <div className="panel-header-actions">
            <span className={`status-dot ${guideFollowing ? "active" : ""}`} aria-label={guideFollowing ? "Guided tour following" : "Manual mode"} />
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

        <section className="replay-control">
          <div className="section-line"><span>TIME</span><span>{replayPlaying ? "PLAYING" : "PAUSED"}</span></div>
          <div className="replay-row">
            <button onClick={() => { detachGuide(); setReplayPlaying((value) => !value); }} aria-label={replayPlaying ? "Pause replay" : "Play replay"}>{replayPlaying ? "Ⅱ" : "▶"}</button>
            <input
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
              aria-label="Historical hour"
            />
          </div>
        </section>

        <section className="narration-control">
          <div className="section-line"><span>GUIDED NARRATION</span><span>{timeLabel(audioTime)} / 6:46</span></div>
          {!tourStarted ? (
            <button className="start-tour" onClick={startTour}>Start Guided Tour</button>
          ) : (
            <>
              <div className="audio-buttons">
                <button onClick={toggleNarration}>{audioPlaying ? "Pause" : "Play"}</button>
                <button onClick={restartTour}>Restart</button>
                <button onClick={jumpToSceneChapter}>Scene Chapter</button>
              </div>
              <input type="range" min="0" max={TOUR_DURATION_SECONDS} step="0.1" value={audioTime} onChange={(event) => seekNarration(Number(event.target.value))} aria-label="Narration progress" />
              {!guideFollowing && <button className="resume-guide" onClick={resumeGuide}>Resume Guide</button>}
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

        <section className="system-status">
          <div id={VR_BUTTON_HOST_ID} className="vr-button-host" />
        </section>
      </aside>
    </main>
  );
}
