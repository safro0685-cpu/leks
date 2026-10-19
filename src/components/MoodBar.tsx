import PixelHeart from './PixelHeart';

/** Настроение 0..100 — пять сердечек как полоска здоровья в Minecraft */
export default function MoodBar({ mood, pulse }: { mood: number; pulse: number }) {
  const halves = Math.round(mood / 10); // 0..10
  return (
    <div className="mood" role="meter" aria-label="Настроение Лекса" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(mood)}>
      <div key={pulse} className="mood__hearts">
        {Array.from({ length: 5 }, (_, i) => {
          const v = halves - i * 2;
          return <PixelHeart key={i} size={20} fill={v >= 2 ? 'full' : v === 1 ? 'half' : 'empty'} />;
        })}
      </div>
    </div>
  );
}
