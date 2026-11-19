# Indie Web Games (working title)

A free catalog of indie browser games: small web games that get posted on Reddit and elsewhere and vanish from the feed. No ads, no login, no cookies. Every game is credited to its developer and "Play" always opens the developer's own site.

**Add your games:** each game is a YAML file in `games/<your-name>/`. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Run locally

```bash
npm install
npm run dev     # http://localhost:4321
npm run build   # validates every manifest and builds the static site into dist/
```

Built with Astro; deployed as static assets on Cloudflare Workers.
