import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../docs/core.mjs';

const destination=(level,mode,action,unlocked=false)=>core.nextTurnTarget(core.levelSpec(level,{mode}),action,unlocked);

test('infinite mode requires an explicitly unlocked campaign',()=>{
 assert.deepEqual(destination(20,'progressive','advance'),{level:20,mode:'progressive'});
 assert.deepEqual(destination(20,'progressive','advance',true),{level:21,mode:'infinite'});
 for(const action of ['retry','advance'])assert.deepEqual(destination(21,'infinite',action),{level:20,mode:'progressive'});
 assert.deepEqual(destination(21,'infinite','advance',true),{level:22,mode:'infinite'});
 assert.deepEqual(destination(21,'infinite','retry',true),{level:21,mode:'infinite'});
});
test('training never advances into infinite mode and campaign retries stay progressive',()=>{
 for(const unlocked of [false,true]){
  assert.deepEqual(destination(20,'training','advance',unlocked),{level:20,mode:'training'});
  assert.deepEqual(destination(7,'training','retry',unlocked),{level:7,mode:'training'});
  assert.deepEqual(destination(7,'training','advance',unlocked),{level:8,mode:'training'});
  assert.deepEqual(destination(20,'progressive','retry',unlocked),{level:20,mode:'progressive'});
  assert.deepEqual(destination(19,'progressive','advance',unlocked),{level:20,mode:'progressive'});
 }
});

const campaign=(settings={},errors=0)=>Array.from({length:8},(_,i)=>({sessionId:'campaign-20',caseId:`guest-${i}`,level:20,correct:i>=errors,settings:{...core.DEFAULTS,...settings}}));
const completed=attempts=>{assert.equal(typeof core.hasCompletedCampaign,'function');return core.hasCompletedCampaign(attempts);};
test('migration recognizes eight distinct canonical guests with at most two errors',()=>{
 assert.equal(completed([]),false);
 for(const errors of [0,1,2])assert.equal(completed(campaign({},errors)),true);
 assert.equal(completed(campaign({},3)),false);
 assert.equal(completed(campaign().slice(0,7)),false);
 assert.equal(completed(campaign().map(a=>({...a,caseId:'same-guest'}))),false);
 assert.equal(completed(campaign().map((a,i)=>({...a,sessionId:i<4?'one':'two'}))),false);
 assert.equal(completed(campaign().map(a=>({...a,level:19}))),false);
});
test('training, infinite, and historical customized turns never unlock the campaign',()=>{
 for(const setting of [{mode:'training'},{mode:'infinite'},{colors:false},{patterns:false},{distractors:false},{visual:'rich'},{timer:'relaxed'}]){
  assert.equal(completed(campaign(setting)),false);
  const mixed=campaign();mixed[3].settings={...mixed[3].settings,...setting};assert.equal(completed(mixed),false);
 }
 assert.equal(completed(campaign({notation:'math',motion:false,sound:false})),true);
 const prior=campaign({mode:'training'}).map(a=>({...a,sessionId:'training'}));
 assert.equal(completed([...prior,...campaign()]),true);
});
