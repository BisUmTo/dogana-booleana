import {renderIcon,describePredicate} from './characters.mjs';
const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const notation={math:{and:'∧',or:'∨',not:'¬'},words:{and:'AND',or:'OR',not:'NOT'},code:{and:'&&',or:'||',not:'!'},bits:{and:'&',or:'|',not:'!'},sets:{and:'∩',or:'∪',not:'∁'}};
// Parentheses remain attached to the whole subexpression even when its content wraps.
const paren=right=>`<span class="paren" aria-hidden="true"><svg viewBox="0 0 10 100" preserveAspectRatio="none" focusable="false"><path d="${right?'M1 2C11 22 11 78 1 98':'M9 2C-1 22-1 78 9 98'}"/></svg></span>`;
const bracket=content=>`<span class="expression-bracket">${paren(false)}${content}${paren(true)}</span>`;
export function expression(node,style='math',nested=false){
 const sy=notation[style]??notation.math;
 const op=key=>`<span class="op ${style==='words'?'word':''}" aria-hidden="true">${escape(sy[key])}</span>`;
 if(node.op==='prop')return `<span class="prop-icon" title="${escape(describePredicate(node))}">${renderIcon(node,{size:54})}</span>`;
 if(node.op==='not')return `<span class="expression-not">${op('not')}${node.arg.op==='prop'?expression(node.arg,style,true):bracket(expression(node.arg,style,true))}</span>`;
 if(!['and','or'].includes(node.op)||!Array.isArray(node.args))throw Error('Espressione non valida');
 const inner=node.args.map((arg,index)=>{
  const content=expression(arg,style,true);
  const term=arg.op!=='prop'&&arg.op!=='not'&&arg.op!==node.op?bracket(content):content;
  return index?`<span class="expression-term">${op(node.op)}${term}</span>`:term;
 }).join('');
 return `<span class="expression-group ${nested?'nested':''}" data-operator="${node.op}">${inner}</span>`;
}
export function words(node){
 if(node.op==='prop')return describePredicate(node);
 if(node.op==='not')return `NON ${node.arg.op==='prop'?words(node.arg):`(${words(node.arg)})`}`;
 if(!['and','or'].includes(node.op))throw Error('Espressione non valida');
 return node.args.map(arg=>arg.op==='prop'||arg.op==='not'?words(arg):`(${words(arg)})`).join(node.op==='and'?' E ':' O ');
}
export function ruleMarkup(rule,style='math'){return `<div class="rule-expression" role="img" aria-label="${escape(words(rule))}">${expression(rule,style)}</div>`;}
