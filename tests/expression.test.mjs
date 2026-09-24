import test from 'node:test';
import assert from 'node:assert/strict';
import {expression,words,ruleMarkup} from '../docs/expression.mjs';
import {levelSpec,p,and,or,not,predicates} from '../docs/core.mjs';

test('all twenty level rules retain every predicate in every notation',()=>{
 for(let level=1;level<=20;level++)for(const notation of ['math','words','code','bits','sets']){
  const rule=levelSpec(level).rule,html=expression(rule,notation);
  const leaves=(html.match(/class="prop-icon"/g)||[]).length;
  const count=n=>n.op==='prop'?1:n.op==='not'?count(n.arg):n.args.reduce((sum,a)=>sum+count(a),0);
  assert.equal(leaves,count(rule),`level ${level}, ${notation}`);
  assert.match(ruleMarkup(rule,notation),/role="img" aria-label="/);
 }
});
test('mixed groups preserve grouping and NOT wraps its complete argument',()=>{
 const rule=and(p('hat'),or(p('badge'),p('tie')),not(and(p('glasses'),p('backpack'))));
 const html=expression(rule);
 assert.equal((html.match(/class="expression-bracket"/g)||[]).length,2);
 assert.equal((html.match(/class="paren"/g)||[]).length,4);
 assert.match(html,/class="expression-not"[\s\S]*class="expression-bracket"/);
 assert.equal(words(rule),'cappello E (tessera visitatore O cravatta) E NON (occhiali E zaino)');
});
test('nested NOT keeps one bracket pair per compound argument',()=>{
 const html=expression(not(not(or(p('hat'),p('badge')))));
 assert.equal((html.match(/class="expression-not"/g)||[]).length,2);
 assert.equal((html.match(/class="expression-bracket"/g)||[]).length,2);
 assert.equal((html.match(/class="paren"/g)||[]).length,4);
});
test('code operators escape ampersands and untrusted values cannot add markup',()=>{
 assert.match(expression(and(p('hat'),p('badge')),'code'),/&amp;&amp;/);
 assert.doesNotMatch(ruleMarkup(p('hatColor','"><script>oops</script>'),'">bad'),/<script>|bad/);
});
