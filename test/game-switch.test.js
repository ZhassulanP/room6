import test from 'node:test';
import assert from 'node:assert/strict';
import { act, createRoom, joinRoom, newPlayer, view } from '../src/game.js';

function setup(input={}) {
  const room=createRoom('123456',newPlayer('Leader','host'),input,1000);
  for(let i=1;i<5;i++)joinRoom(room,newPlayer(`Guest ${i}`,`guest${i}`),1000);
  return room;
}

test('switching games keeps separate dictionaries and role settings while sharing room capacity',()=>{
  const room=setup({game:'wordmine',wordLanguage:'kk',useDefaultWords:false,customWords:'Алма',cycles:3,capacity:7});
  act(room,'host','switch-game',{game:'spy'});
  assert.equal(room.settings.game,'spy');
  assert.equal(room.settings.useDefaultWords,true);
  assert.equal(room.settings.wordLanguage,'kk');
  act(room,'host','settings',{game:'spy',spyCount:2,mrWhite:true,wordLanguage:'en',useDefaultWords:false,customWords:'Pizza | Food',cycles:2,capacity:8});
  act(room,'host','switch-game',{game:'wordmine'});
  assert.equal(room.settings.capacity,8);
  assert.equal(room.settings.wordLanguage,'kk');
  assert.equal(room.settings.cycles,3);
  assert.deepEqual(room.settings.customWords,['Алма']);
  assert.equal(room.settings.useDefaultWords,false);
  act(room,'host','switch-game',{game:'spy'});
  assert.equal(room.settings.spyCount,2);
  assert.equal(room.settings.mrWhite,true);
  assert.equal(room.settings.wordLanguage,'en');
  assert.equal(room.settings.cycles,2);
  assert.deepEqual(room.settings.customWords,['Pizza | Food']);
  assert.equal(room.settings.capacity,8);
});

test('only the leader can switch in the lobby; switching clears readiness and preserves room identity and scores',()=>{
  const room=setup();
  const ids=room.players.map(p=>p.id);
  room.players[1].score=7;
  act(room,'guest1','ready');
  assert.throws(()=>act(room,'guest1','switch-game',{game:'spy'}),{status:403});
  for(const game of ['invalid','__proto__',null,{},1])assert.throws(()=>act(room,'host','switch-game',{game}));
  act(room,'host','switch-game',{game:'spy'});
  assert.deepEqual(room.players.map(p=>p.id),ids);
  assert.equal(room.players[1].score,7);
  assert.ok(room.players.every(p=>!p.ready));
  act(room,'guest1','ready');
  act(room,'host','switch-game',{game:'spy'});
  assert.equal(room.players[1].ready,true);
  act(room,'host','start');
  assert.throws(()=>act(room,'host','switch-game',{game:'wordmine'}));
  assert.equal(room.settings.game,'spy');
});

test('every participant receives the new mode and vocabulary counts without receiving cached private dictionaries',()=>{
  const room=setup({customWords:'Secret custom word'});
  for(const mode of ['spy','wordmine','spy']) {
    act(room,'host','switch-game',{game:mode});
    for(let i=1;i<5;i++) {
      const state=view(room,`guest${i}`);
      assert.equal(state.settings.game,mode);
      assert.equal(state.settings.wordCounts.en,mode==='spy'?30:500);
      assert.equal(state.settings.customWords,'');
      assert.equal(Object.hasOwn(state,'gameSettings'),false);
    }
  }
});

test('legacy rooms switch safely and reconnects retain the selected game',()=>{
  const room=setup(); delete room.settings.game;
  act(room,'host','switch-game',{game:'spy'});
  const id=room.players[1].id;
  joinRoom(room,newPlayer('Guest 1','new-token'));
  assert.equal(view(room,'new-token').settings.game,'spy');
  assert.equal(view(room,'new-token').me,id);
  act(room,'host','switch-game',{game:'wordmine'});
  assert.equal(room.settings.game,'wordmine');
});
