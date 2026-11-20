import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { DatabaseSync } from 'node:sqlite';
import { mock } from 'node:test';
let gameTime = Date.now();
mock.method(Date, 'now', () => gameTime);

// Exercise the actual deployment artifact against SQLite with the D1 interface.
const source = await readFile(new URL('../dist/server/index.js', import.meta.url), 'utf8');
const worker = (await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)).default;
const db = new DatabaseSync(':memory:');
db.exec(await readFile(new URL('../drizzle/0000_rooms.sql', import.meta.url), 'utf8'));
const DB = {
  prepare(sql) {
    return {
      bind(...values) {
        return {
          async first() { return db.prepare(sql).get(...values); },
          async run() { return { meta: { changes: Number(db.prepare(sql).run(...values).changes) } }; }
        };
      }
    };
  }
};
async function request(path, body, token, status = 200) {
  const response = await worker.fetch(new Request('https://word-mine.test' + path, {
    method: body ? 'POST' : 'GET',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    ...(body && { body: JSON.stringify(body) })
  }), { DB });
  const result = await response.json();
  assert.equal(response.status, status, JSON.stringify(result));
  return result;
}
try {
  const page = await worker.fetch(new Request('https://word-mine.test/'), { DB });
  const html = await page.text();
  assert.match(html, /<title>Word Mine & Spy<\/title>/);
  assert.match(html, /data-language="kk"[^>]*>ҚҚ<\/button>/);
  const host = await request('/api/rooms', { name: 'Host', settings: { useDefaultWords: false, customWords: 'Самолёт' } }, null, 201);
  assert.match(host.room.code, /^[0-9]{6}$/);
  const base = '/api/rooms/' + host.room.code;
  const clients = [
    { ...host, name: 'Host' },
    { ...await request(base + '/join', { name: 'Guest One' }), name: 'Guest One' },
    { ...await request(base + '/join', { name: 'Guest Two' }), name: 'Guest Two' }
  ];
  const started = await request(base + '/action', { action: 'start' }, host.token);
  const { explainerId, guesserId } = started.room.round;
  const guesser = clients.find(client => client.room.me === guesserId);
  const miner = clients.find(client => ![explainerId, guesserId].includes(client.room.me));
  assert.equal(started.room.round.deadline - started.room.serverNow, 60000);
  await request(base + '/action', { action: 'mine', data: { word: 'два  слова' } }, miner.token);
  const placed = await request(base, null, miner.token);
  assert.equal(placed.room.phase, 'mining');
  const replaced = await request(base + '/action', { action: 'mine', data: { word: 'новая мина' } }, miner.token);
  assert.equal(replaced.room.round.myMine, 'новая мина');
  assert.equal(replaced.room.round.deadline, started.room.round.deadline);
  gameTime = started.room.round.deadline;
  const hidden = await request(base, null, guesser.token);
  assert.equal(hidden.room.round.word, null); assert.equal(hidden.room.round.mines, null);
  assert.equal(hidden.room.round.deadline, null);
  const result = await request(base + '/action', { action: 'guess', data: { word: 'СаМоЛеТ' } }, guesser.token);
  assert.equal(result.room.phase, 'result'); assert.equal(result.room.players.find(p => p.id === guesserId).score, 1);
  const recovered = await request(base + '/join', { name: guesser.name.toUpperCase() });
  assert.equal(recovered.rejoined, true); assert.equal(recovered.room.me, guesser.room.me);
  assert.equal(recovered.room.players.length, 3); assert.equal(recovered.room.players.find(p => p.id === guesserId).score, 1);
  await request(base, null, guesser.token, 401);
  for (const client of clients) await request(base + '/action', { action: 'leave' }, client === guesser ? recovered.token : client.token);
  const returned = await request(base + '/join', { name: 'HOST' });
  assert.equal(returned.room.me, host.room.me); assert.equal(returned.room.hostId, host.room.me);
  assert.equal(returned.room.players[0].score, Number([explainerId, guesserId].includes(host.room.me)));
  console.log('Cloudflare artifact verified: password-free rooms, D1 queries, roles, mines, answers, scores and nickname recovery.');
} finally { db.close(); mock.restoreAll(); }
