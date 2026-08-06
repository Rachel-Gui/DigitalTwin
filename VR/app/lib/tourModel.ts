import { TOUR_DURATION_SECONDS } from "../data/tourData.ts";

export type TourState = {
  started: boolean;
  following: boolean;
  playing: boolean;
  time: number;
};

export type TourAction =
  | { type: "start" }
  | { type: "play" }
  | { type: "pause" }
  | { type: "time"; time: number }
  | { type: "detach" }
  | { type: "resume" }
  | { type: "restart" }
  | { type: "end" };

export const INITIAL_TOUR_STATE: TourState = { started: false, following: false, playing: false, time: 0 };

export function tourReducer(state: TourState, action: TourAction): TourState {
  switch (action.type) {
    case "start":
    case "restart":
      return { started: true, following: true, playing: true, time: 0 };
    case "play":
      return { ...state, started: true, playing: true };
    case "pause":
      return { ...state, playing: false };
    case "time":
      return { ...state, time: Math.max(0, Math.min(action.time, TOUR_DURATION_SECONDS)) };
    case "detach":
      return { ...state, following: false };
    case "resume":
      return { ...state, following: true };
    case "end":
      return { ...state, following: false, playing: false, time: TOUR_DURATION_SECONDS };
  }
}
