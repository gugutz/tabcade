// Show HN scanner: adds new browser games from Hacker News "Show HN" posts as manifests in games/.
// Runs daily from .github/workflows/scan-hn.yml (or by hand: node scripts/scan-hn.mjs [days]).
// Source: the public HN search API by Algolia (hn.algolia.com/api). One search + one request per candidate site.
// Every HN id it looks at goes into scripts/hn-seen.txt, so a game you delete is never re-added.
// Prints a Markdown summary of what it added (used as the commit message body).
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';

const UA = 'tabcade-scanner/1.0 (+https://github.com/gugutz/tabcade)';
const DAYS = Number(process.argv[2] || 3);
const SEEN = 'scripts/hn-seen.txt';
const today = new Date().toISOString().slice(0, 10);

// A game title, and not a tool/engine/store page about games.
const IS_GAME = /\bgames?\b/i;
const NOT_GAME = /\b(engine|sdk|library|framework|language|ide|compiler|effects|asset|tool(kit)?s?|sell|marketplace|store|shop|setup|launcher|emulator|calendar|games like|for (ios|android|pixi|phaser|unity|godot))\b|\bios\b|\bandroid\b|roblox|steam/i;
// Hosts where the link is not a playable web page.
const BAD_HOST = /(^|\.)(github\.com|gitlab\.com|steampowered\.com|roblox\.com|apple\.com|play\.google\.com|youtube\.com|youtu\.be|itch\.io)$/;
const AI_HINT = /vibe[- ]?coded|claude code|(made|built|created|written|coded) (entirely )?(with|using|by) (ai|claude|cursor|codex|chatgpt|gpt|gemini|copilot|an llm)|with the help of (ai|claude|chatgpt)|directing claude/i;
const GENRE_HINTS = [
  ['tower-defense', /tower defen[cs]e/i], ['survivors', /survivors/i], ['idle', /\b(idle|incremental|clicker)\b/i],
  ['racing', /\b(racing|racer|race|rally|driving|kart)\b/i], ['shooter', /\b(shooter|fps|shoot)\b/i],
  ['platformer', /platformer/i], ['rpg', /\b(rpg|roguelike|roguelite|dungeon)\b/i], ['card', /\b(card|deck|solitaire|poker)\b/i],
  ['strategy', /\b(strategy|chess|battleship|4x|tactics|go game)\b/i], ['sports', /\b(football|soccer|golf|tennis|curling|basketball|sports?)\b/i],
  ['simulation', /\b(sim|simulat\w+|tycoon|manager)\b/i], ['puzzle', /\b(puzzle|word|wordle|sudoku|logic|daily|guess)\b/i],
  ['sandbox', /sandbox/i], ['adventure', /\b(adventure|escape room|story)\b/i],
];

