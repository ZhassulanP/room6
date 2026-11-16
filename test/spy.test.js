import test from 'node:test';
import assert from 'node:assert/strict';
import { createRoom, newPlayer, joinRoom, act, tick, view, settings } from '../src/game.js';
import { SPY_WORDS } from '../src/words.js';

function setup(count = 4, input = {}) {
  const room = createRoom('123456', newPlayer('Leader', 'host'), {game:'spy', wordLanguage:'en', cycles:2, ...input}, 1000);
  for (let i=1;i<count;i++) joinRoom(room, newPlayer(`Player ${i}`, `p${i}`), 1000);
  act(room, 'host', 'start', {}, 1000);
  return room;
}
function action(room, token, name, data = {}) {
  return act(room, token, name, {roundId:room.round?.id, ballot:room.round?.ballot, ...data}, 2000);
}
const player = (room, id) => room.players.find(p=>p.id===id);
function clues(room) {
  while (room.phase==='spy-clues') action(room, player(room, room.round.speakingIds[0]).token, 'spy-clue', {word:'association'});
}
function voteOut(room, id) {
  clues(room);
  for (const p of room.players.filter(p=>room.round.participantIds.includes(p.id) && !room.round.eliminated.includes(p.id))) {
    action(room, p.token, 'spy-vote', {playerId:p.id===id ? null : id});
  }
  action(room, 'host', 'spy-confirm-vote', {accept:true});
}

test('Spy uses private roles, topic hints, and dictionaries in all three languages', () => {
  for (const lang of ['ru','en','kk']) {
    const room = setup(4, {wordLanguage:lang});
    assert.equal(room.phase, 'spy-clues');
    assert.ok(SPY_WORDS[lang].split(';').includes(`${room.round.word}|${room.round.hint}`));
    for (const p of room.players) {
      const state = view(room, p.token);
      assert.equal(state.round.role, p.id===room.round.spyId?'spy':'innocent');
      assert.equal(state.round.word, p.id===room.round.spyId?null:room.round.word);
      assert.equal(state.round.hint, p.id===room.round.spyId?room.round.hint:null);
      assert.equal(state.round.spyId, null);
      assert.equal(state.settings.customWords, '');
      assert.ok(state.players.every(p=>!Object.hasOwn(p,'token')));
      assert.equal(state.settings.wordCounts[lang], 30);
    }
    tick(room, 9999999);
    assert.equal(room.phase,'spy-clues');
  }
});

test('clues follow turn order, reject multiple words and secret words, then open voting', () => {
  const room = setup();
  assert.throws(()=>action(room,'p1','spy-clue',{word:'clue'}));
  assert.throws(()=>action(room,'host','spy-clue',{word:'two words'}));
  assert.throws(()=>action(room,'host','spy-clue',{word:room.round.word}));
  assert.throws(()=>action(room,'host','spy-vote',{playerId:room.players[1].id}));
  clues(room);
  assert.equal(room.phase,'spy-vote');
  assert.equal(room.round.clues.length,4);
  assert.ok(room.players.every(p=>p.score===0));
});

test('votes stay secret until complete; duplicate, self, spectator and stale votes are rejected', () => {
  const room=setup(); clues(room);
  const oldBallot=room.round.ballot;
  action(room,'host','spy-vote',{playerId:room.players[1].id});
  assert.equal(view(room,'p1').round.tally,null);
  assert.equal(view(room,'host').round.myVote,room.players[1].id);
  assert.throws(()=>action(room,'host','spy-vote',{playerId:null}));
  assert.throws(()=>action(room,'p1','spy-vote',{playerId:room.players[1].id}));
  assert.throws(()=>action(room,'host','spy-confirm-vote',{accept:true}));
  for(const token of ['p1','p2','p3']) action(room,token,'spy-vote',{playerId:null});
  assert.equal(view(room,'host').round.candidateId,null);
  action(room,'host','spy-confirm-vote',{accept:true});
  assert.equal(room.phase,'spy-clues');
  clues(room);
  assert.throws(()=>action(room,'p1','spy-vote',{playerId:null,ballot:oldBallot}));
});

test('a majority needs leader confirmation; innocent elimination preserves their eventual winning point', () => {
  const room=setup(5);
  const innocent=room.players.find(p=>p.id!==room.round.spyId && p.token!=='host');
  voteOut(room,innocent.id);
  assert.ok(room.round.eliminated.includes(innocent.id));
  assert.equal(room.phase,'spy-clues');
  assert.ok(!room.round.speakingIds.includes(innocent.id));
  assert.throws(()=>action(room,innocent.token,'spy-clue',{word:'hello'}));
  voteOut(room,room.round.spyId);
  const spy=player(room,room.round.spyId);
  assert.equal(view(room,spy.token).round.word,null);
  action(room,spy.token,'spy-guess',{word:room.round.word});
  assert.ok(room.players.every(p=>p.score===0));
  assert.throws(()=>action(room,'p1','spy-score',{guessed:true}));
  action(room,'host','spy-score',{guessed:true});
  assert.ok(room.players.every(p=>p.score===1));
  assert.equal(room.phase,'result');
  assert.throws(()=>action(room,'host','spy-score',{guessed:true}));
});

