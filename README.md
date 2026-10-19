# Lex — My Best Boy 🐕

## Запуск на localhost

Нужен Node.js 18+ (https://nodejs.org).

```bash
npm install
npm run dev
```

Откроется http://localhost:5173

## Где что лежит

- `public/assets/lex.webp` (+ `lex.png`) — Лекс на прозрачном фоне
- `public/assets/bone.png` — пиксельная косточка 16×16
- Фон рисуется кодом: `src/components/BackgroundScene.tsx`
- Ссылки, фразы, число косточек: `src/config.ts`

Если заменишь фото Лекса — поправь в `src/config.ts` точку рта (`LEX_POINTS.mouth`), куда летит косточка.

## Публикация

```bash
npm run build
```

Готовый сайт появится в папке `dist/` — её содержимое можно залить на любой хостинг (Timeweb, Netlify, Vercel, GitHub Pages).
