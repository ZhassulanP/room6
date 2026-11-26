import { readFile, writeFile, mkdir, rm, cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');
await rm(new URL('dist/', root), { recursive: true, force: true });
await mkdir(new URL('dist/server/', root), { recursive: true });
await mkdir(new URL('dist/.openai/', root), { recursive: true });
const assets = {};
for (const [path, name, type] of [['/', 'index.html', 'text/html; charset=utf-8'], ['/app.js', 'app.js', 'text/javascript; charset=utf-8'], ['/bughouse.js', 'bughouse.js', 'text/javascript; charset=utf-8'], ['/chess-pieces.svg', 'chess-pieces.svg', 'image/svg+xml'], ['/theme.js', 'theme.js', 'text/javascript; charset=utf-8'], ['/i18n.js', 'i18n.js', 'text/javascript; charset=utf-8'], ['/scoreboard.js', 'scoreboard.js', 'text/javascript; charset=utf-8'], ['/style.css', 'style.css', 'text/css; charset=utf-8'], ['/favicon.svg', 'favicon.svg', 'image/svg+xml']]) assets[path] = { body: await read('public/' + name), type };
const source = `import { api } from './src/api.js';\nconst assets = ${JSON.stringify(assets)};\n
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
      if (!env.DB) return Response.json({error:'Хранилище комнат ещё не подключено.'},{status:503});
      const store = {
        async create(room) { const result = await env.DB.prepare("INSERT INTO rooms(code,version,updated,data) VALUES(?,0,?,?) ON CONFLICT(code) DO UPDATE SET version=rooms.version+1,updated=excluded.updated,data=excluded.data WHERE (json_array_length(rooms.data,'$.players')=0 AND COALESCE(json_array_length(rooms.data,'$.departed'),0)=0) OR rooms.updated < ?").bind(room.code,Date.now(),JSON.stringify(room),Date.now()-7*86400000).run(); return result.meta.changes === 1; },
        async get(code) { const row = await env.DB.prepare('SELECT * FROM rooms WHERE code=?').bind(code).first(); return row && {room:JSON.parse(row.data),version:row.version,updated:row.updated}; },
        async save(room, version, now) { const result = await env.DB.prepare('UPDATE rooms SET data=?,version=version+1,updated=? WHERE code=? AND version=?').bind(JSON.stringify(room),now,room.code,version).run(); return result.meta.changes === 1; }
      };
      return api(request,store);
    }
    const asset = assets[url.pathname];
    if (!asset) return new Response('Not found',{status:404});
    return new Response(asset.body,{headers:{'Content-Type':asset.type,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin','Content-Security-Policy':"default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'self'"}});
  }
};`;
const { outputFiles } = await build({
  stdin: { contents: source, resolveDir: fileURLToPath(root) },
  bundle: true, format: 'esm', write: false,
  banner: { js: `/*\n${await read('node_modules/chess.js/LICENSE')}*/` }
});
const worker = outputFiles[0].text;
await writeFile(new URL('dist/server/index.js', root), worker);
await cp(new URL('.openai/hosting.json', root), new URL('dist/.openai/hosting.json', root));
await cp(new URL('drizzle/', root), new URL('dist/.openai/drizzle/', root), { recursive: true });
const module = await import(`data:text/javascript;base64,${Buffer.from(worker).toString('base64')}`);
if (typeof module.default.fetch !== 'function') throw new Error('Invalid Worker');
const response = await module.default.fetch(new Request('http://localhost/'), {});
if (response.status !== 200 || !(await response.text()).includes('<title>Room6</title>')) throw new Error('Invalid page');
console.log('Built and verified Worker + D1 migrations in dist/');
