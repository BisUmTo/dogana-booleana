import test from 'node:test';
import assert from 'node:assert/strict';
import {renderCharacter, renderIcon, describePredicate, renderUIIcon} from '../docs/characters.mjs';

const all = {seed: 17, hat:true, glasses:true, badge:true, tie:true, backpack:true, moustache:true, hatColor:'blue', shirtColor:'orange', shirtPattern:'checks', outfit:'jacket', skin:2, hair:2, face:1, body:1};
const canonical = svg => svg.replace(/guest-\d+/g,'guest-ID');

test('portrait is accessible and includes every independent accessory', () => {
 const svg=renderCharacter(all);
 assert.match(svg, /viewBox="0 0 440 620"/);
 assert.match(svg, /role="img"/);
 assert.match(svg, /aria-label="[^"]*cappello blu/);
 for (const part of ['hat','glasses','badge','tie','backpack','moustache']) assert.match(svg,new RegExp(`data-part="${part}"`));
 assert.match(svg,/data-pattern="checks"/);
 assert.match(svg,/data-outfit="jacket"/);
});
test('false accessories are absent and described explicitly', () => {
 const svg=renderCharacter({...all,hat:false,glasses:false,badge:false,tie:false,backpack:false,moustache:false});
 for(const part of ['hat','glasses','badge','tie','backpack','moustache']) assert.doesNotMatch(svg,new RegExp(`data-part="${part}"`));
 assert.match(svg,/senza cappello/);
});
test('visual generation is deterministic apart from unique document IDs',()=>{
 assert.equal(canonical(renderCharacter(all)),canonical(renderCharacter(all)));
 const one=renderCharacter(all,{idPrefix:'same'}),two=renderCharacter(all,{idPrefix:'same'});
 assert.notEqual(one.match(/id="([^"]+)"/)[1],two.match(/id="([^"]+)"/)[1]);
});
test('hair, face and body indexes select distinct geometries',()=>{
 for(const key of ['hair','face','body']) {
  const variants=[0,1,2,3].map(value=>canonical(renderCharacter({...all,[key]:value})));
  assert.equal(new Set(variants).size,4);
 }
});
test('all rule icons have Italian accessible descriptions',()=>{
 for(const key of ['hat','glasses','badge','tie','backpack','moustache']) {
  assert.ok(describePredicate({key}).length>3);
  assert.match(renderIcon({key}),new RegExp(`data-part="${key}"`));
 }
 for(const value of ['blue','red','green','yellow','purple','orange','white']) {
  assert.match(renderIcon({key:'hatColor',value}),/data-part="hat"/);
  assert.match(renderIcon({key:'shirtColor',value}),/data-part="shirt"/);
 }
 for(const value of ['plain','stripes','dots','checks']) assert.match(renderIcon({key:'shirtPattern',value}),new RegExp(`data-pattern="${value}"`));
 assert.match(renderIcon({key:'outfit',value:'jacket'}),/giacca/);
 assert.notEqual(renderIcon({key:'hat'}),renderIcon({key:'hatColor',value:'blue'}));
});
test('badge is a visitor card, tie and patterned shirt remain independent layers',()=>{
 const svg=renderCharacter(all);
 assert.match(svg,/data-part="badge"[\s\S]*?<rect/);
 assert.ok(svg.indexOf('data-part="badge"')>svg.indexOf('data-part="jacket"'));
 assert.ok(svg.indexOf('data-part="tie"')>svg.indexOf('data-part="jacket"'));
 assert.match(svg,/tessera visitatore/);
});
test('untrusted options and person properties cannot inject markup or event attributes',()=>{
 const attack='\"><script>alert(1)</script><g onload="bad';
 const svg=renderCharacter({...all,shirtColor:attack,hatColor:attack,shirtPattern:attack,skin:attack,hair:attack,face:attack,body:attack},{idPrefix:attack,visual:attack,className:attack});
 const icon=renderIcon({key:attack,value:attack},{size:attack,idPrefix:attack});
 for(const output of [svg,icon]) { assert.doesNotMatch(output,/<script|onload=|NaN|undefined/); assert.match(output,/<svg/); }
});
test('all native interface icons are vectors with accessible names',()=>{
 for(const name of ['heart','settings','clock','pause','help','play','sound','muted','close','arrow','check','cross']) {
  assert.match(renderUIIcon(name,24),/aria-label="[^"]+"/);
  assert.match(renderUIIcon(name,24),/width="24"/);
 }
});

test('every shirt color has clearly contrasting opaque pattern ink',()=>{
 const luminance=hex=>{const rgb=hex.slice(1).match(/../g).map(value=>parseInt(value,16)/255).map(value=>value<=.04045?value/12.92:((value+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;};
 for(const color of ['blue','red','green','yellow','purple','orange','white'])for(const pattern of ['stripes','dots','checks']){
  const svg=renderCharacter({...all,shirtColor:color,shirtPattern:pattern});
  const definition=svg.match(/<pattern\b[^>]*>(.*?)<\/pattern>/s)[1];
  const base=definition.match(/<rect[^>]*fill="(#[a-f0-9]+)"/)[1];
  const ink=definition.match(/<(?:path|circle)[^>]*(?:stroke|fill)="(#[a-f0-9]+)"/)[1];
  const high=Math.max(luminance(base),luminance(ink)),low=Math.min(luminance(base),luminance(ink));
  assert.ok((high+.05)/(low+.05)>=3,`${color}/${pattern} has sufficient graphic contrast`);
  assert.doesNotMatch(definition,/opacity=/);
 }
});
test('tie remains distinct on a red shirt and all requested visual settings survive',()=>{
 const red=renderCharacter({...all,shirtColor:'red',tie:true});
 assert.match(red, /data-part="tie"[\s\S]*?fill="#67213d"/);
 for(const visual of ['simple','normal','rich'])assert.match(renderCharacter(all,{visual}),new RegExp(`character-svg visual-${visual}`));
});

test('blink targets eyes alone and respects quiet modes',()=>{
 const normal=renderCharacter(all);
 const eyes=normal.match(/<g data-part="eyes"[^>]*>([\s\S]*?)<\/g>/)[1];
 assert.equal((eyes.match(/<ellipse /g)||[]).length,2);
 assert.equal((eyes.match(/<circle /g)||[]).length,2);
 assert.doesNotMatch(eyes,/eyebrows|nose|mouth|glasses/);
 assert.match(normal,/prefers-reduced-motion:reduce/);
 assert.match(normal,/\.reduced-motion \[id=/);
 assert.match(normal,/\.visual-simple \[id=/);
 assert.doesNotMatch(renderCharacter(all,{visual:'simple'}),/@keyframes blink-/);
});
test('blink timing varies deterministically and mouth expressions are independent of accessories',()=>{
 const timing=svg=>svg.match(/animation:blink-[^ ]+ ([0-9.]+s -?[0-9.]+s) infinite/)[1];
 assert.equal(timing(renderCharacter(all)),timing(renderCharacter(all)));
 assert.notEqual(timing(renderCharacter({...all,seed:18})),timing(renderCharacter(all)));
 const mouths=[0,8,16,24,32,40].map(seed=>renderCharacter({...all,seed,face:0}).match(/data-part="mouth"[^>]*data-expression="(\d+)"/)[1]);
 assert.equal(new Set(mouths).size,6);
 const mouth=svg=>svg.match(/<g data-part="mouth"[^>]*>([\s\S]*?)<\/g>/)[1];
 assert.equal(mouth(renderCharacter(all)),mouth(renderCharacter({...all,hat:false,glasses:false,badge:false,tie:false,backpack:false,moustache:false})));
});
