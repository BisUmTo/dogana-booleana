/** Original layered vector artwork. Identity variants never encode admission rules. */
const INK = '#24162e';
const COLORS = Object.freeze({blue:'#268aee',red:'#f14660',green:'#38ba82',yellow:'#ffcf49',purple:'#aa6ced',orange:'#ff902e',white:'#fff1d9'});
const COLOR_NAMES = Object.freeze({blue:'blu',red:'rosso',green:'verde',yellow:'giallo',purple:'viola',orange:'arancione',white:'bianco'});
const SKINS = ['#f7c19c','#dfa077','#bd805b','#935637','#6c3f2f','#f1ae87'];
const HAIR = ['#342435','#59323b','#1f2939','#ad6337','#e4af5b','#73535f'];
const PATTERNS = ['plain','stripes','dots','checks'];
const PATTERN_NAMES = {plain:'a tinta unita',stripes:'a righe',dots:'a pois',checks:'a quadri'};
let serial=0;
const escape = value => String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const own = (object,key) => Object.hasOwn(object,key);
const colorKey = value => own(COLORS,value) ? value : 'blue';
const int = (value,fallback=0) => Number.isFinite(Number(value)) ? Math.abs(Math.trunc(Number(value))) : fallback;
const boundedSize = value => Math.min(1024,Math.max(12,Number.isFinite(Number(value))?Number(value):42));
const unique = prefix => `${String(prefix ?? 'guest').replace(/[^a-zA-Z0-9_-]/g,'').slice(0,48)||'guest'}-${++serial}`;
const path = (d,fill,extra='') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const group = (part,content,extra='') => `<g data-part="${part}" ${extra}>${content}</g>`;
const stroke = `stroke="${INK}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"`;

function normalize(person={}) {
 const p=person && typeof person==='object'?person:{};
 const seed=int(p.seed,1);
 return {seed,hat:p.hat===true,glasses:p.glasses===true,badge:p.badge===true,tie:p.tie===true,backpack:p.backpack===true,moustache:p.moustache===true,
  hatColor:colorKey(p.hatColor),shirtColor:colorKey(p.shirtColor),shirtPattern:PATTERNS.includes(p.shirtPattern)?p.shirtPattern:'plain',outfit:p.outfit==='jacket'?'jacket':'shirt',
  skin:int(p.skin,seed%6)%6,hair:int(p.hair,(seed>>>3)%6)%6,face:int(p.face,(seed>>>5)%4)%4,body:int(p.body,(seed>>>7)%4)%4};
}

/** Accessory geometry uses a shared 100 × 100 local coordinate system. */
function accessory(part,color=part==='tie'?COLORS.red:'#ada7c3') {
 switch(part) {
 case 'hat': return group('hat',`${path('M23 67 30 26Q32 18 42 25L52 31 69 23Q78 19 81 29L88 68Z',color)}${path('M29 30 24 62 42 65 46 30 40 26Z','#fff','opacity=".17" stroke="none"')}${path('M25 55Q55 65 85 55L88 68Q56 80 22 69Z','#242037')}<ellipse cx="51" cy="73" rx="46" ry="12" fill="${color}"/>${path('M8 73Q48 83 94 70','none','stroke="#fff" stroke-opacity=".25" stroke-width="2"')}`,stroke);
 case 'glasses': return group('glasses',`<path d="M3 47H12M88 47H97M43 47Q50 39 57 47" fill="none"/><circle cx="27" cy="49" r="19" fill="#fff" fill-opacity=".12"/><circle cx="73" cy="49" r="19" fill="#fff" fill-opacity=".12"/><path d="M18 39 24 34M64 39 70 34" stroke="#fff4e1" stroke-width="2.5" opacity=".75"/>`,`stroke="#ddd4f0" stroke-width="6" stroke-linecap="round"`);
 case 'badge': return group('badge',`<rect x="13" y="27" width="74" height="59" rx="6" fill="#ffc743"/><rect x="20" y="34" width="60" height="45" rx="2" fill="#ffe492" stroke="none"/><rect x="42" y="13" width="16" height="23" rx="3" fill="#f9bb37"/><circle cx="35" cy="49" r="7" fill="#5a3930" stroke="none"/>${path('M23 71V65Q24 55 35 55T47 65V71Z','#5a3930','stroke="none"')}<path d="M54 47H72M54 57H73M54 67H68" stroke="#7a512c" stroke-width="4"/>`,stroke);
 case 'tie': return group('tie',`${path('M32 13Q50 7 68 13L60 33H40Z',color)}${path('M43 33H57L67 76 50 93 33 76Z',color)}${path('M49 36 42 74 49 83','none','stroke="#ff9d9f" stroke-width="3" opacity=".55"')}`,stroke);
 case 'backpack': return group('backpack',`<path d="M36 24V17Q50 3 64 17V24" fill="none" stroke-width="8"/><rect x="16" y="22" width="68" height="71" rx="20" fill="#7976c7"/><path d="M23 31Q35 22 52 25" fill="none" stroke="#c5bff4" stroke-width="4"/><rect x="25" y="57" width="49" height="28" rx="9" fill="#535496"/><path d="M30 65H69" stroke="#e8bc5b" stroke-width="3"/><path d="M64 65V72" stroke="#ffdb81" stroke-width="4"/>`,stroke);
 case 'moustache': return group('moustache',path('M50 39C37 24 29 45 17 46Q8 47 5 39C3 66 30 76 50 58 70 76 97 66 95 39Q92 47 83 46C71 45 63 24 50 39Z',color),stroke);
 default:return '';
 }
}

