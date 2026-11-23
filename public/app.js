import { t, getLanguage, setLanguage, languages, translateError } from './i18n.js';
import { renderScoreboard } from './scoreboard.js';

const $ = selector => document.querySelector(selector);
const app = $('#app');
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tr = (key, values) => esc(t(key, values));
let room = null, session = null;
let tab = new URLSearchParams(location.search).has('room') ? 'join' : 'home';
let selectedGame = 'wordmine';
let busy = false, polling = false, connected = true, offset = 0, signature = '', toastTimeout;
const drafts = new Map(), entryDrafts = new Map();
const revealedRoles = new Set();
let sceneKey = '';
let scoreMotion = new Map();
let gameTransition = null;
let mineAudio = null;
let lastMineTick = null;
const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
function readStoredValue(storage, key, legacyKey) {
  const current = storage.getItem(key);
  if (current !== null) return current;
  const previous = storage.getItem(legacyKey);
  if (previous !== null) { storage.setItem(key, previous); storage.removeItem(legacyKey); }
  return previous;
}
try { session = JSON.parse(readStoredValue(sessionStorage, 'word-mine-session', 'acm-session')); } catch {}

function localizeShell() {
  document.documentElement.lang = getLanguage();
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  $('.brand').setAttribute('aria-label', t('homeAria'));
  $('#language-switch').setAttribute('aria-label', t('language'));
  document.querySelectorAll('[data-language]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.language === getLanguage()));
  });
  $('#close-rules').setAttribute('aria-label', t('close'));
  const theme = $('#theme-toggle');
  theme.setAttribute('aria-label', t('darkTheme'));
  theme.dataset.lightTitle = t('lightTheme');
  theme.dataset.darkTitle = t('enableDark');
  window.dispatchEvent(new Event('wordmine:theme-labels'));
  $('#rule-list').innerHTML = (room?.settings.game || selectedGame) === 'spy' ? `<li><strong>${tr('spy')}</strong><p>${tr('spyRules')}</p></li>` : ['Roles','Mines','Explain','Claim','Score'].map(key => `<li><strong>${tr('rules'+key)}</strong><p>${tr('rules'+key+'Text')}</p></li>`).join('');
}
function captureEntry() {
  app.querySelectorAll('#entry-form input, #home-code').forEach(input => entryDrafts.set(input.id === 'home-code' ? 'code' : input.id, input.type === 'checkbox' ? input.checked : input.value));
}
document.querySelectorAll('[data-language]').forEach(button => {
  button.onclick = () => {
    if (button.dataset.language === getLanguage()) return;
    captureEntry();
    setLanguage(button.dataset.language);
    localizeShell();
    if (room) renderRoom(); else entry();
  };
});
localizeShell();
function toast(message) {
  $('#toast').textContent = message; $('#toast').hidden = false;
  clearTimeout(toastTimeout); toastTimeout = setTimeout(() => { $('#toast').hidden = true; }, 4500);
}
$('#rules-button').onclick = () => { localizeShell(); $('#rules').showModal(); };
$('#close-rules').onclick = () => $('#rules').close();
$('#rules').addEventListener('click', e => { if (e.target === e.currentTarget) { const r = e.currentTarget.getBoundingClientRect(); if (e.clientX < r.left || e.clientY < r.top || e.clientX > r.right || e.clientY > r.bottom) e.currentTarget.close(); } });
$('.brand').addEventListener('click', event => {
  if (!room || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  confirmLeave();
});

const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M4 12h15M13 5l7 7-7 7"/></svg>';
function gameArt(game) {
  if(game==='spy') return `<div class="poster-art dossier-art" aria-hidden="true"><div class="dossier dossier-innocent"><b>●</b></div><div class="dossier dossier-spy"><b>?</b></div><div class="dossier dossier-white"><b>—</b></div></div>`;
  return `<div class="poster-art letter-art" aria-hidden="true"><div class="tile-row">${'WORD'.split('').map((letter,i)=>`<span class="letter-tile" style="--tile:${i}">${letter}</span>`).join('')}</div><div class="tile-row">${'MINE'.split('').map((letter,i)=>`<span class="letter-tile" style="--tile:${i+4}">${letter}</span>`).join('')}</div><span class="tile-burst">✳</span></div>`;
}
function openEntry(nextTab, game = selectedGame) {
  captureEntry();
  const show = () => { selectedGame=game; tab=nextTab; entry(); $('#name')?.focus(); };
  if (reducedMotion() || !app.animate) { show(); return; }
  app.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-12px)'}],{duration:160,easing:'ease-in',fill:'forwards'}).finished.then(() => { app.getAnimations().forEach(a=>a.cancel()); show(); });
}
function bindHomeMotion() {
  document.querySelectorAll('.home-option').forEach(card => {
    card.addEventListener('pointermove', e => {
      if(reducedMotion() || e.pointerType==='touch') return;
      const box=card.getBoundingClientRect();
      card.style.setProperty('--rx', `${((e.clientY-box.top)/box.height-.5)*-5}deg`);
      card.style.setProperty('--ry', `${((e.clientX-box.left)/box.width-.5)*6}deg`);
    });
    card.addEventListener('pointerleave', () => { card.style.setProperty('--rx','0deg'); card.style.setProperty('--ry','0deg'); });
  });
}
function home() {
  app.innerHTML = `<section class="home-intro"><h1>${tr('chooseGame')}</h1></section>
    <section class="game-shelf" aria-label="${tr('chooseGame')}"><div class="home-options">
    <article class="home-option join-option" style="--deal:0"><h2>${tr('joinHeading')}</h2><form id="home-join-form" class="home-join-form"><label for="home-code">${tr('code')}</label><input id="home-code" name="code" aria-label="${tr('code')}" placeholder="000000" minlength="4" maxlength="6" pattern="([0-9]{6}|[0-9]{4}|[A-Za-z2-9]{6})" inputmode="numeric" autocomplete="off" spellcheck="false" required><button class="shelf-button" type="submit">${tr('join')}${arrow}</button></form></article>
    ${['spy','wordmine'].map((game,index)=>`<article class="home-option ${game}-option" style="--deal:${index+1}"><div class="option-meta"><span>${tr('playersThree')}</span></div><h2>${tr(game)}</h2>${gameArt(game)}<p class="option-description">${tr(game==='spy'?'spyShort':'wordmineShort')}</p><button class="shelf-button" type="button" data-create-game="${game}">${tr(game==='spy'?'createSpy':'createWordmine')}${arrow}</button></article>`).join('')}
    </div></section>`;
  $('#home-code').value = entryDrafts.get('code') || entryDrafts.get('home-code') || '';
  $('#home-join-form').onsubmit = e => { e.preventDefault(); entryDrafts.set('code', $('#home-code').value.trim().toUpperCase()); openEntry('join'); };
  bindHomeMotion();
  document.querySelectorAll('[data-create-game]').forEach(button => button.onclick = () => {
    openEntry('create',button.dataset.createGame);
  });
}
function entry() {
  document.body.dataset.screen = 'entry';
  setGameTheme(tab==='create'?selectedGame:null);
  if (tab === 'home') { home(); return; }
  const invite = (new URLSearchParams(location.search).get('room') || '').toUpperCase();
  const legacyInvite = /[A-Z]/.test(invite || entryDrafts.get('code') || '');
  const joining = tab === 'join';
  app.innerHTML = `<section class="entry-stage"><button class="back-link" id="back-games">← ${tr('backGames')}</button><div class="entry-layout"><div class="entry-intro"><h1>${tr(joining?'joinHeading':selectedGame==='spy'?'spy':'wordmine')}</h1>${joining?'':`<div class="entry-art ${selectedGame}-option">${gameArt(selectedGame)}</div><button class="text-button" id="entry-rules">${tr('roomRules')} ↗</button>`}</div>
    <form id="entry-form" class="entry-form"><div class="form-heading"><span class="mono">${tr(joining?'join':'create')}</span><span aria-hidden="true">↘</span></div><div class="field"><label for="name">${tr('name')}</label><input name="name" id="name" placeholder="${tr('namePlaceholder')}" maxlength="24" autocomplete="nickname" required></div>
    ${joining?`<div class="field"><label for="code">${tr('code')}</label><input id="code" name="code" placeholder="000000" value="${esc(invite)}" minlength="4" maxlength="6" pattern="([0-9]{6}|[0-9]{4}|[A-Za-z2-9]{6})" inputmode="${legacyInvite?'text':'numeric'}" autocomplete="off" spellcheck="false" required></div>`:`<div class="field"><label for="capacity">${tr('capacity')} <span class="muted">(${tr('unlimited')})</span></label><input id="capacity" name="capacity" type="number" min="3" max="1000000" step="1" placeholder="${tr('playersThree')}"><span class="field-help">${tr('capacityHelp')}</span></div>`}
    ${!joining && selectedGame==='spy'?roleFields('entry',{spyCount:1,mrWhite:false}):''}<p class="error" id="entry-error" role="alert"></p><button class="primary full" type="submit" ${busy?'disabled':''}>${tr(joining?'enter':selectedGame==='spy'?'createSpy':'createWordmine')}${arrow}</button>${joining?`<p class="form-note">${tr('recovery')}</p>`:`<p class="form-note">${tr('noDownloads')}</p>`}</form></div></section>`;
  $('#back-games').onclick = () => { captureEntry(); tab = 'home'; history.replaceState(null,'','/'); entry(); $('#home-code').focus(); };
  $('#entry-rules')?.addEventListener('click', () => { localizeShell(); $('#rules').showModal(); });
  try { $('#name').value = readStoredValue(localStorage, 'word-mine-name', 'acm-name') || ''; } catch {}
  for (const [id,value] of entryDrafts) { if(document.getElementById(id)) { const input=document.getElementById(id); if(input.type==='checkbox') input.checked=value; else input.value=value; } }
  $('#entry-form').onsubmit = async e => {
    e.preventDefault(); if(busy) return;
    captureEntry();
    const values=Object.fromEntries(new FormData(e.currentTarget));
    const button=e.currentTarget.querySelector('[type=submit]'); button.disabled=true; busy=true; $('#entry-error').textContent='';
    try {
      const result=await request(joining?`/api/rooms/${values.code.trim().toUpperCase()}/join`:'/api/rooms',{name:values.name,settings:{game:selectedGame,capacity:values.capacity,wordLanguage:getLanguage(),spyCount:values.spyCount ?? 1,mrWhite:values.mrWhite==='on'}});
      session={code:result.room.code,token:result.token};
      try { sessionStorage.setItem('word-mine-session',JSON.stringify(session)); localStorage.setItem('word-mine-name',values.name); } catch {}
      history.replaceState(null,'',`/?room=${session.code}`); accept(result.room);
      if(result.rejoined) toast(t('welcomeBack'));
    } catch(e) { $('#entry-error').textContent=e.message; $('#entry-form [type=submit]').disabled=false; }
    finally { busy=false; if(room)renderRoom(); }
  };
}
async function request(path,data) {
  let response;
  try { response=await fetch(path,{method:data?'POST':'GET',headers:{...(data&&{'Content-Type':'application/json'}),...(session&&{'Authorization':`Bearer ${session.token}`})},...(data&&{body:JSON.stringify(data)}),signal:AbortSignal.timeout(12000)}); } catch { throw new Error(t('serverUnavailable')); }
  let result;
  try { result=await response.json(); } catch { throw new Error(t('serverUnavailable')); }
  if(!response.ok) { const error=new Error(translateError(result.error)); error.status=response.status; throw error; }
  return result;
}
function accept(next) {
  if(room && next.serverNow<room.serverNow) return;
  const gameChanged = Boolean(room && (room.settings.game || 'wordmine') !== (next.settings.game || 'wordmine'));
  if(gameChanged) drafts.clear();
  if(room && (room.phase!==next.phase || room.turn!==next.turn || room.round?.id!==next.round?.id)) drafts.clear();
  scoreMotion = new Map(next.players.filter(p=>room?.players.some(old=>old.id===p.id && old.score<p.score)).map(p=>[p.id,room.players.find(old=>old.id===p.id).score]));
  room=next; offset=next.serverNow-Date.now(); connected=true;
  const nextSignature=JSON.stringify({...next,serverNow:0});
  if(signature!==nextSignature) { signature=nextSignature; renderAcceptedRoom(gameChanged); }
  if(gameChanged) toast(t('gameChanged',{name:playerName(next.hostId),game:t(next.settings.game)}));
  $('#connection')?.setAttribute('hidden',''); updateTimer();
}
const isHost=()=>room.me===room.hostId;
const playerName=id=>room.players.find(p=>p.id===id)?.name || room.round?.names?.[id] || t('player');
const me=()=>room.players.find(p=>p.id===room.me);
function roster() {
  return room.players.map(p=>{
    const status=room.settings.game==='spy' && !['lobby','paused','finished'].includes(room.phase) ? (room.round?.eliminated.includes(p.id)?'spyEliminated':!room.round?.participantIds.includes(p.id)?'spectator':'inRoom') : room.phase==='lobby'?(p.ready?'readyStatus':'inRoom'):room.phase==='paused'?'waitingPlayers':room.phase==='finished'?'gameOver':p.id===room.round?.explainerId?'explaining':p.id===room.round?.guesserId?'guessing':'miner';
    return `<div class="player"><div class="avatar">${esc(p.name.slice(0,2).toUpperCase())}</div><div class="player-info"><div class="player-name">${esc(p.name)}${p.id===room.me?` <span class="muted small">(${tr('you')})</span>`:''}</div><div class="player-status">${tr(status)}${p.id===room.hostId?` · ${tr('host')}`:''}</div></div>${room.phase!=='lobby'?`<span class="score" data-score-id="${p.id}" data-score="${p.score}">${p.score}</span>`:''}${isHost()&&p.id!==room.me?`<button class="kick" data-kick="${p.id}" aria-label="${tr('removePlayer',{name:p.name})}">✕</button>`:''}</div>`;
  }).join('');
}
function renderRoom() {
  if(gameTransition) return;
  const previousSwitch=$('#game-switch');
  const previousThumb=previousSwitch?.querySelector('.game-switch-thumb');
  const previousThumbTransform=previousThumb && window.getComputedStyle?.(previousThumb).transform;
  const nextScene = [room.settings.game, room.round?.id, room.phase, room.round?.ballot].join(':');
  const enteringScene = nextScene !== sceneKey; sceneKey = nextScene;
  document.body.dataset.screen = 'room';
  setGameTheme(room.settings.game || 'wordmine');
  const oldDetails=$('#advanced')?.open;
  const focused=document.activeElement?.id;
  const selection=document.activeElement && ['text','search'].includes(document.activeElement.type)?document.activeElement.selectionStart:null;
  app.innerHTML=`<div class="room-top"><h1>${room.phase==='lobby'?tr('lobby'):room.phase==='finished'?tr('gameOver'):room.phase==='paused'?tr('waitingPlayers'):tr('turn',{current:Math.min(room.turn+1,room.totalTurns),total:room.totalTurns})}</h1><div class="room-actions"><button class="secondary" id="invite-button">${tr('invite')} ↗</button><span class="room-code" aria-label="${tr('code')}">${esc(room.code)}</span></div></div>
  ${room.phase==='lobby'?gameSwitcher():''}<div class="connection" id="connection" ${connected?'hidden':''}>${tr('reconnecting')}</div><div class="room-layout"><aside class="panel sidebar"><div class="roster-title"><h2>${tr('players')}</h2><span class="count-pill">${room.players.length} / ${room.settings.capacity??'∞'}</span></div><div class="roster">${roster()}</div><button class="text-button" id="leave-button">${tr('leave')} ↗</button></aside><div class="room-main ${enteringScene?'scene-enter':''}">${room.phase==='lobby'?lobby():room.phase==='finished'?finished():room.phase==='paused'?paused():game()}</div></div>`;
  if(previousSwitch && $('#game-switch')) $('#game-switch').replaceWith(previousSwitch);
  bindGameSwitch(previousThumbTransform);
  $('#invite-button').onclick=copyInvite;
  $('#leave-button').onclick=confirmLeave;
  document.querySelectorAll('[data-kick]').forEach(b=>b.onclick=()=>confirmAction(t('removeTitle'),t('removeMessage',{name:playerName(b.dataset.kick)}),t('remove'),()=>mutate('kick',{playerId:b.dataset.kick})));
  document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>mutate(b.dataset.action));
  $('#lobby-button')?.addEventListener('click',()=>confirmAction(t('lobbyTitle'),t('lobbyMessage'),t('toLobby'),()=>mutate('lobby')));
  $('#skip-button')?.addEventListener('click',()=>confirmAction(t('skipTitle'),t('skipMessage'),t('skip'),()=>mutate('skip')));
  $('#claim-button')?.addEventListener('click',()=>confirmAction(t('claimTitle'),t('claimMessage',{word:room.round.myMine}),t('report'),()=>mutate('claim')));
  $('#accept-claim')?.addEventListener('click',()=>mutate('resolve',{accept:true}));
  $('#reject-claim')?.addEventListener('click',()=>mutate('resolve',{accept:false}));
  $('#mine-form')?.addEventListener('submit',e=>{e.preventDefault();mutate('mine',{word:$('#mine-word').value}).then(success=>{if(success)drafts.delete('mine-word');});});
  $('#guess-form')?.addEventListener('submit',e=>{e.preventDefault();mutate('guess',{word:$('#guess-word').value}).then(success=>{if(success){drafts.delete('guess-word');if($('#guess-word'))$('#guess-word').value='';}});});
  bindSpy();
  $('#settings-form')?.addEventListener('submit',e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget));d.useDefaultWords=$('#default-words').checked;d.mrWhite=$('#set-white')?.checked||false;mutate('settings',d).then(success=>{if(success){drafts.clear();renderRoom();toast(t('saved'));}});});
  for(const [id,value] of drafts) { const input=document.getElementById(id);if(input){if(input.type==='checkbox')input.checked=value;else input.value=value;} }
  document.querySelectorAll('.room-main input,.room-main textarea,.room-main select').forEach(input=>input.addEventListener('input',()=>drafts.set(input.id,input.type==='checkbox'?input.checked:input.value)));
  bindWordLanguages();
  const refreshWordCount=()=>{ const counts=room.settings.wordCounts||{ru:500}; $('#default-words-label').textContent=t('defaultWords',{count:counts[$('#set-word-language').value]||0}); };
  if($('#set-word-language')) { refreshWordCount(); $('#set-word-language').addEventListener('change',refreshWordCount); }
  if(oldDetails&&$('#advanced'))$('#advanced').open=true;
  if(focused&&document.getElementById(focused)){const el=document.getElementById(focused);el.focus({preventScroll:true});if(selection!=null&&el.setSelectionRange)el.setSelectionRange(selection,selection);}
  if(busy) document.querySelectorAll('.room-main button,.kick,#leave-button,[data-switch-game]').forEach(b=>b.disabled=true);
  updateTimer(); animateScores();
}
function lobby() {
  const s=room.settings;
  const config=isHost()?`<form id="settings-form" class="panel"><h2>${tr('settings')}</h2><input type="hidden" id="set-game" name="game" value="${esc(s.game||'wordmine')}"><div class="settings-grid"><div class="field"><label for="set-capacity">${tr('capacity')}</label><input id="set-capacity" name="capacity" type="number" min="${Math.max(3,room.players.length)}" max="1000000" placeholder="${tr('unlimited')}" value="${s.capacity??''}"></div><div class="field"><label for="set-cycles">${tr(s.game==='spy'?'spyRounds':'cycles')}</label><input id="set-cycles" name="cycles" type="number" min="1" max="20" required value="${s.cycles}"></div><div class="field dictionary-language-field"><span class="field-label" id="word-language-label">${tr('wordLanguage')}</span><input type="hidden" id="set-word-language" name="wordLanguage" value="${esc(s.wordLanguage||'ru')}"><div class="word-language-buttons" role="group" aria-labelledby="word-language-label">${Object.entries(languages).map(([code,name])=>`<button type="button" class="word-language-button" data-word-language="${code}" aria-pressed="${code===(s.wordLanguage||'ru')}" lang="${code}"><span>${esc(name)}</span><span class="language-check" aria-hidden="true">✓</span></button>`).join('')}</div></div></div>${s.game==='spy'?roleFields('set',s,s.capacity?Math.max(1,s.capacity-1):1000000):''}<details class="advanced" id="advanced"><summary>${tr(s.game==='spy'?'spyDictionary':'miningSettings')}</summary>${s.game==='spy'?'':`<div class="field"><label>${tr('miningTime')}</label><div class="fixed-setting">${tr('sixtySeconds')}</div></div>`}<label class="check-label"><input id="default-words" name="useDefaultWords" type="checkbox" ${s.useDefaultWords?'checked':''}><span id="default-words-label">${tr('defaultWords',{count:s.wordCounts?.[s.wordLanguage||'ru']||500})}</span></label><label for="set-custom">${tr('customWords')}</label><textarea id="set-custom" name="customWords" placeholder="${tr('customPlaceholder')}" maxlength="61000">${esc(s.customWords)}</textarea><span class="field-help">${tr(s.game==='spy'?'spyCustomHelp':'customHelp')}</span></details><div class="settings-save"><button class="secondary" type="submit">${tr('save')}</button></div></form>`:`<div class="panel"><h2>${tr('waitingStart')}</h2><p class="subtext">${tr('waitingHost',{name:playerName(room.hostId)})}</p><div class="stats-strip"><div class="stat"><strong>${s.cycles}</strong><span>${tr(s.game==='spy'?'spyRounds':'cycles')}</span></div><div class="stat"><strong>${esc(languages[s.wordLanguage||'ru'])}</strong><span>${tr('wordLanguage')}</span></div></div></div>`;
  return `<section class="lobby-color-banner"><div><h2>${tr(s.game||'wordmine')}</h2></div><div class="lobby-banner-art ${s.game==='spy'?'spy-option':'wordmine-option'}">${gameArt(s.game||'wordmine')}</div></section>${s.game==='spy'?`<div class="role-summary">${tr('roleCountSummary',{count:s.spyCount??1,white:t(s.mrWhite?'enabled':'disabled')})}</div><details class="panel lobby-rules"><summary>${tr('roomRules')}</summary><p class="subtext">${tr('spyRules')}</p></details>`:''}${config}<div class="panel lobby-bottom"><div><h3>${tr('playerCount',{count:room.players.length})}</h3><p>${room.players.length<minimumPlayers()?tr('roleRequirements',{count:minimumPlayers()}):tr('canStart')}</p></div><div class="buttons"><button class="${me().ready?'secondary':'primary'}" data-action="ready">${me().ready?'✓ ':''}${tr('ready')}</button>${isHost()?`<button class="primary" data-action="start" ${room.players.length<minimumPlayers()?'disabled':''}>${tr('start')} →</button>`:''}</div></div>`;
}
function paused() {
  return `<section class="panel"><h2>${tr('pause')}</h2><p class="subtext">${tr('pauseHelp',{count:Math.max(0,minimumPlayers()-room.players.length)})}</p></section>${isHost()?`<div class="admin-controls"><button class="text-button" id="lobby-button">${tr('toLobby')} ↗</button></div>`:''}`;
}
function secretCard() {
  const r=room.round;
  return `<div class="secret-card"><span class="mini-label">${tr(r.word?'secret':'partnerKnows')}</span><div class="secret-word ${r.word?'':'hidden-word'}">${r.word?esc(r.word):'••••••'}</div><p>${r.role==='guesser'&&!r.word?tr('listenTo',{name:playerName(r.explainerId)}):tr('keepSecret')}</p>${r.canRedraw?`<button class="secondary" data-action="redraw">↻ ${tr('redraw')}</button><p class="field-help">${tr('redrawHelp')}</p>`:''}</div>`;
}
function sharedMines() {
  const r=room.round;
  const miners=room.players.filter(p=>p.id!==r.explainerId&&p.id!==r.guesserId);
  return `<section class="advanced" aria-label="${tr('sharedMines')}"><span class="mini-label">${tr('sharedMines')}</span><p class="subtext">${tr('minersOnly')}</p><div class="mines-list" aria-live="polite">${miners.map(p=>`<span class="mine-chip">${r.mines?.[p.id]?esc(r.mines[p.id]):`<span class="muted">${tr(room.phase==='mining'?'choosingMine':'noMine')}</span>`}<small>${esc(p.name)}${p.id===room.me?` (${tr('you')})`:''}</small></span>`).join('')}</div></section>`;
}
function scoreboard() {
  return renderScoreboard(room.players, room.me, {title:t('scoreboard'),place:t('place'),player:t('player'),score:t('score'),you:t('you')});
}
function game() {
  if (room.settings.game === 'spy') return spyGame();
  const r=room.round;
  let content='';
  if(room.phase==='mining') {
    content=`<h2>${tr(r.role==='miner'?'miningTitle':'miningWaiting')}</h2><p class="subtext">${tr(r.role==='miner'?'miningHint':'miningWaitHint')}</p>${secretCard()}`;
    if(r.role==='miner')content+=`${r.myMine?`<div class="status-block">${tr('yourMine')}: <strong>${esc(r.myMine)}</strong><br><span class="muted">${tr('replaceHint')}</span></div>`:''}<form id="mine-form" class="mine-form"><input id="mine-word" value="${esc(r.myMine||'')}" placeholder="${tr('minePlaceholder')}" minlength="1" maxlength="20" autocomplete="off" aria-label="${tr('mineInput')}" aria-describedby="mine-help" required><button class="primary" type="submit">${tr(r.myMine?'replaceMine':'placeMine')}</button></form><p class="field-help" id="mine-help">${tr('mineLimit')}</p>`;
    content+=`<div class="mine-progress">${tr('mineCount',{placed:r.mineCount,total:room.players.length-2})}<div class="progress-track"><div class="progress-fill" style="width:${100*r.mineCount/(room.players.length-2)}%"></div></div></div>`;
  } else if(room.phase==='explaining') {
    content=`<h2>${tr(r.role==='explainer'?'explainTitle':r.role==='guesser'?'guessTitle':'listenTitle')}</h2><p class="subtext">${tr('activePair',{explainer:playerName(r.explainerId),guesser:playerName(r.guesserId)})}</p>${secretCard()}`;
    if(r.role==='guesser')content+=`<form id="guess-form" class="mine-form"><input id="guess-word" maxlength="60" placeholder="${tr('guessPlaceholder')}" aria-label="${tr('answer')}" autocomplete="off" required><button class="primary" type="submit">${tr('submitGuess')} →</button></form>`;
    if(r.lastGuess)content+=`<p class="subtext">${tr('wrongGuess',{word:r.lastGuess})}</p>`;
    if(r.role==='miner')content+=r.myMine?`<div class="status-block">${tr('yourMine')}: <strong>${esc(r.myMine)}</strong><br><span class="muted">${tr('reportHint')}</span></div><div class="game-controls"><button id="claim-button" class="danger">✳ ${tr('claim')}</button></div>`:`<p class="note">${tr('noMineHint')}</p>`;
    if(r.role==='explainer'||isHost())content+=`<div class="game-controls"><button class="primary" data-action="guessed">✓ ${tr('guessedAloud')}</button></div>`;
  } else if(room.phase==='claim') {
    content=`<div class="result-heading"><h2>${tr('claimHeading')}</h2><p>${tr('claimBy',{name:playerName(r.claim.playerId)})}</p><div class="secret-word">${esc(r.claim.word)}</div><p>${tr('hostChecking')}</p></div>${isHost()?`<div class="game-controls"><button id="accept-claim" class="danger">${tr('acceptClaim')}</button><button id="reject-claim" class="secondary">${tr('rejectClaim')}</button></div>`:`<div class="note">${tr('waitDecision')}</div>`}`;
  } else if(room.phase==='result') {
    const titles={guessed:'resultGuessed',exploded:'resultExploded',timeout:'resultTimeout',skipped:'resultSkipped'};
    const result=r.result;
    content=`<div class="result-heading"><h2>${tr(titles[result.outcome])}</h2><p>${tr('secret')}</p><div class="secret-word">${esc(r.word)}</div><p>${result.winnerIds.length?tr('pointsAwarded',{names:result.winnerIds.map(playerName).join(', ')}):tr('noPoints')}</p></div>${scoreboard()}<div class="advanced"><span class="mini-label">${tr('roundMines')}</span><div class="mines-list">${Object.entries(r.mines).map(([id,word])=>`<span class="mine-chip ${result.winnerIds.includes(id)&&result.outcome==='exploded'?'hit':''}">${esc(word)}<small>${esc(playerName(id))}</small></span>`).join('')||`<span class="muted small">${tr('noRoundMines')}</span>`}</div></div><div class="game-controls">${isHost()?`<button class="primary" data-action="next">${tr(room.turn+1>=room.totalTurns?'gameResults':'next')} →</button>`:`<p class="subtext">${tr('waitNext')}</p>`}</div>`;
  }
  if(r.role==='miner'&&['mining','explaining','claim'].includes(room.phase))content+=sharedMines();
  return `<section class="panel">${room.phase!=='result'?`<div class="game-head"><span class="role-pill">${tr('role',{role:t(r.role)})}</span><span id="timer" class="timer" aria-label="${tr('timeLeft')}"></span></div>`:''}${content}</section>${isHost()?`<div class="admin-controls">${['mining','explaining','claim'].includes(room.phase)?`<button class="text-button" id="skip-button">${tr('skip')}</button>`:'<span></span>'}<button class="text-button" id="lobby-button">${tr('toLobby')} ↗</button></div>`:''}`;
}
function finished() {
  const highest=Math.max(...room.players.map(p=>p.score));
  const leaders=room.players.filter(p=>p.score===highest);
  return `<section class="panel"><div class="result-heading"><h2>${leaders.length===1?tr('winner',{name:leaders[0].name}):tr('tied')}</h2>${leaders.length>1?`<p>${tr('tiedNames',{names:leaders.map(p=>p.name).join(', ')})}</p>`:''}</div>${scoreboard()}${isHost()?`<button class="primary full" data-action="lobby">${tr('playAgain')} →</button>`:`<p class="subtext">${tr('waitNewGame')}</p>`}</section>`;
}
function enableMineAudio(event) {
  if (!event.isTrusted || mineAudio?.state === 'running') return;
  const AudioContext = window.AudioContext ?? window.webkitAudioContext;
  if (!AudioContext) return;
  try {
    mineAudio ??= new AudioContext();
    mineAudio.resume().then(updateTimer).catch(() => {});
  } catch {} // Audio is optional on browsers that block it.
}
document.addEventListener('click', enableMineAudio, true);
document.addEventListener('keydown', enableMineAudio, true);