test('caught spy gets one guess; leader confirms either correct or incorrect scoring', () => {
  for(const correct of [true,false]) {
    const room=setup(); voteOut(room,room.round.spyId);
    const spy=player(room,room.round.spyId);
    assert.equal(room.phase,'spy-guess');
    assert.throws(()=>action(room,'host','spy-score',{guessed:true}));
    const innocent=room.players.find(p=>p.id!==spy.id);
    assert.throws(()=>action(room,innocent.token,'spy-guess',{word:'anything'}));
    action(room,spy.token,'spy-guess',{word:correct?room.round.word:'wrong'});
    assert.throws(()=>action(room,spy.token,'spy-guess',{word:room.round.word}));
    action(room,'host','spy-score',{guessed:correct});
    assert.equal(spy.score,correct?1:0);
    assert.ok(room.players.filter(p=>p.id!==spy.id).every(p=>p.score===1));
    assert.equal(view(room,spy.token).round.word,room.round.word);
  }
});

test('undetected spy gets exactly three points only after leader confirmation; next round preserves scores', () => {
  const room=setup();
  assert.throws(()=>action(room,'host','spy-undetected'));
  clues(room);
  assert.throws(()=>action(room,'p1','spy-undetected'));
  const spy=player(room,room.round.spyId);
  const old=room.round.id;
  action(room,'host','spy-undetected');
  assert.equal(spy.score,3);
  assert.ok(room.players.filter(p=>p.id!==spy.id).every(p=>p.score===0));
  assert.throws(()=>action(room,'host','spy-undetected'));
  action(room,'host','next');
  assert.equal(room.turn,1);
  assert.equal(spy.score,3);
  assert.throws(()=>action(room,'host','skip',{roundId:old}));
  action(room,'host','skip'); action(room,'host','next');
  assert.equal(room.phase,'finished');
  action(room,'host','lobby'); action(room,'host','start');
  assert.ok(room.players.every(p=>p.score===0));
});

test('two survivors require leader to confirm the undetected spy win', () => {
  const room=setup(3);
  const innocent=room.players.find(p=>p.id!==room.round.spyId);
  voteOut(room,innocent.id);
  assert.equal(room.phase,'spy-vote');
  assert.ok(room.players.every(p=>p.score===0));
  action(room,'host','spy-undetected');
  assert.equal(player(room,room.round.spyId).score,3);
});

test('late arrivals spectate until next round, reconnects keep roles, departures restart without points', () => {
  const room=setup();
  const late=joinRoom(room,newPlayer('Late','late'),1500);
  assert.equal(view(room,'late').round.role,'spectator');
  assert.equal(view(room,'late').round.word,null);
  const old=room.round.id;
  const spy=player(room,room.round.spyId);
  joinRoom(room,newPlayer(spy.name,'reconnected'),1600);
  assert.equal(room.round.id,old);
  assert.equal(view(room,'reconnected').round.role,'spy');
  clues(room);
  assert.throws(()=>action(room,'late','spy-vote',{playerId:null}));
  const leaderToken=player(room,room.hostId).token;
  action(room,leaderToken,'spy-undetected'); action(room,leaderToken,'next');
  assert.equal(view(room,'late').round.role==='spectator',false);
  const scores=room.players.map(p=>[p.id,p.score]);
  action(room,'late','leave');
  assert.notEqual(room.round.id,old);
  for(const [id,score] of scores) if(player(room,id)) assert.equal(player(room,id).score,score);
});

test('Spy pauses below three, transfers leadership, resumes safely and supports custom hints', () => {
  const room=setup(3,{useDefaultWords:false,customWords:'Pizza | Food'});
  assert.equal(room.round.word,'Pizza'); assert.equal(room.round.hint,'Food');
  act(room,'host','leave');
  assert.equal(room.phase,'paused'); assert.equal(room.round,null);
  assert.equal(room.hostId,room.players[0].id);
  joinRoom(room,newPlayer('New','new'));
  assert.equal(room.phase,'spy-clues');
  assert.ok(room.players.every(p=>p.score===0));
  for(const customWords of ['Pizza','Pizza | Pizza','Pizza | Tasty pizza','Pizza | Food | More']) assert.throws(()=>settings({game:'spy',customWords}));
  assert.throws(()=>settings({game:'invalid'}));
});

