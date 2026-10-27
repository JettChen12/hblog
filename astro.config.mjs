import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { site } from './src/config';
import { shikiThemes } from './src/theme';

export default defineConfig({
  site: site.url,
  trailingSlash: 'always',
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      themes: { light: shikiThemes.light, dark: shikiThemes.dark },
      wrap: true,
    },
  },
});
