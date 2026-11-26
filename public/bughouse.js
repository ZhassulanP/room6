import { t } from './i18n.js';

const pieceNames = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' };
const turnColor = color => color === 'w' ? 'chessWhite' : 'chessBlack';
const opposite = color => color === 'w' ? 'b' : 'w';
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const tr = (key, values) => esc(t(key, values));
const renderPiece = (type, color) => `<svg class="chess-piece" viewBox="0 0 45 45" aria-hidden="true" focusable="false"><use href="/chess-pieces.svg#${color}${type}"></use></svg>`;
const person = (room, id) => room.players.find(player => player.id === id)?.name ?? room.round?.names?.[id] ?? t('chessEmptySeat');
let positionKey, selected, promotion, cursor;

export function bughouseArt() {
  return `<div class="poster-art chess-art" aria-hidden="true"><div class="chess-art-board">${renderPiece('r', 'b')}</div><div class="chess-art-board">${renderPiece('n', 'w')}</div></div>`;
}

export function bughouseLobby(room) {
  const host = room.me === room.hostId;
  const full = room.players.length === 4;
  const ready = room.players.find(player => player.id === room.me).ready;
  const teams = [1, 2].map(team => room.seats.map(board => {
    const color = board.w.team === team ? 'w' : 'b';
    return { id: board[color].id, color };
  }));
  const partnerId = teams[0][1].id;
  const partnerPicker = room.players.length > 2 ? `<div class="field"><label for="chess-partner">${tr('chessChoosePartner')}</label><select id="chess-partner">${room.players.filter(player => player.id !== room.hostId).map(player => `<option value="${esc(player.id)}" ${partnerId === player.id ? 'selected' : ''}>${esc(player.name)}</option>`).join('')}</select></div>` : '';
  return `<section class="lobby-color-banner"><div><h2>${tr('bughouse')}</h2></div><div class="lobby-banner-art bughouse-option">${bughouseArt()}</div></section>
    <div class="chess-teams">${teams.map((team, index) => `<section class="panel"><h2>${tr('chessTeam', { team: index + 1 })}</h2><ul>${team.map(seat => `<li><span>${esc(person(room, seat.id))}</span><span class="muted">${tr(turnColor(seat.color))}</span></li>`).join('')}</ul></section>`).join('')}</div>
    ${host ? `<div class="panel chess-lobby-controls">${partnerPicker}<button type="button" class="secondary" id="chess-swap-colors" data-action="bughouse-swap-colors" aria-pressed="${room.colorsSwapped}">${tr('chessSwapColors')}</button></div>` : ''}
    <div class="panel lobby-bottom"><div><h3>${tr('playerCount', { count: room.players.length })}</h3><p>${tr(full ? 'canStart' : 'chessWaiting')}</p></div><div class="buttons"><button class="${ready ? 'secondary' : 'primary'}" data-action="ready" aria-pressed="${ready}">${ready ? '✓ ' : ''}${tr('ready')}</button>${host ? `<button class="primary" data-action="start" ${full ? '' : 'disabled'}>${tr('start')} →</button>` : ''}</div></div>`;
}

function reserve(board, color, playable) {
  return `<div class="chess-reserve" aria-label="${tr('chessReserve')}">${Object.keys(pieceNames).filter(type => board.reserve[color][type]).map(type => {
    const amount = board.reserve[color][type];
    const label = tr('chessReservePiece', { piece: t(pieceNames[type]), count: amount });
    const face = `${renderPiece(type, color)}<span aria-hidden="true">${amount}</span>`;
    return playable
      ? `<button type="button" class="chess-pocket-piece" id="chess-drop-${type}" data-chess-drop="${type}" aria-label="${label}" aria-pressed="${selected?.drop === type}">${face}</button>`
      : `<span class="chess-pocket-piece" role="img" aria-label="${label}">${face}</span>`;
  }).join('') || `<span class="chess-empty-reserve">${tr('chessEmptyReserve')}</span>`}</div>`;
}

