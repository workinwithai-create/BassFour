import { figureNotes } from "@/lib/music/figure";
import type { ChairId, ChairMutes, Groove, PlayMode, Recipe } from "@/lib/music/types";
import { STEPS, TOTAL_BARS } from "@/lib/music/types";

const PRE = "https://cdn.jsdelivr.net/gh/workinwithai-create/PreEight@main/public/samples";
const GM =
  "https://cdn.jsdelivr.net/gh/gleitz/midi-js-soundfonts@gh-pages/FluidR3_GM/electric_bass_finger-mp3";

const FLATS = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
const FINGER_LO = 26;
const FINGER_HI = 58;

export function midiName(midi: number): string {
  const oct = Math.floor(midi / 12) - 1;
  return `${FLATS[((midi % 12) + 12) % 12]}${oct}`;
}

type Voice = "kick" | "snare" | "hat" | "piano" | "acoustic" | "finger";

export type Hit = {
  voice: Voice;
  midi?: number;
  gain: number;
  offset?: number;
  dur?: number;
  chair?: ChairId;
};

const BED: [string, string, number][] = [
  ["kick", `${PRE}/drums/kick.mp3`, 0],
  ["snare", `${PRE}/drums/snare.mp3`, 0],
  ["hat", `${PRE}/drums/hihat.mp3`, 0],
  ["pC3", `${PRE}/piano/C3.mp3`, 48],
  ["pA3", `${PRE}/piano/A3.mp3`, 57],
  ["pC4", `${PRE}/piano/C4.mp3`, 60],
  ["aE1", `${PRE}/bass/E1.mp3`, 28],
  ["aA1", `${PRE}/bass/A1.mp3`, 33],
  ["aC2", `${PRE}/bass/C2.mp3`, 36],
];

function fingerFiles(): [string, string][] {
  const files: [string, string][] = [];
  for (let midi = FINGER_LO; midi <= FINGER_HI; midi += 1) {
    files.push([`f${midi}`, `${GM}/${midiName(midi)}.mp3`]);
  }
  return files;
}

const FILES: [string, string][] = [...BED.map(([k, url]) => [k, url] as [string, string]), ...fingerFiles()];

function rateFromMidi(midi: number, base: number) {
  return 2 ** ((midi - base) / 12);
}

function nearest(midi: number, points: [string, number][]): [string, number] {
  let best = points[0]!;
  let bestDist = Math.abs(midi - best[1]);
  for (const p of points) {
    const d = Math.abs(midi - p[1]);
    if (d < bestDist) {
      best = p;
      bestDist = d;
    }
  }
  return best;
}

function pickPiano(midi: number): [string, number] {
  if (midi < 54) return ["pC3", 48];
  if (midi < 59) return ["pA3", 57];
  return ["pC4", 60];
}

function pickAcoustic(midi: number): [string, number] {
  if (midi < 31) return ["aE1", 28];
  if (midi < 35) return ["aA1", 33];
  return ["aC2", 36];
}

function bedHits(groove: Groove, barIndex: number, step: number, acoustic: boolean): Hit[] {
  const ch = groove.pocket[barIndex];
  if (!ch) return [];
  const hits: Hit[] = [];
  if (step === 0 || step === 8) hits.push({ voice: "kick", gain: step === 0 ? 0.4 : 0.28 });
  if (step === 4 || step === 12) hits.push({ voice: "snare", gain: 0.2 });
  if (step % 4 === 2) hits.push({ voice: "hat", gain: 0.03 });
  if (step === 0) {
    for (const note of ch.piano.slice(0, 3)) {
      hits.push({ voice: "piano", midi: note, gain: 0.055 });
    }
    if (acoustic) hits.push({ voice: "acoustic", midi: ch.root, gain: 0.32 });
  }
  if (acoustic && step === 8) hits.push({ voice: "acoustic", midi: ch.root, gain: 0.16 });
  return hits;
}

