import { useEffect, useMemo, useRef, useState } from "react";
import { Copy, Download, Square } from "lucide-react";
import { engine, midiName } from "@/lib/audio/engine";
import { encodeBassMidi } from "@/lib/midi/export";
import { CHAIR_LABEL, figureNotes } from "@/lib/music/figure";
import { GROOVES, grooveById } from "@/lib/music/grooves";
import { punchList } from "@/lib/music/punch";
import { RECIPES, recipeById } from "@/lib/music/recipes";
import type { ChairId, ChairMutes, PlayMode } from "@/lib/music/types";
import { STEPS } from "@/lib/music/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CHAIRS: ChairId[] = ["root", "move", "pop"];
const OPEN_MUTES: ChairMutes = { root: false, move: false, pop: false };

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function DeskApp() {
  const [grooveId, setGrooveId] = useState(GROOVES[0]!.id);
  const [recipeId, setRecipeId] = useState(RECIPES[0]!.id);
  const [mutes, setMutes] = useState<ChairMutes>(OPEN_MUTES);
  const [mode, setMode] = useState<PlayMode | null>(null);
  const [bar, setBar] = useState<number | null>(null);
  const [step, setStep] = useState<number | null>(null);
  const [status, setStatus] = useState("Live finger bass. Nothing has left the tab.");
  const [busy, setBusy] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [note, setNote] = useState<string>("");

  const groove = grooveById(grooveId);
  const recipe = recipeById(recipeId);
  const grooveRef = useRef(groove);
  const recipeRef = useRef(recipe);
  grooveRef.current = groove;
  recipeRef.current = recipe;
  const sheet = useMemo(() => punchList(groove, recipe), [groove, recipe]);

  useEffect(() => {
    const savedG = localStorage.getItem("bassfour-groove");
    const savedR = localStorage.getItem("bassfour-recipe");
    if (savedG && GROOVES.some((g) => g.id === savedG)) setGrooveId(savedG);
    if (savedR && RECIPES.some((r) => r.id === savedR)) setRecipeId(savedR);
  }, []);

  useEffect(() => {
    localStorage.setItem("bassfour-groove", grooveId);
    localStorage.setItem("bassfour-recipe", recipeId);
  }, [grooveId, recipeId]);

  useEffect(() => {
    engine.setMutes(mutes);
  }, [mutes]);

  useEffect(() => {
    return engine.subscribe({
      onBar: setBar,
      onPlaying: (playing, next) => {
        setMode(playing ? next : null);
        if (!playing) setStep(null);
      },
      onStatus: setStatus,
      onHit: (midi, chair) => setNote(`${midiName(midi)} · ${CHAIR_LABEL[chair]}`),
    });
  }, []);

  useEffect(() => {
    if (bar == null || mode == null) return;
    const started = performance.now();
    const stepMs = (60 / groove.bpm / 4) * 1000;
    let raf = 0;
    let last = -1;
    const tick = () => {
      const next = Math.min(STEPS - 1, Math.floor((performance.now() - started) / stepMs));
      if (next !== last) {
        last = next;
        setStep(next);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [bar, mode, groove.bpm]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const g = grooveRef.current;
      const r = recipeRef.current;
      const go = (next: PlayMode) => {
        void engine.play(next, g, r).catch(() => setStatus("Live bass samples did not load. Try again."));
      };
      if (e.code === "Space") {
        e.preventDefault();
        go("hook");
      } else if (e.key === "a" || e.key === "A") {
        go("floor");
      } else if (e.key === "4") {
        go("solo");
      } else if (e.key === "Escape") {
        engine.stop();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function run(next: PlayMode) {
    try {
      await engine.play(next, groove, recipe);
    } catch {
      setStatus("Live bass samples did not load. Try again.");
    }
  }

  async function bounce(kind: "bass" | "pocket") {
    setBusy(kind);
    try {
      const blob =
        kind === "bass" ? await engine.bounceBass(groove, recipe) : await engine.bouncePocket(groove, recipe);
      const slug = `${groove.id}-${recipe.id}`;
      saveBlob(blob, kind === "bass" ? `BassFour-${slug}.wav` : `BassFour-pocket-${slug}.wav`);
      setStatus(kind === "bass" ? "Bass WAV bounced. Drop it on the chorus." : "Pocket WAV bounced.");
    } catch {
      setStatus("Bounce failed. The samples may still be seating.");
    } finally {
      setBusy(null);
    }
  }

  function bounceMidi() {
    const blob = encodeBassMidi(groove, recipe, mutes);
    saveBlob(blob, `BassFour-${groove.id}-${recipe.id}.mid`);
    setStatus("MIDI bounced. Electric bass, finger. Program 34.");
  }

  async function copySheet() {
    try {
      await navigator.clipboard.writeText(sheet);
    } catch {
      const area = document.createElement("textarea");
      area.value = sheet;
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6 sm:py-10">
      <header className="flex flex-col gap-3">
        <p className="font-mono text-xs tracking-widest text-accent uppercase">
          Workin' With AI · finish the low end
        </p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-5xl leading-none text-fg sm:text-6xl">BassFour</h1>
          <p className="max-w-md text-sm text-muted">
            Four bars. One live finger bass. The chorus stops being a loop and starts being a hook.
          </p>
        </div>
        <p className="max-w-2xl text-base text-fg">
          Generators smear the bottom, or park a root and call it a bassline. Remixing the prompt
          just adds entropy. Stamp a figure you can hum, then bounce it onto the chorus you already have.
        </p>
      </header>

      <section className="flex flex-col gap-3" aria-label="Grooves">
        <h2 className="font-mono text-xs tracking-widest text-subtle uppercase">Groove</h2>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {GROOVES.map((g) => {
            const on = g.id === groove.id;
            return (
              <button
                key={g.id}
                type="button"
                aria-pressed={on}
                onClick={() => setGrooveId(g.id)}
                className={cn(
                  "min-h-11 shrink-0 rounded-md border px-3 py-2 text-left transition-colors duration-150",
                  on ? "border-accent bg-surface-2 text-fg" : "border-line bg-surface text-muted hover:text-fg",
                )}
              >
                <span className="block text-sm font-medium">{g.name}</span>
                <span className="font-mono text-xs text-subtle">
                  {g.bpm} · {g.key}
                </span>
              </button>
            );
          })}
        </div>
        <p className="text-sm text-muted">{groove.blurb}</p>
      </section>

      <section className="flex flex-col gap-3" aria-label="Transport">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Button
            variant={mode === "floor" ? "solid" : "line"}
            onClick={() => void run("floor")}
            aria-pressed={mode === "floor"}
          >
            A · Floor
          </Button>
          <Button
            variant={mode === "hook" ? "solid" : "line"}
            onClick={() => void run("hook")}
            aria-pressed={mode === "hook"}
          >
            B · Hook
          </Button>
          <Button
            variant={mode === "solo" ? "solid" : "line"}
            onClick={() => void run("solo")}
            aria-pressed={mode === "solo"}
          >
            Bass only
          </Button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-xs text-muted" role="status">
            {status}
          </p>
          <Button variant="ghost" onClick={() => engine.stop()} aria-label="Stop">
            <Square className="size-4" aria-hidden />
            Stop
          </Button>
        </div>
        <p className="text-xs text-subtle">Space plays the hook. A is the floor. 4 is bass only. Esc stops.</p>
      </section>

      <section className="flex flex-col gap-4" aria-label="Four bars">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {groove.pocket.map((ch, i) => {
            const notes = figureNotes(groove, recipe, i);
            const active = bar === i && mode != null;
            return (
              <div
                key={`${groove.id}-${i}`}
                className={cn(
                  "flex flex-col gap-2 rounded-lg border bg-surface p-3",
                  active ? "border-accent" : "border-line",
                )}
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-2xl text-fg">{ch.symbol}</span>
                  <span className="font-mono text-xs text-subtle">bar {i + 1}</span>
                </div>
                <div className="flex h-10 items-end gap-px" aria-hidden>
                  {Array.from({ length: STEPS }, (_, s) => {
                    const hit = notes.find((n) => n.step === s);
                    const here = active && step === s;
                    const muted = hit ? mutes[hit.chair] : false;
                    return (
                      <div key={s} className="flex h-full flex-1 items-end">
                        <div
                          className={cn(
                            "w-full rounded-xs",
                            !hit && (here ? "h-2 bg-surface-2" : "h-1 bg-line"),
                            hit?.chair === "root" && "h-8 bg-accent",
                            hit?.chair === "move" && "h-5 bg-fg",
                            hit?.chair === "pop" && "h-3 bg-accent",
                            muted && "opacity-25",
                            here && hit && "ring-2 ring-fg",
                          )}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {CHAIRS.map((id) => {
            const on = !mutes[id];
            return (
              <button
                key={id}
                type="button"
                aria-pressed={on}
                onClick={() => setMutes((m) => ({ ...m, [id]: !m[id] }))}
                className={cn(
                  "min-h-11 rounded-md border px-4 text-sm font-medium transition-colors duration-150",
                  on ? "border-accent bg-surface-2 text-fg" : "border-line text-subtle",
                )}
              >
                {CHAIR_LABEL[id]}
                <span className="ml-2 font-mono text-xs text-subtle">{on ? "in" : "out"}</span>
              </button>
            );
          })}
          <span className="font-mono text-xs text-accent">{note}</span>
        </div>
        <p className="text-xs text-subtle">
          Copper is the root. Cream is the move. Short copper is the octave pop. A loops. B plays four and stops.
        </p>
      </section>

      <section className="flex flex-col gap-3" aria-label="Recipes">
        <h2 className="font-mono text-xs tracking-widest text-subtle uppercase">Stamp a figure</h2>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {RECIPES.map((r) => {
            const on = r.id === recipe.id;
            return (
              <button
                key={r.id}
                type="button"
                aria-pressed={on}
                onClick={() => setRecipeId(r.id)}
                className={cn(
                  "min-h-11 rounded-lg border px-4 py-3 text-left transition-colors duration-150",
                  on ? "border-accent bg-surface-2" : "border-line bg-surface hover:border-muted",
                )}
              >
                <span className="block text-sm font-medium text-fg">{r.name}</span>
                <span className="mt-1 block text-sm text-muted">{r.blurb}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-3" aria-label="Punch list">
        <h2 className="font-mono text-xs tracking-widest text-subtle uppercase">Punch list</h2>
        <pre className="overflow-x-auto rounded-lg border border-line bg-surface p-4 font-mono text-xs leading-relaxed text-muted">
          {sheet}
        </pre>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Button variant="line" onClick={() => void copySheet()}>
            <Copy className="size-4" aria-hidden />
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button variant="solid" disabled={busy != null} onClick={() => void bounce("bass")}>
            <Download className="size-4" aria-hidden />
            {busy === "bass" ? "Bouncing" : "Bass WAV"}
          </Button>
          <Button variant="line" disabled={busy != null} onClick={() => void bounce("pocket")}>
            {busy === "pocket" ? "Bouncing" : "Pocket WAV"}
          </Button>
          <Button variant="line" onClick={bounceMidi}>
            MIDI
          </Button>
        </div>
      </section>

      <footer className="border-t border-line pt-6 text-sm text-muted">
        <p>
          Not AltoFour (yesterday's reed line). Not WalkEight (an eight-bar jazz walk). Not PedalFour,
          not SlideTwo, not the drop. BassFour is the missing hook bass: four bars of live FluidR3 finger
          bass so the chorus has one body and one phase.
        </p>
        <p className="mt-2 text-subtle">Audio never leaves the tab. No account. No oscillators.</p>
      </footer>
    </main>
  );
}
