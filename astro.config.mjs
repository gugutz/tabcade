import { defineConfig } from 'astro/config';

// Static output. Domain not chosen yet: update `site` and wrangler.jsonc when it is.
export default defineConfig({
  site: 'https://example.com',
  trailingSlash: 'never',
  build: { format: 'file' },
});
