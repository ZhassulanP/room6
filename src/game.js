import { DICTIONARIES, SPY_WORDS } from './words.js';

const WORD_MINE_SCHEDULE_VERSION = 1;

export class GameError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}
export const normalize = value => String(value ?? '').trim().toLocaleLowerCase('ru').replaceAll('ё', 'е');
const requireThat = (condition, message, status) => { if (!condition) throw new GameError(message, status); };
const integer = (value, min, max, label) => {
  const n = Number(value);
  requireThat(Number.isSafeInteger(n) && n >= min && n <= max, `${label}: от ${min} до ${max}.`);
  return n;
};
export function settings(input = {}, count = 0) {
  const game = input.game ?? 'wordmine';
  requireThat(['wordmine', 'spy'].includes(game), 'Неизвестная игра.');
  const wordLanguage = input.wordLanguage ?? 'ru';
  requireThat(Object.hasOwn(DICTIONARIES, wordLanguage), 'Неизвестный язык словаря.');
  const capacity = input.capacity === '' || input.capacity == null || input.capacity === 0 ? null : integer(input.capacity, 3, 1000000, 'Число игроков');
  requireThat(!capacity || capacity >= count, 'В комнате уже больше игроков.');
  const customWords = [...new Set(String(input.customWords || '').split(/[\n,;]/).map(w => w.trim()).filter(Boolean))];
  requireThat(customWords.length <= 1000 && customWords.every(w => w.length <= 60), 'До 1000 своих слов, каждое до 60 символов.');
  if (game === 'spy') requireThat(customWords.every(w => { const parts = w.split('|').map(v => v.trim()); return parts.length === 2 && parts.every(Boolean) && normalize(parts[0]) !== normalize(parts[1]) && !normalize(parts[1]).includes(normalize(parts[0])); }), 'Для каждого слова шпиона укажите: слово | подсказка.');
  const useDefaultWords = input.useDefaultWords !== false;
  requireThat(useDefaultWords || customWords.length > 0, 'Добавьте свои слова или включите встроенный словарь.');
  const spyCount = integer(input.spyCount ?? 1, 0, 1000000, 'Число шпионов');
  const mrWhite = input.mrWhite === true || input.mrWhite === 'on';
  if (game === 'spy') {
    requireThat(spyCount + Number(mrWhite) > 0, 'Добавьте хотя бы одного шпиона или Мистера Уайта.');
    requireThat(!capacity || spyCount + Number(mrWhite) < capacity, 'Оставьте хотя бы одно место для мирного игрока.');
  }
  return { game, spyCount, mrWhite, capacity, wordLanguage, duration: null, miningDuration: 60, cycles: integer(input.cycles ?? 1, 1, 20, 'Количество кругов'), customWords, useDefaultWords };
}
export function newPlayer(name, token) {
  name = String(name || '').trim();
  requireThat(name.length >= 1 && name.length <= 24, 'Имя должно содержать от 1 до 24 символов.');
  return { id: crypto.randomUUID(), token, name, ready: false, score: 0 };
}
export function createRoom(code, player, input, now) {
  return { code, hostId: player.id, players: [player], settings: settings(input), phase: 'lobby', turn: 0, totalTurns: 0, round: null, used: [], departed: [], progress: { [player.id]: { explained: 0, guessed: 0 } }, schedule: [], scheduleVersion: WORD_MINE_SCHEDULE_VERSION, updated: now };
}
export function joinRoom(room, player, now = Date.now()) {
  const existing = room.players.find(p => normalize(p.name) === normalize(player.name));
  if (existing) {
    tick(room, now);
    existing.token = player.token;
    room.updated = now;
    return existing;
  }
  requireThat(!room.settings.capacity || room.players.length < room.settings.capacity, 'Комната заполнена. Попросите ведущего увеличить размер.');
  tick(room, now);
  const saved = room.departed.find(entry => normalize(entry.player.name) === normalize(player.name));
  const joined = saved ? { ...saved.player, token: player.token, ready: false } : player;
  room.players.push(joined);
  room.progress[joined.id] = saved ? { ...saved.progress } : { explained: 0, guessed: 0 };
  room.departed = room.departed.filter(entry => entry.player.id !== joined.id);
  if (!room.hostId) room.hostId = joined.id;
  if (room.round) room.round.names[joined.id] = joined.name;
  if (!['lobby', 'finished'].includes(room.phase)) {
    if (room.settings.game !== 'spy') rebuildSchedule(room);
    if (room.phase === 'paused' && canStartSpy(room)) startTurn(room, now);
  }
  room.updated = now;
  return joined;
}
const activePhases = ['mining', 'explaining', 'claim'];