function patternDef(id,pattern,base) {
 const light=[COLORS.white,COLORS.yellow,COLORS.orange,COLORS.green].includes(base)?'#4d426e':'#fff7e6';
 const motif=pattern==='stripes'?'<path d="M0 7H32M0 23H32" stroke="#fff7e6" stroke-width="5"/>':
 pattern==='dots'?'<circle cx="8" cy="8" r="4.5" fill="#fff7e6"/><circle cx="24" cy="24" r="4.5" fill="#fff7e6"/>':
 pattern==='checks'?'<path d="M8 0V32M24 0V32M0 8H32M0 24H32" stroke="#fff7e6" stroke-width="3.5"/>':'';
 return `<pattern id="${id}" width="32" height="32" patternUnits="userSpaceOnUse"><rect width="32" height="32" fill="${base}"/>${motif.replaceAll('#fff7e6',light)}</pattern>`;
}

function clothingIcon(id,color,pattern='plain',jacket=false) {
 return `<defs>${patternDef(`${id}-cloth`,pattern,color)}</defs>${group('shirt',`${path('M30 21 10 32 3 57 22 63 26 49V91H74V49L78 63 97 57 90 32 70 21 58 27H42Z',`url(#${id}-cloth)`)}${path('M36 19 50 30 41 44 29 25M64 19 50 30 59 44 71 25','#fff2dd')}${jacket?group('jacket',path('M29 23 37 25 36 92H25L24 51 20 61 4 55 12 33ZM71 23 63 25 64 92H75L76 51 80 61 96 55 88 33Z','#303451')):''}`,`${stroke} data-pattern="${pattern}"`)}`;
}

export function describePredicate(predicate={}) {
 const {key,value}=predicate || {};
 const names={hat:'cappello',glasses:'occhiali',badge:'tessera visitatore',tie:'cravatta',backpack:'zaino',moustache:'baffi'};
 if(own(names,key))return names[key];
 if(key==='hatColor')return `cappello ${COLOR_NAMES[colorKey(value)]}`;
 if(key==='shirtColor')return `camicia ${({red:'rossa',yellow:'gialla',white:'bianca'})[value]||COLOR_NAMES[colorKey(value)]}`;
 if(key==='shirtPattern')return `camicia ${PATTERN_NAMES[PATTERNS.includes(value)?value:'plain']}`;
 if(key==='outfit')return value==='jacket'?'giacca':'camicia senza giacca';
 return 'caratteristica';
}

