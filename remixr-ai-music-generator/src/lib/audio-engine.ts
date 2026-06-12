// Browser Web Audio synthesizer. Generates a short looping mood track from
// a mood preset. No external API needed; runs entirely client-side.

export type Mood =
  | "chill"
  | "epic"
  | "lofi"
  | "synthwave"
  | "dreamy"
  | "trap"
  | "cinematic"
  | "happy";

export interface MoodPreset {
  id: Mood;
  label: string;
  emoji: string;
  bpm: number;
  scale: number[]; // semitone offsets from root
  root: number;    // MIDI note
  waveform: OscillatorType;
  reverb: number;  // 0..1
  bass: boolean;
  drums: boolean;
  description: string;
}

export const MOODS: MoodPreset[] = [
  { id: "chill",     label: "Chill",     emoji: "🌊", bpm: 82,  scale: [0,2,3,5,7,8,10], root: 57, waveform: "sine",     reverb: 0.6, bass: true,  drums: true,  description: "Smooth, mellow, late-night vibes" },
  { id: "epic",      label: "Epic",      emoji: "⚡", bpm: 128, scale: [0,2,3,5,7,8,10], root: 50, waveform: "sawtooth", reverb: 0.4, bass: true,  drums: true,  description: "Cinematic, powerful, soaring" },
  { id: "lofi",      label: "Lo-Fi",     emoji: "📻", bpm: 74,  scale: [0,2,3,5,7,9,10], root: 55, waveform: "triangle", reverb: 0.7, bass: true,  drums: true,  description: "Dusty beats, study session" },
  { id: "synthwave", label: "Synthwave", emoji: "🌆", bpm: 110, scale: [0,2,4,7,9],      root: 52, waveform: "sawtooth", reverb: 0.5, bass: true,  drums: true,  description: "Retro neon, 80s drive" },
  { id: "dreamy",    label: "Dreamy",    emoji: "✨", bpm: 90,  scale: [0,2,4,7,9,11],   root: 60, waveform: "sine",     reverb: 0.85,bass: false, drums: false, description: "Floating, ambient, ethereal" },
  { id: "trap",      label: "Trap",      emoji: "🔥", bpm: 140, scale: [0,1,3,5,7,8,10], root: 45, waveform: "square",   reverb: 0.3, bass: true,  drums: true,  description: "Hard 808s, snappy hats" },
  { id: "cinematic", label: "Cinematic", emoji: "🎬", bpm: 96,  scale: [0,2,3,5,7,8,11], root: 48, waveform: "sawtooth", reverb: 0.7, bass: true,  drums: false, description: "Tense, dramatic, score-like" },
  { id: "happy",     label: "Happy",     emoji: "☀️", bpm: 118, scale: [0,2,4,5,7,9,11], root: 60, waveform: "triangle", reverb: 0.4, bass: true,  drums: true,  description: "Uplifting, bright, playful" },
];

const midiToFreq = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

