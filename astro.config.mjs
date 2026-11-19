import { defineConfig } from 'astro/config';

// Static output. Provisional workers.dev address until a domain is chosen.
export default defineConfig({
  site: 'https://tabcade.gugutz.workers.dev',
  trailingSlash: 'never',
  build: { format: 'file' },
});
