import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type PointerEvent } from 'react';
import { ASSETS } from '../config';

export type DogState = 'idle' | 'pet' | 'eat' | 'happy';

export interface DogHandle {
  /** Точка на изображении в координатах экрана (fx, fy — доли 0..1) */
  pointAt: (fx: number, fy: number) => { x: number; y: number };
  /** Попал ли курсор в непрозрачную часть Лекса */
  hit: (x: number, y: number) => boolean;
}

interface Props {
  state: DogState;
  onPetStart: (x: number, y: number) => void;
  onPetMove: (x: number, y: number) => void;
}

/**
 * Лекс — отдельный слой поверх фона.
 * Чтобы позже добавить кадры анимации, достаточно подставить
 * другой src в зависимости от `state` (например, lex-eat.webp).
 */
const DogCharacter = forwardRef<DogHandle, Props>(function DogCharacter(
  { state, onPetStart, onPetMove },
  ref,
) {
  const imgRef = useRef<HTMLImageElement>(null);
  const mask = useRef<{ w: number; h: number; a: Uint8ClampedArray } | null>(null);
  const pressed = useRef(false);
  const [src, setSrc] = useState(ASSETS.lex);

  // Маска прозрачности: гладить можно только самого Лекса, а не пустоту вокруг
  const buildMask = () => {
    const img = imgRef.current;
    if (!img || !img.naturalWidth) return;
    const w = 160;
    const h = Math.round((w * img.naturalHeight) / img.naturalWidth);
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    ctx.drawImage(img, 0, 0, w, h);
    try {
      mask.current = { w, h, a: ctx.getImageData(0, 0, w, h).data };
    } catch {
      mask.current = null; // без маски — просто прямоугольник
    }
  };

  useEffect(() => {
    if (imgRef.current?.complete) buildMask();
  }, []);

  useImperativeHandle(ref, () => ({
    pointAt(fx, fy) {
      const r = imgRef.current?.getBoundingClientRect();
      if (!r) return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      return { x: r.left + r.width * fx, y: r.top + r.height * fy };
    },
    hit(x, y) {
      const r = imgRef.current?.getBoundingClientRect();
      if (!r) return false;
      const fx = (x - r.left) / r.width;
      const fy = (y - r.top) / r.height;
      if (fx < 0 || fy < 0 || fx > 1 || fy > 1) return false;
      const m = mask.current;
      if (!m) return true;
      const px = Math.min(m.w - 1, Math.floor(fx * m.w));
      const py = Math.min(m.h - 1, Math.floor(fy * m.h));
      return m.a[(py * m.w + px) * 4 + 3] > 40;
    },
  }));

  const isOnDog = (e: PointerEvent) => {
    const r = imgRef.current?.getBoundingClientRect();
    if (!r) return false;
    const m = mask.current;
    const fx = (e.clientX - r.left) / r.width;
    const fy = (e.clientY - r.top) / r.height;
    if (!m) return true;
    const px = Math.max(0, Math.min(m.w - 1, Math.floor(fx * m.w)));
    const py = Math.max(0, Math.min(m.h - 1, Math.floor(fy * m.h)));
    return m.a[(py * m.w + px) * 4 + 3] > 40;
  };

  return (
    <div className="dog">
      <div className="dog__glow" />
      <div className={`dog__body dog__body--${state}`}>
        <img
          ref={imgRef}
          src={src}
          alt="Лекс — рыже-белый стаффорд с высунутым языком"
          className="dog__img"
          draggable={false}
          onLoad={buildMask}
          onError={() => src !== ASSETS.lexFallback && setSrc(ASSETS.lexFallback)}
          onPointerDown={(e) => {
            pressed.current = true;
            if (isOnDog(e)) onPetStart(e.clientX, e.clientY);
          }}
          onPointerMove={(e) => {
            if (pressed.current && isOnDog(e)) onPetMove(e.clientX, e.clientY);
          }}
          onPointerUp={() => (pressed.current = false)}
          onPointerLeave={() => (pressed.current = false)}
          onPointerCancel={() => (pressed.current = false)}
        />
      </div>
    </div>
  );
});

export default DogCharacter;