export function renderIcon(predicate={},options={}) {
 const safe=predicate && typeof predicate==='object'?predicate:{};
 const {size=42,idPrefix='icon'}=options || {};
 const id=unique(idPrefix), s=boundedSize(size);
 const key=safe.key;
 let content='';
 if(['hat','glasses','badge','tie','backpack','moustache'].includes(key))content=accessory(key);
 else if(key==='hatColor')content=accessory('hat',COLORS[colorKey(safe.value)]);
 else if(['shirtColor','shirtPattern','outfit'].includes(key)) content=clothingIcon(id,key==='shirtColor'?COLORS[colorKey(safe.value)]:'#817aa8',key==='shirtPattern'&&PATTERNS.includes(safe.value)?safe.value:'plain',key==='outfit'&&safe.value==='jacket');
 else content='<circle cx="50" cy="50" r="32" fill="none" stroke="#c9c1df" stroke-width="5"/>';
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 100 100" role="img" aria-label="${escape(describePredicate(safe))}" class="predicate-icon" focusable="false">${content}</svg>`;
}

function hairBack(index,color) {
 const silhouettes=[
 'M146 198C118 145 135 88 181 72 221 52 286 69 305 109Q331 147 300 237L275 252 159 249Z',
 'M139 202C95 150 128 63 186 70 206 40 257 56 279 78 326 89 335 143 307 199L294 247 153 249Z',
 'M144 167C112 104 145 57 185 65 224 30 296 62 299 101Q325 116 306 168L285 201 153 201Z',
 'M135 165C130 90 158 62 204 69 256 44 310 84 310 150L321 274 282 300 254 250 173 275 119 258Z',
 'M143 166C115 140 129 112 123 92 157 91 154 56 185 74 205 40 231 64 250 67 279 51 286 87 310 96L302 177Z',
 'M143 171C114 127 145 60 195 65Q251 39 290 87C320 114 315 159 300 189L303 252 273 272 267 225 159 249 130 233Z'
 ];
 return group('hair-back',path(silhouettes[index],color),stroke);
}

function hairFront(index,color) {
 const fronts=[
 'M143 166Q146 105 172 105C195 140 244 109 270 91Q299 110 298 157L279 139 266 117Q216 155 172 131L157 183Z',
 'M141 157Q122 132 144 112C136 91 158 74 178 86 184 65 211 68 226 81 244 62 267 81 272 92 299 91 309 120 292 139L282 153 264 121Q220 141 164 128L157 167Z',
 'M143 156Q135 103 163 85L185 74 169 92Q233 43 282 93L298 119 280 141Q260 97 246 105L235 128 216 116 195 137 170 121 158 166Z',
 'M138 157Q137 91 188 88 245 54 282 99L298 148 280 161 266 112Q224 151 173 151L161 213 140 197Z',
 'M141 152 130 120 152 113 147 88 176 97 184 77 208 96 232 75 247 95 274 91 294 120 284 153 264 130 252 111 227 124 201 112 179 132 159 133 155 169Z',
 'M140 162Q133 94 183 88C224 65 268 79 286 105L299 157 280 164 268 122Q227 165 173 141L159 192 139 181Z'
 ];
 return group('hair-front',`${path(fronts[index],color)}${path(index===1?'M157 113Q171 103 180 112M195 94Q205 86 216 96M237 98Q250 88 260 107':'M155 119Q188 85 229 97','none',`stroke="#fff1d0" stroke-width="4" opacity=".12"`)}`,stroke);
}

