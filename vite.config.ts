import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  // на GitHub Pages сайт живёт по адресу /Leks.html/
  base: command === 'build' ? '/Leks.html/' : '/',
  plugins: [react()],
  server: { port: 5173 },
}));