const slug = (s) => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'game';
const norm = (u) => u.replace(/[#?].*$/, '').replace(/\/+$/, '').toLowerCase();
const clean = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const meta = (html, name) =>
  html.match(new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']*)`, 'i'))?.[1] ??
  html.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:name|property)=["']${name}["']`, 'i'))?.[1];
const cut = (s, n) => (s.length <= n ? s : s.slice(0, s.lastIndexOf(' ', n - 1)) + '…');

// Everything already in the catalog, by play_url and by HN id in source_url.
const listed = new Set();
for (const dev of readdirSync('games')) {
  for (const f of readdirSync(`games/${dev}`).filter((f) => f.endsWith('.yaml') && f !== 'developer.yaml')) {
    const y = readFileSync(`games/${dev}/${f}`, 'utf8');
    const play = y.match(/^play_url:\s*(\S+)/m)?.[1];
    if (play) listed.add(norm(play));
    const hn = y.match(/news\.ycombinator\.com\/item\?id=(\d+)/)?.[1];
    if (hn) listed.add(hn);
  }
}
const seen = new Set(existsSync(SEEN) ? readFileSync(SEEN, 'utf8').split(/\s+/).filter(Boolean) : []);

const since = Math.floor(Date.now() / 1000) - DAYS * 86400;
const api = `https://hn.algolia.com/api/v1/search_by_date?tags=show_hn&query=game&hitsPerPage=200&numericFilters=created_at_i%3E${since}`;
const { hits } = await (await fetch(api, { headers: { 'user-agent': UA } })).json();

const added = [];
for (const h of hits.reverse()) {
  const id = h.objectID;
  if (seen.has(id) || listed.has(id)) continue;
  seen.add(id);
  const title = clean(h.title.replace(/^Show HN:\s*/i, ''));
  if (!h.url || !h.url.startsWith('https://') || !IS_GAME.test(title) || NOT_GAME.test(title)) continue;
  const url = new URL(h.url);
  if (BAD_HOST.test(url.hostname) || listed.has(norm(h.url))) continue;

  let html;
  try {
    const r = await fetch(h.url, { headers: { 'user-agent': UA }, redirect: 'follow', signal: AbortSignal.timeout(15000) });
    if (!r.ok || !(r.headers.get('content-type') || '').includes('text/html')) continue;
    html = await r.text();
  } catch { continue; }
  if (/<meta[^>]+name=["']robots["'][^>]+noindex/i.test(html)) continue;

  // Name: first part of the page's own title ("Lava Puzzle – Daily Puzzle Game" -> "Lava Puzzle"),
  // else of the HN title ("Name – what it is" / "Name: ..." / "Name, a ...").
  const first = (t) => clean(t || '').split(/\s+[–—|·-]\s+|:\s+|,\s+(?:an?|the)\s+/i)[0].trim();
  const pageName = first(meta(html, 'og:title') || html.match(/<title[^>]*>([^<]*)/i)?.[1]);
  const name = cut(pageName.length >= 2 && pageName.length <= 40 ? pageName : first(title), 80);
  const pageText = clean(meta(html, 'og:description') || meta(html, 'description') || '');
  const story = clean(h.story_text || '');
  let description = cut(pageText.length >= 10 ? pageText : title, 300);
  if (description.length < 10) description = `${name}, a browser game.`;
  const genre = GENRE_HINTS.find(([, re]) => re.test(`${title} ${pageText}`))?.[0] ?? 'other';
  const ads = /adsbygoogle|googlesyndication|adinplay|venatus|cpmstar/i.test(html) ? 'true' : 'unknown';
  const ai = AI_HINT.test(`${title} ${pageText} ${story}`);

  const dev = slug(h.author);
  if (!existsSync(`games/${dev}`)) {
    mkdirSync(`games/${dev}`, { recursive: true });
    writeFileSync(`games/${dev}/developer.yaml`, `name: ${JSON.stringify(h.author)}\nlinks:\n  - https://news.ycombinator.com/user?id=${h.author}\n`);
  }
  let file = slug(name);
  while (existsSync(`games/${dev}/${file}.yaml`)) file += '-2';
  writeFileSync(`games/${dev}/${file}.yaml`, [
    `# Added automatically from Show HN by scripts/scan-hn.mjs. Genre, ai, ads and mobile are guesses: fix or delete freely.`,
    `title: ${JSON.stringify(name)}`,
    `play_url: ${h.url}`,
    `source_url: https://news.ycombinator.com/item?id=${id}`,
    `description: ${JSON.stringify(description)}`,
    `genre: ${genre}`,
    ...(ai ? ['ai: true'] : []),
    `ads: ${ads}`,
    `purchases: unknown`,
    `added: ${today}`,
    '',
  ].join('\n'));
  listed.add(norm(h.url));
  added.push(`- [${name}](${h.url}) by ${h.author} ([HN](https://news.ycombinator.com/item?id=${id}), ${h.points} points) → \`games/${dev}/${file}.yaml\``);
}

writeFileSync(SEEN, [...seen].sort().join('\n') + '\n');
console.log(added.length ? added.join('\n') : '');
