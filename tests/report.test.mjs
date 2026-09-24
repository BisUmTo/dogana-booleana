import test from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {seal,unseal,unlock,importPrivate,from64,to64} from '../docs/crypto.mjs';
import {mergeLogs,filterReport,buildCSV,csvCell,ruleInWords} from '../docs/prof.mjs';
import {p,and,or,not,evaluate,DEFAULTS} from '../docs/core.mjs';
const person={seed:1,hat:true,glasses:false,badge:false,tie:false,backpack:false,moustache:false,hatColor:'blue',shirtColor:'white',shirtPattern:'plain',outfit:'shirt',skin:0,hair:0,face:0,body:0};
function attempt(id,options={}){const a={id,sessionId:'session-1',level:1,kind:'answer',answer:1,activeMs:1250,at:'2026-09-25T08:00:00.000Z',settings:{...DEFAULTS},rule:p('hat'),person:{...person},...options};a.expected=evaluate(a.rule,a.person);a.correct=a.kind==='answer'&&Boolean(a.answer)===a.expected;return a;}
const log=(attempts,student={name:'Anna Test',className:'1 A'})=>({format:'dogana-booleana-log',version:1,student,attempts});
const pair=await webcrypto.subtle.generateKey({name:'RSA-OAEP',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['encrypt','decrypt']);
const pub=await webcrypto.subtle.exportKey('jwk',pair.publicKey),priv=await webcrypto.subtle.exportKey('jwk',pair.privateKey);
const key=await unlock(priv,pub);

test('encrypted reports round trip without student identifiers in envelope',async()=>{
 const source=log([attempt('a')]),envelope=await seal(source,pub);
 assert.equal(envelope.format,'dogana-booleana');assert.equal(envelope.version,1);
 assert.doesNotMatch(JSON.stringify(envelope),/Anna Test|session-1|activeMs/);
 assert.deepEqual(await unseal(envelope,key),source);
 assert.notEqual((await seal(source,pub)).ciphertext,envelope.ciphertext);
});
test('tampered ciphertext, IV, format and key ID are rejected',async()=>{
 const envelope=await seal(log([attempt('a')]),pub);
 for(const field of ['ciphertext','iv']){const altered=from64(envelope[field]);altered[0]^=1;await assert.rejects(unseal({...envelope,[field]:to64(altered)},key));}
 await assert.rejects(unseal({...envelope,format:'pesca-binaria'},key));
 await assert.rejects(unseal({...envelope,keyId:'not-this-key'},key));
 await assert.rejects(unseal({...envelope,iv:'<script>'},key));
});
test('wrong private key and damaged key cannot unlock reports',async()=>{
 const other=await webcrypto.subtle.generateKey({name:'RSA-OAEP',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['encrypt','decrypt']);
 const otherJwk=await webcrypto.subtle.exportKey('jwk',other.privateKey);
 await assert.rejects(unlock(otherJwk,pub));
 await assert.rejects(unseal(await seal(log([attempt('a')]),pub),await importPrivate(otherJwk)));
 await assert.rejects(unlock({...priv,d:undefined},pub));
});
test('overlapping logs deduplicate exact attempts and never inflate summary',()=>{
 const a=attempt('a'),b=attempt('b',{at:'2026-09-25T08:00:01Z',answer:0});
 const merged=mergeLogs([log([a]),{...log([a,b]),summary:{correct:1000,total:1000}}]);
 assert.equal(merged.total,2);assert.equal(merged.duplicates,1);assert.equal(merged.students[0].correct,1);assert.equal(merged.students[0].accuracy,.5);
});
test('conflicting duplicate rejects entire prospective import without mutation',()=>{
 const first=log([attempt('a')]);const snapshot=JSON.stringify(first);
 assert.throws(()=>mergeLogs([first,log([attempt('new'),attempt('a',{activeMs:4500})])]),/contenuto diverso/);
 assert.equal(JSON.stringify(first),snapshot);assert.equal(mergeLogs([first]).total,1);
 assert.throws(()=>mergeLogs([first,log([attempt('a')],{name:'Altro',className:'1 A'})]),/contenuto diverso/);
});
test('best streak sorts timestamps within sessions and never joins sessions',()=>{
 const attempts=[attempt('s1-3',{at:'2026-09-25T08:00:03Z'}),attempt('s2-1',{sessionId:'session-2',at:'2026-09-25T08:01:01Z'}),attempt('s1-1',{at:'2026-09-25T08:00:01Z'}),attempt('s1-2',{at:'2026-09-25T08:00:02Z',answer:0}),attempt('s1-4',{at:'2026-09-25T08:00:04Z'})];
 const row=mergeLogs([log(attempts.slice(0,2)),log(attempts.slice(2))]).students[0];
 assert.equal(row.bestStreak,2);assert.equal(row.sessions,2);assert.equal(row.correct,4);
});
test('operator counts, timeout and mean derive from recorded cases',()=>{
 const a=attempt('a',{rule:and(p('hat'),not(p('glasses'))),activeMs:2000});
 const b=attempt('b',{rule:or(p('hat'),p('badge')),kind:'timeout',answer:null,activeMs:6000});
 const row=mergeLogs([log([a,b])]).students[0];
 assert.equal(row.timeouts,1);assert.equal(row.activeMs,8000);assert.equal(row.meanMs,2000);
 assert.deepEqual(row.byOperator,{and:{total:1,correct:1},or:{total:1,correct:0},not:{total:1,correct:1}});
 assert.match(ruleInWords(a.rule),/cappello E NON \(occhiali\)/);
});
test('incoherent claims and invalid settings are rejected',()=>{
 assert.throws(()=>mergeLogs([log([{...attempt('a'),correct:false}])]),/incoerente/);
 assert.throws(()=>mergeLogs([log([attempt('a',{sessionId:''})])]),/Identificatore/);
 assert.throws(()=>mergeLogs([log([attempt('a',{settings:{notation:'attack'}})])]),/Impostazioni/);
});
test('CSV cells quote delimiters/newlines and neutralize formula prefixes',()=>{
 for(const value of ['=cmd()','+1','-1','@sum()', '\t=cmd()', '   =cmd()'])assert.match(csvCell(value),/^"'/);
 assert.equal(csvCell('A;B"C\nD'),'"A;B""C\nD"');
 const rows=mergeLogs([log([attempt('a')],{name:'=HYPERLINK("bad")',className:'1;A'})]).students;
 const csv=buildCSV(rows);assert.match(csv,/'=HYPERLINK\(""bad""\)/);assert.match(csv,/"1;A"/);assert.match(csv,/AND tentativi/);
});
test('committed public key has no private RSA fields',async()=>{
 const jwk=JSON.parse(await readFile(new URL('../docs/public-key.json',import.meta.url),'utf8'));
 assert.equal(jwk.kty,'RSA');for(const name of ['d','p','q','dp','dq','qi'])assert.equal(jwk[name],undefined);
});


test('game is the default report activity and legacy modes remain game',()=>{
 const legacy=attempt('legacy',{settings:{notation:'math'},activeMs:1000});
 const progressive=attempt('progressive',{sessionId:'game-progressive',activeMs:2000});
 const infinite=attempt('infinite',{settings:{...DEFAULTS,mode:'infinite'},sessionId:'game-infinite',answer:0,activeMs:3000});
 const training=attempt('training',{settings:{...DEFAULTS,mode:'training'},sessionId:'training-session',activeMs:9000});
 const source=mergeLogs([log([legacy,progressive,infinite,training])]);
 const game=filterReport(source),practice=filterReport(source,'training');
 assert.equal(game.total,3);assert.equal(game.students[0].correct,2);assert.equal(game.students[0].activeMs,6000);assert.equal(game.students[0].meanMs,1500);assert.equal(game.students[0].sessions,3);
 assert.equal(practice.total,1);assert.equal(practice.students[0].correct,1);assert.equal(practice.students[0].activeMs,9000);assert.equal(practice.students[0].activity,'training');
 assert.equal(source.total,4);assert.equal(source.students[0].attempts.length,4);
});
test('all activity view keeps the same student in separate rows and separate streaks',()=>{
 const attempts=[attempt('game-1',{at:'2026-09-25T08:00:01Z'}),attempt('game-2',{at:'2026-09-25T08:00:02Z'}),attempt('training-1',{settings:{...DEFAULTS,mode:'training'},sessionId:'training',at:'2026-09-25T08:00:03Z',answer:0}),attempt('training-2',{settings:{...DEFAULTS,mode:'training'},sessionId:'training',at:'2026-09-25T08:00:04Z'})];
 const source=mergeLogs([log(attempts),log(attempts)]),all=filterReport(source,'all');
 assert.equal(all.students.length,2);assert.equal(all.studentCount,1);assert.equal(all.total,4);assert.equal(all.duplicates,4);
 const game=all.students.find(row=>row.activity==='game'),training=all.students.find(row=>row.activity==='training');
 assert.notEqual(game.key,training.key);assert.equal(game.studentKey,training.studentKey);assert.equal(game.bestStreak,2);assert.equal(training.bestStreak,1);
 assert.deepEqual(all.byActivity,{game:{total:2,correct:2,accuracy:1},training:{total:2,correct:1,accuracy:.5}});
 assert.equal(filterReport(source,'game').duplicates,4);
});
test('activity filters recalculate operator rates and exclude unmatched students',()=>{
 const game=attempt('game',{rule:and(p('hat'),not(p('glasses'))),answer:0});
 const training=attempt('training',{settings:{...DEFAULTS,mode:'training'},rule:or(p('hat'),p('badge'))});
 const source=mergeLogs([log([game,training]),log([attempt('only-training',{settings:{...DEFAULTS,mode:'training'}})],{name:'Solo pratica',className:'1 A'})]);
 const filtered=filterReport(source,'game');assert.equal(filtered.students.length,1);assert.deepEqual(filtered.students[0].byOperator,{and:{total:1,correct:0},or:{total:0,correct:0},not:{total:1,correct:0}});
 assert.equal(filterReport(source,'training').students.length,2);assert.equal(filterReport(mergeLogs([])).total,0);assert.throws(()=>filterReport(source,'unknown'),/Attività/);
});
test('CSV explicitly separates activities even if passed unfiltered mixed source rows',()=>{
 const source=mergeLogs([log([attempt('game'),attempt('training',{settings:{...DEFAULTS,mode:'training'},answer:0})])]);
 const allCSV=buildCSV(source.students),gameCSV=buildCSV(filterReport(source).students),trainingCSV=buildCSV(filterReport(source,'training').students);
 assert.match(allCSV,/"Attività"/);assert.match(allCSV,/"Gioco"/);assert.match(allCSV,/"Allenamento"/);assert.equal(allCSV.split('\r\n').length,3);
 assert.match(gameCSV,/"Gioco"/);assert.doesNotMatch(gameCSV,/"Allenamento"/);assert.match(trainingCSV,/"Allenamento"/);assert.doesNotMatch(trainingCSV,/"Gioco"/);
});

test('changing an attempt activity cannot evade global duplicate conflict detection',()=>{
 const game=attempt('shared-id');
 const training={...game,settings:{...game.settings,mode:'training'}};
 assert.throws(()=>mergeLogs([log([game]),log([training])]),/contenuto diverso/);
});
