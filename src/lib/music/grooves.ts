import type { Bar, Groove } from "./types";

function bar(
  symbol: string,
  piano: number[],
  root: number,
  third: number,
  fifth: number,
  oct: number,
  below: number,
  door: number[],
): Bar {
  return { symbol, piano, root, third, fifth, oct, below, door };
}

export const GROOVES: Groove[] = [
  {
    id: "dock",
    name: "Dock Light",
    bpm: 98,
    key: "A minor",
    blurb: "Minor chorus. The vocal already loops. The low end does not.",
    pocket: [
      bar("Am", [57, 60, 64], 33, 36, 40, 45, 31, [33, 36, 40, 45]),
      bar("F", [53, 57, 60], 29, 33, 36, 41, 28, [29, 33, 36, 41]),
      bar("C", [48, 52, 55, 60], 36, 40, 43, 48, 35, [36, 40, 43, 48]),
      bar("G", [55, 59, 62], 31, 35, 38, 43, 30, [29, 30, 31, 32]),
    ],
  },
  {
    id: "canal",
    name: "Canal",
    bpm: 104,
    key: "D minor",
    blurb: "A radio minor. Needs a figure you can hum without the vocal.",
    pocket: [
      bar("Dm", [50, 53, 57], 38, 41, 45, 50, 36, [38, 41, 45, 50]),
      bar("Bb", [46, 50, 53], 34, 38, 41, 46, 33, [34, 38, 41, 46]),
      bar("F", [41, 45, 48, 53], 41, 45, 48, 53, 40, [41, 45, 48, 53]),
      bar("C", [48, 52, 55], 36, 40, 43, 48, 35, [34, 35, 36, 37]),
    ],
  },
  {
    id: "brick",
    name: "Brick Chorus",
    bpm: 108,
    key: "E minor",
    blurb: "Faster hook. Static roots make it feel like a loop, not a chorus.",
    pocket: [
      bar("Em", [52, 55, 59], 40, 43, 47, 52, 38, [40, 43, 47, 52]),
      bar("C", [48, 52, 55], 36, 40, 43, 48, 35, [36, 40, 43, 48]),
      bar("G", [43, 47, 50, 55], 43, 47, 50, 55, 42, [43, 47, 50, 55]),
      bar("D", [50, 54, 57], 38, 42, 45, 50, 37, [35, 36, 37, 39]),
    ],
  },
  {
    id: "sunday",
    name: "Sunday Root",
    bpm: 86,
    key: "G major",
    blurb: "Slow enough that a bad bass note has nowhere to hide.",
    pocket: [
      bar("G", [55, 59, 62], 43, 47, 50, 55, 42, [43, 47, 50, 55]),
      bar("Em", [52, 55, 59], 40, 43, 47, 52, 38, [40, 43, 47, 52]),
      bar("C", [48, 52, 55, 60], 36, 40, 43, 48, 35, [36, 40, 43, 48]),
      bar("D", [50, 54, 57], 38, 42, 45, 50, 37, [39, 40, 41, 42]),
    ],
  },
  {
    id: "paper",
    name: "Paper Low",
    bpm: 94,
    key: "C minor",
    blurb: "Flat-side chorus. The generator smears the bottom. Lock one body.",
    pocket: [
      bar("Cm", [48, 51, 55], 36, 39, 43, 48, 35, [36, 39, 43, 48]),
      bar("Ab", [44, 48, 51], 44, 48, 51, 56, 43, [44, 48, 51, 56]),
      bar("Eb", [51, 55, 58], 39, 43, 46, 51, 38, [39, 43, 46, 51]),
      bar("Bb", [46, 50, 53], 34, 38, 41, 46, 33, [44, 45, 46, 47]),
    ],
  },
  {
    id: "radio",
    name: "Radio Floor",
    bpm: 100,
    key: "F major",
    blurb: "Major hook. The bass should be the part people sing in the car.",
    pocket: [
      bar("F", [53, 57, 60], 41, 45, 48, 53, 40, [41, 45, 48, 53]),
      bar("Dm", [50, 53, 57], 38, 41, 45, 50, 36, [38, 41, 45, 50]),
      bar("Bb", [46, 50, 53], 46, 50, 53, 58, 45, [46, 50, 53, 58]),
      bar("C", [48, 52, 55, 60], 36, 40, 43, 48, 35, [36, 38, 39, 40]),
    ],
  },
];

export function grooveById(id: string): Groove {
  return GROOVES.find((g) => g.id === id) ?? GROOVES[0]!;
}
