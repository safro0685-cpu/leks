import { useCallback, useEffect, useRef, useState } from 'react';
import BackgroundScene from './components/BackgroundScene';
import DogCharacter, { type DogHandle, type DogState } from './components/DogCharacter';
import EffectsLayer, { type Bubble, type Flight, type Particle } from './components/EffectsLayer';
import BoneInventory from './components/BoneInventory';
import MoodBar from './components/MoodBar';
import SocialLinks from './components/SocialLinks';
import { EAT_PHRASES, LEX_POINTS, PET_PHRASES, REFILL_BONES, START_BONES } from './config';

const PET_COOLDOWN = 450;
let uid = 0;
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

function useReducedMotion() {
  const [rm, setRm] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setRm(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return rm;
}

export default function App() {
  const dog = useRef<DogHandle>(null);
  const reducedMotion = useReducedMotion();

  const [dogState, setDogState] = useState<DogState>('idle');
  const [bones, setBones] = useState(START_BONES);
  const [mood, setMood] = useState(60);
  const [moodPulse, setMoodPulse] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [bubble, setBubble] = useState<Bubble | null>(null);
  const [flight, setFlight] = useState<Flight | null>(null);
  const [ghost, setGhost] = useState<{ x: number; y: number } | null>(null);
  const [touched, setTouched] = useState(false);

  const lastPet = useRef(0);
  const stateTimers = useRef<number[]>([]);
  const bubbleTimer = useRef(0);

  // ---- Состояния Лекса: реакция → радость → покой ----
  const play = useCallback((first: DogState, firstMs: number, happyMs: number) => {
    stateTimers.current.forEach(clearTimeout);
    setDogState(first);
    stateTimers.current = [
      window.setTimeout(() => setDogState('happy'), firstMs),
      window.setTimeout(() => setDogState('idle'), firstMs + happyMs),
    ];
  }, []);

  useEffect(() => () => stateTimers.current.forEach(clearTimeout), []);

  // ---- Частицы ----
  const burst = useCallback(
    (x: number, y: number, kind: Particle['kind'], count: number) => {
      const n = reducedMotion ? Math.min(2, count) : count;
      const items: Particle[] = Array.from({ length: n }, (_, i) => ({
        id: ++uid,
        kind,
        x,
        y,
        dx: (Math.random() - 0.5) * (kind === 'crumb' ? 120 : 90),
        dy: kind === 'crumb' ? 40 + Math.random() * 50 : -(70 + Math.random() * 70),
        delay: i * (kind === 'heart' ? 70 : 20),
        size: kind === 'heart' ? 16 + Math.round(Math.random() * 10) : kind === 'crumb' ? 6 : 5,
      }));
      setParticles((p) => [...p.slice(-40), ...items]);
      const ids = new Set(items.map((i) => i.id));
      window.setTimeout(() => setParticles((p) => p.filter((it) => !ids.has(it.id))), 1600);
    },
    [reducedMotion],
  );

  const say = useCallback((text: string) => {
    const p = dog.current?.pointAt(LEX_POINTS.head.x, LEX_POINTS.head.y) ?? { x: innerWidth / 2, y: 80 };
    const x = Math.min(innerWidth - 120, Math.max(120, p.x));
    setBubble({ id: ++uid, text, x, y: Math.max(70, p.y) });
    clearTimeout(bubbleTimer.current);
    bubbleTimer.current = window.setTimeout(() => setBubble(null), 1500);
  }, []);

  const addMood = (v: number) => {
    setMood((m) => Math.min(100, m + v));
    setMoodPulse((p) => p + 1);
  };

  // ---- Поглаживание ----
  const pet = useCallback(
    (x: number, y: number) => {
      const now = performance.now();
      if (now - lastPet.current < PET_COOLDOWN || flight) return;
      lastPet.current = now;
      setTouched(true);
      play('pet', 600, 700);
      burst(x, y, 'heart', 3);
      burst(x, y, 'spark', 4);
      say(pick(PET_PHRASES));
      addMood(5);
    },
    [burst, play, say, flight],
  );

  // ---- Кормление ----
  const feedFrom = (from: { x: number; y: number }) => {
    if (bones <= 0 || flight) return;
    const to = dog.current?.pointAt(LEX_POINTS.mouth.x, LEX_POINTS.mouth.y) ?? from;
    setBones((b) => b - 1);
    setTouched(true);
    setFlight({ id: ++uid, from, to });
  };

  const onFlightEnd = useCallback(() => {
    const p = dog.current?.pointAt(LEX_POINTS.mouth.x, LEX_POINTS.mouth.y);
    setFlight(null);
    play('eat', 1000, 900);
    if (p) {
      burst(p.x, p.y, 'crumb', 8);
      window.setTimeout(() => burst(p.x - 20, p.y - 40, 'heart', 4), 350);
    }
    say(pick(EAT_PHRASES));
    addMood(15);
  }, [burst, play, say]);

  const onDrop = (pos: { x: number; y: number }) => {
    // бросили на Лекса — он ест; мимо — косточка просто остаётся в слоте
    if (dog.current?.hit(pos.x, pos.y)) feedFrom(pos);
  };

  // Настроение постепенно спадает, но не ниже 30
  useEffect(() => {
    const t = window.setInterval(() => setMood((m) => (m > 30 ? m - 1 : m)), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <main className="app">
      <BackgroundScene />

      <header className="title">
        <h1>LEX</h1>
      </header>

      <DogCharacter ref={dog} state={dogState} onPetStart={pet} onPetMove={pet} />

      <EffectsLayer
        particles={particles}
        bubble={bubble}
        flight={flight}
        ghost={ghost}
        reducedMotion={reducedMotion}
        onFlightEnd={onFlightEnd}
      />

      <p className={`hint${touched ? ' hint--hidden' : ''}`}>погладь Лекса или дай косточку</p>

      <nav className="panel" aria-label="Управление">
        <BoneInventory
          bones={bones}
          busy={!!flight}
          onFeed={feedFrom}
          onDrag={setGhost}
          onDrop={onDrop}
          onRefill={() => setBones(REFILL_BONES)}
        />
        <MoodBar mood={mood} pulse={moodPulse} />
        <SocialLinks />
      </nav>
    </main>
  );
}
