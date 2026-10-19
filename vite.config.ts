import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // относительные пути — сайт работает по любому адресу (GitHub Pages, хостинг, подпапка)
  base: './',
  plugins: [react()],
  server: { port: 5173 },
});
