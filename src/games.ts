import { getCollection } from 'astro:content';
import { GENRES } from './content.config';

// Site name lives here only; the domain lives in astro.config.mjs and public/robots.txt.
export const SITE_NAME = 'Indie Web Games'; // placeholder until a name is chosen

const devs = new Map((await getCollection('developers')).map((d) => [d.id, d.data]));

export const games = (await getCollection('games'))
  .map(({ id, data }) => {
    const devId = id.split('/')[0];
    const dev = devs.get(devId);
    // A pull request that adds games must also add games/<developer>/developer.yaml.
    if (!dev) throw new Error(`games/${devId}/developer.yaml is missing (needed by games/${id}.yaml)`);
    return { ...data, id, devId, dev, genreLabel: GENRES[data.genre] };
  })
  .sort((a, b) => +b.added - +a.added || a.title.localeCompare(b.title));

export type Game = (typeof games)[number];

// Same game submitted twice (by different people, or under two folders).
const seen = new Map<string, string>();
for (const g of games) {
  const key = g.play_url.replace(/\/+$/, '').toLowerCase();
  if (seen.has(key)) throw new Error(`games/${g.id}.yaml and games/${seen.get(key)}.yaml have the same play_url`);
  seen.set(key, g.id);
}

export const developers = [...devs].map(([id, data]) => ({ id, ...data }));
export const genres = [...new Set(games.map((g) => g.genre))].sort().map((id) => [id, GENRES[id]] as const);

export const isAi = (g: Game) => g.ai === true || Array.isArray(g.ai);

// Text the catalog search matches against.
export const searchText = (g: Game) =>
  [g.title, g.dev.name, g.devId, g.genreLabel, g.description, ...g.tags].join(' ').toLowerCase();

export const sourceLabel = (url: string) => {
  const sub = url.match(/reddit\.com\/r\/([^/]+)/i);
  if (sub) return `r/${sub[1]}`;
  const host = new URL(url).hostname.replace(/^www\./, '');
  return host === 'news.ycombinator.com' ? 'Hacker News' : host;
};

export const yesNo = (v: boolean | 'unknown') => (v === 'unknown' ? 'Not checked yet' : v ? 'Yes' : 'No');
