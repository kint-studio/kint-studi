import {test} from 'node:test';
import assert from 'node:assert/strict';
import {loadMaterial} from '../assets/studi/material.js';
// Il worker del materiale si ferma con stop() della scena (signal), oltre che dopo MATERIAL_TIMEOUT_MS come nel principale.
function withWorker(fn){const saved={Worker:globalThis.Worker,OffscreenCanvas:globalThis.OffscreenCanvas,createImageBitmap:globalThis.createImageBitmap,location:globalThis.location},workers=[];
 globalThis.Worker=class{constructor(url,o){this.url=url;this.o=o;this.terminated=false;workers.push(this);}postMessage(m){this.message=m;}terminate(){this.terminated=true;}};
 globalThis.OffscreenCanvas=class{};globalThis.createImageBitmap=()=>{};globalThis.location={href:'http://localhost/studi/'};
 return Promise.resolve(fn(workers)).finally(()=>Object.assign(globalThis,saved));}
test('loadMaterial: l\'argento satinato viene chiesto al worker',()=>withWorker(async workers=>{
 const p=loadMaterial('/assets/studi/stilografica-kintsugi-640.webp',{workerUrl:'w.js',load:()=>Promise.reject(),make:()=>({}),satin:true});
 assert.equal(workers.length,1);assert.deepEqual(workers[0].message,{url:'http://localhost/assets/studi/stilografica-kintsugi-640.webp',satin:true});
 workers[0].onmessage({data:{bitmap:'bitmap'}});assert.equal(await p,'bitmap');}));
test('loadMaterial: con il segnale interrotto il worker termina e la promessa rifiuta',()=>withWorker(async workers=>{
 const controller=new AbortController();
 const p=loadMaterial('/m.webp',{workerUrl:'w.js',load:()=>Promise.reject(new Error('no')),make:()=>({}),satin:true,signal:controller.signal});
 controller.abort();await assert.rejects(p);assert.equal(workers[0].terminated,true);}));
// Senza worker il materiale si calcola a fette nei tempi morti: dopo stop() (signal interrotto) nessuna fetta si calcola né si programma.
test('loadMaterial senza worker: con il segnale interrotto le fette si fermano',async()=>{
 const saved={Worker:globalThis.Worker,requestIdleCallback:globalThis.requestIdleCallback},queued=[];let made=0;
 globalThis.Worker=undefined;globalThis.requestIdleCallback=fn=>{queued.push(fn);};
 try{const controller=new AbortController();
  const p=loadMaterial('/m.webp',{workerUrl:'w.js',load:async()=>({width:4,height:4}),make:()=>{made++;return {};},signal:controller.signal});
  p.catch(()=>{});
  for(let i=0;i<5&&!queued.length;i++)await new Promise(r=>setTimeout(r,0));
  assert.equal(queued.length,1,'la prima fetta è programmata');
  controller.abort();queued[0]({timeRemaining:()=>10});
  await assert.rejects(p);assert.equal(made,0,'nessuna fetta calcolata dopo stop()');assert.equal(queued.length,1,'nessuna fetta programmata dopo stop()');
 }finally{Object.assign(globalThis,saved);}
});
