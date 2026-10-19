// «Гав!» — настоящий лай из public/assets/bark.mp3

const URL = `${import.meta.env.BASE_URL}assets/bark.mp3`;

let ctx: AudioContext | null = null;
let buffer: AudioBuffer | null = null;
let loading: Promise<void> | null = null;
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

function load(ac: AudioContext) {
  if (!loading) {
    loading = fetch(URL)
      .then((r) => r.arrayBuffer())
      .then((data) => ac.decodeAudioData(data))
      .then((b) => {
        buffer = b;
      })
      .catch(() => {
        loading = null;
      });
  }
  return loading;
}

function play(ac: AudioContext, at: number, rate: number) {
  if (!buffer) return;
  const src = ac.createBufferSource();
  src.buffer = buffer;
  src.playbackRate.value = rate;
  const g = ac.createGain();
  g.gain.value = 0.8;
  src.connect(g).connect(ac.destination);
  src.start(at);
}

/** Лекс гавкает. times — сколько раз подряд (1 или 2). */
export function bark(times = 1) {
  const now = performance.now();
  if (now - last < 900) return; // не гавкать на каждое движение пальца
  last = now;
  const ac = audio();
  if (!ac) return;
  const go = () => {
    const t = ac.currentTime + 0.01;
    const rate = 0.95 + Math.random() * 0.1; // чуть разный голос каждый раз
    for (let i = 0; i < times; i++) play(ac, t + i * 0.36, rate * (i ? 0.97 : 1));
  };
  if (buffer) go();
  else void load(ac).then(go);
}

// Подгружаем звук заранее, при первом касании страницы
window.addEventListener(
  'pointerdown',
  () => {
    const ac = audio();
    if (ac) void load(ac);
  },
  { once: true },
);
