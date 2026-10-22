import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Relative assets work at both a Vercel root and a GitHub Pages repository path.
  base: './',
});
