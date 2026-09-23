import { collectBassMidi } from "@/lib/audio/engine";
import type { ChairMutes, Groove, Recipe } from "@/lib/music/types";

function vlq(value: number): number[] {
  const bytes = [value & 0x7f];
  let rest = value >> 7;
  while (rest > 0) {
    bytes.unshift((rest & 0x7f) | 0x80);
    rest >>= 7;
  }
  return bytes;
}

export function encodeBassMidi(groove: Groove, recipe: Recipe, mutes: ChairMutes): Blob {
  const ppq = 480;
  const hits = collectBassMidi(groove, recipe, mutes);
  const events: { tick: number; bytes: number[] }[] = [];
  const tempo = Math.round(60_000_000 / groove.bpm);
  events.push({
    tick: 0,
    bytes: [0xff, 0x51, 0x03, (tempo >> 16) & 0xff, (tempo >> 8) & 0xff, tempo & 0xff],
  });
  events.push({ tick: 0, bytes: [0xc0, 33] });
  for (const hit of hits) {
    if (hit.midi == null) continue;
    const tick = Math.max(0, Math.round((((hit.offset ?? 0) * groove.bpm) / 60) * ppq));
    const vel = Math.max(28, Math.min(118, Math.round((hit.gain ?? 0.4) * 150)));
    const ticksOn = Math.max(ppq / 8, Math.round(((hit.dur ?? 0.2) * groove.bpm * ppq) / 60));
    events.push({ tick, bytes: [0x90, hit.midi, vel] });
    events.push({ tick: tick + ticksOn, bytes: [0x80, hit.midi, 0] });
  }
  events.sort((a, b) => a.tick - b.tick || a.bytes[0]! - b.bytes[0]!);
  const body: number[] = [];
  let last = 0;
  for (const ev of events) {
    const delta = Math.max(0, ev.tick - last);
    body.push(...vlq(delta), ...ev.bytes);
    last = ev.tick;
  }
  body.push(...vlq(ppq), 0xff, 0x2f, 0x00);
  const trackLen = body.length;
  const bytes = new Uint8Array(22 + trackLen);
  bytes.set([0x4d, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 0, 0, 1, (ppq >> 8) & 0xff, ppq & 0xff], 0);
  bytes.set(
    [
      0x4d,
      0x54,
      0x72,
      0x6b,
      (trackLen >> 24) & 0xff,
      (trackLen >> 16) & 0xff,
      (trackLen >> 8) & 0xff,
      trackLen & 0xff,
    ],
    14,
  );
  bytes.set(body, 22);
  return new Blob([bytes], { type: "audio/midi" });
}
