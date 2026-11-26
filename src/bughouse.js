import { Chess, DEFAULT_POSITION } from 'chess.js';

const reserveTypes = ['p', 'n', 'b', 'r', 'q'];
const promotions = ['n', 'b', 'r', 'q'];
const opposite = color => color === 'w' ? 'b' : 'w';
const isSquare = value => typeof value === 'string' && /^[a-h][1-8]$/.test(value);

export function bughouseSeats(room) {
  const guests = room.players.filter(player => player.id !== room.hostId);
  const partner = guests.find(player => player.id === room.settings.partnerId) ?? guests[0];
  const opponents = guests.filter(player => player !== partner);
  const seats = [
    { w: { id: room.hostId, team: 1 }, b: { id: opponents[0]?.id ?? null, team: 2 } },
    { w: { id: opponents[1]?.id ?? null, team: 2 }, b: { id: partner?.id ?? null, team: 1 } }
  ];
  return room.settings.colorsSwapped ? seats.map(({ w, b }) => ({ w: b, b: w })) : seats;
}

export function startBughouse(room) {
  room.phase = 'chess';
  room.round = {
    id: crypto.randomUUID(),
    names: Object.fromEntries(room.players.map(({ id, name }) => [id, name])),
    seats: bughouseSeats(room),
    boards: Array.from({ length: 2 }, () => ({
      fen: DEFAULT_POSITION, promoted: [], reserve: { w: {}, b: {} }, revision: 0, last: null
    })),
    drawVotes: [],
    result: null
  };
}

function seatOf(match, playerId) {
  const board = match.seats.findIndex(seats => seats.w.id === playerId || seats.b.id === playerId);
  if (board < 0) return null;
  const color = match.seats[board].w.id === playerId ? 'w' : 'b';
  return { board, color, team: match.seats[board][color].team };
}

function legalDrops(chess, reserve) {
  const types = reserveTypes.filter(type => reserve[type] > 0);
  if (!types.length) return {};

  const color = chess.turn();
  const blocking = chess.isCheck() ? new Chess(chess.fen()) : null;
  const squares = [];
  for (const [row, rank] of chess.board().entries()) {
    for (const [column, piece] of rank.entries()) {
      if (piece) continue;
      const square = `${'abcdefgh'[column]}${8 - row}`;
      if (blocking) {
        // Every drop occupies the same square, so one piece can test king safety for all types.
        blocking.put({ type: 'n', color }, square);
        const safe = !blocking.isCheck();
        blocking.remove(square);
        if (!safe) continue;
      }
      squares.push(square);
    }
  }
  return Object.fromEntries(types.map(type => [type, type === 'p' ? squares.filter(square => !/[18]$/.test(square)) : squares]));
}

function finishBughouse(room, reason, winnerTeam = null, board = null) {
  room.round.result = { reason, winnerTeam, board };
  room.phase = 'finished';
}

export function resignBughouse(room, playerId) {
  const seat = seatOf(room.round, playerId);
  if (seat) finishBughouse(room, 'resignation', 3 - seat.team, seat.board);
}

export function playBughouse(room, playerId, action, data, requireThat) {
  const match = room.round;
  requireThat(match && data?.roundId === match.id && room.phase === 'chess', 'Эта партия уже завершилась или сменилась.', 409);
  const seat = seatOf(match, playerId);
  requireThat(seat, 'В этой партии вы наблюдатель.', 403);
  const { board: index, color, team } = seat;
  if (action === 'bughouse-resign') {
    resignBughouse(room, playerId);
    return;
  }
  if (action === 'bughouse-draw') {
    requireThat(data.position === match.boards[0].revision + match.boards[1].revision, 'Этот ход уже сменился. Дождитесь обновления экрана.', 409);
    match.drawVotes = match.drawVotes.includes(playerId)
      ? match.drawVotes.filter(id => id !== playerId)
      : [...match.drawVotes, playerId];
    if (match.drawVotes.length === 4) finishBughouse(room, 'agreement');
    return;
  }

  const board = match.boards[index];
  requireThat(data.revision === board.revision, 'Этот ход уже сменился. Дождитесь обновления экрана.', 409);
  const chess = new Chess(board.fen);
  requireThat(chess.turn() === color, 'Сейчас ход соперника.', 403);
  requireThat(isSquare(data.to), 'Недопустимый ход.');

  if (action === 'bughouse-drop') {
    const { piece, to } = data;
    requireThat(reserveTypes.includes(piece) && legalDrops(chess, board.reserve[color])[piece]?.includes(to), 'Сюда нельзя поставить эту фигуру.');
    chess.put({ type: piece, color }, to);
    const [position, , castling, , halfMoves, moveNumber] = chess.fen().split(' ');
    chess.load([position, opposite(color), castling, '-', piece === 'p' ? 0 : Number(halfMoves) + 1, Number(moveNumber) + Number(color === 'b')].join(' '));
    if (--board.reserve[color][piece] === 0) delete board.reserve[color][piece];
    board.last = { to };
  } else {
    const { from, to, promotion } = data;
    requireThat(isSquare(from) && (promotion === undefined || promotions.includes(promotion)), 'Недопустимый ход.');
    let move;
    try { move = chess.move({ from, to, promotion }); } catch { requireThat(false, 'Недопустимый ход.'); }
    if (move.captured) {
      const captured = board.promoted.includes(to) ? 'p' : move.captured;
      const partnerReserve = match.boards[1 - index].reserve[opposite(color)];
      partnerReserve[captured] = (partnerReserve[captured] ?? 0) + 1;
    }
    const promoted = move.promotion || board.promoted.includes(from);
    board.promoted = board.promoted.filter(square => square !== from && square !== to);
    if (promoted) board.promoted.push(to);
    board.last = { from, to };
  }

  board.fen = chess.fen();
  board.revision++;
  match.drawVotes = [];
  if (!chess.moves().length && !Object.values(legalDrops(chess, board.reserve[chess.turn()])).some(squares => squares.length)) {
    if (chess.isCheck()) finishBughouse(room, 'checkmate', team, index);
    else finishBughouse(room, 'stalemate', null, index);
  }
}

export function bughouseView(room, playerId) {
  const match = room.round;
  const seat = seatOf(match, playerId);
  let moves = [], drops = {};
  const boards = match.boards.map((board, index) => {
    const chess = new Chess(board.fen);
    const turn = chess.turn();
    const pieces = Object.fromEntries(chess.board().flat().filter(Boolean).map(({ square, color, type }) => [square, color + type]));
    if (room.phase === 'chess' && seat?.board === index && seat.color === turn) {
      moves = chess.moves({ verbose: true }).map(({ from, to, promotion }) => ({ from, to, promotion }));
      drops = legalDrops(chess, board.reserve[turn]);
    }
    return { pieces, turn, check: chess.isCheck(), reserve: board.reserve, revision: board.revision, last: board.last };
  });
  return { id: match.id, seats: match.seats, names: match.names, boards, seat, moves, drops, drawVotes: match.drawVotes, result: match.result };
}
