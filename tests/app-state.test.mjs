import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {webcrypto} from 'node:crypto';
import * as core from '../docs/core.mjs';
import * as characters from '../docs/characters.mjs';
import * as expressions from '../docs/expression.mjs';
import {DecisionClock} from '../docs/clock.mjs';
import {mergeLogs} from '../docs/prof.mjs';

const source=readFileSync(new URL('../docs/app.mjs',import.meta.url),'utf8').replace(/^import.*$/mg,'');
class Element {
 constructor(){this.listeners={};this.attributes={};this.classList={toggle(){},add(){},remove(){}};this.style={};this.open=false;this.value='';}
 addEventListener(event,listener){this.listeners[event]=listener;}
 setAttribute(key,value){this.attributes[key]=value;}
 getAttribute(key){return this.attributes[key]??'';}
 querySelector(){return new Element();}
 showModal(){this.open=true;}
 close(){this.open=false;}
 click(){}
 reportValidity(){return true;}
}
class SilentAudio {async unlock(){}configure(){}stopMusic(){}play(){}}
function mount(saved=null){
 const elements=new Map(),timers=[],exports=[];let stored=saved?JSON.stringify(saved):null;
 const element=id=>{if(!elements.has(id))elements.set(id,new Element());return elements.get(id);};
 const document={getElementById:element,querySelector:()=>new Element(),createElement:()=>new Element(),body:new Element(),hidden:false,addEventListener(){}};
 const scope={...core,...characters,...expressions,DecisionClock,GameAudio:SilentAudio,document,window:{addEventListener(){}},crypto:webcrypto,
  localStorage:{getItem:()=>stored,setItem:(_,value)=>{stored=value;}},Image:class{},ResizeObserver:class{observe(){}},requestAnimationFrame:()=>1,
  setTimeout:(callback,delay)=>{timers.push({callback,delay});return timers.length;},clearTimeout(){},
  fetch:async()=>({ok:true,json:async()=>({})}),seal:async log=>{exports.push(structuredClone(log));return {encrypted:true};},URL:{createObjectURL:()=>'',revokeObjectURL(){}}
 };
 // Run the actual application handlers, supplying only browser and audio boundaries.
 const state=new Function(...Object.keys(scope),source+';return ()=>({data,game,phase});')(...Object.values(scope));
 const click=action=>element('panel-content').listeners.click({target:{closest:()=>({dataset:{action}})}});
 const run=delay=>{const due=timers.filter(t=>t.delay===delay);for(const timer of due){timers.splice(timers.indexOf(timer),1);timer.callback();}};
 const begin=async()=>{await element('start-form').listeners.submit({preventDefault(){}});await click('begin');run(380);};
 const correct=()=>element(state().game.cases[state().game.index].expected?'admit':'reject').onclick();
 const next=()=>{run(570);run(380);};
 const download=async()=>{element('pause').onclick();await click('report');await click('download');};
 return {element,state,click,run,begin,correct,next,download,exports,stored:()=>JSON.parse(stored)};
}

test('changing notation preserves earlier attempts and overlapping exported logs still merge',async()=>{
 const app=mount();app.element('student-name').value='Review';app.element('student-class').value='1 A';
 await app.begin();app.correct();app.next();await app.download();await app.click('close');
 app.element('settings-open').onclick();app.element('set-notation').value='math';app.element('set-audio').value='off';app.element('set-motion').checked=true;
 await app.click('save-settings');
 assert.equal(app.state().data.attempts[0].settings.notation,'bits');
 assert.equal(app.state().data.current.settings.notation,'math');
 app.correct();app.next();await app.download();
 assert.equal(app.exports.length,2);assert.equal(app.exports[0].attempts[0].settings.notation,'bits');
 assert.deepEqual(app.exports[1].attempts.map(a=>a.settings.notation),['bits','math']);
 const merged=mergeLogs(app.exports);assert.equal(merged.total,2);assert.equal(merged.duplicates,1);
});

test('recovering a partially customized historical level 20 cannot unlock infinite mode',async()=>{
 const seed=52,spec=core.levelSpec(20,{mode:'training',timer:'relaxed',colors:false});spec.settings.mode='progressive';
 const cases=core.buildCases(spec,seed),attempts=cases.slice(0,7).map((c,i)=>({id:`old-${i}`,sessionId:'old-session',level:20,caseId:c.id,at:`2026-09-25T08:00:0${i}Z`,kind:'answer',answer:Number(c.expected),expected:c.expected,correct:true,activeMs:100,rule:spec.rule,person:c.person,settings:{...spec.settings}}));
 const initial={version:1,student:{name:'Review',className:'1 A'},settings:{...spec.settings},attempts,unlocked:20,current:{level:20,seed,index:7,lives:3,streak:7,sessionId:'old-session',settings:{...spec.settings},elapsed:0,phase:'playing'}};
 const app=mount(initial);await app.begin();app.correct();app.next();
 assert.equal(app.state().phase,'ended');assert.equal(app.state().data.attempts.length,8);
 assert.equal(app.state().data.campaignCompleted,false);assert.equal(app.stored().campaignCompleted,false);
 assert.doesNotMatch(app.element('panel-content').innerHTML,/Modalità infinita sbloccata|Continua in modalità infinita/);
 assert.deepEqual(app.state().data.attempts.slice(0,7),attempts);
 await app.click('advance');assert.equal(app.state().game.spec.number,20);assert.equal(app.state().game.spec.settings.mode,'progressive');
 assert.equal(app.state().game.spec.settings.timer,'auto');
});
