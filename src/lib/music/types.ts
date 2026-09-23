export type ChairId = "root" | "move" | "pop";

export type Tone = "r" | "third" | "fifth" | "oct" | "below";

export type Bar = {
  symbol: string;
  piano: number[];
  root: number;
  third: number;
  fifth: number;
  oct: number;
  below: number;
  /** Four notes on the last bar of the Door recipe. Leading tone last. */
  door: number[];
};

export type Groove = {
  id: string;
  name: string;
  bpm: number;
  key: string;
  blurb: string;
  pocket: [Bar, Bar, Bar, Bar];
};

export type BassFeel =
  | "riff"
  | "pop"
  | "holes"
  | "late"
  | "ghost"
  | "slam"
  | "door"
  | "sync";

export type Recipe = {
  id: string;
  name: string;
  blurb: string;
  feel: BassFeel;
  rootFrom: number;
  moveFrom: number;
  popFrom: number;
};

export type PlayMode = "floor" | "hook" | "solo";

export type ChairMutes = Record<ChairId, boolean>;

export type FigureNote = {
  step: number;
  midi: number;
  chair: ChairId;
  durSteps: number;
  gain: number;
};

export const STEPS = 16;
export const TOTAL_BARS = 4;

export function chairOn(recipe: Recipe, barIndex: number, chair: ChairId): boolean {
  if (chair === "root") return barIndex >= recipe.rootFrom;
  if (chair === "move") return barIndex >= recipe.moveFrom;
  return barIndex >= recipe.popFrom;
}