function shuffle(items) {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function samePair({ explainerId, guesserId }, previous) {
  return previous != null && (
    (explainerId === previous.explainerId && guesserId === previous.guesserId) ||
    (explainerId === previous.guesserId && guesserId === previous.explainerId)
  );
}

function rebuildSchedule(room) {
  if (room.settings.game === 'spy') { room.totalTurns = room.settings.cycles; return; }
  const counts = structuredClone(room.progress);
  if (room.round && activePhases.includes(room.phase)) {
    counts[room.round.explainerId].explained++;
    counts[room.round.guesserId].guessed++;
  }
  const target = room.settings.cycles;
  const ids = room.players.map(p => p.id);
  const total = id => counts[id].explained + counts[id].guessed;
  room.schedule = [];
  const addPair = pair => {
    room.schedule.push(pair);
    counts[pair.explainerId].explained++;
    counts[pair.guesserId].guessed++;
  };
  while (ids.length >= 3 && ids.some(id => counts[id].explained < target || counts[id].guessed < target)) {
    const previous = room.schedule.at(-1) ?? room.round;
    const completedCycles = counts[ids[0]].explained;
    if (ids.every(id => counts[id].explained === completedCycles && counts[id].guessed === completedCycles)) {
      // Pair each player with the next person in a shuffled ring, then shuffle the turn order.
      const order = shuffle(ids);
      const turns = shuffle(order.map((explainerId, i) => ({ explainerId, guesserId: order[(i + 1) % order.length] })));
      if (samePair(turns[0], previous)) [turns[0], turns[1]] = [turns[1], turns[0]];
      turns.forEach(addPair);
      continue;
    }

    // After roster changes, fill missing roles first and allow extra turns to balance the totals.
    // Three candidates per role leave alternatives for self-pairings and immediate rematches.
    const byRole = role => shuffle(ids).sort((a, b) => counts[a][role] - counts[b][role] || total(a) - total(b)).slice(0, 3);
    const explainers = byRole('explained'), guessers = byRole('guessed');
    const pairs = explainers.flatMap(explainerId => guessers.filter(id => id !== explainerId).map(guesserId => ({ explainerId, guesserId })));
    const explained = pair => counts[pair.explainerId].explained;
    const guessed = pair => counts[pair.guesserId].guessed;
    const deficit = pair => Number(explained(pair) < target) + Number(guessed(pair) < target);
    pairs.sort((a, b) => deficit(b) - deficit(a) ||
      (explained(a) + guessed(a)) - (explained(b) + guessed(b)) ||
      Number(samePair(a, previous)) - Number(samePair(b, previous)) ||
      (total(a.explainerId) + total(a.guesserId)) - (total(b.explainerId) + total(b.guesserId)));
    addPair(pairs[0]);
  }
  room.totalTurns = room.turn + (room.round ? 1 : 0) + room.schedule.length;
}
function ensureState(room) {
  let changed = false;
  if (!room.departed) { room.departed = []; changed = true; }
  if (!room.progress) {
    room.progress = Object.fromEntries(room.players.map(p => [p.id, { explained: 0, guessed: 0 }]));
    // Older rooms used a fixed cyclic schedule. Preserve their completed roles.
    const completed = room.phase === 'finished' ? room.turn : room.turn + Number(room.phase === 'result');
    for (let i = 0; room.players.length && i < completed; i++) {
      room.progress[room.players[i % room.players.length].id].explained++;
      room.progress[room.players[(i + 1) % room.players.length].id].guessed++;
    }
    changed = true;
  }
  if (!room.schedule) { room.schedule = []; changed = true; }
  if (room.round && !room.round.id) {
    room.round.id = crypto.randomUUID();
    room.round.names = Object.fromEntries(room.players.map(p => [p.id, p.name]));
    changed = true;
  }
  if (room.settings.game === 'spy') return changed;
  if (room.scheduleVersion !== WORD_MINE_SCHEDULE_VERSION) {
    room.scheduleVersion = WORD_MINE_SCHEDULE_VERSION;
    changed = true;
  }
  if (room.round && room.round.redrawLocked == null) {
    room.round.redrawLocked = Object.keys(room.round.mines).length > 0;
    changed = true;
  }
  if (changed && !['lobby', 'finished'].includes(room.phase)) rebuildSchedule(room);
  return changed;
}
function dictionary(room) {
  return [...(room.settings.useDefaultWords ? DICTIONARIES[room.settings.wordLanguage || 'ru'] : []), ...room.settings.customWords];
}
function hasAlternative(room, word) {
  return dictionary(room).some(w => normalize(w) !== normalize(word));
}
function drawWord(room, avoidWord) {
  let words = dictionary(room);
  const alternatives = words.filter(w => normalize(w) !== normalize(avoidWord));
  if (alternatives.length) words = alternatives;
  let available = words.filter(w => !room.used.includes(w));
  if (!available.length) { room.used = []; available = words; }
  const word = available[crypto.getRandomValues(new Uint32Array(1))[0] % available.length];
  room.used.push(word);
  return word;
}
function startRound(room, pair, now, avoidWord) {
  room.round = {
    id: crypto.randomUUID(), names: Object.fromEntries(room.players.map(p => [p.id, p.name])),
    word: drawWord(room, avoidWord), ...pair,
    mines: {}, redrawLocked: false, deadline: now + 60000,
    claim: null, result: null, lastGuess: ''
  };
  room.phase = 'mining';
}
function startTurn(room, now) {
  if (room.settings.game === 'spy') { startSpyRound(room); return; }
  if (room.players.length < 3) { room.phase = 'paused'; room.round = null; return; }
  const pair = room.schedule.shift();
  if (!pair) { room.phase = 'finished'; room.round = null; return; }
  startRound(room, pair, now, room.avoidWord);
  delete room.avoidWord;
}
function startExplaining(room) {
  room.phase = 'explaining';
  room.round.deadline = null;
}
function finish(room, outcome, winnerIds = [], mine = null) {
  for (const p of room.players) if (winnerIds.includes(p.id)) p.score++;
  room.round.result = { outcome, winnerIds, mine };
  room.round.deadline = null;
  room.round.claim = null;
  room.phase = 'result';
  room.progress[room.round.explainerId].explained++;
  room.progress[room.round.guesserId].guessed++;
}
export function tick(room, now) {
  let changed = ensureState(room);
  // Apply the current timing rules to rooms saved before this update as well.
  if (room.settings.duration !== null || room.settings.miningDuration !== 60) {
    if (room.phase === 'mining') room.round.deadline += (60 - room.settings.miningDuration) * 1000;
    room.settings.duration = null; room.settings.miningDuration = 60; changed = true;
  }
  if (room.phase === 'explaining' && room.round.deadline !== null) { room.round.deadline = null; changed = true; }
  if (room.phase === 'mining' && now >= room.round.deadline) { startExplaining(room); changed = true; }
  return changed;
}
export function act(room, token, action, data = {}, now = Date.now()) {
  const p = room.players.find(p => p.token === token);
  requireThat(p, 'Вы вышли из комнаты. Войдите снова.', 401);
  const host = p.id === room.hostId;
  const onlyHost = () => requireThat(host, 'Это действие доступно ведущему.', 403);
  tick(room, now);
  if (room.settings.game === 'spy' && ((typeof action === 'string' && action.startsWith('spy-')) || ['skip', 'next'].includes(action))) {
    actSpy(room, p, action, data, onlyHost); room.updated = now; return p;
  }
  if ((['mine', 'guess', 'guessed', 'claim', 'resolve', 'skip', 'next'].includes(action) && data.roundId != null) || action === 'redraw') {
    requireThat(data.roundId === room.round?.id, 'Этот ход уже сменился. Дождитесь обновления экрана.', 409);
  }
  if (action === 'ready') {
    requireThat(room.phase === 'lobby', 'Игра уже началась.'); p.ready = !p.ready;
  } else if (action === 'settings') {
    onlyHost(); requireThat(room.phase === 'lobby', 'Настройки доступны в лобби.');
    const next = settings(data, room.players.length);
    room.gameSettings ||= {};
    room.gameSettings[room.settings.game || 'wordmine'] = structuredClone(room.settings);
    room.settings = next;
    room.gameSettings[next.game] = structuredClone(next);
    room.players.forEach(player => { player.ready = false; });
  } else if (action === 'switch-game') {
    onlyHost(); requireThat(room.phase === 'lobby', 'Настройки доступны в лобби.');
    requireThat(['wordmine', 'spy'].includes(data.game), 'Неизвестная игра.');
    if (data.game !== (room.settings.game || 'wordmine')) {
      const saved = room.gameSettings?.[data.game];
      const next = settings(saved ? { ...saved, capacity: room.settings.capacity, customWords: saved.customWords.join('\n') } : { game: data.game, capacity: room.settings.capacity, wordLanguage: room.settings.wordLanguage }, room.players.length);
      room.gameSettings ||= {};
      room.gameSettings[room.settings.game || 'wordmine'] = structuredClone(room.settings);
      room.settings = next;
      room.players.forEach(player => { player.ready = false; });
    }
  } else if (action === 'start') {
    onlyHost(); requireThat(room.phase === 'lobby', 'Игра уже началась.');
    requireThat(room.players.length >= 3, 'Для игры нужны хотя бы 3 игрока.');
    if (room.settings.game === 'spy') requireThat(canStartSpy(room), 'Недостаточно игроков для выбранных ролей.');
    room.players.forEach(p => { p.score = 0; }); room.turn = 0;
    room.departed.forEach(entry => { entry.player.score = 0; entry.progress = { explained: 0, guessed: 0 }; });
    room.progress = Object.fromEntries(room.players.map(p => [p.id, { explained: 0, guessed: 0 }]));
    room.round = null; room.used = []; rebuildSchedule(room);
    startTurn(room, now);
  } else if (action === 'redraw') {
    requireThat(room.phase === 'mining', 'Сменить слово можно только до установки мин.');
    const r = room.round;
    requireThat(p.id === r.explainerId, 'Сменить слово может только объясняющий.', 403);
    requireThat(!r.redrawLocked && Object.keys(r.mines).length === 0, 'Первая мина уже установлена. Сменить слово нельзя.');
    requireThat(hasAlternative(room, r.word), 'В словаре нет другого слова.');
    startRound(room, { explainerId: r.explainerId, guesserId: r.guesserId }, now, r.word);
  } else if (action === 'mine') {
    requireThat(room.phase === 'mining', 'Минирование уже завершено.');
    requireThat(p.id !== room.round.explainerId && p.id !== room.round.guesserId, 'Мины устанавливают только минёры.', 403);
    const word = String(data.word || '').trim();
    requireThat(word.length >= 1 && word.length <= 20, 'Мина — от 1 до 20 символов, включая пробелы.');
    requireThat(normalize(word) !== normalize(room.round.word), 'Секретное слово не может быть миной.');
    room.round.mines[p.id] = word;
    room.round.redrawLocked = true;
  } else if (action === 'guess') {
    requireThat(room.phase === 'explaining', 'Сейчас нельзя отправить ответ.');
    requireThat(p.id === room.round.guesserId, 'Ответ отправляет угадывающий.', 403);
    const guess = String(data.word || '').trim();
    requireThat(guess.length > 0 && guess.length <= 60, 'Введите ответ до 60 символов.');
    if (normalize(guess) === normalize(room.round.word)) finish(room, 'guessed', [room.round.explainerId, room.round.guesserId]);
    else room.round.lastGuess = guess;
  } else if (action === 'guessed') {
    requireThat(room.phase === 'explaining', 'Ход уже завершён.');
    requireThat(host || p.id === room.round.explainerId, 'Подтвердить ответ может объясняющий или ведущий.', 403);
    finish(room, 'guessed', [room.round.explainerId, room.round.guesserId]);
  } else if (action === 'claim') {
    requireThat(room.phase === 'explaining', 'Сейчас нельзя сообщить о мине.');
    requireThat(room.round.mines[p.id], 'Можно заявить только о своей мине.', 403);
    room.round.claim = { playerId: p.id, word: room.round.mines[p.id] };
    room.phase = 'claim'; room.round.deadline = null;
  } else if (action === 'resolve') {
    onlyHost(); requireThat(room.phase === 'claim', 'Нет заявки на подрыв.');
    if (data.accept === true) {
      const mine = room.round.claim.word;
      const winners = Object.entries(room.round.mines).filter(([, w]) => normalize(w) === normalize(mine)).map(([id]) => id);
      finish(room, 'exploded', winners, mine);
    } else {
      room.round.deadline = null; room.round.claim = null; room.phase = 'explaining';
    }
  } else if (action === 'skip') {
    onlyHost(); requireThat(['mining', 'explaining', 'claim'].includes(room.phase), 'Нет активного хода.');
    finish(room, 'skipped');
  } else if (action === 'next') {
    onlyHost(); requireThat(room.phase === 'result', 'Сначала завершите ход.');
    room.turn++;
    startTurn(room, now);
  } else if (action === 'lobby') {
    onlyHost(); requireThat(room.phase !== 'lobby', 'Вы уже в лобби.'); resetLobby(room);
  } else if (action === 'leave' || action === 'kick') {
    if (action === 'kick') onlyHost();
    const id = action === 'leave' ? p.id : data.playerId;
    requireThat(action !== 'kick' || id !== p.id, 'Для выхода используйте кнопку «Выйти».');
    requireThat(room.players.some(p => p.id === id), 'Игрок не найден.');
    const { token: removedToken, ...savedPlayer } = room.players.find(p => p.id === id);
    room.departed = room.departed.filter(entry => entry.player.id !== id);
    room.departed.push({ player: { ...savedPlayer, ready: false }, progress: { ...room.progress[id] } });
    room.players = room.players.filter(p => p.id !== id);
    if (room.hostId === id) room.hostId = room.players[0]?.id ?? null;
    delete room.progress[id];
    if (room.settings.game === 'spy' && !['lobby', 'finished', 'result'].includes(room.phase)) {
      // A departure cancels the exposed round without awarding points.
      startSpyRound(room);
    } else if (!['lobby', 'finished'].includes(room.phase)) {
      if (room.players.length < 3) {
        if (room.phase === 'result') room.turn++;
        if (activePhases.includes(room.phase)) room.avoidWord = room.round.word;
        room.phase = 'paused'; room.round = null;
      } else if (activePhases.includes(room.phase)) {
        if ([room.round.explainerId, room.round.guesserId].includes(id)) {
          // A replacement guesser may have seen the old answer as a miner.
          // Restart with a fresh word rather than reusing the exposed answer.
          room.avoidWord = room.round.word; room.phase = 'paused'; room.round = null;
        } else {
          delete room.round.mines[id];
          if (room.round.claim?.playerId === id) { room.round.claim = null; startExplaining(room); }
        }
      }
      rebuildSchedule(room);
      if (room.phase === 'paused' && canStartSpy(room)) startTurn(room, now);
    }
  } else throw new GameError('Неизвестное действие.');
  room.updated = now;
  return p;
}
function resetLobby(room) {
  room.phase = 'lobby'; room.round = null; room.schedule = [];
  room.players.forEach(p => { p.ready = false; });
}
export function view(room, token, now = Date.now()) {
  const p = room.players.find(p => p.token === token);
  requireThat(p, 'Вы вышли из комнаты. Войдите снова.', 401);
  const r = room.round;
  const spy = room.settings.game === 'spy';
  const role = spy && r ? (!r.participantIds.includes(p.id) ? 'spectator' : (r.spyIds || [r.spyId]).includes(p.id) ? 'spy' : p.id === r.whiteId ? 'mrWhite' : 'innocent') : !r ? null : p.id === r.explainerId ? 'explainer' : p.id === r.guesserId ? 'guesser' : 'miner';
  const reveal = ['result', 'finished'].includes(room.phase);
  return {
    code: room.code, me: p.id, hostId: room.hostId, phase: room.phase,
    players: room.players.map(({ token, ...player }) => ({ ...player, turnsExplained: room.progress?.[player.id]?.explained ?? 0, turnsGuessed: room.progress?.[player.id]?.guessed ?? 0 })),
    settings: { ...room.settings, game: room.settings.game || 'wordmine', spyCount: room.settings.spyCount ?? 1, mrWhite: room.settings.mrWhite ?? false, wordLanguage: room.settings.wordLanguage || 'ru', wordCounts: Object.fromEntries(Object.entries(DICTIONARIES).map(([language, words]) => [language, (spy ? SPY_WORDS[language].split(';').length : words.length)])), customWords: p.id === room.hostId && room.phase === 'lobby' ? room.settings.customWords.join('\n') : '', customCount: room.settings.customWords.length },
    turn: room.turn, totalTurns: room.totalTurns, serverNow: now,
    round: spy ? spyView(room, p, role, reveal) : r && { id: r.id, names: r.names, role, explainerId: r.explainerId, guesserId: r.guesserId,
      word: role !== 'guesser' || reveal ? r.word : null,
      canRedraw: role === 'explainer' && room.phase === 'mining' && !r.redrawLocked && Object.keys(r.mines).length === 0 && hasAlternative(room, r.word),
      mineCount: Object.keys(r.mines).length, myMine: r.mines[p.id] || null,
      mines: reveal || role === 'miner' ? r.mines : null, deadline: r.deadline,
      claim: r.claim && { playerId: r.claim.playerId, word: r.claim.word }, result: r.result, lastGuess: r.lastGuess }
  };
}

function startSpyRound(room) {
  room.totalTurns = room.settings.cycles;
  if (room.turn >= room.totalTurns) { room.phase = 'finished'; room.round = null; return; }
  if (!canStartSpy(room)) { room.phase = 'paused'; room.round = null; return; }
  const words = [...(room.settings.useDefaultWords ? SPY_WORDS[room.settings.wordLanguage || 'ru'].split(';') : []), ...room.settings.customWords];
  let available = words.filter(w => !room.used.includes(w));
  if (!available.length) { room.used = []; available = words; }
  const entry = available[crypto.getRandomValues(new Uint32Array(1))[0] % available.length];
  room.used.push(entry);
  const [word, hint] = entry.split('|').map(v => v.trim());
  const ids = room.players.map(p => p.id);
  const shuffled = shuffle(ids);
  const spyIds = shuffled.slice(0, room.settings.spyCount ?? 1);
  const whiteId = room.settings.mrWhite ? shuffled[spyIds.length] : null;
  room.round = { id: crypto.randomUUID(), names: Object.fromEntries(room.players.map(p => [p.id, p.name])),
    word, hint, spyId: spyIds[0] || null, spyIds, whiteId, caughtId: null, guessBonuses: {}, participantIds: ids,
    eliminated: [], clues: [], speakingIds: [...ids], votes: {}, ballot: 1, guess: null, result: null };
  room.phase = 'spy-clues';
}
function spyActive(r) { return r.participantIds.filter(id => !r.eliminated.includes(id)); }
function spyTally(r) {
  const tally = {};
  for (const id of Object.values(r.votes)) if (id) tally[id] = (tally[id] || 0) + 1;
  return tally;
}
function spyCandidate(r) {
  const tally = spyTally(r);
  return Object.keys(tally).find(id => tally[id] > spyActive(r).length / 2) || null;
}
function spyClues(room) {
  room.phase = 'spy-clues'; room.round.votes = {}; room.round.ballot++;
  room.round.speakingIds = spyActive(room.round);
}
function canStartSpy(room) {
  return room.players.length >= 3 && (room.settings.game !== 'spy' || room.players.length > (room.settings.spyCount ?? 1) + Number(Boolean(room.settings.mrWhite)));
}
function hiddenIds(r) { return [...(r.spyIds || [r.spyId]), ...(r.whiteId ? [r.whiteId] : [])].filter(Boolean); }
function survivingHidden(r) { return hiddenIds(r).filter(id => !r.eliminated.includes(id)); }
function spyFinish(room, outcome, guessed = false) {
  const r = room.round;
  const awards = { ...r.guessBonuses };
  if (outcome === 'skipped') { for (const id of Object.keys(awards)) delete awards[id]; }
  if (outcome === 'undetected') for (const id of survivingHidden(r)) awards[id] = id === r.whiteId ? 5 : 3;
  if (outcome === 'caught') for (const id of r.participantIds) if (!hiddenIds(r).includes(id)) awards[id] = 1;
  for (const p of room.players) p.score += awards[p.id] || 0;
  r.result = { outcome, awards, guessed }; room.phase = 'result';
}
function afterSpyElimination(room) {
  const r = room.round;
  if (!survivingHidden(r).length) room.phase = 'spy-review';
  else if (spyActive(r).length <= 2) { room.phase = 'spy-vote'; r.votes = {}; r.ballot++; }
  else spyClues(room);
}
function actSpy(room, p, action, data, onlyHost) {
  const r = room.round;
  requireThat(r && data.roundId === r.id, 'Этот ход уже сменился. Дождитесь обновления экрана.', 409);
  if (action === 'spy-settings') {
    onlyHost(); requireThat(room.phase === 'result', 'Меняйте роли между раундами.');
    const next = settings({ ...room.settings, customWords: room.settings.customWords.join('\n'), spyCount: data.spyCount, mrWhite: data.mrWhite }, room.players.length);
    requireThat(room.players.length > next.spyCount + Number(next.mrWhite), 'Недостаточно игроков для выбранных ролей.');
    room.settings = next; return;
  }
  if (action === 'next') {
    onlyHost(); requireThat(room.phase === 'result', 'Сначала завершите ход.');
    if (room.turn + 1 < room.settings.cycles) requireThat(canStartSpy(room), 'Недостаточно игроков для выбранных ролей.');
    room.turn++; startSpyRound(room); return;
  }
  requireThat(['spy-clues', 'spy-vote', 'spy-guess', 'spy-review'].includes(room.phase), 'Нет активного хода.');
  const active = spyActive(r);
  if (action === 'skip') { onlyHost(); spyFinish(room, 'skipped'); }
  else if (action === 'spy-clue') {
    requireThat(room.phase === 'spy-clues' && r.speakingIds[0] === p.id, 'Дождитесь своей очереди для ассоциации.', 403);
    const word = String(data.word || '').trim();
    requireThat(word.length > 0 && word.length <= 40 && !/\s/u.test(word), 'Введите одну ассоциацию до 40 символов без пробелов.');
    requireThat(normalize(word) !== normalize(r.word), 'Нельзя называть секретное слово.');
    r.clues.push({ playerId: p.id, word, ballot: r.ballot }); r.speakingIds.shift();
    if (!r.speakingIds.length) room.phase = 'spy-vote';
  } else if (action === 'spy-vote') {
    requireThat(room.phase === 'spy-vote' && active.length > 2 && active.includes(p.id), 'Сейчас голосуют только активные игроки.', 403);
    requireThat(data.ballot === r.ballot, 'Это голосование уже завершено.', 409);
    requireThat(data.playerId === null || (active.includes(data.playerId) && data.playerId !== p.id), 'Выберите другого активного игрока или пропустите голос.');
    requireThat(!Object.hasOwn(r.votes, p.id), 'Вы уже проголосовали.');
    r.votes[p.id] = data.playerId;
  } else if (action === 'spy-confirm-vote') {
    onlyHost(); requireThat(room.phase === 'spy-vote' && Object.keys(r.votes).length === active.length, 'Дождитесь голосов всех игроков.');
    requireThat(data.ballot === r.ballot, 'Это голосование уже завершено.', 409);
    const candidate = spyCandidate(r);
    if (data.accept !== true || !candidate) { spyClues(room); return; }
    r.eliminated.push(candidate);
    if ((r.spyIds || [r.spyId]).includes(candidate)) { r.caughtId = candidate; r.guess = null; room.phase = 'spy-guess'; }
    else afterSpyElimination(room);
  } else if (action === 'spy-undetected') {
    onlyHost(); requireThat(room.phase === 'spy-vote' && survivingHidden(r).length > 0, 'Сначала завершите ассоциации.');
    spyFinish(room, 'undetected');
  } else if (action === 'spy-guess') {
    requireThat(room.phase === 'spy-guess' && p.id === (r.caughtId || r.spyId) && r.guess === null, 'Только пойманный шпион может дать один ответ.', 403);
    const word = String(data.word || '').trim();
    requireThat(word.length > 0 && word.length <= 60, 'Введите ответ до 60 символов.');
    r.guess = word;
  } else if (action === 'spy-score') {
    onlyHost(); requireThat(room.phase === 'spy-guess' && r.guess !== null, 'Дождитесь ответа шпиона.');
    requireThat(typeof data.guessed === 'boolean', 'Подтвердите, верен ли ответ.');
    r.guessBonuses ||= {};
    if (data.guessed) r.guessBonuses[r.caughtId || r.spyId] = 1;
    afterSpyElimination(room);
    if (room.phase === 'spy-review') spyFinish(room, 'caught', data.guessed);
  } else if (action === 'spy-finish') {
    onlyHost(); requireThat(room.phase === 'spy-review', 'Сначала завершите ход.');
    spyFinish(room, 'caught');
  } else throw new GameError('Неизвестное действие.');
}
function spyView(room, p, role, reveal) {
  const r = room.round;
  if (!r) return null;
  const complete = Object.keys(r.votes).length === spyActive(r).length;
  return { id: r.id, names: r.names, role, word: reveal || role === 'innocent' ? r.word : null,
    hint: role === 'spy' || reveal ? r.hint : null, spyId: reveal ? r.spyId : room.phase === 'spy-guess' ? (r.caughtId || r.spyId) : null,
    spyIds: reveal ? (r.spyIds || [r.spyId]).filter(Boolean) : null, whiteId: reveal ? r.whiteId ?? null : null,
    caughtId: room.phase === 'spy-guess' ? (r.caughtId || r.spyId) : null,
    participantIds: r.participantIds, eliminated: r.eliminated, clues: r.clues, speakerId: r.speakingIds[0] || null,
    ballot: r.ballot, voteCount: Object.keys(r.votes).length, hasVoted: Object.hasOwn(r.votes, p.id),
    myVote: r.votes[p.id] ?? null, votesComplete: complete, tally: complete ? spyTally(r) : null,
    candidateId: complete ? spyCandidate(r) : null, guess: room.phase === 'spy-guess' || reveal ? r.guess : null,
    result: r.result };
}
