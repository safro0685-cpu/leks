// «Гав!» — синтезируется прямо в браузере (Web Audio), без звуковых файлов.

let ctx: AudioContext | null = null;
let last = 0;

function audio() {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function woof(ac: AudioContext, t: number, pitch: number) {
  const out = ac.createGain();
  out.gain.setValueAtTime(0.0001, t);
  out.gain.exponentialRampToValueAtTime(0.5, t + 0.012);
  out.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
  out.connect(ac.destination);

  const filter = ac.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1100 * pitch, t);
  filter.frequency.exponentialRampToValueAtTime(600 * pitch, t + 0.18);
  filter.Q.value = 1.4;
  filter.connect(out);

  // голос
  const osc = ac.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(330 * pitch, t);
  osc.frequency.linearRampToValueAtTime(520 * pitch, t + 0.03);
  osc.frequency.exponentialRampToValueAtTime(190 * pitch, t + 0.19);
  osc.connect(filter);
  osc.start(t);
  osc.stop(t + 0.22);

  // хрипотца
  const len = Math.floor(ac.sampleRate * 0.2);
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const noise = ac.createBufferSource();
  noise.buffer = buf;
  const ng = ac.createGain();
  ng.gain.value = 0.35;
  noise.connect(ng).connect(filter);
  noise.start(t);
}

/** Лекс гавкает. times — сколько раз подряд (1 или 2). */
export function bark(times = 1) {
  const now = performance.now();
  if (now - last < 900) return; // не гавкать на каждое движение пальца
  last = now;
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime + 0.01;
  const pitch = 0.92 + Math.random() * 0.16;
  for (let i = 0; i < times; i++) woof(ac, t + i * 0.24, pitch * (i ? 0.95 : 1));
}
