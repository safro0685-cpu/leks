import type { ReactElement } from 'react';
const ROWS = ['.##.##.', '#######', '#######', '.#####.', '..###..', '...#...'];

interface Props {
  size?: number;
  fill?: 'full' | 'half' | 'empty';
  className?: string;
}

/** Пиксельное сердечко 7×6 */
export default function PixelHeart({ size = 18, fill = 'full', className }: Props) {
  const rects: ReactElement[] = [];
  ROWS.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      if (ch !== '#') return;
      const on = fill === 'full' || (fill === 'half' && x < 4);
      rects.push(
        <rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} fill={on ? 'var(--heart)' : 'var(--heart-empty)'} />,
      );
    }),
  );
  return (
    <svg
      className={className}
      width={size}
      height={(size * 6) / 7}
      viewBox="0 0 7 6"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {rects}
      {fill !== 'empty' && <rect x={1} y={1} width={1} height={1} fill="#ffd0dc" />}
    </svg>
  );
}