test('multiplayer API preserves simultaneous votes and applies concurrent leader scoring exactly once', async () => {
  const {api}=await import('../src/api.js');
  let record=null;
  const store={
    async create(room){record={room:structuredClone(room),version:0,updated:Date.now()};return true;},
    async get(){return structuredClone(record);},
    async save(room,version,now){if(record.version!==version)return false;record={room:structuredClone(room),version:version+1,updated:now};return true;}
  };
  async function request(path,body,token){
    const response=await api(new Request(`http://localhost${path}`,{method:body?'POST':'GET',headers:{...(token?{Authorization:`Bearer ${token}`}:{})},...(body?{body:JSON.stringify(body)}:{})}),store);
    return {status:response.status,...await response.json()};
  }
  const host=await request('/api/rooms',{name:'Leader',settings:{game:'spy',wordLanguage:'en'}});
  const base=`/api/rooms/${host.room.code}`;
  const alice=await request(base+'/join',{name:'Alice'});
  const bob=await request(base+'/join',{name:'Bob'});
  const tokens=[host.token,alice.token,bob.token];
  const send=(token,action,data={})=>request(base+'/action',{action,data:{roundId:record.room.round?.id,ballot:record.room.round?.ballot,...data}},token);
  assert.equal((await send(host.token,'start')).status,200);
  while(record.room.phase==='spy-clues'){
    const speaker=record.room.players.find(p=>p.id===record.room.round.speakingIds[0]);
    assert.equal((await send(speaker.token,'spy-clue',{word:'clue'})).status,200);
  }
  const spyId=record.room.round.spyId;
  const responses=await Promise.all(tokens.map(token=>send(token,'spy-vote',{playerId:record.room.players.find(p=>p.token===token).id===spyId?null:spyId})));
  assert.ok(responses.every(r=>r.status===200));
  assert.equal(Object.keys(record.room.round.votes).length,3);
  assert.equal((await send(host.token,'spy-confirm-vote',{accept:true})).status,200);
  const spyToken=record.room.players.find(p=>p.id===spyId).token;
  assert.equal((await request(base,null,spyToken)).room.round.word,null);
  assert.equal((await send(spyToken,'spy-guess',{word:record.room.round.word})).status,200);
  const scores=await Promise.all([send(host.token,'spy-score',{guessed:true}),send(host.token,'spy-score',{guessed:true})]);
  assert.equal(scores.filter(r=>r.status===200).length,1);
  assert.equal(record.room.phase,'result');
  assert.ok(record.room.players.every(p=>p.score===1));
});

test('configurable spies and Mr. White get separate private information with no teammate disclosure', () => {
  const room=setup(7,{spyCount:2,mrWhite:true});
  assert.equal(room.round.spyIds.length,2);
  assert.ok(!room.round.spyIds.includes(room.round.whiteId));
  const roles=room.players.map(p=>view(room,p.token).round.role);
  assert.equal(roles.filter(r=>r==='spy').length,2);
  assert.equal(roles.filter(r=>r==='mrWhite').length,1);
  assert.equal(roles.filter(r=>r==='innocent').length,4);
  for(const p of room.players) {
    const state=view(room,p.token).round;
    assert.equal(state.spyIds,null);
    assert.equal(state.whiteId,null);
    if(state.role==='mrWhite') {assert.equal(state.word,null);assert.equal(state.hint,null);}
    if(state.role==='spy') {assert.equal(state.word,null);assert.equal(state.hint,room.round.hint);}
    if(state.role==='innocent') {assert.equal(state.word,room.round.word);assert.equal(state.hint,null);}
  }
});

test('each surviving spy gets 3, surviving Mr. White gets 5, and only the leader can award once', () => {
  const room=setup(6,{spyCount:2,mrWhite:true}); clues(room);
  assert.ok(room.players.every(p=>p.score===0));
  assert.throws(()=>action(room,'p1','spy-undetected'));
  action(room,'host','spy-undetected');
  for(const p of room.players) assert.equal(p.score,p.id===room.round.whiteId?5:room.round.spyIds.includes(p.id)?3:0);
  assert.throws(()=>action(room,'host','spy-undetected'));
});

