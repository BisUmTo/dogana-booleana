import {validateLog,evaluate,normalizeSettings,summarize} from './core.mjs';
import {describePredicate} from './characters.mjs';
import {unlock,unseal} from './crypto.mjs';

const localDate=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');};
const clean=value=>value.trim().replace(/\s+/g,' ');
const studentKey=student=>JSON.stringify([clean(student.name).toLocaleLowerCase('it'),clean(student.className).toLocaleLowerCase('it')]);
const stable=value=>value===null||typeof value!=='object'?JSON.stringify(value):Array.isArray(value)?`[${value.map(stable).join(',')}]`:`{${Object.keys(value).sort().map(key=>`${JSON.stringify(key)}:${stable(value[key])}`).join(',')}}`;
export function ruleInWords(rule){
 if(rule.op==='prop')return describePredicate(rule);
 if(rule.op==='not')return `NON (${ruleInWords(rule.arg)})`;
 return `(${rule.args.map(ruleInWords).join(rule.op==='and'?' E ':' O ')})`;
}
function verify(log){
 validateLog(log);
 for(const a of log.attempts){
  if(!a.id.trim()||!a.sessionId.trim()||a.sessionId.length>150||typeof a.settings!=='object'||Array.isArray(a.settings))throw Error('Identificatore o impostazioni del tentativo non validi.');
  const settings=normalizeSettings(a.settings);
  if(Object.entries(a.settings).some(([key,value])=>!(key in settings)||settings[key]!==value))throw Error('Impostazioni del tentativo non riconosciute.');
 }
 return log;
}
/** Validate an entire prospective collection before returning any changes. */
export function mergeLogs(logs){
 if(!Array.isArray(logs)||logs.length>1000)throw Error('Troppi file da importare.');
 const seen=new Map(),students=new Map();let duplicates=0;
 for(const log of logs){
  verify(log);
  const key=studentKey(log.student);
  if(!students.has(key))students.set(key,{key,name:clean(log.student.name),className:clean(log.student.className),attempts:[],files:0});
  const student=students.get(key);student.files++;
  for(const a of log.attempts){
   const expected=evaluate(a.rule,a.person),correct=a.kind==='answer'&&Boolean(a.answer)===expected;
   const attempt={...a,expected,correct};
   const fingerprint=stable({student:key,attempt});
   if(seen.has(a.id)){if(seen.get(a.id)!==fingerprint)throw Error(`Tentativo duplicato con contenuto diverso: ${a.id.slice(0,70)}. File rifiutato interamente.`);duplicates++;continue;}
   if(seen.size>=250000)throw Error('Limite complessivo di 250.000 tentativi raggiunto.');
   seen.set(a.id,fingerprint);student.attempts.push(attempt);
  }
 }
 const rows=[...students.values()].map(student=>{
  student.attempts.sort((a,b)=>a.sessionId.localeCompare(b.sessionId)||Date.parse(a.at)-Date.parse(b.at)||a.id.localeCompare(b.id));
  return {...student,...summarize(student.attempts),sessions:new Set(student.attempts.map(a=>a.sessionId)).size};
 }).sort((a,b)=>a.className.localeCompare(b.className,'it')||a.name.localeCompare(b.name,'it'));
 return {students:rows,duplicates,total:seen.size};
}
const activityOf=attempt=>attempt.settings?.mode==='training'?'training':'game';
const activityLabel=activity=>activity==='training'?'Allenamento':'Gioco';
const modeLabel=attempt=>attempt.settings?.mode==='training'?'Allenamento':attempt.settings?.mode==='infinite'?'Gioco · Infinita':attempt.settings?.mode==='progressive'?'Gioco · Progressiva':'Gioco · Report precedente';
/** The source remains globally deduplicated; each visible row has exactly one activity. */
export function filterReport(report,activity='game'){
 if(!['game','training','all'].includes(activity))throw Error('Attività non riconosciuta.');
 const selected=activity==='all'?['game','training']:[activity],rows=[];
 for(const student of report.students){
  for(const kind of selected){
   const attempts=student.attempts.filter(attempt=>activityOf(attempt)===kind);
   if(!attempts.length)continue;
   attempts.sort((a,b)=>a.sessionId.localeCompare(b.sessionId)||Date.parse(a.at)-Date.parse(b.at)||a.id.localeCompare(b.id));
   const sourceKey=student.studentKey??student.key;
   rows.push({...student,key:JSON.stringify([sourceKey,kind]),studentKey:sourceKey,activity:kind,attempts,...summarize(attempts),sessions:new Set(attempts.map(attempt=>attempt.sessionId)).size});
  }
 }
 const byActivity={};
 for(const kind of ['game','training']){
  const group=rows.filter(row=>row.activity===kind),total=group.reduce((n,row)=>n+row.total,0),correct=group.reduce((n,row)=>n+row.correct,0);
  byActivity[kind]={total,correct,accuracy:total?correct/total:null};
 }
 return {students:rows,studentCount:new Set(rows.map(row=>row.studentKey)).size,duplicates:report.duplicates,total:rows.reduce((n,row)=>n+row.total,0),activity,byActivity};
}
export function csvCell(value){
 let text=value===null||value===undefined?'':String(value);
 if(/^[\s\u0000-\u001f]*[=+\-@]/.test(text)||/^[\t\r\n]/.test(text))text="'"+text;
 return `"${text.replaceAll('"','""')}"`;
}
export function buildCSV(students){
 const header=['Nome','Classe','Attività','Sessioni','Risposte corrette','Tentativi','Accuratezza %','Timeout','Serie migliore','Tempo attivo ms','Media risposte corrette ms','AND tentativi','AND corretti','AND %','OR tentativi','OR corretti','OR %','NOT tentativi','NOT corretti','NOT %'];
 const rate=(n,d)=>d?(100*n/d).toFixed(1):'';
 const rows=filterReport({students,duplicates:0},'all').students.map(s=>[s.name,s.className,activityLabel(s.activity),s.sessions,s.correct,s.total,rate(s.correct,s.total),s.timeouts,s.bestStreak,s.activeMs,s.meanMs===null?'':Math.round(s.meanMs),...['and','or','not'].flatMap(op=>{const n=s.byOperator[op];return[n.total,n.correct,rate(n.correct,n.total)];})]);
 return '\ufeff'+[header,...rows].map(row=>row.map(csvCell).join(';')).join('\r\n');
}

