import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
// landing.js si avvia da solo all'import con il document globale: qui un document finto, senza scena né scia.
const fakeDoc=({scene=null,years=[],asked=[]}={})=>({hidden:false,body:{classList:{contains:()=>false}},fonts:{ready:new Promise(()=>{})},
 addEventListener(){},getElementById:()=>null,
 querySelector:s=>{asked.push(s);return s==='[data-scene]'?scene:null;},
 querySelectorAll:s=>s==='[data-year]'?years:[]});
globalThis.document=fakeDoc();
const {initLanding}=await import('../assets/studi/landing.js');
// La scena della penna (hero.js) arriva dopo lo scheletro: finché manca, landing.js non la avvia e il livello della scena resta com'è.
const SCENE=existsSync(new URL('../assets/studi/hero.js',import.meta.url));

// Se startHero lancia subito (per esempio manca matchMedia), la scena sparisce e il resto della pagina parte lo stesso.
// Senza scena: initLanding non tocca il livello della scena e fa partire anni, scia e scritta del footer.
test('initLanding: se startHero lancia (o la scena non c\'è ancora), la pagina continua',()=>{
 const saved=globalThis.matchMedia;globalThis.matchMedia=undefined;
 const scene={hidden:false,querySelector:()=>null,parentElement:null},year={textContent:''},asked=[];
 try{assert.doesNotThrow(()=>initLanding(fakeDoc({scene,years:[year],asked})));}finally{globalThis.matchMedia=saved;}
 assert.equal(scene.hidden,SCENE,SCENE?'la scena è nascosta':'la scena non avviata resta visibile');
 assert.equal(year.textContent,String(new Date().getFullYear()));
 assert.ok(asked.includes('[data-service-trail]')&&asked.includes('[data-footer-wordmark]'),'dopo la scena partono scia e scritta del footer');
});
