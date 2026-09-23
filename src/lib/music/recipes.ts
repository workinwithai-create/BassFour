import type { Recipe } from "./types";

export const RECIPES: Recipe[] = [
  {
    id: "riff",
    name: "Hook riff",
    blurb: "Root, octave, fifth, octave. A four-note figure you can hum with the vocal muted.",
    feel: "riff",
    rootFrom: 0,
    moveFrom: 0,
    popFrom: 0,
  },
  {
    id: "pop",
    name: "Octave pop",
    blurb: "Root on the beat. Octave on the and. The chorus finally has a body, not a drone.",
    feel: "pop",
    rootFrom: 0,
    moveFrom: 0,
    popFrom: 0,
  },
  {
    id: "sync",
    name: "Ahead of the vocal",
    blurb: "The figure lands before the downbeat. The hook pushes instead of sitting.",
    feel: "sync",
    rootFrom: 0,
    moveFrom: 0,
    popFrom: 0,
  },
  {
    id: "holes",
    name: "Hole answer",
    blurb: "The vocal keeps beat 1. The bass talks in the gaps, then lands on bar 4.",
    feel: "holes",
    rootFrom: 0,
    moveFrom: 0,
    popFrom: 0,
  },
  {
    id: "late",
    name: "Late figure",
    blurb: "Two bars of the dump. The hook bass walks in on bar 3 and stays.",
    feel: "late",
    rootFrom: 0,
    moveFrom: 2,
    popFrom: 2,
  },
  {
    id: "ghost",
    name: "Ghosts between",
    blurb: "One long root. Quiet dead notes in the cracks. Pocket, not a new song.",
    feel: "ghost",
    rootFrom: 0,
    moveFrom: 0,
    popFrom: 4,
  },
  {
    id: "slam",
    name: "Air then slam",
    blurb: "Figure, figure, one bar of nothing, then the bass hits. Not a full drop.",
    feel: "slam",
    rootFrom: 0,
    moveFrom: 0,
    popFrom: 0,
  },
  {
    id: "door",
    name: "Chromatic door",
    blurb: "Simple for three. Bar 4 walks to the leading tone. Bar 5 is yours.",
    feel: "door",
    rootFrom: 0,
    moveFrom: 0,
    popFrom: 4,
  },
];

export function recipeById(id: string): Recipe {
  return RECIPES.find((r) => r.id === id) ?? RECIPES[0]!;
}