function tickMineCountdown(seconds) {
  const round = room.round;
  if (room.phase !== 'mining' || round.role !== 'miner' || round.myMine || seconds < 1 || seconds > 15) return;
  if (mineAudio?.state !== 'running') return;
  if (lastMineTick?.roundId === round.id && lastMineTick.seconds <= seconds) return;
  lastMineTick = { roundId: round.id, seconds };

  const now = mineAudio.currentTime;
  const tick = mineAudio.createOscillator();
  const volume = mineAudio.createGain();
  tick.frequency.setValueAtTime(seconds % 2 ? 1200 : 900, now);
  tick.frequency.exponentialRampToValueAtTime(450, now + 0.035);
  volume.gain.setValueAtTime(0, now);
  volume.gain.linearRampToValueAtTime(0.07, now + 0.003);
  volume.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
  tick.connect(volume).connect(mineAudio.destination);
  tick.onended = () => volume.disconnect();
  tick.start(now);
  tick.stop(now + 0.04);
}
function updateTimer() {
  const element=$('#timer'); if(!element||!room?.round)return;
  const deadline=room.round.deadline;
  element.classList.toggle('untimed',!deadline);
  element.setAttribute('aria-label',deadline?t('timeLeft'):'');
  if(!deadline){element.classList.remove('low');element.textContent=room.phase==='explaining'?t('untimed'):room.phase==='claim'?t('checking'):'—';return;}
  const seconds=Math.max(0,Math.ceil((deadline-Date.now()-offset)/1000));
  element.textContent=`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;
  element.classList.toggle('low',seconds<=10);
  tickMineCountdown(seconds);
}
async function mutate(action,data={}) {
  if(busy)return false;busy=true;
  if(room?.round&&(action.startsWith('spy-') || ['mine','redraw','guess','guessed','claim','resolve','skip','next'].includes(action)))data={...data,roundId:room.round.id};
  document.querySelectorAll('.room-main button,.kick,#leave-button,[data-switch-game]').forEach(b=>b.disabled=true);
  try {
    const result=await request(`/api/rooms/${session.code}/action`,{action,data});
    if(result.left){clearSession();room=null;signature='';drafts.clear();entryDrafts.clear();tab='home';history.replaceState(null,'','/');entry();}
    else accept(result.room);
    return true;
  } catch(e){toast(e.message);if(e.status===401||e.status===404)lostRoom(e.message);return false;}
  finally{busy=false;if(room){signature='';if(!gameTransition)renderRoom();}else if($('#entry-form [type=submit]'))$('#entry-form [type=submit]').disabled=false;}
}
function confirmLeave() {
  if (busy) return;
  const leavingSession = session;
  confirmAction(t('leaveTitle'), t(room.phase === 'lobby' ? 'leaveLobby' : 'leaveGame'), t('leave'), () => {
    if (session === leavingSession) mutate('leave');
  });
}
function confirmAction(title,message,label,callback) {
  const dialog=document.createElement('dialog');dialog.className='dialog';
  dialog.innerHTML=`<h2>${esc(title)}</h2><p class="confirmation-text">${esc(message)}</p><div class="confirm-actions"><button class="secondary" id="cancel-confirm">${tr('cancel')}</button><button class="primary" id="accept-confirm">${esc(label)}</button></div>`;
  document.body.append(dialog);dialog.showModal();
  dialog.querySelector('#cancel-confirm').onclick=()=>dialog.close();
  dialog.querySelector('#accept-confirm').onclick=()=>{dialog.close();callback();};
  dialog.onclose=()=>dialog.remove();
}
async function copyInvite() {
  const link=`${location.origin}/?room=${room.code}`;
  try{await navigator.clipboard.writeText(link);toast(t('copied'));}
  catch{const d=document.createElement('dialog');d.className='dialog';d.innerHTML=`<h2>${tr('inviteTitle')}</h2><p class="confirmation-text">${tr('inviteHelp')}</p><input readonly aria-label="${tr('inviteLink')}" value="${esc(link)}"><button class="secondary full" style="margin-top:18px">${tr('done')}</button>`;document.body.append(d);d.showModal();d.querySelector('input').select();d.querySelector('button').onclick=()=>d.close();d.onclose=()=>d.remove();}
}
function clearSession(){session=null;try{sessionStorage.removeItem('word-mine-session');sessionStorage.removeItem('acm-session');}catch{}}
function lostRoom(message){clearSession();room=null;signature='';entry();toast(message);}
async function poll() {
  if (!session || busy || polling || document.hidden) return;
  const pollingSession = session;
  polling = true;
  try {
    const result = await request(`/api/rooms/${pollingSession.code}`);
    if (session === pollingSession) accept(result.room);
  } catch (error) {
    if (session !== pollingSession) return;
    if (error.status === 401 || error.status === 404) lostRoom(error.message);
    else { connected = false; $('#connection')?.removeAttribute('hidden'); }
  } finally {
    polling = false;
  }
}
if(session&&(!new URLSearchParams(location.search).get('room')||new URLSearchParams(location.search).get('room').toUpperCase()===session.code)){
  try{const result=await request(`/api/rooms/${session.code}`);history.replaceState(null,'',`/?room=${session.code}`);accept(result.room);}
  catch(e){if(e.status===401||e.status===404)clearSession();entry();toast(e.message);}
}else{clearSession();entry();}
setInterval(poll,1200);setInterval(updateTimer,250);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)poll();});

function bindSpy() {
  $('#role-settings-form')?.addEventListener('submit', e => { e.preventDefault(); const d=Object.fromEntries(new FormData(e.currentTarget)); d.mrWhite=$('#next-white').checked; mutate('spy-settings',d).then(success=>{if(success)toast(t('saved'));}); });
  $('#reveal-role')?.addEventListener('click', () => {
    const key=room.round.id;
    if(revealedRoles.has(key)) revealedRoles.delete(key); else revealedRoles.add(key);
    const card=$('#private-role-card'); card.classList.toggle('is-revealed',revealedRoles.has(key));
    $('#reveal-role').setAttribute('aria-expanded',String(revealedRoles.has(key)));
    $('#reveal-role').setAttribute('aria-label',roleAccessibleLabel(room.round,revealedRoles.has(key)));
    card.querySelector('.role-front').setAttribute('aria-hidden',String(!revealedRoles.has(key)));
    card.querySelector('.role-back').setAttribute('aria-hidden',String(revealedRoles.has(key)));
  });
  const r = room.round;
  $('#spy-clue-form')?.addEventListener('submit', e => { e.preventDefault(); mutate('spy-clue', {word: $('#spy-clue-word').value}); });
  $('#spy-guess-form')?.addEventListener('submit', e => { e.preventDefault(); mutate('spy-guess', {word: $('#spy-guess-word').value}); });
  document.querySelectorAll('[data-vote]').forEach(b => b.onclick = () => mutate('spy-vote', {playerId: b.dataset.vote || null, ballot: r.ballot}));
  document.querySelectorAll('[data-confirm-vote]').forEach(b => b.onclick = () => mutate('spy-confirm-vote', {accept: b.dataset.confirmVote === 'yes', ballot: r.ballot}));
  document.querySelectorAll('[data-spy-score]').forEach(b => b.onclick = () => confirmAction(t('spyCaught', {name:playerName(r.caughtId || r.spyId)}), t('spyGuessReview', {word:r.guess}), b.textContent, () => mutate('spy-score', {guessed:b.dataset.spyScore==='yes'})));
  $('#spy-undetected')?.addEventListener('click', () => confirmAction(t('hiddenWin'), t('hiddenWinConfirm'), t('acceptClaim'), () => mutate('spy-undetected')));
}
function spyGame() {
  const r = room.round;
  const active = r.participantIds.filter(id => !r.eliminated.includes(id));
  const canPlay = active.includes(room.me);
  let content = '';
  if (room.phase === 'result') {
    content = `<div class="result-heading spy-result"><span class="result-emblem" aria-hidden="true">${r.result.outcome==='caught'?'✓':r.result.outcome==='undetected'?'?':'—'}</span><h2>${tr(r.result.outcome==='caught'?'spyInnocentWin':r.result.outcome==='undetected'?'hiddenWin':'resultSkipped')}</h2>${(r.spyIds || [r.spyId]).filter(Boolean).map(id=>`<p>${tr('spyIdentity',{name:playerName(id)})}</p>`).join('')}${r.whiteId?`<p>${tr('whiteIdentity',{name:playerName(r.whiteId)})}</p>`:''}<span class="mini-label">${tr('secret')}</span><div class="secret-word">${esc(r.word)}</div>${Object.entries(r.result.awards).map(([id,points])=>`<p>${tr('spyAward',{name:playerName(id),points})}</p>`).join('') || `<p>${tr('noPoints')}</p>`}</div>${scoreboard()}${isHost() && room.turn+1<room.totalTurns?`<form id="role-settings-form" class="next-role-settings"><h3>${tr('nextRoles')}</h3>${roleFields('next',room.settings,room.players.length-1)}<button class="secondary" type="submit">${tr('save')}</button></form>`:''}<div class="game-controls">${isHost()?`<button class="primary" data-action="next">${tr(room.turn+1>=room.totalTurns?'gameResults':'next')} →</button>`:`<p>${tr('waitNext')}</p>`}</div>`;
  } else {
    content = r.eliminated.includes(room.me)?`<p class="note">${tr('spyEliminated')}</p>`:'';
    if(r.role==='spectator') content += `<p class="note">${tr('spySpectating')}</p>`;
    else content += privateRoleCard(r);
    if (room.phase === 'spy-clues') {
      content += `<h2>${tr('spySpeaking',{count:r.ballot})}</h2><p class="subtext">${tr('spySpeaker',{name:playerName(r.speakerId)})}</p>`;
      if(r.speakerId===room.me) content += `<form id="spy-clue-form" class="mine-form"><input id="spy-clue-word" aria-label="${tr('spyClue')}" placeholder="${tr('spyClue')}" maxlength="40" pattern="[^\\s]+" autocomplete="off" required><button class="primary">${tr('spySubmit')}</button></form>`;
    }
    if (room.phase === 'spy-vote') {
      content += `<h2>${tr('spyVoteTitle')}</h2><p class="subtext">${tr('spyVoteHelp')}</p><p role="status">${tr('spyVotes',{count:r.voteCount,total:active.length})}</p>`;
      if(active.length<=2) content += `<p class="note">${tr('spyFinalTwo')}</p>`;
      else if(canPlay && !r.hasVoted) content += `<div class="spy-votes">${active.filter(id=>id!==room.me).map(id=>`<button class="secondary" data-vote="${esc(id)}">${tr('spyVote')}: ${esc(playerName(id))}</button>`).join('')}<button class="text-button" data-vote="">${tr('spyAbstain')}</button></div>`;
      else if(r.hasVoted) content += `<p class="note vote-receipt"><span aria-hidden="true">✓</span> ${tr('spyVoted')}</p>`;
      if(r.votesComplete) {
        content += `<div class="status-block">${Object.entries(r.tally).map(([id,count])=>`<div class="vote-result-row"><span>${esc(playerName(id))}</span><strong>${count}</strong><span class="vote-bar" style="--vote-share:${100*count/active.length}%" aria-hidden="true"></span></div>`).join('')}<p>${r.candidateId?tr('spyCandidate',{name:playerName(r.candidateId)}):tr('spyNoMajority')}</p></div>`;
        if(isHost()) content += `<div class="game-controls">${r.candidateId?`<button class="danger" data-confirm-vote="yes">${tr('spyEliminate')}</button>`:''}<button class="secondary" data-confirm-vote="no">${tr('spyContinue')}</button></div>`;
        else content += `<p>${tr('waitDecision')}</p>`;
      }
      if(isHost()) content += `<div class="game-controls"><button class="primary" id="spy-undetected">${tr('confirmHiddenWin')}</button></div>`;
    }
    if (room.phase === 'spy-guess') {
      content += `<h2>${tr('spyCaught',{name:playerName(r.caughtId || r.spyId)})}</h2><p class="subtext">${tr('spyGuessHelp')}</p>`;
      if(r.guess===null && room.me===(r.caughtId || r.spyId)) content += `<form id="spy-guess-form" class="mine-form"><input id="spy-guess-word" aria-label="${tr('answer')}" placeholder="${tr('guessPlaceholder')}" maxlength="60" autocomplete="off" required><button class="primary">${tr('submitGuess')}</button></form>`;
      else if(r.guess===null) content += `<p>${tr('spyGuessWaiting')}</p>`;
      else { content += `<p class="status-block">${tr('spyGuessReview',{word:r.guess})}</p>`; if(isHost()) content += `<div class="game-controls"><button class="primary" data-spy-score="yes">${tr('spyBonusCorrect')}</button><button class="secondary" data-spy-score="no">${tr('spyBonusWrong')}</button></div>`; else content += `<p>${tr('waitDecision')}</p>`; }
    }
    if(room.phase==='spy-guess') content += `<p class="field-help">${tr('bonusHelp')}</p>`;
    if(room.phase==='spy-review') content += `<h2>${tr('innocentsReady')}</h2>${isHost()?`<button class="primary" data-action="spy-finish">${tr('confirmInnocents')}</button>`:`<p>${tr('waitDecision')}</p>`}`;
    if(r.clues.length) content += `<ol class="spy-clues">${r.clues.map(clue=>`<li><span class="muted">${esc(playerName(clue.playerId))} · ${clue.ballot}</span><strong>${esc(clue.word)}</strong></li>`).join('')}</ol>`;
  }
  return `<section class="panel">${content}</section>${isHost()?`<div class="admin-controls">${room.phase!=='result'?`<button class="text-button" id="skip-button">${tr('skip')}</button>`:'<span></span>'}<button class="text-button" id="lobby-button">${tr('toLobby')} ↗</button></div>`:''}`;
}

function minimumPlayers() {
  return room.settings.game==='spy' ? Math.max(3,(room.settings.spyCount??1)+Number(Boolean(room.settings.mrWhite))+1) : 3;
}
function roleFields(prefix, values, max = 1000000) {
  return `<fieldset class="role-config"><legend>${tr('roleSetup')}</legend><div class="role-config-grid"><div class="field"><label for="${prefix}-spies">${tr('spyCount')}</label><input id="${prefix}-spies" name="spyCount" type="number" min="0" max="${max}" value="${values.spyCount??1}" step="1" required></div><label class="white-toggle" for="${prefix}-white"><input id="${prefix}-white" name="mrWhite" type="checkbox" ${values.mrWhite?'checked':''}><span class="toggle-track" aria-hidden="true"></span><span><strong>${tr('mrWhite')}</strong><small>${tr('mrWhiteHelp')}</small></span></label></div></fieldset>`;
}
function privateRoleCard(r) {
  const revealed=revealedRoles.has(r.id);
  return `<div class="private-role ${revealed?'is-revealed':''}" id="private-role-card" data-role="${esc(r.role)}"><button id="reveal-role" class="role-flipper" type="button" aria-expanded="${revealed}" aria-label="${esc(roleAccessibleLabel(r,revealed))}"><span class="role-face role-back" aria-hidden="${revealed}"><span class="role-seal" aria-hidden="true">?</span><span class="reveal-prompt">${tr('revealRole')} ↗</span></span><span class="role-face role-front" aria-hidden="${!revealed}"><span class="mini-label">${tr('role',{role:t(r.role)})}</span><span class="secret-word">${r.role==='mrWhite'?'—':esc(r.role==='spy'?r.hint:r.word)}</span><span class="role-secret-label">${tr(r.role==='mrWhite'?'whiteBlank':r.role==='spy'?'spyHint':'secret')}</span><span class="role-secret-help">${tr(r.role==='mrWhite'?'whitePlay':'spyKeep')}</span><span class="hide-prompt">${tr('hideRole')} ↶</span></span></button></div>`;
}

function animateScores() {
  if(reducedMotion() || !window.requestAnimationFrame) return;
  document.querySelectorAll('[data-score-id]').forEach(el=>{
    const from=scoreMotion.get(el.dataset.scoreId), to=Number(el.dataset.score);
    if(from==null || from>=to) return;
    el.classList.add('score-changed');
    const started=performance.now();
    const frame=now=>{
      if(!el.isConnected) return;
      const progress=Math.min(1,(now-started)/650);
      el.textContent=String(Math.round(from+(to-from)*(1-Math.pow(1-progress,3))));
      if(progress<1) window.requestAnimationFrame(frame);
    };
    window.requestAnimationFrame(frame);
  });
}

function roleAccessibleLabel(r,revealed) {
  if(!revealed) return t('revealRole');
  const detail=r.role==='mrWhite'?t('whiteBlank'):`${t(r.role==='spy'?'spyHint':'secret')}: ${r.role==='spy'?r.hint:r.word}`;
  return `${t('role',{role:t(r.role)})}. ${detail}. ${t('hideRole')}`;
}

function setGameTheme(game) {
  if(game) { document.documentElement.dataset.game=game; document.body.dataset.game=game; }
  else { delete document.documentElement.dataset.game; delete document.body.dataset.game; }
  window.dispatchEvent(new Event('wordmine:palette'));
}
function renderAcceptedRoom(gameChanged) {
  if(gameTransition) return;
  const main=$('.room-main');
  if(!gameChanged || reducedMotion() || !main?.animate) { renderRoom(); return; }
  app.classList.add('is-switching-game');
  app.setAttribute('aria-busy','true');
  gameTransition=main.animate([{opacity:1,transform:'translateX(0)'},{opacity:0,transform:'translateX(-14px)'}],{duration:150,easing:'ease-in',fill:'forwards'});
  gameTransition.finished.catch(()=>{}).then(()=>{
    gameTransition=null;
    app.classList.remove('is-switching-game');
    app.removeAttribute('aria-busy');
    if (room) renderRoom();
  });
}
function gameSwitcher() {
  return `<section class="lobby-switch-bar" aria-label="${tr('gameMode')}"><div><span class="field-label">${tr('gameMode')}</span></div><div class="game-switch" id="game-switch" role="radiogroup" aria-label="${tr('gameMode')}" style="--switch-position:${room.settings.game==='spy'?1:0}"><span class="game-switch-thumb" aria-hidden="true"></span>${['wordmine','spy'].map(mode=>`<button id="switch-${mode}" type="button" role="radio" data-switch-game="${mode}" aria-checked="${(room.settings.game||'wordmine')===mode}" tabindex="${(room.settings.game||'wordmine')===mode?0:-1}" ${!isHost()?'disabled':''}><span class="game-swatch swatch-${mode}" aria-hidden="true"></span><span data-switch-label>${tr(mode)}</span></button>`).join('')}</div></section>`;
}
function bindGameSwitch(previousTransform) {
  const control=$('#game-switch'); if(!control) return;
  control.setAttribute('aria-label',t('gameMode'));
  if(!isHost())control.title=t('gameSwitchHelp');
  let drag=null, ignoreClickUntil=0;
  const previousGame=control.querySelector('[aria-checked="true"]')?.dataset.switchGame;
  const position=()=>room.settings.game==='spy'?1:0;
  control.style.setProperty('--switch-position',String(position()));
  const thumb=control.querySelector('.game-switch-thumb');
  if(previousGame && previousGame!==(room.settings.game||'wordmine') && !reducedMotion() && thumb.animate) {
    thumb.animate([{transform:previousTransform || `translateX(${previousGame==='spy'?100:0}%)`},{transform:`translateX(${position()*100}%)`}],{duration:450,easing:'cubic-bezier(.2,.8,.2,1)'});
  }
  const choose=mode=>{
    if(!isHost() || busy || mode===(room.settings.game||'wordmine')) return false;
    control.style.setProperty('--switch-position',String(mode==='spy'?1:0));
    mutate('switch-game',{game:mode});
    return true;
  };
  control.querySelectorAll('[data-switch-game]').forEach(button=>{
    const selected=button.dataset.switchGame===(room.settings.game||'wordmine');
    button.disabled=!isHost() || busy;
    button.setAttribute('aria-checked',String(selected)); button.tabIndex=selected?0:-1;
    button.querySelector('[data-switch-label]').textContent=t(button.dataset.switchGame);
    button.onclick=()=>{if(performance.now()>ignoreClickUntil)choose(button.dataset.switchGame);};
  });
  control.onkeydown=e=>{
    if(!isHost() || busy || !['ArrowLeft','ArrowRight','Home','End'].includes(e.key)) return;
    e.preventDefault(); const mode=['ArrowRight','End'].includes(e.key)?'spy':'wordmine';
    $(`#switch-${mode}`).focus(); choose(mode);
  };
  control.onpointerdown=e=>{
    if(!isHost() || busy || (e.button!=null && e.button!==0)) return;
    drag={id:e.pointerId,start:e.clientX,position:position(),width:control.getBoundingClientRect().width,moved:false};
  };
  control.onpointermove=e=>{
    if(!drag || drag.id!==e.pointerId) return;
    const dx=e.clientX-drag.start;
    if(!drag.moved && Math.abs(dx)<7) return;
    if(!drag.moved) {drag.moved=true;control.setPointerCapture?.(e.pointerId);control.classList.add('is-dragging');}
    drag.position=Math.max(0,Math.min(1,position()+dx/(drag.width/2)));
    control.style.setProperty('--switch-position',String(drag.position));
  };
  const finish=(e,cancelled=false)=>{
    if(!drag || drag.id!==e.pointerId) return;
    const ended=drag; drag=null; control.classList.remove('is-dragging');
    let settled=position();
    if(ended.moved) {
      ignoreClickUntil=performance.now()+350;
      const target=ended.position>=.5?'spy':'wordmine';
      if(!cancelled && choose(target)) settled=target==='spy'?1:0;
    }
    control.style.setProperty('--switch-position',String(settled));
    if(control.hasPointerCapture?.(e.pointerId))control.releasePointerCapture(e.pointerId);
  };
  control.onpointerup=e=>finish(e);
  control.onpointercancel=e=>finish(e,true);
  control.onlostpointercapture=e=>{if(drag)finish(e,true);};
}
function bindWordLanguages() {
  const hidden=$('#set-word-language'); if(!hidden) return;
  const sync=()=>document.querySelectorAll('[data-word-language]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.wordLanguage===hidden.value)));
  document.querySelectorAll('[data-word-language]').forEach(button=>button.onclick=()=>{
    hidden.value=button.dataset.wordLanguage; drafts.set(hidden.id,hidden.value); sync();
    hidden.dispatchEvent(new Event('change',{bubbles:true}));
  });
  sync();
}
