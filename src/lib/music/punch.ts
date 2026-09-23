import { figureNotes } from "./figure";
import type { Groove, Recipe } from "./types";
import { TOTAL_BARS } from "./types";

export function punchList(groove: Groove, recipe: Recipe): string {
  const bars = Array.from({ length: TOTAL_BARS }, (_, i) => {
    const ch = groove.pocket[i]!;
    const notes = figureNotes(groove, recipe, i);
    const root = notes.some((n) => n.chair === "root") ? "root" : "—";
    const move = notes.some((n) => n.chair === "move") ? "move" : "—";
    const pop = notes.some((n) => n.chair === "pop") ? "pop" : "—";
    const air = notes.length === 0 ? "  air" : "";
    return `  ${i + 1}. ${ch.symbol.padEnd(4)}  ${root.padEnd(6)} ${move.padEnd(6)} ${pop}${air}`;
  }).join("\n");

  return `BassFour punch list
${groove.name} · ${groove.bpm} BPM · ${groove.key} · ${recipe.name}

The problem: the chorus already loops, but the low end is a static root or a
Suno smear. Remixing the whole prompt adds entropy. One human bass decision
finishes the hook. WalkEight is an eight-bar jazz walk. PedalFour holds one
note. SlideTwo is an 808 into the drop. AltoFour is a reed line. This is the
four-bar finger-bass figure people hum when the vocal drops out.

The move: ${recipe.blurb}

Four-bar pocket (drop the bass on the chorus you have — do not write a new form)
bar  chord  root   move   pop
${bars}

Feel: ${recipe.feel}

Live chairs only — FluidR3 electric bass (finger) plus a PreEight kit, piano,
and upright root for the dry dump. No oscillators. Audio never leaves the tab.

Bounce the bass WAV and drop it on these four bars. Keep your drums. A loops
the floor. B plays the figure once and stops. The next section starts on bar 5.`;
}
