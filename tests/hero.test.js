import {test} from 'node:test';
import assert from 'node:assert/strict';
import {startHero} from '../assets/studi/hero.js';
import {PenScene,FORMATION_DONE_MS} from '../assets/studi/pen-scene.js';
// Adattato dalla landing gemella (commit a00ff51): senza oggetto 3D su GPU, con la penna che gira solo verso il mouse.
// Un finto contesto 2D: ogni metodo non fa nulla, le letture di pixel restituiscono pixel vuoti.
const pixels=(...a)=>({data:new Uint8ClampedArray(Math.max(1,(a.at(-2)|0)*(a.at(-1)|0))*4)});
function context(){const own={getImageData:pixels,createImageData:pixels,getTransform:()=>({a:1}),measureText:()=>({width:5})};
 return new Proxy(own,{get:(t,k)=>k in t?t[k]:()=>({addColorStop(){}}),set:(t,k,v)=>{t[k]=v;return true;}});}
const canvas=()=>{const ctx=context();return {width:300,height:150,hidden:false,style:{},getContext:type=>type==='2d'?ctx:null};};
const events=()=>{const map=new Map();return {map,addEventListener:(t,f)=>map.set(t,[...(map.get(t)||[]),f]),removeEventListener:(t,f)=>map.set(t,(map.get(t)||[]).filter(g=>g!==f)),emit:(t,e)=>(map.get(t)||[]).forEach(f=>f(e)),count:()=>[...map.values()].reduce((n,l)=>n+l.length,0)};};
const flush=()=>new Promise(r=>setTimeout(r,0));
function setup({reduced=false,touch=false,hidden=false,dpr=1,loadImage,make,size={width:1440,height:900}}={}){
 const view=canvas(),ring={style:{}},section=events();
 const root={...events(),parentElement:section,querySelector:s=>s==='canvas'?view:s==='.kf-cursor'?ring:null,
  getBoundingClientRect:()=>{measures.n++;return {left:0,top:0,right:size.width,bottom:size.height,width:size.width,height:size.height};}};
 const measures={n:0},doc={...events(),hidden},win=events(),observers={io:[],ro:[]};
 let observer;const IO=class{constructor(cb){this.cb=cb;this.on=true;observer=this;observers.io.push(this);}observe(){}disconnect(){this.on=false;}};
 // Il ResizeObserver vero riferisce la prima misura dopo il layout del browser: qui in un microtask.
 const RO=class{constructor(cb){this.cb=cb;this.on=true;observers.ro.push(this);}observe(el){queueMicrotask(()=>{if(this.on)this.cb([{target:el,contentRect:{width:size.width,height:size.height}}]);});}disconnect(){this.on=false;}};
 let queue=[],clock=0;const raf=cb=>{queue.push(cb);};
 // un secondo simulato: 60 fotogrammi da 16,7 ms
 const run=(frames=60)=>{for(let i=0;i<frames;i++){clock+=1000/60;const q=queue;queue=[];q.forEach(cb=>cb(clock));}};
 const frames={n:0},engines=[],calls={setPointer:0,addPointer:0};
 const Engine=class extends PenScene{constructor(o){super(o);engines.push(this);}frame(...a){frames.n++;return super.frame(...a);}
  setPointer(...a){calls.setPointer++;return super.setPointer(...a);}addPointer(...a){calls.addPointer++;return super.addPointer(...a);}};
 const material=[],images=[];
 const hero=startHero(root,{
  matchMedia:q=>({matches:(q.includes('reduce')&&reduced)||(q.includes('hover: none')&&touch)}),
  IntersectionObserver:IO,ResizeObserver:RO,document:doc,window:win,dpr,raf,now:()=>clock,Engine,
  loadImage:loadImage||(async url=>{images.push(url);return {width:1024,height:1536};}),createCanvas:make||canvas,
  loadMaterial:(url,o)=>{material.push({url,o});return Promise.resolve({width:1024,height:1536});}});
 const intersect=ratio=>observer.cb([{isIntersecting:ratio>0,intersectionRatio:ratio}]);
 return {hero,root,view,ring,doc,win,section,run,frames,engines,material,images,calls,observers,measures,intersect,get queued(){return queue.length;}};}
const mouse=(x,y,pointerType='mouse')=>({clientX:x,clientY:y,pointerType,target:{}});

test('(a) hero fuori schermo: nessun engine.frame in 1 s',async()=>{
 const s=setup();await s.hero.ready;s.intersect(0);s.run();
 assert.equal(s.engines.length,1);assert.equal(s.frames.n,0);assert.equal(s.queued,0,'nessun rAF in coda');});
