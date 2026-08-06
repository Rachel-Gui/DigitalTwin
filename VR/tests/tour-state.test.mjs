import assert from "node:assert/strict";
import test from "node:test";
import { chapterAt, chapterHour, TOUR_CHAPTERS, TOUR_DURATION_SECONDS } from "../app/data/tourData.ts";
import { INITIAL_TOUR_STATE, tourReducer } from "../app/lib/tourModel.ts";

test("tour chapters align Concord and South Park with the official audio", () => {
  assert.equal(TOUR_DURATION_SECONDS, 406.152);
  assert.equal(TOUR_CHAPTERS.length, 2);
  assert.equal(chapterAt(0).sceneId, "concord");
  assert.equal(chapterHour(chapterAt(0), 0), 0);
  assert.equal(chapterAt(280.499).sceneId, "concord");
  assert.equal(chapterAt(280.5).sceneId, "south-park");
  assert.equal(chapterHour(chapterAt(280.5), 280.5), 0);
  assert.ok(TOUR_CHAPTERS.every((chapter) => chapter.transcript.length > 900));
});

test("tour state covers start, pause, detach, resume, restart and end", () => {
  let state = tourReducer(INITIAL_TOUR_STATE, { type: "start" });
  assert.deepEqual(state, { started: true, following: true, playing: true, time: 0 });
  state = tourReducer(state, { type: "time", time: 100 });
  state = tourReducer(state, { type: "pause" });
  assert.equal(state.playing, false);
  state = tourReducer(state, { type: "play" });
  state = tourReducer(state, { type: "detach" });
  assert.equal(state.playing, true, "manual detach must not stop narration");
  assert.equal(state.following, false);
  state = tourReducer(state, { type: "resume" });
  assert.equal(state.following, true);
  state = tourReducer(state, { type: "restart" });
  assert.equal(state.time, 0);
  state = tourReducer(state, { type: "end" });
  assert.deepEqual(state, { started: true, following: false, playing: false, time: TOUR_DURATION_SECONDS });
});

test("narration requires a user control and has no autoplay attribute", async () => {
  const source = await import("node:fs/promises").then((fs) => fs.readFile(new URL("../app/components/PhiExperience.tsx", import.meta.url), "utf8"));
  assert.match(source, /className="start-tour" onClick=\{startTour\}>.*Start Guided Tour/);
  assert.doesNotMatch(source, /autoPlay/);
  assert.match(source, /Resume Guide/);
  assert.doesNotMatch(source, /English narration text|Starts at Concord 00:00|Audio continues independently/);
});