function facialFeatures(index,seed,id,visual) {
 const eyes = index===1 ? 'M174 179Q186 166 201 180Q188 186 174 179ZM239 180Q253 166 267 178Q254 187 239 180Z' : index===2 ? 'M174 179Q187 164 203 179Q190 193 174 179ZM239 179Q253 164 268 179Q252 193 239 179Z' : 'M174 178Q187 170 202 181Q188 189 174 178ZM239 181Q253 168 267 176Q255 190 239 181Z';
 const expression=(index+((seed>>>3)%6))%6;
 const mouth = ['M194 230Q220 242 245 224Q226 252 205 240Z','M200 230Q221 240 242 228','M198 229Q220 248 242 228L238 242Q219 257 203 241Z','M200 232Q220 222 242 231Q223 246 200 232Z','M197 228Q221 247 244 226','M199 232Q218 239 242 226Q229 247 214 240Z'][expression];
 const interval=(4.5+(seed%18)*.15).toFixed(2),delay=(-((seed>>>4)%37)/10).toFixed(1);
 const motion=visual==='simple'?'':`<style>@keyframes blink-${id}{0%,95%,98.5%,100%{transform:scaleY(1)}96%,97.3%{transform:scaleY(.06)}}[id="${id}-eyes"]{transform-box:view-box;transform-origin:220px 179px;animation:blink-${id} ${interval}s ${delay}s infinite}.reduced-motion [id="${id}-eyes"],.visual-simple [id="${id}-eyes"]{animation:none!important}@media(prefers-reduced-motion:reduce){[id="${id}-eyes"]{animation:none!important}}</style>`;
 const eyeGroup=group('eyes',`${path(eyes,'#fff7e8','stroke-width="2.5"')}<ellipse cx="190" cy="179" rx="5.8" ry="8" fill="${INK}" stroke="none"/><ellipse cx="253" cy="179" rx="5.8" ry="8" fill="${INK}" stroke="none"/><circle cx="192" cy="176" r="2" fill="#fff" stroke="none"/><circle cx="255" cy="176" r="2" fill="#fff" stroke="none"/>`,`id="${id}-eyes" class="character-eyes"`);
 return motion+group('face-features',`${group('eyebrows',path('M172 161Q184 151 201 163M240 161Q254 149 268 158','none','stroke="#332633" stroke-width="6"'))}${eyeGroup}${group('nose',path('M220 182 214 207Q220 213 229 206','none','stroke="#784c43" stroke-width="2.5"'))}<ellipse cx="179" cy="208" rx="15" ry="8" fill="#e66b68" opacity=".25" stroke="none"/><ellipse cx="259" cy="207" rx="14" ry="8" fill="#e66b68" opacity=".25" stroke="none"/>${group('mouth',`${path(mouth,[1,4].includes(expression)?'none':'#bb595f','stroke="#713e44" stroke-width="2.8"')}${expression===2?path('M204 232Q220 240 236 232','#fff6e6','stroke="none"'):''}`,`data-expression="${expression}"`)}${path('M209 252Q221 256 231 250','none','stroke="#fff4d6" stroke-opacity=".3" stroke-width="3"')}`,stroke);
}