test('(b) scheda nascosta: nessun engine.frame in 1 s',async()=>{
 const s=setup({hidden:true});await s.hero.ready;s.intersect(1);s.run();
 assert.equal(s.frames.n,0);assert.equal(s.queued,0);
 // tornando visibile la scena riparte, e si ferma di nuovo uscendo dallo schermo
 s.doc.hidden=false;s.doc.emit('visibilitychange');s.run();assert.ok(s.frames.n>0);
 s.intersect(0);const n=s.frames.n;s.run();assert.equal(s.frames.n,n);});
test('(c) riduci movimento: formazione completa all\'avvio e niente rotazione',async()=>{
 const s=setup({reduced:true});const engine=await s.hero.ready;s.intersect(.5);
 assert.equal(engine.started,true);assert.equal(engine.elapsed,FORMATION_DONE_MS);
 s.run(2);assert.equal(engine.done,true);
 s.win.emit('pointermove',mouse(1400,100));s.run(5);assert.equal(s.calls.setPointer,0);assert.deepEqual(engine.targetPose,{yaw:0,pitch:0});});
test('(c2) senza riduci movimento la formazione dura FORMATION_DONE_MS',async()=>{
 const s=setup();const engine=await s.hero.ready;s.intersect(.2);assert.equal(engine.started,false,'sotto il 35% non parte');
 s.intersect(.5);assert.equal(engine.elapsed,0);s.run(60);assert.equal(engine.done,false);s.run(120);assert.equal(engine.done,true);});
test('desktop: carica la sagoma e il materiale nella misura che basta, e la penna gira verso il mouse',async()=>{
 // 1440x900 a dpr 1: rettangolo largo 754,5 px (vedi pen-scene.test.js), quindi le immagini da 1024
 const s=setup();const engine=await s.hero.ready;
 assert.deepEqual(s.images,['/assets/studi/stilografica-ceramic-1024.webp']);
 assert.equal(s.material.length,1);assert.equal(s.material[0].url,'/assets/studi/stilografica-kintsugi-1024.webp');
 assert.equal(s.material[0].o.satin,true,'argento satinato sotto il varco');assert.equal(engine.maxDpr,2,'risoluzione massima 2 anche sul computer');
 assert.match(String(s.material[0].o.workerUrl),/\/assets\/studi\/material-worker\.js\?v=[\w.-]+$/);
 await flush();assert.ok(engine.tech,'il materiale arriva alla scena');
 s.intersect(1);s.run(200);assert.equal(engine.done,true);
 s.win.emit('pointermove',mouse(1400,100));s.run(30);
 assert.ok(engine.pose.yaw>.1&&engine.pose.pitch<-.05,`posa ${JSON.stringify(engine.pose)}`);
 assert.ok(s.calls.addPointer>0);assert.equal(s.ring.style.opacity,'1');assert.equal(s.view.hidden,false);});
test('l\'hero non si misura mentre il modulo si valuta',()=>{
 const s=setup();assert.equal(s.measures.n,0,'nessun getBoundingClientRect sincrono');});
test('(d) telefono: il dito apre il varco ma non gira la penna, e il cursore automatico apre solo il varco',async()=>{
 const s=setup({touch:true,dpr:3});const engine=await s.hero.ready;assert.equal(engine.dpr,2,'risoluzione massima 2 sul telefono');
 assert.deepEqual(s.images,['/assets/studi/stilografica-ceramic-1024.webp']);
 s.intersect(1);s.run(200);assert.equal(engine.done,true);
 const before=s.calls.addPointer;s.win.emit('pointermove',mouse(700,400,'touch'));
 assert.equal(s.calls.setPointer,0,'niente setPointer su touch');assert.ok(s.calls.addPointer>before,'il varco si apre');
 assert.equal(s.ring.style.opacity,'0');
 // dopo l'attesa il cursore automatico percorre l'oggetto: varco sì, rotazione no
 const idle=s.calls.addPointer;s.run(400);
 assert.ok(s.calls.addPointer>idle);assert.equal(s.calls.setPointer,0);
 assert.deepEqual(engine.targetPose,{yaw:0,pitch:0});assert.deepEqual(engine.pose,{yaw:0,pitch:0});});
test('(e) immagine che non si carica: startHero non lancia e la scena sparisce',async()=>{
 let s;assert.doesNotThrow(()=>{s=setup({loadImage:()=>Promise.reject(new Error('404'))});});
 assert.equal(await s.hero.ready,null);assert.equal(s.engines.length,0);assert.equal(s.view.hidden,true);assert.equal(s.root.hidden,true,'resta solo il fondo della sezione');
 s.run();assert.equal(s.frames.n,0);});