function fingerHits(
  groove: Groove,
  recipe: Recipe,
  barIndex: number,
  step: number,
  mutes: ChairMutes,
): Hit[] {
  return figureNotes(groove, recipe, barIndex)
    .filter((n) => n.step === step && !mutes[n.chair])
    .map((n) => ({
      voice: "finger" as const,
      midi: n.midi,
      gain: n.gain,
      dur: undefined,
      chair: n.chair,
      offset: 0,
      durSteps: n.durSteps,
    }));
}

function collectHits(
  groove: Groove,
  recipe: Recipe,
  barIndex: number,
  step: number,
  mode: PlayMode,
  mutes: ChairMutes,
  stepDur: number,
): Hit[] {
  const hits: Hit[] = [];
  if (mode === "floor" || mode === "hook") hits.push(...bedHits(groove, barIndex, step, mode === "floor"));
  if (mode === "hook" || mode === "solo") {
    for (const hit of fingerHits(groove, recipe, barIndex, step, mutes)) {
      const durSteps = (hit as Hit & { durSteps?: number }).durSteps ?? 2;
      hits.push({ ...hit, dur: Math.max(0.08, durSteps * stepDur * 0.92) });
    }
  }
  return hits;
}

export function collectBassMidi(groove: Groove, recipe: Recipe, mutes: ChairMutes): Hit[] {
  const events: Hit[] = [];
  const stepDur = 60 / groove.bpm / 4;
  for (let bar = 0; bar < TOTAL_BARS; bar += 1) {
    for (let step = 0; step < STEPS; step += 1) {
      const t = (bar * STEPS + step) * stepDur;
      for (const hit of collectHits(groove, recipe, bar, step, "solo", mutes, stepDur)) {
        events.push({ ...hit, offset: t + (hit.offset ?? 0) });
      }
    }
  }
  return events;
}

async function decodeInto(
  ctx: BaseAudioContext,
  onProgress?: (done: number, total: number) => void,
): Promise<Record<string, AudioBuffer>> {
  const buffers: Record<string, AudioBuffer> = {};
  let done = 0;
  await Promise.all(
    FILES.map(async ([key, url]) => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(String(res.status));
        const raw = await res.arrayBuffer();
        buffers[key] = await ctx.decodeAudioData(raw.slice(0));
      } catch (err) {
        console.warn("sample miss", key, err);
      }
      done += 1;
      onProgress?.(done, FILES.length);
    }),
  );
  return buffers;
}

