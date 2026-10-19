// Всё, что можно настроить, — здесь.

export const LINKS = {
  telegram: 'https://t.me/furunkul_leks1',
  tiktok: 'https://www.tiktok.com/@staffleksys?_r=1&_t=ZS-9Agq073QJ9O',
};

const BASE = import.meta.env.BASE_URL; // '/' локально, '/Leks.html/' на GitHub Pages

export const ASSETS = {
  lex: `${BASE}assets/lex.webp`,
  lexFallback: `${BASE}assets/lex.png`,
  bone: `${BASE}assets/bone.png`,
};

// Точки на картинке Лекса (доли от ширины/высоты изображения)
export const LEX_POINTS = {
  mouth: { x: 0.7, y: 0.5 }, // куда летит косточка
  head: { x: 0.5, y: 0.04 }, // над чем появляется облачко с фразой
};

export const START_BONES = 5;
export const REFILL_BONES = 5;

export const PET_PHRASES = ['Хороший мальчик!', 'Гав!', 'Лексу приятно', 'Ещё погладь :3'];
export const EAT_PHRASES = ['Ням-ням!', 'Вкуснятина!', 'Гав! Спасибо!', 'Ещё косточку?'];
