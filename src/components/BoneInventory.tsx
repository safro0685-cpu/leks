import { useRef } from 'react';
import { ASSETS } from '../config';

interface Props {
  bones: number;
  busy: boolean;
  onFeed: (from: { x: number; y: number }) => void;
  onDrag: (pos: { x: number; y: number } | null) => void;
  onDrop: (pos: { x: number; y: number }) => void;
  onRefill: () => void;
}

/** Слот с косточками: клик — бросить Лексу, перетаскивание — донести самому */
export default function BoneInventory({ bones, busy, onFeed, onDrag, onDrop, onRefill }: Props) {
  const start = useRef<{ x: number; y: number; id: number } | null>(null);
  const dragging = useRef(false);

  if (bones <= 0) {
    return (
      <button key="refill" className="slot slot--refill" onClick={onRefill} title="Получить ещё 5 косточек">
        <img src={ASSETS.bone} alt="" className="slot__bone slot__bone--dim" draggable={false} />
        <span className="slot__plus">+5</span>
      </button>
    );
  }

  const centerOf = (el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };

  return (
    <button
      key="bone"
      className={`slot slot--bone${busy ? ' is-busy' : ''}`}
      title="Нажми или перетащи косточку к Лексу"
      aria-label={`Дать косточку. Осталось ${bones}`}
      onPointerDown={(e) => {
        if (busy) return;
        start.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
        dragging.current = false;
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        const s = start.current;
        if (!s || s.id !== e.pointerId) return;
        if (!dragging.current && Math.hypot(e.clientX - s.x, e.clientY - s.y) > 8) dragging.current = true;
        if (dragging.current) onDrag({ x: e.clientX, y: e.clientY });
      }}
      onPointerUp={(e) => {
        const s = start.current;
        start.current = null;
        if (!s) return;
        if (dragging.current) {
          dragging.current = false;
          onDrag(null);
          onDrop({ x: e.clientX, y: e.clientY });
        } else {
          onFeed(centerOf(e.currentTarget));
        }
      }}
      onPointerCancel={() => {
        start.current = null;
        dragging.current = false;
        onDrag(null);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (!busy) onFeed(centerOf(e.currentTarget));
        }
      }}
    >
      <img src={ASSETS.bone} alt="" className="slot__bone" draggable={false} />
      <span className="slot__count">{bones}</span>
    </button>
  );
}