const html=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const duration=ms=>{const seconds=Math.round(ms/1000);return seconds>=60?`${Math.floor(seconds/60)} min ${String(seconds%60).padStart(2,'0')} s`:`${seconds} s`;};
const percentage=value=>value===null?'—':`${Math.round(value*100)}%`;
const mean=value=>value===null?'—':`${(value/1000).toLocaleString('it-IT',{maximumFractionDigits:1})} s`;
const answer=value=>value===null?'Tempo scaduto':value?'1 · Ammetti':'0 · Respingi';

function mount(){
 const $=id=>document.getElementById(id);
 let privateKey=null,publicKey=null,logs=[],report=mergeLogs([]),busy=false,revision=0;
 const status=(text,error=false)=>{const box=$('status');box.textContent=text;box.classList.toggle('error',error);};
 const setBusy=value=>{busy=value;$('key-file').disabled=value;$('log-files').disabled=value||!privateKey;$('download-csv').disabled=value||!filtered().length;};
 function filtered(){const name=$('filter-name').value.trim().toLocaleLowerCase('it'),className=$('filter-class').value;return filterReport(report,$('filter-activity').value).students.filter(s=>(!name||s.name.toLocaleLowerCase('it').includes(name))&&(!className||`class:${s.className}`===className));}
 function opCell(s,op){const n=s.byOperator[op];return n.total?`<strong>${percentage(n.correct/n.total)}</strong><small>${n.correct}/${n.total}</small>`:'<span class="muted">—</span>';}
 function paint(){
  const rows=filtered(),all=rows.reduce((sum,s)=>sum+s.total,0),correct=rows.reduce((sum,s)=>sum+s.correct,0);
  $('count-students').textContent=new Set(rows.map(row=>row.studentKey)).size;$('count-attempts').textContent=all;$('count-duplicates').textContent=report.duplicates;
  const activity=$('filter-activity').value,split=activity==='all';$('count-accuracy').classList.toggle('is-split',split);
  if(split){$('count-accuracy').innerHTML=['game','training'].map(kind=>{const subset=rows.filter(row=>row.activity===kind),n=subset.reduce((sum,row)=>sum+row.total,0),c=subset.reduce((sum,row)=>sum+row.correct,0);return `<span>${activityLabel(kind)} <b>${n?percentage(c/n):'—'}</b></span>`;}).join('');}
  else $('count-accuracy').textContent=all?percentage(correct/all):'—';
  $('activity-note').textContent=split?'Gioco e Allenamento restano in righe separate: accuratezza, tempi e serie non vengono mescolati.':activity==='training'?'Mostri solo Allenamento. Questi tentativi non entrano nei risultati del gioco.':'Mostri solo Gioco: progressiva, infinita e report precedenti. Allenamento escluso.';
  $('table-body').innerHTML=rows.map(s=>`<tr><th scope="row"><button class="student-link" data-student="${html(s.key)}">${html(s.name)}</button><small>${s.sessions} ${s.sessions===1?'sessione':'sessioni'}</small></th><td>${html(s.className)||'—'}</td><td><span class="activity-tag ${s.activity}">${activityLabel(s.activity)}</span></td><td><strong>${s.correct}/${s.total}</strong></td><td><span class="rate ${s.accuracy>=.8?'good':''}">${percentage(s.accuracy)}</span></td><td>${s.timeouts}</td><td>${s.bestStreak}</td><td>${duration(s.activeMs)}</td><td>${mean(s.meanMs)}</td><td>${opCell(s,'and')}</td><td>${opCell(s,'or')}</td><td>${opCell(s,'not')}</td></tr>`).join('');
  $('empty-state').hidden=rows.length>0;$('results-table').hidden=!rows.length;
  $('empty-state').textContent=report.students.length?'Nessuno studente corrisponde ai filtri.':'Carica la chiave docente e importa uno o più file LOG per iniziare.';
  $('download-csv').disabled=busy||!rows.length;$('clear-reports').disabled=busy||!logs.length;
 }
 function paintFilters(){const current=$('filter-class').value;$('filter-class').innerHTML='<option value="">Tutte le classi</option>'+[...new Set(report.students.map(s=>s.className))].sort((a,b)=>a.localeCompare(b,'it')).map(c=>`<option value="${html(`class:${c}`)}">${html(c)||'Senza classe'}</option>`).join('');$('filter-class').value=current;}
 function details(key){
  const s=filtered().find(s=>s.key===key);if(!s)return;
  $('detail-title').textContent=s.name;$('detail-subtitle').textContent=`${s.className||'Classe non indicata'} · ${activityLabel(s.activity)} · ${s.correct}/${s.total} corretti · serie migliore ${s.bestStreak}`;
  const errors=s.attempts.filter(a=>!a.correct).sort((a,b)=>Date.parse(a.at)-Date.parse(b.at));
  $('detail-content').innerHTML=`<p class="detail-note">${errors.length?`${errors.length} tentativi da rivedere. Gli orari seguono il fuso del dispositivo.`:'Nessun errore nei report importati.'}</p>`+errors.map(a=>`<article class="attempt"><div class="attempt-meta"><span class="activity-tag ${activityOf(a)}">${modeLabel(a)}</span><span>Livello ${a.level}</span><time>${html(new Date(a.at).toLocaleString('it-IT'))}</time><span>${duration(a.activeMs)}</span></div><p class="rule-words">${html(ruleInWords(a.rule))}</p><p><span class="wrong-answer">Scelta: ${answer(a.answer)}</span> <span class="right-answer">Atteso: ${answer(Number(evaluate(a.rule,a.person)))}</span></p><details><summary>Caratteristiche dell’ospite e impostazioni</summary><p>${html(['hat','glasses','badge','tie','backpack','moustache'].map(key=>`${describePredicate({key})}: ${a.person[key]?'sì':'no'}`).join(' · '))}</p><p>${html([a.person.hat?describePredicate({key:'hatColor',value:a.person.hatColor}):'senza cappello',describePredicate({key:'shirtColor',value:a.person.shirtColor}),describePredicate({key:'shirtPattern',value:a.person.shirtPattern}),describePredicate({key:'outfit',value:a.person.outfit})].join(' · '))}</p><p>Notazione: ${html(a.settings.notation||'math')} · aiuti: ${a.helped===true?'sì':'no'}</p></details></article>`).join('');
  $('student-detail').showModal();
 }
 $('key-file').addEventListener('change',async event=>{
  const file=event.target.files[0];if(!file)return;
  setBusy(true);status('Verifica della chiave in corso…');const token=revision;
  try{if(file.size>100000)throw Error('File chiave troppo grande.');const jwk=JSON.parse(await file.text());const key=await unlock(jwk,publicKey);if(token!==revision)return;privateKey=key;$('key-status').textContent='Chiave attiva in questa scheda';$('key-status').classList.add('unlocked');$('lock-key').disabled=false;status('Chiave verificata. Puoi importare i file LOG.');}
  catch(error){status(error.message||'Chiave non valida.',true);}finally{event.target.value='';setBusy(false);}
 });
 $('log-files').addEventListener('change',async event=>{
  const files=[...event.target.files];if(!files.length||!privateKey)return;
  setBusy(true);const token=revision;let imported=0;const failures=[];
  for(const file of files){
   if(token!==revision)break;
   status(`Importazione ${imported+failures.length+1}/${files.length}: ${file.name}`);
   try{if(file.size>64*1024*1024)throw Error('File superiore a 64 MB.');const envelope=JSON.parse(await file.text());if(envelope.keyId!==publicKey.n.slice(0,20))throw Error('Il file appartiene a un’altra chiave docente.');const log=await unseal(envelope,privateKey);const prospective=mergeLogs([...logs,log]);if(token!==revision)break;logs.push(log);report=prospective;imported++;}
   catch(error){failures.push(`${file.name}: ${error.message}`);}
  }
  if(token===revision){paintFilters();paint();status(`${imported} ${imported===1?'file importato':'file importati'}. ${report.duplicates} tentativi sovrapposti ignorati.${failures.length?' '+failures.join(' | '):''}`,!!failures.length);}
  event.target.value='';setBusy(false);
 });
 $('lock-key').addEventListener('click',()=>{revision++;privateKey=null;$('key-status').textContent='Chiave non caricata';$('key-status').classList.remove('unlocked');$('lock-key').disabled=true;setBusy(false);status('Chiave rimossa dalla memoria della pagina. I risultati già aperti restano visibili.');});
 $('clear-reports').addEventListener('click',()=>{revision++;logs=[];report=mergeLogs([]);$('student-detail').close();$('detail-content').replaceChildren();paintFilters();paint();status('Report rimossi dalla pagina.');});
 $('filter-name').addEventListener('input',paint);$('filter-class').addEventListener('change',paint);$('filter-activity').addEventListener('change',paint);
 $('table-body').addEventListener('click',event=>{const button=event.target.closest('[data-student]');if(button)details(button.dataset.student);});
 $('close-detail').addEventListener('click',()=>$('student-detail').close());
 $('download-csv').addEventListener('click',()=>{const blob=new Blob([buildCSV(filtered())],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`dogana-booleana-report-${$('filter-activity').value}-${localDate()}.csv`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
 paint();
 fetch('./public-key.json',{cache:'no-store'}).then(response=>{if(!response.ok)throw Error('Chiave pubblica non disponibile.');return response.json();}).then(jwk=>{publicKey=jwk;$('key-file').disabled=false;status('Pronto. Carica la chiave privata docente.');}).catch(error=>status(`${error.message} Apri la pagina dal sito del gioco o da un server locale.`,true));
}
if(typeof document!=='undefined')mount();