function playVoice(
  ctx: BaseAudioContext,
  dest: AudioNode,
  buffers: Record<string, AudioBuffer>,
  hit: Hit,
  when: number,
  onHit?: (midi: number, chair: ChairId) => void,
) {
  let sample: string = hit.voice;
  let rate = 1;
  if (hit.voice === "piano" && hit.midi != null) {
    const [n, base] = pickPiano(hit.midi);
    sample = n;
    rate = rateFromMidi(hit.midi, base);
  } else if (hit.voice === "acoustic" && hit.midi != null) {
    const [n, base] = pickAcoustic(hit.midi);
    sample = n;
    rate = rateFromMidi(hit.midi, base);
  } else if (hit.voice === "finger" && hit.midi != null) {
    const exact = `f${hit.midi}`;
    if (buffers[exact]) {
      sample = exact;
      rate = 1;
    } else {
      const points: [string, number][] = [];
      for (let m = FINGER_LO; m <= FINGER_HI; m += 1) {
        if (buffers[`f${m}`]) points.push([`f${m}`, m]);
      }
      if (points.length === 0) return;
      const [n, base] = nearest(hit.midi, points);
      sample = n;
      rate = rateFromMidi(hit.midi, base);
    }
  }
  const buf = buffers[sample];
  if (!buf) return;
  if (hit.voice === "finger" && hit.midi != null && hit.chair && onHit) {
    const delay = Math.max(0, (when - ctx.currentTime) * 1000);
    const midi = hit.midi;
    const chair = hit.chair;
    if (!(ctx instanceof OfflineAudioContext)) {
      setTimeout(() => onHit(midi, chair), delay);
    }
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.playbackRate.value = Math.max(0.7, Math.min(1.45, rate));
  const g = ctx.createGain();
  const dur = hit.dur ?? Math.min(0.45, buf.duration / Math.max(rate, 0.7));
  const attack = hit.voice === "finger" ? 0.012 : 0.006;
  g.gain.setValueAtTime(0.0001, when);
  g.gain.exponentialRampToValueAtTime(Math.max(0.001, hit.gain), when + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, when + Math.max(attack + 0.03, dur));
  src.connect(g);
  g.connect(dest);
  src.start(when);
  try {
    src.stop(when + dur + 0.04);
  } catch {
    /* already stopped */
  }
}

function scheduleBar(
  ctx: BaseAudioContext,
  bed: AudioNode,
  bass: AudioNode,
  buffers: Record<string, AudioBuffer>,
  groove: Groove,
  recipe: Recipe,
  barIndex: number,
  t0: number,
  stepDur: number,
  mode: PlayMode,
  mutes: ChairMutes,
  onHit?: (midi: number, chair: ChairId) => void,
) {
  const live = !(ctx instanceof OfflineAudioContext);
  for (let step = 0; step < STEPS; step += 1) {
    const jitter = live ? (Math.random() - 0.5) * 0.003 : 0;
    const when = t0 + step * stepDur + jitter;
    for (const hit of collectHits(groove, recipe, barIndex, step, mode, mutes, stepDur)) {
      const node = hit.voice === "finger" ? bass : bed;
      playVoice(ctx, node, buffers, hit, when + (hit.offset ?? 0), onHit);
    }
  }
}

export type EngineListener = {
  onBar?: (bar: number | null) => void;
  onPlaying?: (playing: boolean, mode: PlayMode | null) => void;
  onStatus?: (status: string) => void;
  onHit?: (midi: number, chair: ChairId) => void;
};

const OPEN: ChairMutes = { root: false, move: false, pop: false };

function wireBass(ctx: BaseAudioContext, master: GainNode) {
  const bass = ctx.createGain();
  bass.gain.value = 1;
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 42;
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 2800;
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -18;
  comp.knee.value = 8;
  comp.ratio.value = 3;
  comp.attack.value = 0.012;
  comp.release.value = 0.16;
  bass.connect(hp);
  hp.connect(lp);
  lp.connect(comp);
  comp.connect(master);
  return bass;
}

export function createEngine() {
  let ctx: AudioContext | null = null;
  let bed: GainNode | null = null;
  let bass: AudioNode | null = null;
  let buffers: Record<string, AudioBuffer> = {};
  let loaded = false;
  let loading: Promise<void> | null = null;
  let playing = false;
  let mode: PlayMode | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let mutes: ChairMutes = { ...OPEN };
  const listeners = new Set<EngineListener>();

  function emit() {
    for (const l of listeners) l.onPlaying?.(playing, mode);
  }
  function setStatus(status: string) {
    for (const l of listeners) l.onStatus?.(status);
  }
  function setBar(bar: number | null) {
    for (const l of listeners) l.onBar?.(bar);
  }
  function fireHit(midi: number, chair: ChairId) {
    for (const l of listeners) l.onHit?.(midi, chair);
  }

  async function ensure() {
    if (loaded) return;
    if (loading) return loading;
    loading = (async () => {
      ctx = new AudioContext({ latencyHint: "interactive" });
      const master = ctx.createGain();
      master.gain.value = 0.72;
      master.connect(ctx.destination);
      bed = ctx.createGain();
      bed.gain.value = 1;
      bed.connect(master);
      bass = wireBass(ctx, master);
      setStatus("Seating the bass");
      buffers = await decodeInto(ctx, (done, total) => {
        setStatus(`Seating samples ${done}/${total}`);
      });
      const fingerCount = Object.keys(buffers).filter((k) => k.startsWith("f")).length;
      loaded = fingerCount > 8;
      setStatus(loaded ? "Finger bass seated · live FluidR3" : "Samples failed to seat");
      if (!loaded) throw new Error("Bass samples did not load");
    })();
    try {
      await loading;
    } finally {
      loading = null;
    }
  }

  function halt() {
    playing = false;
    mode = null;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    setBar(null);
    emit();
  }

  async function play(next: PlayMode, groove: Groove, recipe: Recipe) {
    await ensure();
    if (!ctx || !bed || !bass) return;
    if (ctx.state === "suspended") await ctx.resume();
    halt();
    playing = true;
    mode = next;
    emit();
    const stepDur = 60 / groove.bpm / 4;
    let barIndex = 0;
    const loops = next === "floor";
    const tick = () => {
      if (!playing || !ctx || !bed || !bass) return;
      if (barIndex >= TOTAL_BARS) {
        if (!loops) {
          halt();
          setStatus("Figure planted · next section on 5");
          return;
        }
        barIndex = 0;
      }
      setBar(barIndex);
      scheduleBar(ctx, bed, bass, buffers, groove, recipe, barIndex, ctx.currentTime + 0.04, stepDur, next, mutes, fireHit);
      barIndex += 1;
      timer = setTimeout(tick, STEPS * stepDur * 1000);
    };
    tick();
  }

  async function render(groove: Groove, recipe: Recipe, modeName: PlayMode): Promise<Blob> {
    await ensure();
    const stepDur = 60 / groove.bpm / 4;
    const seconds = TOTAL_BARS * STEPS * stepDur + 1.4;
    const offline = new OfflineAudioContext(2, Math.ceil(seconds * 44100), 44100);
    const pack = await decodeInto(offline);
    const master = offline.createGain();
    master.gain.value = 0.8;
    master.connect(offline.destination);
    const bedNode = offline.createGain();
    bedNode.connect(master);
    const bassNode = wireBass(offline, master);
    for (let i = 0; i < TOTAL_BARS; i += 1) {
      scheduleBar(
        offline,
        bedNode,
        bassNode,
        pack,
        groove,
        recipe,
        i,
        i * STEPS * stepDur + 0.02,
        stepDur,
        modeName,
        mutes,
      );
    }
    const rendered = await offline.startRendering();
    return encodeWav(rendered);
  }

  return {
    subscribe(listener: EngineListener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    preload: ensure,
    play,
    stop: halt,
    bounceBass: (groove: Groove, recipe: Recipe) => render(groove, recipe, "solo"),
    bouncePocket: (groove: Groove, recipe: Recipe) => render(groove, recipe, "hook"),
    setMutes(next: ChairMutes) {
      mutes = { ...next };
    },
    get playing() {
      return playing;
    },
  };
}

function encodeWav(buffer: AudioBuffer): Blob {
  const channels = 2;
  const rate = buffer.sampleRate;
  const length = buffer.length;
  const bytes = new ArrayBuffer(44 + length * channels * 2);
  const view = new DataView(bytes);
  const writeStr = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i += 1) view.setUint8(offset + i, s.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + length * channels * 2, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, rate, true);
  view.setUint32(28, rate * channels * 2, true);
  view.setUint16(32, channels * 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, length * channels * 2, true);
  const left = buffer.getChannelData(0);
  const right = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : left;
  let offset = 44;
  for (let i = 0; i < length; i += 1) {
    const sl = Math.max(-1, Math.min(1, left[i] ?? 0));
    const sr = Math.max(-1, Math.min(1, right[i] ?? 0));
    view.setInt16(offset, sl < 0 ? sl * 0x8000 : sl * 0x7fff, true);
    view.setInt16(offset + 2, sr < 0 ? sr * 0x8000 : sr * 0x7fff, true);
    offset += 4;
  }
  return new Blob([bytes], { type: "audio/wav" });
}

export const engine = createEngine();
