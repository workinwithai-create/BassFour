import type { Bar, ChairId, FigureNote, Groove, Recipe, Tone } from "./types";
import { chairOn } from "./types";

type Event = { step: number; tone: Tone; durSteps: number; gain: number };

const RIFF: Event[] = [
  { step: 0, tone: "r", durSteps: 3, gain: 0.72 },
  { step: 3, tone: "oct", durSteps: 2, gain: 0.46 },
  { step: 6, tone: "fifth", durSteps: 3, gain: 0.54 },
  { step: 10, tone: "oct", durSteps: 2, gain: 0.4 },
  { step: 14, tone: "below", durSteps: 2, gain: 0.3 },
];

const POP: Event[] = [
  { step: 0, tone: "r", durSteps: 1, gain: 0.7 },
  { step: 2, tone: "oct", durSteps: 1, gain: 0.38 },
  { step: 4, tone: "r", durSteps: 1, gain: 0.48 },
  { step: 8, tone: "r", durSteps: 1, gain: 0.62 },
  { step: 10, tone: "oct", durSteps: 1, gain: 0.36 },
  { step: 12, tone: "fifth", durSteps: 2, gain: 0.44 },
  { step: 15, tone: "below", durSteps: 1, gain: 0.26 },
];

const SYNC: Event[] = [
  { step: 2, tone: "r", durSteps: 2, gain: 0.64 },
  { step: 6, tone: "fifth", durSteps: 2, gain: 0.46 },
  { step: 8, tone: "oct", durSteps: 2, gain: 0.4 },
  { step: 11, tone: "third", durSteps: 2, gain: 0.42 },
  { step: 14, tone: "r", durSteps: 2, gain: 0.36 },
];

const HOLES: Event[] = [
  { step: 6, tone: "fifth", durSteps: 1, gain: 0.55 },
  { step: 7, tone: "oct", durSteps: 1, gain: 0.32 },
  { step: 14, tone: "r", durSteps: 1, gain: 0.5 },
  { step: 15, tone: "third", durSteps: 1, gain: 0.3 },
];

const FLOOR: Event[] = [{ step: 0, tone: "r", durSteps: 6, gain: 0.42 }];

const GHOST: Event[] = [
  { step: 0, tone: "r", durSteps: 6, gain: 0.62 },
  { step: 3, tone: "below", durSteps: 1, gain: 0.16 },
  { step: 7, tone: "fifth", durSteps: 1, gain: 0.14 },
  { step: 11, tone: "below", durSteps: 1, gain: 0.14 },
  { step: 15, tone: "third", durSteps: 1, gain: 0.12 },
];

const SIMPLE: Event[] = [
  { step: 0, tone: "r", durSteps: 6, gain: 0.62 },
  { step: 8, tone: "fifth", durSteps: 4, gain: 0.4 },
];

const SLAM_LAST: Event[] = [
  { step: 0, tone: "r", durSteps: 2, gain: 0.8 },
  { step: 4, tone: "oct", durSteps: 2, gain: 0.5 },
  { step: 8, tone: "fifth", durSteps: 2, gain: 0.55 },
  { step: 12, tone: "oct", durSteps: 3, gain: 0.48 },
];

function chairOf(tone: Tone): ChairId {
  if (tone === "oct") return "pop";
  if (tone === "r") return "root";
  return "move";
}

function midiOf(bar: Bar, tone: Tone): number {
  if (tone === "r") return bar.root;
  if (tone === "third") return bar.third;
  if (tone === "fifth") return bar.fifth;
  if (tone === "oct") return bar.oct;
  return bar.below;
}

function eventsFor(recipe: Recipe, barIndex: number): Event[] {
  const last = barIndex === 3;
  if (recipe.feel === "riff") return RIFF;
  if (recipe.feel === "pop") return POP;
  if (recipe.feel === "sync") return SYNC;
  if (recipe.feel === "holes") {
    return last ? [{ step: 0, tone: "r", durSteps: 4, gain: 0.74 }, ...HOLES] : HOLES;
  }
  if (recipe.feel === "late") return barIndex < 2 ? FLOOR : RIFF;
  if (recipe.feel === "ghost") return GHOST;
  if (recipe.feel === "slam") {
    if (barIndex === 2) return [];
    if (last) return SLAM_LAST;
    return RIFF;
  }
  if (recipe.feel === "door") return last ? [] : SIMPLE;
  return RIFF;
}

export function figureNotes(groove: Groove, recipe: Recipe, barIndex: number): FigureNote[] {
  const bar = groove.pocket[barIndex];
  if (!bar) return [];

  if (recipe.feel === "door" && barIndex === 3) {
    return bar.door.map((midi, i) => ({
      step: i * 4,
      midi,
      chair: "move" as const,
      durSteps: 3,
      gain: 0.5 + i * 0.06,
    }));
  }

  const notes: FigureNote[] = [];
  for (const ev of eventsFor(recipe, barIndex)) {
    const chair = chairOf(ev.tone);
    if (!chairOn(recipe, barIndex, chair)) continue;
    notes.push({
      step: ev.step,
      midi: midiOf(bar, ev.tone),
      chair,
      durSteps: ev.durSteps,
      gain: ev.gain,
    });
  }
  return notes;
}

export const CHAIR_LABEL: Record<ChairId, string> = {
  root: "Root",
  move: "Move",
  pop: "Pop",
};
