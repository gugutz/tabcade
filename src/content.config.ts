// Manifest schema. Documented for contributors in CONTRIBUTING.md; keep both in sync.
//
//   games/<developer>/developer.yaml   who made the games (one per folder)
//   games/<developer>/<game>.yaml      one file per game
//
// `npm run build` fails on any manifest that doesn't match, which is what checks a pull request.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const url = z.url({ protocol: /^https$/, error: 'must be a full https:// URL' });

export const GENRES = {
  action: 'Action', adventure: 'Adventure', arcade: 'Arcade', card: 'Card', idle: 'Idle / incremental',
  platformer: 'Platformer', puzzle: 'Puzzle', racing: 'Racing', rpg: 'RPG', sandbox: 'Sandbox',
  shooter: 'Shooter', simulation: 'Simulation', sports: 'Sports', strategy: 'Strategy',
  survivors: 'Survivors-like', 'tower-defense': 'Tower defense', exploration: 'Exploration', other: 'Other',
} as const;

export const AI_PARTS = ['code', 'art', 'audio', 'text'] as const;

// true / false, or `unknown` when nobody has checked yet.
const yesNoUnknown = z.union([z.boolean(), z.literal('unknown')]);

const developers = defineCollection({
  loader: glob({ pattern: '*/developer.yaml', base: './games', generateId: ({ entry }) => entry.split('/')[0] }),
  schema: z.strictObject({
    name: z.string().min(1).max(60),
    url: url.optional(), // homepage, itch.io profile, GitHub...
    links: z.array(url).max(5).optional(), // other profiles (Reddit, Bluesky, X...)
  }),
});

const games = defineCollection({
  loader: glob({ pattern: ['*/*.yaml', '!*/developer.yaml'], base: './games' }),
  schema: ({ image }) =>
    z.strictObject({
      title: z.string().min(1).max(80),
      play_url: url, // where "Play" goes: the developer's own site
      page_url: url.optional(), // store/info page if different (itch.io page, homepage)
      source_url: url.optional(), // original post (Reddit, Show HN, itch devlog...)
      source_code: url.optional(), // public repository, if any
      description: z.string().min(10).max(300), // 1–2 sentences, in English
      genre: z.enum(Object.keys(GENRES) as [keyof typeof GENRES]),
      tags: z.array(z.string().regex(/^[a-z0-9-]+$/, 'lowercase-with-dashes')).max(8).default([]),
      mobile: z.boolean().default(false), // only true when it really works with touch
      multiplayer: z.enum(['none', 'local', 'online']).default('none'),
      ai: z.union([z.boolean(), z.array(z.enum(AI_PARTS)).min(1)]).optional(), // omit = not stated
      ads: yesNoUnknown, // the game itself shows ads
      purchases: yesNoUnknown, // in-game purchases or paid unlocks
      needs: z.string().max(80).optional(), // what the player must bring: "Doom IWAD", "an account"...
      stage: z.string().max(20).optional(), // prototype, alpha, beta, 1.0...
      cover: image().optional(), // image next to the manifest, 16:9; yours or used with permission
      added: z.coerce.date(),
    }),
});

export const collections = { developers, games };
