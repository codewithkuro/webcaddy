// @ts-check
import { defineConfig } from 'astro/config';
// @ts-check
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    assets: 'systemassets'
  }
});
