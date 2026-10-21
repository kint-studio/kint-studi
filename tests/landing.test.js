import {test} from 'node:test';
import assert from 'node:assert/strict';
// landing.js si avvia da solo all'import con il document globale: qui un document finto, senza scena né scia.
const fakeDoc=({scene=null,years=[],asked=[]}={})=>({hidden:false,body:{classList:{contains:()=>false}},fonts:{ready:new Promise(()=>{})},
 addEventListener(){},getElementById:()=>null,
 querySelector:s=>{asked.push(s);return s==='[data-scene]'?scene:null;},
 querySelectorAll:s=>s==='[data-year]'?years:[]});
globalThis.document=fakeDoc();
const {initLanding}=await import('../assets/studi/landing.js');

// Se startHero lancia subito (per esempio manca matchMedia), la scena sparisce e il resto della pagina parte lo stesso.
test('initLanding: se startHero lancia, la scena si nasconde e la pagina continua',()=>{
 const saved=globalThis.matchMedia;globalThis.matchMedia=undefined;
 const scene={hidden:false,querySelector:()=>null,parentElement:null},year={textContent:''},asked=[];
 try{assert.doesNotThrow(()=>initLanding(fakeDoc({scene,years:[year],asked})));}finally{globalThis.matchMedia=saved;}
 assert.equal(scene.hidden,true,'la scena è nascosta');
 assert.equal(year.textContent,String(new Date().getFullYear()));
 assert.ok(asked.includes('[data-service-trail]')&&asked.includes('[data-footer-wordmark]'),'dopo la scena partono scia e scritta del footer');
});
