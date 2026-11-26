import test from 'node:test';
import assert from 'node:assert/strict';
import { act, createRoom, joinRoom, newPlayer, tick, view } from '../src/game.js';

const names = ['Host', 'Partner', 'First opponent', 'Second opponent'];
const tokens = ['host', 'partner', 'first', 'second'];

function setup(count = 4, start = true) {
  const room = createRoom('123456', newPlayer(names[0], tokens[0]), { game: 'bughouse', capacity: 20 }, 1000);
  for (let i = 1; i < count; i++) joinRoom(room, newPlayer(names[i], tokens[i]), 1000);
  if (start) act(room, 'host', 'start', {}, 1000);
  return room;
}

function submit(room, token, action, data = {}) {
  const { id, seat, boards } = view(room, token).round;
  act(room, token, 'bughouse-' + action, { roundId: id, revision: boards[seat.board].revision, position: boards[0].revision + boards[1].revision, ...data }, 2000);
}

function move(room, token, from, to, promotion) {
  submit(room, token, 'move', { from, to, promotion });
}

test('chess rooms seat exactly four and cannot enter or leave through game switching', () => {
  const room = setup(3, false);
  const host = room.players[0];
  assert.deepEqual(room.settings, { game: 'bughouse', capacity: 4 });
  assert.throws(() => act(room, 'host', 'start'), /ровно четыре/);
  assert.throws(() => act(room, 'host', 'switch-game', { game: 'spy' }), /Неизвестное действие/);
  assert.throws(() => act(room, 'host', 'settings', { game: 'wordmine' }), /Неизвестное действие/);
  for (const game of ['wordmine', 'spy']) {
    const other = createRoom('654321', host, { game }, 1000);
    assert.throws(() => act(other, 'host', 'switch-game', { game: 'bughouse' }), /Неизвестная игра/);
    assert.throws(() => act(other, 'host', 'settings', { game: 'bughouse' }), /Неизвестная игра/);
  }
  const fourth = joinRoom(room, newPlayer(names[3], tokens[3]), 1000);
  assert.throws(() => joinRoom(room, newPlayer('Fifth', 'fifth'), 1000), /уже четыре/);
  assert.throws(() => act(room, 'second', 'start'), /ведущему/);
  assert.throws(() => act(room, 'partner', 'bughouse-partner', { playerId: fourth.id }), /ведущему/);
  act(room, 'host', 'bughouse-partner', { playerId: fourth.id });
  act(room, 'host', 'start', {}, 1000);
  const started = view(room, 'second');
  assert.deepEqual(started.round.seat, { board: 1, color: 'b', team: 1 });
  assert.deepEqual(view(room, 'host').round.seat, { board: 0, color: 'w', team: 1 });
  assert.equal(tick(room, 7_000_000), false);
  assert.equal(room.phase, 'chess');
  assert.ok(started.players.every(player => !Object.hasOwn(player, 'token')));
});

test('the host can swap both boards’ colors in the lobby without changing teams', () => {
  const room = setup(4, false);
  act(room, 'host', 'bughouse-partner', { playerId: room.players[3].id });
  act(room, 'partner', 'ready');
  const original = view(room, 'host').seats;
  assert.throws(() => act(room, 'partner', 'bughouse-swap-colors'), /ведущему/);
  act(room, 'host', 'bughouse-swap-colors');
  const swapped = view(room, 'partner');
  assert.equal(swapped.colorsSwapped, true);
  assert.deepEqual(swapped.seats, original.map(({ w, b }) => ({ w: b, b: w })));
  assert.ok(swapped.players.every(player => !player.ready));

  act(room, 'host', 'start');
  assert.deepEqual(view(room, 'host').round.seat, { board: 0, color: 'b', team: 1 });
  assert.deepEqual(view(room, 'second').round.seat, { board: 1, color: 'w', team: 1 });
  assert.throws(() => act(room, 'host', 'bughouse-swap-colors'), /доступны в лобби/);
  assert.throws(() => move(room, 'host', 'e7', 'e5'), /ход соперника/);
  move(room, 'partner', 'e2', 'e4');
  move(room, 'host', 'd7', 'd5');
  move(room, 'partner', 'e4', 'd5');
  assert.deepEqual(view(room, 'first').round.boards[1].reserve.b, { p: 1 });

  act(room, 'host', 'lobby');
  assert.equal(view(room, 'host').colorsSwapped, true);
  act(room, 'host', 'bughouse-swap-colors');
  assert.deepEqual(view(room, 'host').seats, original);
});

test('a legal capture adds exactly one piece to the opposite board and a legal drop spends the turn', () => {
  const room = setup();
  assert.throws(() => move(room, 'first', 'e7', 'e5'), /ход соперника/);
  assert.throws(() => move(room, 'host', 'e2', 'e5'), /Недопустимый ход/);
  move(room, 'host', 'e2', 'e4');
  move(room, 'first', 'd7', 'd5');
  move(room, 'host', 'e4', 'd5');
  move(room, 'second', 'g1', 'f3');
  const { round } = view(room, 'partner');
  assert.deepEqual(round.boards[1].reserve, { w: {}, b: { p: 1 } });
  assert.ok(round.drops.p.includes('e6'));
  assert.ok(!round.drops.p.includes('g1'));
  assert.throws(() => submit(room, 'partner', 'drop', { piece: 'p', to: 'g1' }), /нельзя поставить/);
  assert.throws(() => submit(room, 'partner', 'drop', { piece: 'q', to: 'e6' }), /нельзя поставить/);
  submit(room, 'partner', 'drop', { piece: 'p', to: 'e6' });
  const board = view(room, 'partner').round.boards[1];
  assert.equal(board.pieces.e6, 'bp');
  assert.equal(board.turn, 'w');
  assert.deepEqual(board.reserve.b, {});
  assert.equal(room.round.boards[0].revision, 3);
  assert.throws(() => submit(room, 'partner', 'drop', { piece: 'p', to: 'e5', revision: 1 }), /ход уже сменился/);
});

