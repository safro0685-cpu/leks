import { useEffect, useRef } from 'react';

/**
 * Пиксельный вечерний пейзаж, нарисованный кодом на canvas.
 * Без собаки — Лекс живёт в отдельном слое (DogCharacter).
 */

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type RGB = [number, number, number];
const mix = (a: RGB, b: RGB, t: number): RGB => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

function draw(canvas: HTMLCanvasElement) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const cell = Math.max(7, Math.round(Math.min(vw, vh) / 70));
  const W = Math.ceil(vw / cell);
  const H = Math.ceil(vh / cell);
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const img = ctx.createImageData(W, H);
  const d = img.data;
  const r = rng(1408);
  const set = (x: number, y: number, c: RGB) => {
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    const i = (y * W + x) * 4;
    d[i] = c[0];
    d[i + 1] = c[1];
    d[i + 2] = c[2];
    d[i + 3] = 255;
  };
  const jitter = (c: RGB, amt: number): RGB => {
    const k = (r() - 0.5) * amt;
    return [c[0] + k, c[1] + k, c[2] + k * 1.4];
  };

  const horizon = Math.round(H * 0.6);
  const grassEnd = Math.round(H * 0.7);

  // Небо
  const skyTop: RGB = [8, 34, 150];
  const skyMid: RGB = [18, 70, 230];
  const skyLow: RGB = [26, 60, 190];
  for (let y = 0; y < horizon; y++) {
    const t = y / horizon;
    const base = t < 0.55 ? mix(skyTop, skyMid, t / 0.55) : mix(skyMid, skyLow, (t - 0.55) / 0.45);
    for (let x = 0; x < W; x++) set(x, y, jitter(base, 14));
  }

  // Облака — мягкие пиксельные пятна
  const cloud: RGB = [54, 104, 245];
  const cloudCount = Math.max(4, Math.round(W / 22));
  for (let c = 0; c < cloudCount; c++) {
    const cx = Math.floor(r() * W);
    const cy = Math.floor(H * (0.08 + r() * 0.3));
    const len = 8 + Math.floor(r() * 18);
    for (let i = 0; i < len; i++) {
      const bx = cx + i - Math.floor(len / 2);
      const h = 1 + Math.round(Math.sin((i / len) * Math.PI) * (1 + r() * 2));
      for (let j = 0; j < h; j++) set(bx, cy - j, jitter(mix(cloud, skyMid, j * 0.18), 10));
    }
  }

  // Звёзды
  for (let s = 0; s < Math.round((W * horizon) / 520); s++) {
    const x = Math.floor(r() * W);
    const y = Math.floor(r() * horizon * 0.55);
    set(x, y, r() > 0.6 ? [255, 244, 214] : [170, 200, 255]);
  }

  // Ели: дальний и ближний ряды
  const pine = (x0: number, base: number, h: number, col: RGB) => {
    for (let j = 0; j < h; j++) {
      const y = base - j;
      const p = j / h;
      // ступенчатая крона
      const step = (j % 3) / 3;
      const half = Math.max(0, Math.round((1 - p) * h * 0.32 + step * 1.2));
      for (let x = x0 - half; x <= x0 + half; x++) set(x, y, jitter(col, 8));
    }
  };
  const farCol: RGB = [10, 26, 78];
  for (let x = -4; x < W + 4; x += 3 + Math.floor(r() * 4)) {
    pine(x, horizon + 1, Math.round(H * (0.14 + r() * 0.12)), farCol);
  }
  // заполняем низ дальнего ряда
  for (let y = horizon - Math.round(H * 0.05); y <= horizon + 1; y++)
    for (let x = 0; x < W; x++) set(x, y, jitter(farCol, 8));

  const nearCol: RGB = [8, 30, 34];
  for (let x = -6; x < W + 6; x += 5 + Math.floor(r() * 6)) {
    // в центре деревья ниже — там стоит Лекс
    const center = 1 - Math.min(1, Math.abs(x - W / 2) / (W * 0.35));
    const h = Math.round(H * (0.16 + r() * 0.16) * (1 - center * 0.55));
    pine(x, horizon + 2, h, nearCol);
  }

  // Огоньки в лесу
  for (let i = 0; i < Math.max(3, Math.round(W / 30)); i++) {
    const x = Math.floor(r() * W);
    const y = horizon - Math.floor(r() * H * 0.08);
    set(x, y, [170, 225, 255]);
  }

  // Трава с цветами
  const g1: RGB = [24, 66, 40];
  const g2: RGB = [44, 100, 52];
  for (let y = horizon + 1; y < grassEnd; y++) {
    const t = (y - horizon) / (grassEnd - horizon);
    for (let x = 0; x < W; x++) set(x, y, jitter(mix(g1, g2, t * 0.8), 18));
  }
  // травинки над линией горизонта
  for (let x = 0; x < W; x++) if (r() > 0.55) set(x, horizon, jitter(g2, 14));
  // цветы
  const flowers: RGB[] = [
    [244, 154, 190],
    [255, 214, 120],
    [236, 236, 250],
  ];
  for (let i = 0; i < Math.round(W / 6); i++) {
    const x = Math.floor(r() * W);
    const y = horizon + 2 + Math.floor(r() * (grassEnd - horizon - 3));
    set(x, y, flowers[Math.floor(r() * flowers.length)]);
  }

  // Дорога / земля
  const road: RGB = [70, 74, 98];
  const dirt: RGB = [96, 86, 82];
  for (let y = grassEnd; y < H; y++) {
    const t = (y - grassEnd) / Math.max(1, H - grassEnd);
    for (let x = 0; x < W; x++) set(x, y, jitter(mix(road, dirt, t), 22));
  }
  // светлые пятна-отблески на дороге
  for (let i = 0; i < Math.round(W / 8); i++) {
    const x = Math.floor(r() * W);
    const y = grassEnd + 1 + Math.floor(r() * (H - grassEnd - 1));
    const len = 2 + Math.floor(r() * 4);
    for (let k = 0; k < len; k++) set(x + k, y, jitter([120, 126, 150], 10));
  }

  ctx.putImageData(img, 0, 0);
}

export default function BackgroundScene() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    draw(canvas);
    let t = 0;
    const onResize = () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => draw(canvas), 120);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.clearTimeout(t);
    };
  }, []);

  return (
    <div className="scene" aria-hidden="true">
      <canvas ref={ref} className="scene__canvas" />
      <div className="scene__glow" />
      <Fireflies />
    </div>
  );
}

const FLIES = Array.from({ length: 16 }, (_, i) => {
  const r = rng(77 + i * 13);
  return {
    left: r() * 100,
    top: 35 + r() * 45,
    delay: -r() * 8,
    dur: 6 + r() * 6,
    size: r() > 0.7 ? 6 : 4,
  };
});

function Fireflies() {
  return (
    <div className="fireflies">
      {FLIES.map((f, i) => (
        <span
          key={i}
          className="firefly"
          style={{
            left: `${f.left}%`,
            top: `${f.top}%`,
            width: f.size,
            height: f.size,
            animationDelay: `${f.delay}s, ${f.delay * 0.7}s`,
            animationDuration: `${f.dur}s, ${f.dur * 0.45}s`,
          }}
        />
      ))}
    </div>
  );
}
