// Library sync. The browser makes a random key and keeps it in the URL fragment of its secret link
// (#k=...), so the key never reaches logs or Referer headers. The server stores only sha256(key).
//   GET /api/library/<key>  -> { ids: [...] }   (empty list if unknown)
//   PUT /api/library/<key>  body { ids: [...] } -> 204
// ponytail: no rate limiting yet; add a Workers rate-limit binding if someone starts filling the DB.
const KEY = /^[A-Za-z0-9_-]{22,64}$/;
const ID = /^[a-z0-9-]{1,60}\/[a-z0-9-]{1,80}$/;
const MAX_IDS = 500;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

const hash = async (key) =>
  [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(key)))]
    .map((b) => b.toString(16).padStart(2, '0')).join('');

export default {
  async fetch(request, env) {
    const m = new URL(request.url).pathname.match(/^\/api\/library\/([^/]+)$/);
    if (!m) return json({ error: 'not found' }, 404);
    if (!KEY.test(m[1])) return json({ error: 'bad key' }, 400);
    const keyHash = await hash(m[1]);

    if (request.method === 'GET') {
      const row = await env.DB.prepare('SELECT ids FROM libraries WHERE key_hash = ?').bind(keyHash).first();
      return json({ ids: row ? JSON.parse(row.ids) : [] });
    }
    if (request.method === 'PUT') {
      const text = await request.text();
      if (text.length > 60_000) return json({ error: 'too large' }, 413);
      let ids;
      try { ids = JSON.parse(text).ids; } catch { return json({ error: 'bad json' }, 400); }
      if (!Array.isArray(ids) || ids.length > MAX_IDS || !ids.every((id) => typeof id === 'string' && ID.test(id)))
        return json({ error: 'ids must be a list of up to 500 "developer/game" ids' }, 400);
      await env.DB.prepare(
        'INSERT INTO libraries (key_hash, ids, updated_at) VALUES (?1, ?2, ?3) ON CONFLICT(key_hash) DO UPDATE SET ids = ?2, updated_at = ?3',
      ).bind(keyHash, JSON.stringify([...new Set(ids)]), Date.now()).run();
      return new Response(null, { status: 204 });
    }
    return json({ error: 'method not allowed' }, 405);
  },
};
