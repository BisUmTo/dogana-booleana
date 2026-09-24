export const VERSION=1;
export const DEFAULTS=Object.freeze({notation:'bits',visual:'normal',colors:true,patterns:true,distractors:true,mode:'progressive',timer:'auto',sound:true,music:false,motion:true});
const CAMPAIGN_SETTINGS=Object.freeze({visual:'normal',colors:true,patterns:true,distractors:true,timer:'auto'});
export const COLORS=['blue','red','green','yellow','purple','orange','white'];
export const PATTERNS=['plain','stripes','dots','checks'];
export const BOOL_KEYS=['hat','glasses','badge','tie','backpack','moustache'];
export const p=(key,value)=>({op:'prop',key,...(value===undefined?{}:{value})});
export const and=(...args)=>({op:'and',args});
export const or=(...args)=>({op:'or',args});
export const not=arg=>({op:'not',arg});
export function nextTurnTarget(spec,action,unlockedInfinite=false){
 const level=spec.number+(action==='advance'?1:0),mode=spec.settings.mode;
 if(mode==='training')return {level:Math.min(20,level),mode};
 if(mode==='infinite')return unlockedInfinite===true?{level,mode}:{level:20,mode:'progressive'};
 if(action==='advance'&&spec.number===20&&unlockedInfinite===true)return {level:21,mode:'infinite'};
 return {level:Math.min(20,level),mode:'progressive'};
}
export function hasCompletedCampaign(attempts){
 const sessions=new Map();
 for(const a of attempts){
  if(a?.level!==20||typeof a.sessionId!=='string'||!a.sessionId)continue;
  if(!sessions.has(a.sessionId))sessions.set(a.sessionId,{cases:new Set(),errors:0,canonical:true});
  const session=sessions.get(a.sessionId);
  if(a.settings?.mode!=='progressive'||!Object.entries(CAMPAIGN_SETTINGS).every(([key,value])=>a.settings[key]===value)||typeof a.caseId!=='string'||!a.caseId||typeof a.correct!=='boolean')session.canonical=false;
  session.cases.add(a.caseId);if(a.correct!==true)session.errors++;
 }
 return [...sessions.values()].some(session=>session.canonical&&session.cases.size===8&&session.errors<=2);
}
export function evaluate(node,person){switch(node.op){case'prop':return node.key==='hatColor'?!!person.hat&&person.hatColor===node.value:node.value===undefined?person[node.key]===true:person[node.key]===node.value;case'not':return!evaluate(node.arg,person);case'and':return node.args.every(n=>evaluate(n,person));case'or':return node.args.some(n=>evaluate(n,person));default:throw Error('Operatore non valido');}}
export function walk(node){return[node,...(node.op==='prop'?[]:node.op==='not'?walk(node.arg):node.args.flatMap(walk))];}
export function predicates(node){return [...new Map(walk(node).filter(n=>n.op==='prop').map(n=>[n.key+':'+(n.value??''),n])).values()];}
export function operators(node){return [...new Set(walk(node).filter(n=>n.op!=='prop').map(n=>n.op))];}
export function rng(seed){let t=seed>>>0;return()=>{t+=0x6D2B79F5;let x=Math.imul(t^t>>>15,1|t);x^=x+Math.imul(x^x>>>7,61|x);return((x^x>>>14)>>>0)/4294967296;};}
export function shuffle(a,r){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
const locations=[['club','Velluto Elettrico','La lista ospiti ha cambiato idea.'],['customs','Dogana delle Stranezze','Qualcosa da dichiarare? Un cappello.'],['beach','Spiaggia Riservata','Qui il dress code prende il sole.'],['museum','Museo dell’Assurdo','Non toccare le opere. Leggi la regola.'],['airport','Gate Improbabile','Imbarco secondo logica.'],['rooftop','Tetto delle Meraviglie','Vista panoramica. Criteri discutibili.'],['cinema','Cinema Paradosso','Il colpo di scena è all’ingresso.'],['garden','Giardino Segreto','Entra solo chi soddisfa la regola.'],['space','Scalo Stellare','Il vuoto cosmico non è un lasciapassare.'],['arcade','Sala Pixel','Nuovo livello, nuove condizioni.'],['hotel','Grand Hotel Forse','La prenotazione non basta.'],['train','Binario Fantasma','Attenzione alle coincidenze logiche.'],['aquarium','Acquario Notturno','Niente risposte a caso: ci guardano i pesci.'],['library','Biblioteca dei Sussurri','Prima leggi. Poi decidi.'],['festival','Festival delle Eccezioni','Stasera suonano gli operatori.'],['snow','Rifugio dei Dubbi','Le condizioni cambiano. La logica resta.'],['harbor','Porto delle Ipotesi','La prossima partenza dipende da te.'],['theater','Teatro degli Equivoci','Una parentesi può cambiare la scena.'],['desert','Oasi Esclusiva','Acqua fresca, regole insolite.'],['observatory','Osservatorio Logico','Una decisione sotto le stelle.']];
export const LOCATIONS=locations.map(([id,name,joke],i)=>({id,name,joke,background:`assets/backgrounds/${String(i+1).padStart(2,'0')}-${id}.webp`}));
const rules=[
 p('hat'),not(p('glasses')),and(p('hat'),p('badge')),or(p('badge'),p('tie')),
 and(p('hat'),not(p('glasses'))),and(p('hat'),or(p('badge'),p('tie'))),or(and(p('hat'),p('tie')),p('badge')),
 and(p('hat'),or(p('badge'),p('tie')),not(p('glasses'))),
 p('hatColor','blue'),and(p('hatColor','red'),not(p('glasses'))),or(p('hatColor','blue'),p('shirtColor','green')),
 and(p('shirtPattern','stripes'),p('badge')),or(p('shirtPattern','dots'),p('shirtPattern','checks')),
 and(p('shirtPattern','stripes'),not(p('backpack'))),and(or(p('badge'),p('tie')),not(p('moustache'))),
 not(or(p('glasses'),p('backpack'))),or(and(p('hatColor','blue'),p('badge')),and(p('shirtPattern','dots'),not(p('glasses')))),
 and(p('hat'),not(and(p('glasses'),p('tie')))),and(or(p('shirtColor','red'),p('shirtPattern','checks')),or(p('badge'),p('tie')),not(p('backpack'))),
 and(or(and(p('hat'),p('badge')),and(p('tie'),not(p('glasses')))),not(and(p('backpack'),p('moustache'))))
];
const lessons=[
 ['Una sola condizione','Guarda il cartello: se la caratteristica c’è, scegli 1. Se manca, scegli 0. Il cappello grigio indica qualsiasi cappello: qui il colore non conta.'],
 ['NOT cambia il risultato','Il simbolo {not} significa NON. Questa volta gli occhiali NON devono esserci.'],
 ['AND: tutte e due','Con {and} devono essere vere entrambe le condizioni. Una sola non basta.'],
 ['OR: almeno una','Con {or} basta una delle due condizioni. Se ci sono entrambe, va bene lo stesso!'],
 ['Arriva il conto alla rovescia','Da qui ogni ospite ha un tempo. Prima impara la regola: il timer parte solo quando arriva.'],
 ['Prima la parentesi','Valuta il gruppo tra parentesi, poi combina il risultato con il resto.'],
 ['Due strade per entrare','Un gruppo di condizioni può essere un’alternativa a un’altra condizione.'],
 ['Un controllo completo','Unisci AND, OR e NOT. Guarda una condizione alla volta.'],
 ['Conta anche il colore','Il cappello del cartello ha un colore preciso. Un cappello di un altro colore non basta.'],
 ['Presenza e assenza','Un colore richiesto e un accessorio vietato possono comparire nella stessa regola.'],
 ['Colori alternativi','Valuta il colore dell’oggetto indicato. Non confonderlo con un altro indumento.'],
 ['Arrivano i pattern','Le righe, i pois e i quadri appartengono alla camicia visibile al centro del busto. Il colore conta solo se la regola lo richiede.'],
 ['Un pattern oppure l’altro','Valgono solo i pattern mostrati. La fantasia della borsa non è quella della camicia.'],
 ['Distrazioni','Alcuni dettagli non compaiono nel cartello: non devono cambiare la tua decisione.'],
 ['Il dettaglio che cambia tutto','Un solo accessorio può rendere falsa l’intera regola.'],
 ['NOT di un gruppo','NOT fuori dalla parentesi ne rovescia il risultato. Non si applica solo al primo elemento.'],
 ['Alternative complete','Ogni ramo ha le sue condizioni: basta che uno dei due rami sia vero.'],
 ['Una combinazione vietata','Qui è vietata una combinazione. Uno solo dei due accessori può essere ammesso.'],
 ['Tutti i gruppi devono funzionare','Risolvi le parentesi separatamente, poi unisci i risultati.'],
 ['Controllo finale','Leggi con calma prima di iniziare. Non lasciarti guidare dai dettagli irrilevanti.']
];
export function normalizeSettings(input={}){const s={...DEFAULTS};for(const key of ['colors','patterns','distractors','sound','music','motion'])if(typeof input[key]==='boolean')s[key]=input[key];for(const[key,allowed]of Object.entries({notation:['math','words','code','bits','sets'],visual:['simple','normal','rich'],mode:['progressive','infinite','training'],timer:['auto','relaxed']}))if(allowed.includes(input[key]))s[key]=input[key];return s;}
function adaptRule(node,s){if(node.op==='prop'){if(!s.colors&&['hatColor','shirtColor'].includes(node.key))return p(node.key==='hatColor'?'hat':'tie');if(!s.patterns&&node.key==='shirtPattern')return p(node.value==='dots'?'badge':node.value==='checks'?'backpack':'tie');return {...node};}if(node.op==='not')return not(adaptRule(node.arg,s));return {op:node.op,args:node.args.map(n=>adaptRule(n,s))};}
const notationSymbols={math:{and:'∧',or:'∨',not:'¬'},words:{and:'AND',or:'OR',not:'NOT'},code:{and:'&&',or:'||',not:'!'},bits:{and:'&',or:'|',not:'!'},sets:{and:'∩',or:'∪',not:'∁'}};
export function levelSpec(number,settings={}){const s=normalizeSettings(settings);if(s.mode!=='training')Object.assign(s,CAMPAIGN_SETTINGS);const index=(Math.max(1,number)-1)%20;let rule=adaptRule(rules[index],s);if(s.mode==='infinite'&&number>20){const base=rules[8+(number%12)];rule=adaptRule(number%3===0?not(base):base,s);}let [title,intro]=lessons[index];intro=intro.replace(/\{(and|or|not)\}/g,(_,op)=>notationSymbols[s.notation][op]);if(number>20){title='Controlli senza fine';intro='Una nuova combinazione di condizioni. Leggila prima di aprire gli ingressi.';}else if((!s.colors&&index>=8&&index<=10)||(!s.patterns&&index>=11&&index<=13)){title='Conta la combinazione';intro='La regola è adattata alle tue preferenze: osserva gli accessori nel cartello e combina le condizioni.';}else if(number===5&&s.timer==='relaxed'){title='Una presenza, una assenza';intro='Il cappello deve esserci e gli occhiali devono mancare. Entrambe le condizioni devono funzionare.';}return {number,index,rule,location:LOCATIONS[index],title,intro,count:8,timeLimitMs:number<=4||s.timer==='relaxed'?null:Math.max(16000,8000+walk(rule).length*2500),settings:s};}
function makePerson(r,s){const pick=a=>a[Math.floor(r()*a.length)];return{seed:Math.floor(r()*1e9),hat:s.distractors&&r()>.5,glasses:s.distractors&&r()>.5,badge:s.distractors&&r()>.5,tie:s.distractors&&r()>.5,backpack:s.distractors&&r()>.65,moustache:s.distractors&&r()>.6,hatColor:s.colors?pick(COLORS):'blue',shirtColor:s.colors?pick(COLORS):'white',shirtPattern:s.patterns&&s.distractors?pick(PATTERNS):'plain',outfit:pick(['shirt','jacket']),skin:Math.floor(r()*5),hair:Math.floor(r()*6),face:Math.floor(r()*4),body:Math.floor(r()*4)};}
function candidates(rule,s,r){const props=predicates(rule), keys=[...new Set(props.map(n=>n.key))];if(keys.includes('hatColor')&&!keys.includes('hat'))keys.push('hat');let configs=[{}];for(const key of keys){let domain=BOOL_KEYS.includes(key)?[false,true]:key==='hatColor'||key==='shirtColor'?COLORS:key==='shirtPattern'?PATTERNS:['shirt','jacket'];configs=configs.flatMap(c=>domain.map(v=>({...c,[key]:v})));}return configs.map(config=>Object.assign(makePerson(r,s),config));}
export function classify(rule,person){const tags=[evaluate(rule,person)?'valid':'invalid'];for(const n of walk(rule)){if(n.op==='or'){const count=n.args.filter(a=>evaluate(a,person)).length;if(count===n.args.length)tags.push('or-both');else if(count===0)tags.push('or-neither');else tags.push('or-one');}if(n.op==='not')tags.push(evaluate(n,person)?'not-true':'not-false');}return[...new Set(tags)];}
export function buildCases(spec,seed){const r=rng(seed),pool=shuffle(candidates(spec.rule,{...spec.settings,distractors:spec.settings.distractors&&(spec.number>=14||spec.settings.visual==='rich'),patterns:spec.settings.patterns&&spec.number>=12},r),r),selected=[],used=new Set();const take=predicate=>{const i=pool.findIndex((v,j)=>!used.has(j)&&predicate(v));if(i>=0){used.add(i);selected.push(pool[i]);return pool[i];}};
 const valid=take(v=>evaluate(spec.rule,v));take(v=>!evaluate(spec.rule,v));
 if(valid){const props=predicates(spec.rule);take(v=>!evaluate(spec.rule,v)&&props.filter(n=>evaluate(n,v)!==evaluate(n,valid)).length===1);}
 for(const tag of ['or-both','or-one','or-neither','not-true','not-false'])if(selected.length<spec.count&&!selected.some(v=>classify(spec.rule,v).includes(tag)))take(v=>classify(spec.rule,v).includes(tag));
 while(selected.length<spec.count){const desired=selected.filter(v=>evaluate(spec.rule,v)).length<Math.floor(spec.count/2);if(!take(v=>evaluate(spec.rule,v)===desired)){const list=pool.filter(v=>evaluate(spec.rule,v)===desired);const source=list.length?list:pool;selected.push({...source[Math.floor(r()*source.length)],seed:Math.floor(r()*1e9),hair:Math.floor(r()*6),face:Math.floor(r()*4),skin:Math.floor(r()*5)});}}
 return shuffle(selected,r).map((person,i)=>({id:`${seed}-${i}`,person,expected:evaluate(spec.rule,person),tags:classify(spec.rule,person)}));
}
export function validateRule(n,depth=0){if(!n||typeof n!=='object'||depth>8)throw Error('Regola non valida');if(n.op==='prop'){if(BOOL_KEYS.includes(n.key)){if(n.value!==undefined)throw Error('Valore booleano non valido');}else{const values=n.key==='hatColor'||n.key==='shirtColor'?COLORS:n.key==='shirtPattern'?PATTERNS:n.key==='outfit'?['shirt','jacket']:[];if(!values.includes(n.value))throw Error('Proprietà non valida');}}else if(n.op==='not')validateRule(n.arg,depth+1);else if(['and','or'].includes(n.op)&&Array.isArray(n.args)&&n.args.length>=2&&n.args.length<=4)n.args.forEach(a=>validateRule(a,depth+1));else throw Error('Operatore non valido');}
export function validatePerson(p){if(!p||BOOL_KEYS.some(k=>typeof p[k]!=='boolean')||!COLORS.includes(p.hatColor)||!COLORS.includes(p.shirtColor)||!PATTERNS.includes(p.shirtPattern)||!['shirt','jacket'].includes(p.outfit))throw Error('Personaggio non valido');}
export function validateLog(log){if(log?.format!=='dogana-booleana-log'||log.version!==VERSION||typeof log.student?.name!=='string'||!log.student.name.trim()||log.student.name.length>100||typeof log.student?.className!=='string'||log.student.className.length>80||!Array.isArray(log.attempts)||log.attempts.length>100000)throw Error('Report non valido');const ids=new Set();for(const a of log.attempts){if(typeof a.id!=='string'||a.id.length>150||ids.has(a.id)||typeof a.sessionId!=='string'||!Number.isInteger(a.level)||a.level<1||a.level>100000||!['answer','timeout'].includes(a.kind)||!(a.answer===0||a.answer===1||a.answer===null)||!Number.isFinite(a.activeMs)||a.activeMs<0||a.activeMs>86400000||!Number.isFinite(Date.parse(a.at))||!a.settings)throw Error('Tentativo non valido');ids.add(a.id);validateRule(a.rule);validatePerson(a.person);if(a.kind==='timeout'&&a.answer!==null||a.kind==='answer'&&a.answer===null)throw Error('Risposta incoerente');if(a.expected!==evaluate(a.rule,a.person)||a.correct!==(a.kind==='answer'&&Boolean(a.answer)===a.expected))throw Error('Risultato incoerente');}return log;}
export function summarize(attempts){let streak=0,best=0,lastSession=null;const byOperator={and:{total:0,correct:0},or:{total:0,correct:0},not:{total:0,correct:0}},times=[];for(const a of attempts){if(a.sessionId!==lastSession){streak=0;lastSession=a.sessionId;}streak=a.correct?streak+1:0;best=Math.max(best,streak);for(const op of operators(a.rule)){byOperator[op].total++;byOperator[op].correct+=Number(a.correct);}if(a.correct)times.push(a.activeMs);}return {total:attempts.length,correct:attempts.filter(a=>a.correct).length,timeouts:attempts.filter(a=>a.kind==='timeout').length,activeMs:attempts.reduce((n,a)=>n+a.activeMs,0),bestStreak:best,accuracy:attempts.length?attempts.filter(a=>a.correct).length/attempts.length:null,meanMs:times.length?times.reduce((a,b)=>a+b,0)/times.length:null,bestMs:times.length?times.reduce((best,time)=>Math.min(best,time),Infinity):null,byOperator};}