test('catching one spy continues the round; all hidden roles must be caught for innocent points', () => {
  const room=setup(7,{spyCount:2,mrWhite:true});
  const [first,second]=room.round.spyIds;
  const white=room.round.whiteId;
  voteOut(room,first);
  assert.equal(room.round.caughtId,first);
  assert.equal(view(room,player(room,second).token).round.spyId,first);
  assert.equal(view(room,player(room,first).token).round.word,null);
  action(room,player(room,first).token,'spy-guess',{word:room.round.word});
  action(room,'host','spy-score',{guessed:true});
  assert.equal(room.phase,'spy-clues');
  assert.ok(room.players.every(p=>p.score===0));
  voteOut(room,white);
  assert.equal(room.phase,'spy-clues');
  voteOut(room,second);
  assert.throws(()=>action(room,player(room,first).token,'spy-guess',{word:'again'}));
  action(room,player(room,second).token,'spy-guess',{word:'wrong'});
  action(room,'host','spy-score',{guessed:false});
  assert.equal(room.phase,'result');
  assert.equal(player(room,first).score,1);
  assert.equal(player(room,second).score,0);
  assert.equal(player(room,white).score,0);
  for(const p of room.players.filter(p=>![first,second,white].includes(p.id))) assert.equal(p.score,1);
});

test('Mr. White can be the only hidden role; caught White needs leader confirmation and gets no escape points', () => {
  const room=setup(4,{spyCount:0,mrWhite:true});
  assert.deepEqual(room.round.spyIds,[]);
  const white=room.round.whiteId;
  voteOut(room,white);
  assert.equal(room.phase,'spy-review');
  assert.ok(room.players.every(p=>p.score===0));
  assert.throws(()=>action(room,'p1','spy-finish'));
  action(room,'host','spy-finish');
  assert.equal(player(room,white).score,0);
  assert.ok(room.players.filter(p=>p.id!==white).every(p=>p.score===1));
});

test('caught spy guess bonus survives a hidden-role win without awarding caught roles survival points', () => {
  const room=setup(6,{spyCount:2,mrWhite:true});
  const caught=room.round.spyIds[0];
  voteOut(room,caught);
  action(room,player(room,caught).token,'spy-guess',{word:room.round.word});
  action(room,'host','spy-score',{guessed:true});
  clues(room); action(room,'host','spy-undetected');
  assert.equal(player(room,caught).score,1);
  assert.equal(player(room,room.round.spyIds[1]).score,3);
  assert.equal(player(room,room.round.whiteId).score,5);
  assert.ok(room.players.filter(p=>![...room.round.spyIds,room.round.whiteId].includes(p.id)).every(p=>p.score===0));
});

test('leader changes role settings only between rounds; the completed result and scores remain immutable', () => {
  const room=setup(6);
  assert.throws(()=>action(room,'host','spy-settings',{spyCount:2,mrWhite:true}));
  clues(room);action(room,'host','spy-undetected');
  const before=structuredClone(room.round);
  const scores=room.players.map(p=>p.score);
  assert.throws(()=>action(room,'p1','spy-settings',{spyCount:2,mrWhite:true}));
  action(room,'host','spy-settings',{spyCount:2,mrWhite:true});
  assert.deepEqual(room.round,before);
  assert.deepEqual(room.players.map(p=>p.score),scores);
  assert.equal(room.settings.spyCount,2);
  assert.equal(room.settings.mrWhite,true);
  action(room,'host','next');
  assert.equal(room.round.spyIds.length,2);
  assert.ok(room.round.whiteId);
  assert.deepEqual(room.players.map(p=>p.score),scores);
});

test('role count validation rejects impossible lineups before start and pauses departures until enough players join', () => {
  for(const input of [{spyCount:-1},{spyCount:1.5},{spyCount:'nope'},{spyCount:0,mrWhite:false},{spyCount:3,capacity:3}]) assert.throws(()=>settings({game:'spy',...input}));
  const room=createRoom('123456',newPlayer('Leader','host'),{game:'spy',spyCount:3,mrWhite:true},1000);
  for(let i=1;i<4;i++)joinRoom(room,newPlayer(`Player ${i}`,`p${i}`));
  room.players[0].score=10;
  assert.throws(()=>act(room,'host','start'));
  assert.equal(room.players[0].score,10);
  joinRoom(room,newPlayer('Fifth','p4'));
  act(room,'host','start');
  assert.equal(room.phase,'spy-clues');
  act(room,'p4','leave');
  assert.equal(room.phase,'paused');assert.equal(room.round,null);
  joinRoom(room,newPlayer('Replacement','replacement'));
  assert.equal(room.phase,'spy-clues');
  assert.equal(room.round.spyIds.length,3);
});

test('saved single-spy rounds remain playable without the new role fields', () => {
  const room=setup();
  delete room.round.spyIds;delete room.round.whiteId;delete room.round.caughtId;delete room.round.guessBonuses;
  delete room.settings.spyCount;delete room.settings.mrWhite;
  clues(room);action(room,'host','spy-undetected');
  assert.equal(player(room,room.round.spyId).score,3);
  action(room,'host','next');
  assert.equal(room.round.spyIds.length,1);
});