function renderBoard(room, index, color, title) {
  const { round } = room;
  const board = round.boards[index];
  const playable = room.phase === 'chess' && round.seat?.board === index && board.turn === color;
  const targets = new Set();
  if (playable && selected) {
    const squares = selected.drop ? round.drops[selected.drop] ?? [] : round.moves.filter(move => move.from === selected.from).map(move => move.to);
    squares.forEach(square => targets.add(square));
  }
  const squares = [...(color === 'w' ? '87654321' : '12345678')].flatMap(rank => [...(color === 'w' ? 'abcdefgh' : 'hgfedcba')].map(file => file + rank));
  const side = sideColor => {
    const seat = round.seats[index][sideColor];
    return `<div class="chess-side"><div class="chess-player"><span class="chess-turn-dot ${board.turn === sideColor && room.phase === 'chess' ? 'active' : ''}" aria-hidden="true"></span><strong>${esc(person(room, seat.id))}</strong><span class="muted">${tr(turnColor(sideColor))}</span></div>${reserve(board, sideColor, playable && sideColor === color)}</div>`;
  };
  return `<section class="chess-board-panel"><div class="chess-board-heading"><h2>${tr(title)}</h2>${room.phase === 'chess' ? `<p class="chess-board-status">${tr(playable ? 'chessYourTurn' : 'chessToMove', { name: person(room, round.seats[index][board.turn].id) })}${board.check ? ` · ${tr('chessCheck')}` : ''}</p>` : ''}</div>
    ${side(opposite(color))}<div class="chess-board" role="group" aria-label="${tr(title)}" ${playable ? 'data-chess-board' : ''}>${squares.map((square, i) => {
      const piece = board.pieces[square];
      const checked = board.check && piece === board.turn + 'k';
      const last = square === board.last?.from || square === board.last?.to;
      const active = playable && selected?.from === square;
      const classes = `chess-square ${(Math.floor(i / 8) + i % 8) % 2 ? 'chess-dark' : 'chess-light'}${checked ? ' chess-checked' : ''}${last ? ' chess-last' : ''}${active ? ' chess-selected' : ''}${targets.has(square) ? ' chess-target' : ''}`;
      const label = `${square}, ${piece ? t('chessPiece', { color: t(turnColor(piece[0])), piece: t(pieceNames[piece[1]]) }) : t('chessEmptySquare')}`;
      const face = `${piece ? renderPiece(piece[1], piece[0]) : ''}${i % 8 === 0 ? `<span class="chess-rank" aria-hidden="true">${square[1]}</span>` : ''}${i >= 56 ? `<span class="chess-file" aria-hidden="true">${square[0]}</span>` : ''}`;
      return playable
        ? `<button class="${classes}" type="button" id="chess-square-${square}" data-chess-square="${square}" tabindex="${(cursor || (color === 'w' ? 'e2' : 'e7')) === square ? 0 : -1}" aria-label="${esc(label)}" aria-pressed="${active}">${face}</button>`
        : `<span class="${classes}" role="img" aria-label="${esc(label)}">${face}</span>`;
    }).join('')}</div>${side(color)}</section>`;
}

export function renderBughouse(room) {
  const { round } = room;
  const seat = round.seat;
  const key = `${round.id}:${room.me}:${round.boards[seat?.board ?? 0].revision}:${room.phase}`;
  if (positionKey !== key) {
    positionKey = key;
    selected = promotion = cursor = null;
  }
  const result = round.result;
  const outcome = result?.winnerTeam ? tr('chessWinner', { team: result.winnerTeam }) : tr('chessDrawn');
  const resultText = result && `<section class="panel chess-result" role="status"><h2>${outcome}</h2><p>${tr('chessResult_' + result.reason)}</p></section>`;
  const primaryBoard = seat ? renderBoard(room, seat.board, seat.color, 'chessYourBoard') : renderBoard(room, 0, 'w', 'chessBoardA');
  const otherBoard = seat ? renderBoard(room, 1 - seat.board, opposite(seat.color), 'chessPartnerBoard') : renderBoard(room, 1, 'w', 'chessBoardB');
  const voted = round.drawVotes.includes(room.me);
  const actions = room.phase === 'chess' && seat ? `<div class="chess-actions"><button class="secondary" id="chess-draw" aria-pressed="${voted}">${tr(voted ? 'chessWithdrawDraw' : 'chessOfferDraw')}</button><button class="text-button" id="chess-resign">${tr('chessResign')}</button>${round.drawVotes.length ? `<span class="muted" role="status">${tr('chessDrawVotes', { count: round.drawVotes.length })}</span>` : ''}</div>` : '';
  return `${resultText || ''}<div class="chess-boards">${primaryBoard}${otherBoard}</div>${actions}${room.phase === 'finished' && room.me === room.hostId ? `<div class="admin-controls"><button class="text-button" id="lobby-button">${tr('toLobby')} ↗</button></div>` : ''}
    ${promotion ? `<dialog class="dialog chess-promotion" id="chess-promotion"><h2>${tr('chessPromote')}</h2><div>${promotion.moves.map(move => `<button class="secondary" type="button" data-chess-promotion="${move.promotion}" aria-label="${tr(pieceNames[move.promotion])}">${renderPiece(move.promotion, seat.color)}</button>`).join('')}</div><button class="text-button" id="chess-cancel-promotion">${tr('cancel')}</button></dialog>` : ''}`;
}