export function renderCharacter(person={},options={}) {
 const p=normalize(person), {idPrefix='guest',visual='normal'}=options || {}, id=unique(idPrefix);
 const skin=SKINS[p.skin], hair=HAIR[(p.seed>>>1)%HAIR.length], cloth=COLORS[p.shirtColor];
 const breadth=[0,12,-8,6][p.body];
 const left=122-breadth,right=318+breadth;
 const torso=`M179 295Q153 303 ${left} 321L${left-12} 430 129 529Q221 553 311 529L${right+12} 430 ${right} 321Q287 303 261 295Z`;
 const head=['M155 142Q163 106 215 104 277 101 289 147L284 217Q275 251 238 273Q218 286 197 270L167 245Q150 219 155 142Z',
 'M155 146Q159 106 216 102 279 102 289 149L285 214Q280 263 226 279Q184 272 162 238 148 207 155 146Z',
 'M158 147Q161 107 216 104 275 103 287 148L282 225 252 259Q222 279 194 260L165 231Z',
 'M158 144Q162 104 218 103 277 106 287 149L280 227Q266 254 224 281Q186 265 165 232Z'][p.face];
 const labels=[p.hat?describePredicate({key:'hatColor',value:p.hatColor}):'senza cappello',...['glasses','badge','tie','backpack','moustache'].map(key=>`${p[key]?'con':'senza'} ${describePredicate({key})}`),describePredicate({key:'shirtColor',value:p.shirtColor}),PATTERN_NAMES[p.shirtPattern],p.outfit==='jacket'?'con giacca':'senza giacca'];
 const defs=`<defs>${patternDef(`${id}-cloth`,p.shirtPattern,cloth)}<linearGradient id="${id}-shade" x1="0" x2="1"><stop stop-color="#21142d" stop-opacity=".16"/><stop offset=".45" stop-color="#fff6d4" stop-opacity=".08"/><stop offset="1" stop-color="#21142d" stop-opacity=".23"/></linearGradient><linearGradient id="${id}-trousers" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#42405b"/><stop offset="1" stop-color="#25243c"/></linearGradient><clipPath id="${id}-body"><path d="${torso}"/></clipPath></defs>`;
 const backpack=p.backpack?group('backpack-assembly',`<g transform="translate(312 286) rotate(5 50 50) scale(1.1 1.55)">${accessory('backpack')}</g>`):'';
 const trousers=group('trousers',`${path('M137 512Q219 534 303 512L322 620H235L222 558 206 620H121Z',`url(#${id}-trousers)`)}${path('M222 558 218 532M157 556 178 540M282 544 267 558','none','stroke="#141729" stroke-width="4"')}<path d="M141 519Q221 538 300 518" fill="none" stroke="#191a2b" stroke-width="18"/><rect x="209" y="519" width="27" height="21" rx="4" fill="#d6a654"/><rect x="215" y="524" width="15" height="11" rx="1" fill="#24283b" stroke="none"/>`,stroke);
 const sleeve=p.outfit==='jacket'?'#33354f':`url(#${id}-cloth)`;
 const arms=group('arms',`${path(`M${left+5} 319Q${left-23} 322 ${left-29} 354L72 473Q65 503 91 520L132 539 150 502 118 482 154 394Z`,sleeve)}${path(`M${right-5} 319Q${right+24} 324 ${right+29} 354L366 473Q375 503 348 521L308 540 290 503 321 481 286 391Z`,sleeve)}${path('M96 492Q107 485 127 503L145 519Q155 534 139 543L120 537 98 514Z',skin)}${path('M342 492Q330 486 313 504L295 520Q285 534 302 543L320 536 341 514Z',skin)}${path('M109 504 129 519M329 505 312 519','none','stroke="#925a48" stroke-width="2.5"')}`,stroke);
 const shirt=group('shirt',`${path(torso,`url(#${id}-cloth)`)}<path d="${torso}" fill="url(#${id}-shade)" stroke="none"/><path d="M220 347V511" fill="none" stroke="${INK}" stroke-opacity=".18" stroke-width="2.5"/>${[387,422,457,492].map(y=>`<circle cx="228" cy="${y}" r="2.4" fill="${INK}" opacity=".5" stroke="none"/>`).join('')}${path('M149 482 158 464M283 501 275 481','none','stroke="#21142d" stroke-opacity=".2" stroke-width="3"')}`,`${stroke} data-pattern="${p.shirtPattern}" data-outfit="${p.outfit}"`);
 const jacket=p.outfit==='jacket'?group('jacket',`${path(`M180 297 ${left} 318 105 439 120 479 150 434 137 553 171 563 182 422 194 343Z`,'#33354f')}${path(`M260 297 ${right} 318 338 439 321 479 292 434 304 553 269 563 258 422 246 343Z`,'#33354f')}${path('M180 298 157 345 176 355 161 378 183 421 194 342M260 298 283 345 264 355 280 378 258 421 246 342','#4b4d69')}${path('M122 454 150 436M294 435 321 454','none','stroke="#7a7295" stroke-width="3"')}<circle cx="269" cy="469" r="3" fill="#d7b665" stroke="none"/>`,stroke):'';
 const neck=group('neck',`${path('M192 253 191 287Q183 299 173 302L216 353 266 304Q246 294 247 281L247 253Z',skin)}${path('M193 261Q219 282 247 259L247 281Q220 300 192 282Z','#6c3b33','opacity=".24" stroke="none"')}`,stroke);
 const collar=group('collar',`${path('M183 294 217 338 192 362 170 313Z','#fff0d5')}${path('M255 294 221 338 245 362 270 313Z','#fff0d5')}`,stroke);
 const straps=p.backpack?group('backpack-straps',`${path('M149 316Q127 370 126 441','none','stroke="#262b43" stroke-width="15"')}${path('M298 315Q316 359 314 421','none','stroke="#262b43" stroke-width="15"')}${path('M149 316Q127 370 126 441M298 315Q316 359 314 421','none','stroke="#9189ce" stroke-width="6"')}<rect x="121" y="410" width="13" height="19" rx="3" fill="#f1c566" stroke="${INK}" stroke-width="2"/>`):'';
 const ears=group('ears',`<ellipse cx="157" cy="190" rx="16" ry="25" fill="${skin}"/><ellipse cx="285" cy="190" rx="15" ry="24" fill="${skin}"/>${path('M153 180Q166 179 161 198M287 180Q276 181 282 198','none','stroke="#945849" stroke-width="3"')}`,stroke);
 const headArt=group('head',`${path(head,skin)}${path('M159 180Q161 237 199 261L216 274Q180 265 165 233Z','#75432f','opacity=".18" stroke="none"')}`,stroke);
 const tie=p.tie?`<g transform="translate(187 329) scale(.66 1.22)">${accessory('tie',p.shirtColor==='red'?'#67213d':COLORS.red)}</g>`:'';
 const badge=p.badge?`<g transform="translate(264 366) rotate(-5 34 35) scale(.7)">${accessory('badge')}</g>`:'';
 const glasses=p.glasses?`<g transform="translate(155 126) scale(1.34 1.05)">${accessory('glasses')}</g>`:'';
 const moustache=p.moustache?`<g transform="translate(191 196) scale(.6 .52)">${accessory('moustache','#352434')}</g>`:'';
 const hat=p.hat?`<g transform="translate(106 3) rotate(-4 118 90) scale(2.27 1.5)">${accessory('hat',COLORS[p.hatColor])}</g>`:'';
 const visualClass=['normal','simple','rich','contrast'].includes(visual)?visual:'normal';
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 620" role="img" aria-label="${escape(`Ospite: ${labels.join(', ')}.`)}" class="character-svg visual-${visualClass}" focusable="false">${defs}<ellipse cx="221" cy="610" rx="129" ry="9" fill="#110b22" opacity=".2"/>${backpack}${hairBack(p.hair,hair)}${trousers}${arms}${shirt}${jacket}${neck}${collar}${straps}${tie}${badge}${ears}${headArt}${facialFeatures(p.face,p.seed,id,visualClass)}${hairFront(p.hair,hair)}${moustache}${glasses}${hat}</svg>`;
}

export function renderUIIcon(name,size=24) {
 const paths={
  heart:['vita','M12 21S2 15 2 8Q2 2 8 3L12 6 16 3Q22 2 22 8C22 15 12 21 12 21Z'],
  settings:['impostazioni','M9 3 10 1H14L15 4 18 5 21 5 23 9 21 12 22 15 20 19 17 19 14 22H10L8 20 5 20 2 17 3 14 1 11 3 7 6 7ZM16 12A4 4 0 1 0 8 12A4 4 0 1 0 16 12Z'],
  clock:['tempo','M22 12A10 10 0 1 1 2 12A10 10 0 1 1 22 12ZM12 5V12L17 15'],
  pause:['pausa','M7 4V20M17 4V20'],play:['riprendi','M7 3 21 12 7 21Z'],
  help:['aiuto','M22 12A10 10 0 1 1 2 12A10 10 0 1 1 22 12ZM9 8Q9 4 13 6T13 12Q11 13 12 15M12 18V18.2'],
  sound:['audio attivo','M3 9H7L13 4V20L7 15H3ZM17 8Q21 12 17 16M20 5Q26 12 20 19'],
  muted:['audio disattivato','M3 9H7L13 4V20L7 15H3ZM17 9 23 15M23 9 17 15'],
  close:['chiudi','M5 5 19 19M19 5 5 19'],arrow:['continua','M3 12H21M14 5 21 12 14 19'],
  check:['corretto','M4 12 9 18 21 5'],cross:['errore','M5 5 19 19M19 5 5 19']
 };
 const [label,d]=own(paths,name)?paths[name]:paths.help;
 const s=boundedSize(size);
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 24 24" role="img" aria-label="${label}" class="ui-icon" focusable="false"><path d="${d}" fill="${name==='heart'?'currentColor':'none'}" fill-rule="evenodd" stroke="currentColor" stroke-width="${name==='pause'?4:2}" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}