test('(f) stop(): ferma la scena e ripulisce listener, observer e worker',async()=>{
 const s=setup();await s.hero.ready;s.intersect(1);s.run(5);
 assert.ok(s.win.count()>0&&s.doc.count()>0&&s.section.count()>0);
 const signal=s.material[0].o.signal;assert.equal(signal.aborted,false);
 s.hero.stop();const n=s.frames.n;s.run();assert.equal(s.frames.n,n);
 assert.equal(s.win.count(),0,'listener su window');assert.equal(s.doc.count(),0,'listener su document');assert.equal(s.section.count(),0,'listener sulla sezione');
 assert.ok(s.observers.io.every(o=>!o.on)&&s.observers.ro.every(o=>!o.on),'observer scollegati');
 assert.equal(signal.aborted,true,'il worker del materiale si ferma');});
test('stop() prima che arrivino le immagini: nessuna scena',async()=>{
 let release;const s=setup({loadImage:()=>new Promise(r=>{release=r;})});await flush();s.hero.stop();release({width:1024,height:1536});
 assert.equal(await s.hero.ready,null);assert.equal(s.engines.length,0);assert.equal(s.material.length,0);});

// La prima tela su cui la pagina disegna costa 10-30 ms a freddo: la paga una tela usa e getta in un task a parte, mentre l'immagine arriva, non la costruzione della scena.
test('una tela usa e getta prepara il disegno in un task a parte, senza toccare la tela visibile',async()=>{
 const made=[];const make=()=>{const c=canvas(),get=c.getContext;c.used=0;c.getContext=t=>{const x=get(t),st=x.setTransform;x.setTransform=(...a)=>{c.used++;return st?st.apply(x,a):undefined;};return x;};made.push(c);return c;};
 const s=setup({loadImage:()=>new Promise(()=>{}),make});
 assert.equal(made.length,0,'niente durante la valutazione del modulo');
 await flush();
 assert.equal(made.length,1);assert.equal(made[0].used,1);
 assert.equal(s.view.width,300,'la tela visibile resta vuota');assert.equal(s.engines.length,0);
 const t=setup({loadImage:()=>new Promise(()=>{}),make});t.hero.stop();await flush();assert.equal(made.length,1,'dopo stop() non si prepara nulla');
});

// Il caricamento predefinito non si blocca se decode() non si risolve mai (scheda in background).
test('decoded: l\'immagine arriva anche se decode() non si risolve mai',async()=>{
 const {decoded}=await import('../assets/studi/hero.js');
 const saved=globalThis.Image;
 globalThis.Image=class{decode(){return new Promise(()=>{});}set src(v){this._src=v;setTimeout(()=>this.onload(),0);}};
 try{const image=await decoded('/x.webp');assert.equal(image._src,'/x.webp');}finally{globalThis.Image=saved;}
});
test('decoded: un errore di caricamento rifiuta',async()=>{
 const {decoded}=await import('../assets/studi/hero.js');
 const saved=globalThis.Image;
 globalThis.Image=class{decode(){return Promise.resolve();}set src(v){setTimeout(()=>this.onerror(new Error('404')),0);}};
 try{await assert.rejects(decoded('/x.webp'));}finally{globalThis.Image=saved;}
});
// Dove il browser può, l'immagine diventa un ImageBitmap già decodificato; se createImageBitmap fallisce resta l'<img>.
const withImageBitmap=async(create,fn)=>{const saved={Image:globalThis.Image,createImageBitmap:globalThis.createImageBitmap};
 globalThis.Image=class{decode(){return Promise.resolve();}set src(v){this._src=v;setTimeout(()=>this.onload(),0);}};globalThis.createImageBitmap=create;
 try{await fn();}finally{Object.assign(globalThis,saved);}};
test('decoded: con createImageBitmap restituisce il bitmap',()=>withImageBitmap(async image=>({bitmap:true,from:image}),async()=>{
 const {decoded}=await import('../assets/studi/hero.js');const out=await decoded('/x.webp');
 assert.equal(out.bitmap,true);assert.equal(out.from._src,'/x.webp');}));
test('decoded: se createImageBitmap rifiuta restituisce l\'<img>',()=>withImageBitmap(()=>Promise.reject(new Error('no')),async()=>{
 const {decoded}=await import('../assets/studi/hero.js');const out=await decoded('/x.webp');
 assert.equal(out._src,'/x.webp');assert.equal(out.bitmap,undefined);}));