export function bindBughouse(root, room, mutate, rerender, confirmAction) {
  root.querySelector('#chess-partner')?.addEventListener('change', event => mutate('bughouse-partner', { playerId: event.target.value }));
  if (!room.round?.seat) return;
  const { round } = room;
  const board = round.boards[round.seat.board];
  const play = (move, action = 'bughouse-move') => {
    selected = promotion = null;
    mutate(action, { ...move, roundId: round.id, revision: board.revision });
  };
  root.querySelector('#chess-draw')?.addEventListener('click', () => mutate('bughouse-draw', { roundId: round.id, position: round.boards[0].revision + round.boards[1].revision }));
  root.querySelector('#chess-resign')?.addEventListener('click', () => confirmAction(t('chessResignTitle'), t('chessResignHelp'), t('chessResign'), () => mutate('bughouse-resign', { roundId: round.id })));
  const grid = root.querySelector('[data-chess-board]');
  grid?.addEventListener('click', event => {
    const square = event.target.closest('[data-chess-square]')?.dataset.chessSquare;
    if (!square) return;
    cursor = square;
    if (selected?.drop && round.drops[selected.drop]?.includes(square)) {
      play({ piece: selected.drop, to: square }, 'bughouse-drop');
      return;
    }
    const moves = round.moves.filter(move => move.from === selected?.from && move.to === square);
    if (moves.length === 1) {
      play(moves[0]);
      return;
    }
    if (moves.length) promotion = { moves };
    else selected = board.pieces[square]?.[0] === round.seat.color && selected?.from !== square ? { from: square } : null;
    rerender();
  });
  grid?.addEventListener('keydown', event => {
    if (event.key === 'Escape') { selected = null; rerender(); return; }
    const step = { ArrowUp: -8, ArrowDown: 8, ArrowLeft: -1, ArrowRight: 1 }[event.key];
    if (!step) return;
    const buttons = [...grid.children];
    const index = buttons.indexOf(event.target);
    const next = buttons[index + step];
    if (index < 0 || !next || (Math.abs(step) === 1 && Math.floor(index / 8) !== Math.floor((index + step) / 8))) return;
    event.preventDefault();
    event.target.tabIndex = -1;
    next.tabIndex = 0;
    cursor = next.dataset.chessSquare;
    next.focus();
  });
  root.querySelectorAll('[data-chess-drop]').forEach(button => button.addEventListener('click', () => {
    const drop = button.dataset.chessDrop;
    selected = selected?.drop === drop ? null : { drop };
    rerender();
  }));
  const dialog = root.querySelector('#chess-promotion');
  if (dialog) {
    dialog.showModal();
    dialog.addEventListener('close', () => { promotion = null; rerender(); });
    dialog.querySelector('#chess-cancel-promotion').onclick = () => dialog.close();
    dialog.querySelectorAll('[data-chess-promotion]').forEach(button => button.addEventListener('click', () => play(promotion.moves.find(move => move.promotion === button.dataset.chessPromotion))));
  }
}
