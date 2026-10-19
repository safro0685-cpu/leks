import { useLayoutEffect, useRef, type CSSProperties } from 'react';
import PixelHeart from './PixelHeart';
import { ASSETS } from '../config';

export interface Particle {
  id: number;
  kind: 'heart' | 'crumb' | 'spark';
  x: number;
  y: number;
  dx: number;
  dy: number;
  delay: number;
  size: number;
}

export interface Bubble {
  id: number;
  text: string;
  x: number;
  y: number;
}

export interface Flight {
  id: number;
  from: { x: number; y: number };
  to: { x: number; y: number };
}

interface Props {
  particles: Particle[];
  bubble: Bubble | null;
  flight: Flight | null;
  ghost: { x: number; y: number } | null;
  reducedMotion: boolean;
  onFlightEnd: () => void;
}

export default function EffectsLayer({ particles, bubble, flight, ghost, reducedMotion, onFlightEnd }: Props) {
  return (
    <div className="effects" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className={`particle particle--${p.kind}`}
          style={
            {
              left: p.x,
              top: p.y,
              '--dx': `${p.dx}px`,
              '--dy': `${p.dy}px`,
              animationDelay: `${p.delay}ms`,
              width: p.kind === 'heart' ? undefined : p.size,
              height: p.kind === 'heart' ? undefined : p.size,
            } as CSSProperties
          }
        >
          {p.kind === 'heart' && <PixelHeart size={p.size} />}
        </span>
      ))}

      {bubble && (
        <div key={bubble.id} className="bubble" style={{ left: bubble.x, top: bubble.y }}>
          {bubble.text}
        </div>
      )}

      {flight && <FlyingBone key={flight.id} flight={flight} reducedMotion={reducedMotion} onEnd={onFlightEnd} />}

      {ghost && <img className="bone-ghost" src={ASSETS.bone} alt="" style={{ left: ghost.x, top: ghost.y }} />}
    </div>
  );
}

function FlyingBone({ flight, reducedMotion, onEnd }: { flight: Flight; reducedMotion: boolean; onEnd: () => void }) {
  const ref = useRef<HTMLImageElement>(null);
  const endRef = useRef(onEnd);
  endRef.current = onEnd;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const { from, to } = flight;
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const lift = Math.min(180, Math.abs(dx) * 0.4 + 80);
    const frames: Keyframe[] = [];
    const steps = 12;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = from.x + dx * t;
      const y = from.y + dy * t - Math.sin(t * Math.PI) * lift;
      frames.push({
        transform: `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${t * 540}deg) scale(${1 - t * 0.35})`,
        opacity: t > 0.92 ? 0 : 1,
      });
    }
    const anim = el.animate(frames, { duration: reducedMotion ? 200 : 650, easing: 'cubic-bezier(.35,.1,.45,1)', fill: 'forwards' });
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      endRef.current();
    };
    anim.onfinish = finish;
    return () => {
      anim.onfinish = null;
      anim.cancel();
    };
  }, [flight, reducedMotion]);

  return <img ref={ref} className="bone-flying" src={ASSETS.bone} alt="" />;
}