function seededRand(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

// Hash string to int
function hash(str: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function makeImpulseResponse(ctx: OfflineAudioContext, seconds: number, decay: number) {
  const rate = ctx.sampleRate;
  const length = rate * seconds;
  const impulse = ctx.createBuffer(2, length, rate);
  for (let ch = 0; ch < 2; ch++) {
    const data = impulse.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }
  return impulse;
}

export interface RenderOptions {
  preset: MoodPreset;
  seed: string;
  bars?: number;
}

export async function renderTrack({ preset, seed, bars = 8 }: RenderOptions): Promise<Blob> {
  const sampleRate = 44100;
  const beatsPerBar = 4;
  const totalBeats = bars * beatsPerBar;
  const beatSec = 60 / preset.bpm;
  const duration = totalBeats * beatSec + 2; // tail for reverb

  const Offline: typeof OfflineAudioContext =
    (window as unknown as { OfflineAudioContext: typeof OfflineAudioContext })
      .OfflineAudioContext ||
    (window as unknown as { webkitOfflineAudioContext: typeof OfflineAudioContext })
      .webkitOfflineAudioContext;
  const ctx = new Offline(2, Math.ceil(sampleRate * duration), sampleRate);

  const master = ctx.createGain();
  master.gain.value = 0.85;

  // Reverb send
  const convolver = ctx.createConvolver();
  convolver.buffer = makeImpulseResponse(ctx, 2.2, 2.5);
  const reverbGain = ctx.createGain();
  reverbGain.gain.value = preset.reverb;
  convolver.connect(reverbGain).connect(master);
  master.connect(ctx.destination);

  const dryBus = ctx.createGain();
  dryBus.gain.value = 1;
  dryBus.connect(master);
  dryBus.connect(convolver);

  const rand = seededRand(hash(seed + preset.id));

  // Build a chord progression of 4 chords (each 2 bars)
  const degrees = [0, 5, 3, 4]; // I VI IV V style indices into scale
  const chordRoots = degrees.map(d => preset.root + preset.scale[d % preset.scale.length]);

  // PAD chords
  for (let i = 0; i < 4; i++) {
    const start = i * 2 * beatsPerBar * beatSec;
    const len = 2 * beatsPerBar * beatSec;
    const rootMidi = chordRoots[i];
    const notes = [rootMidi, rootMidi + 4, rootMidi + 7, rootMidi + 12];
    notes.forEach(n => {
      const osc = ctx.createOscillator();
      osc.type = preset.waveform;
      osc.frequency.value = midiToFreq(n);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, start);
      g.gain.linearRampToValueAtTime(0.06, start + 0.5);
      g.gain.linearRampToValueAtTime(0.05, start + len - 0.3);
      g.gain.linearRampToValueAtTime(0, start + len);
      osc.connect(g).connect(dryBus);
      osc.start(start);
      osc.stop(start + len + 0.2);
    });
  }

  // MELODY
  const melodyLen = totalBeats * 2; // 8th notes
  for (let i = 0; i < melodyLen; i++) {
    if (rand() < 0.35) continue; // rests
    const t = i * (beatSec / 2);
    const chordIdx = Math.floor(t / (2 * beatsPerBar * beatSec)) % 4;
    const root = chordRoots[chordIdx];
    const octave = rand() < 0.6 ? 12 : 24;
    const degree = preset.scale[Math.floor(rand() * preset.scale.length)];
    const note = root + octave + degree;
    const dur = beatSec / 2 * (0.6 + rand() * 0.6);
    const osc = ctx.createOscillator();
    osc.type = preset.waveform === "sawtooth" ? "triangle" : preset.waveform;
    osc.frequency.value = midiToFreq(note);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.12, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(dryBus);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  // BASS
  if (preset.bass) {
    for (let beat = 0; beat < totalBeats; beat++) {
      const t = beat * beatSec;
      const chordIdx = Math.floor(beat / (2 * beatsPerBar)) % 4;
      const note = chordRoots[chordIdx] - 12;
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.value = midiToFreq(note);
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 400;
      const g = ctx.createGain();
      const dur = beatSec * 0.9;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.22, t + 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.connect(filter).connect(g).connect(dryBus);
      osc.start(t);
      osc.stop(t + dur);
    }
  }

  // DRUMS
  if (preset.drums) {
    for (let beat = 0; beat < totalBeats; beat++) {
      const t = beat * beatSec;
      // Kick on 1,3
      if (beat % 2 === 0) {
        const osc = ctx.createOscillator();
        osc.frequency.setValueAtTime(140, t);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.15);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.9, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        osc.connect(g).connect(dryBus);
        osc.start(t); osc.stop(t + 0.22);
      }
      // Snare on 2,4
      if (beat % 2 === 1) {
        const bufferSize = sampleRate * 0.2;
        const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 4);
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = "highpass"; filter.frequency.value = 1500;
        const g = ctx.createGain();
        g.gain.value = 0.35;
        src.connect(filter).connect(g).connect(dryBus);
        src.start(t);
      }
      // Hats every 8th
      for (let s = 0; s < 2; s++) {
        const ht = t + s * (beatSec / 2);
        const len = 0.05;
        const bufferSize = Math.floor(sampleRate * len);
        const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 8);
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = "highpass"; filter.frequency.value = 6000;
        const g = ctx.createGain();
        g.gain.value = s === 1 ? 0.08 : 0.14;
        src.connect(filter).connect(g).connect(dryBus);
        src.start(ht);
      }
    }
  }

  const rendered = await ctx.startRendering();
  return audioBufferToWavBlob(rendered);
}

function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numCh = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const length = buffer.length * numCh * 2 + 44;
  const arr = new ArrayBuffer(length);
  const view = new DataView(arr);
  const writeStr = (off: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i)); };

  writeStr(0, "RIFF");
  view.setUint32(4, length - 8, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numCh, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numCh * 2, true);
  view.setUint16(32, numCh * 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, length - 44, true);

  const channels: Float32Array[] = [];
  for (let i = 0; i < numCh; i++) channels.push(buffer.getChannelData(i));

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numCh; ch++) {
      let s = Math.max(-1, Math.min(1, channels[ch][i]));
      s = s < 0 ? s * 0x8000 : s * 0x7fff;
      view.setInt16(offset, s, true);
      offset += 2;
    }
  }
  return new Blob([arr], { type: "audio/wav" });
}