test('en passant and captured promotions transfer pawns', () => {
  const room = setup();
  move(room, 'host', 'e2', 'e4');
  move(room, 'first', 'a7', 'a6');
  move(room, 'host', 'e4', 'e5');
  move(room, 'first', 'd7', 'd5');
  move(room, 'host', 'e5', 'd6');
  const afterCapture = view(room, 'host').round;
  assert.equal(afterCapture.boards[0].pieces.d5, undefined);
  assert.equal(afterCapture.boards[0].pieces.d6, 'wp');
  assert.deepEqual(afterCapture.boards[1].reserve.b, { p: 1 });

  room.round.boards[0].fen = '1r2k3/P7/8/8/8/8/8/4K3 w - - 0 1';
  assert.deepEqual(view(room, 'host').round.moves.filter(move => move.from === 'a7' && move.to === 'a8').map(move => move.promotion).sort(), ['b', 'n', 'q', 'r']);
  move(room, 'host', 'a7', 'a8', 'n');
  assert.equal(view(room, 'host').round.boards[0].pieces.a8, 'wn');
  move(room, 'first', 'b8', 'a8');
  assert.deepEqual(room.round.boards[1].reserve.w, { p: 1 });
});

test('a reserve drop can block a check that otherwise ends the whole match', () => {
  for (const hasReserve of [false, true]) {
    const room = setup();
    const board = room.round.boards[0];
    board.fen = 'k7/6r1/8/8/3r1r2/8/8/4K3 b - - 0 1';
    if (hasReserve) board.reserve.w.p = 1;
    move(room, 'first', 'g7', 'e7');
    if (!hasReserve) {
      assert.equal(room.phase, 'finished');
      assert.deepEqual(room.round.result, { reason: 'checkmate', winnerTeam: 2, board: 0 });
      assert.throws(() => move(room, 'second', 'e2', 'e4'), /завершилась/);
      continue;
    }
    assert.equal(room.phase, 'chess');
    assert.deepEqual(view(room, 'host').round.drops.p, ['e6', 'e5', 'e4', 'e3', 'e2']);
    assert.throws(() => submit(room, 'host', 'drop', { piece: 'p', to: 'h4' }), /нельзя поставить/);
    submit(room, 'host', 'drop', { piece: 'p', to: 'e2' });
    assert.equal(view(room, 'host').round.boards[0].check, false);
  }
});

test('stalemate is a draw only when the player also has no legal drops', () => {
  for (const hasReserve of [false, true]) {
    const room = setup();
    const board = room.round.boards[0];
    board.fen = '7k/5K2/8/6Q1/8/8/8/8 w - - 0 1';
    if (hasReserve) board.reserve.b.n = 1;
    move(room, 'host', 'g5', 'g6');
    const { round } = view(room, 'first');
    assert.equal(round.boards[0].check, false);
    assert.deepEqual(round.moves, []);
    if (hasReserve) {
      assert.ok(round.drops.n.includes('a8'));
      assert.equal(room.phase, 'chess');
    } else {
      assert.equal(room.phase, 'finished');
      assert.deepEqual(round.result, { reason: 'stalemate', winnerTeam: null, board: 0 });
    }
  }
});

test('rejoining restores the seat, and leaving forfeits the match for the departing team', () => {
  const room = setup();
  move(room, 'host', 'e2', 'e4');
  const started = view(room, 'host').round;
  joinRoom(room, newPlayer('HOST', 'host-returned'), 2000);
  assert.throws(() => view(room, 'host'), /Войдите снова/);
  assert.deepEqual(view(room, 'host-returned').round, started);
  const departingId = view(room, 'partner').me;
  act(room, 'partner', 'leave');
  assert.equal(room.phase, 'finished');
  assert.deepEqual(room.round.result, { reason: 'resignation', winnerTeam: 2, board: 1 });
  const back = joinRoom(room, newPlayer('Partner', 'partner-returned'));
  assert.equal(back.id, departingId);
  act(room, 'host-returned', 'lobby');
  act(room, 'host-returned', 'start');
  assert.notEqual(room.round.id, started.id);
  assert.throws(() => submit(room, 'host-returned', 'move', { roundId: started.id, from: 'e2', to: 'e4' }), /партия уже/);
});

test('all four players must agree to a draw in the current position', () => {
  const room = setup();
  submit(room, 'host', 'draw');
  move(room, 'host', 'e2', 'e4');
  assert.deepEqual(room.round.drawVotes, []);
  assert.throws(() => submit(room, 'host', 'draw', { position: 0 }), /ход уже сменился/);
  for (const token of tokens.slice(0, 3)) submit(room, token, 'draw');
  assert.equal(room.phase, 'chess');
  submit(room, 'second', 'draw');
  assert.equal(room.phase, 'finished');
  assert.deepEqual(room.round.result, { reason: 'agreement', winnerTeam: null, board: null });
});
