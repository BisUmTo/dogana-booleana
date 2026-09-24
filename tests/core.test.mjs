import test from 'node:test';import assert from 'node:assert/strict';import{p,and,or,not,evaluate,levelSpec,buildCases,validateRule,DEFAULTS,operators,normalizeSettings}from'../docs/core.mjs';
test('AND OR NOT truth tables including inclusive OR',()=>{for(const a of[false,true])for(const b of[false,true]){const person={hat:a,badge:b};assert.equal(evaluate(and(p('hat'),p('badge')),person),a&&b);assert.equal(evaluate(or(p('hat'),p('badge')),person),a||b);assert.equal(evaluate(not(or(p('hat'),p('badge'))),person),!(a||b));}});
test('colored hat requires actual hat',()=>{assert.equal(evaluate(p('hatColor','blue'),{hat:false,hatColor:'blue'}),false);});
test('every stage has eight intentional valid and invalid cases, all configurations',()=>{for(const colors of[false,true])for(const patterns of[false,true])for(const distractors of[false,true])for(let level=1;level<=40;level++){const spec=levelSpec(level,{...DEFAULTS,colors,patterns,distractors,mode:level<=20?'training':'infinite'});validateRule(spec.rule);const a=buildCases(spec,level*723);assert.equal(a.length,8);assert.ok(a.some(c=>c.expected));assert.ok(a.some(c=>!c.expected));for(const c of a)assert.equal(c.expected,evaluate(spec.rule,c.person));assert.deepEqual(a,buildCases(spec,level*723));}});
test('OR level covers both, neither and exactly one',()=>{const a=buildCases(levelSpec(4),654);for(const tag of['or-both','or-one','or-neither'])assert.ok(a.some(c=>c.tags.includes(tag)));});
test('timer absent early and relaxed; nested NOT preserved',()=>{for(let i=1;i<5;i++)assert.equal(levelSpec(i).timeLimitMs,null);assert.ok(levelSpec(5).timeLimitMs>0);assert.equal(levelSpec(20,{mode:'training',timer:'relaxed'}).timeLimitMs,null);assert.ok(operators(levelSpec(16).rule).includes('not'));});
test('reject unsafe rules and normalize settings',()=>{assert.throws(()=>validateRule({op:'eval',args:[]}));assert.throws(()=>validateRule(p('__proto__')));assert.equal(normalizeSettings({notation:'evil'}).notation,'bits');});
test('adapted lessons never teach disabled color/pattern rules or promise a disabled timer',()=>{for(const i of[9,10,11]){const s=levelSpec(i,{mode:'training',colors:false});assert.ok(!/colore/i.test(s.intro));assert.ok(!JSON.stringify(s.rule).includes('Color'));}for(const i of[12,13,14]){const s=levelSpec(i,{mode:'training',patterns:false});assert.ok(!/righe|pois|quadri|pattern/i.test(s.intro));assert.ok(!JSON.stringify(s.rule).includes('Pattern'));}assert.ok(!/timer|tempo/i.test(levelSpec(5,{mode:'training',timer:'relaxed'}).intro));});
test('initial characters introduce only relevant accessories; advanced stages preserve all required traits',()=>{for(let i=1;i<=8;i++){const spec=levelSpec(i);const keys=new Set(JSON.stringify(spec.rule).match(/hat|glasses|badge|tie|backpack|moustache/g));for(const c of buildCases(spec,i*42))for(const key of['hat','glasses','badge','tie','backpack','moustache'])if(!keys.has(key))assert.equal(c.person[key],false);}for(let i=12;i<=20;i++){const spec=levelSpec(i);for(const c of buildCases(spec,i*42))assert.equal(evaluate(spec.rule,c.person),c.expected);}});
test('summary accepts the teacher import limit without argument overflow',async()=>{const {summarize}=await import('../docs/core.mjs');const rule=p('hat');const attempts=Array.from({length:250000},(_,i)=>({sessionId:'load',correct:true,kind:'answer',rule,activeMs:i===199999?3:20}));const summary=summarize(attempts);assert.equal(summary.total,250000);assert.equal(summary.bestMs,3);assert.equal(summary.correct,250000);});

test('campaign and infinite rules stay canonical while training accepts custom rules',()=>{
 const custom={colors:false,patterns:false,distractors:false,visual:'simple',timer:'relaxed',notation:'code',sound:false,motion:false};
 for(const mode of ['progressive','infinite']){
  const actual=levelSpec(19,{...custom,mode}),canonical=levelSpec(19,{mode});
  assert.deepEqual(actual.rule,canonical.rule);assert.equal(actual.timeLimitMs,canonical.timeLimitMs);
  for(const key of ['colors','patterns','distractors','visual','timer'])assert.equal(actual.settings[key],DEFAULTS[key]);
  assert.equal(actual.settings.notation,'code');assert.equal(actual.settings.sound,false);assert.equal(actual.settings.motion,false);
 }
 const training=levelSpec(19,{...custom,mode:'training'});
 for(const [key,value]of Object.entries(custom))assert.equal(training.settings[key],value);
 assert.equal(training.timeLimitMs,null);assert.notDeepEqual(training.rule,levelSpec(19).rule);
});
test('normalization keeps historical teaching settings and recognizes training',()=>{
 const old={notation:'math',mode:'progressive',visual:'rich',colors:false,patterns:false,distractors:false,timer:'relaxed'};
 for(const [key,value]of Object.entries(old))assert.equal(normalizeSettings(old)[key],value);
 assert.equal(normalizeSettings({mode:'training'}).mode,'training');assert.equal(DEFAULTS.notation,'bits');
});
test('introductory lessons explain the selected notation including the default symbols',()=>{
 const symbols={bits:['!','&','|'],math:['¬','∧','∨'],words:['NOT','AND','OR'],code:['!','&&','||'],sets:['∁','∩','∪']};
 for(const [notation,expected] of Object.entries(symbols))for(let i=0;i<3;i++)assert.ok(levelSpec(i+2,{notation}).intro.includes(expected[i]));
 for(const [i,symbol]of [[2,'!'],[3,'&'],[4,'|']])assert.ok(levelSpec(i).intro.includes(symbol));
});
