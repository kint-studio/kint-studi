import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {layout,imageUrl,MAX_DPR,BOUNDS,DEPTH_STYLE} from '../assets/studi/pen-scene.js';
import {penImage} from '../assets/studi/scene-images.js';
import {linearRelief,makeDepth} from '../assets/studi/depth-surface.js';
// Valori calcolati a mano dalla funzione layout di KfScene.tsx (commit 7d54a63), con BOUNDS {top:.208,bottom:.792,left:.229,right:.792}:
// wf=.563, hf=.584, cx=.5105. Desktop (k=1.08): ih=min(900*.68*1.08/.584, 1440*.36*1.08/(.563*2/3))=min(1131.78082,1491.66607)=1131.78082,
// iw=ih*2/3=754.52055, x=720-iw*.5105=334.81726, y=810-ih*.792=-86.37041.
// Telefono (senza k): ih=min(min(812*.44,370)/.584, 375*.95/(.563*2/3))=min(611.78082,949.15631)=611.78082, iw=407.85388,
// x=187.5-iw*.5105=-20.70941, y=812-266-ih*.792=61.46959.
const near=(actual,expected)=>{for(const k of ['x','y','w','h'])assert.ok(Math.abs(actual[k]-expected[k])<1e-4,`${k}: ${actual[k]} invece di ${expected[k]}`);};
test('layout: 1440x900 come KfScene.tsx (k = 1.08)',()=>near(layout(1440,900),{x:334.81726,y:-86.37041,w:754.52055,h:1131.78082}));
test('layout: 375x812 come KfScene.tsx (telefono senza k)',()=>near(layout(375,812),{x:-20.70941,y:61.46959,w:407.85388,h:611.78082}));
test('parametri della penna come KfScene.tsx',()=>{
 assert.deepEqual(BOUNDS,{top:.208,bottom:.792,left:.229,right:.792});
 assert.deepEqual(DEPTH_STYLE,{kind:'lineare',gain:2,cap:.05});
 assert.equal(MAX_DPR,2);});
test('imageUrl: con il tocco mai l\'immagine da 2048 px',()=>{
 for(const width of [100,300,560,800,1024,1600,3000])for(const dpr of [1,2,3])for(const kind of ['ceramic','kintsugi']){
  const url=imageUrl(kind,width,{touch:true,dpr});
  assert.match(url,new RegExp(`stilografica-${kind}-(640|1024)\\.webp$`),`${kind} ${width}px a ${dpr}x: ${url}`);}});
// Con MAX_DPR 2 anche sul computer: 300 px a 2x chiedono 600 px (la 1024; con 1,5 sarebbe bastata la 640), 600 px a 2x o 3x chiedono 1200 px (la 2048).
test('imageUrl: sul computer la più piccola che basta, con il DPR limitato a 2',()=>{
 assert.equal(imageUrl('ceramic',300,{touch:false,dpr:1}),'/assets/studi/stilografica-ceramic-640.webp');
 assert.equal(imageUrl('kintsugi',754.5,{touch:false,dpr:1}),'/assets/studi/stilografica-kintsugi-1024.webp');
 assert.equal(imageUrl('ceramic',300,{touch:false,dpr:2}),'/assets/studi/stilografica-ceramic-1024.webp');
 assert.equal(imageUrl('kintsugi',600,{touch:false,dpr:2}),'/assets/studi/stilografica-kintsugi.webp');
 assert.equal(imageUrl('ceramic',600,{touch:false,dpr:3}),'/assets/studi/stilografica-ceramic.webp');
 assert.equal(imageUrl('ceramic',500,{touch:false,dpr:3}),'/assets/studi/stilografica-ceramic-1024.webp');});
test('penImage: le tre misure in assets/studi/',()=>{
 assert.equal(penImage('ceramic',''),'/assets/studi/stilografica-ceramic.webp');
 assert.equal(penImage('kintsugi','-640'),'/assets/studi/stilografica-kintsugi-640.webp');
 assert.equal(penImage('ceramic','-1024'),'/assets/studi/stilografica-ceramic-1024.webp');});
test('preload: solo la sagoma da 1024 px, sui dispositivi a tocco, ed è quella che il telefono chiede',()=>{
 for(const page of ['studi/index.html','en/studi/index.html','fr/studi/index.html','de/studi/index.html']){
  const html=readFileSync(new URL(`../${page}`,import.meta.url),'utf8');
  const images=[...html.matchAll(/<link rel="preload" as="image"[^>]*>/g)].map(m=>m[0]);
  assert.deepEqual(images,['<link rel="preload" as="image" href="/assets/studi/stilografica-ceramic-1024.webp" media="(hover: none)" fetchpriority="high">'],page);}
 for(const dpr of [2,3])assert.equal(imageUrl('ceramic',layout(375,812).w,{touch:true,dpr}),'/assets/studi/stilografica-ceramic-1024.webp');});

// Rilievo lineare come depth-surface.ts di 7d54a63: cresce di `gain` volte la distanza dal bordo, fino a `cap` larghezze dell'immagine; zero fuori.
// Una sagoma sintetica sottile: una barra orizzontale alta 30 px in un'immagine larga 200 (il tetto: .05*200 = 10 px di rilievo, raggiunto a 5 px dal bordo).
const bar=()=>{const W=200,H=50,data=new Uint8ClampedArray(W*H*4);for(let y=10;y<40;y++)for(let x=20;x<180;x++)data[(y*W+x)*4+3]=255;
 return {base:{width:W,height:H},make:()=>({width:0,height:0,getContext:()=>({drawImage(){},getImageData:()=>({data})})})};};
const CAP=Math.floor(.05*.7/.36*255);// il tetto nella texture: .05 larghezze → 24
test('linearRelief: zero fuori, cresce con la distanza dal bordo, si ferma al tetto',()=>{
 const {base,make}=bar(),{w,h,data:out}=linearRelief(base,make,{gain:2,cap:.05}),at=y=>out[y*w+100];
 assert.equal(w,200);assert.equal(h,50);assert.equal(out[0],0);assert.equal(at(5),0);assert.equal(out[25*w+10],0);
 for(let y=10;y<14;y++)assert.ok(at(y)<at(y+1),`riga ${y}: ${at(y)} non sale verso ${at(y+1)}`);
 for(let y=16;y<34;y++)assert.equal(at(y),CAP,`riga ${y}: ${at(y)} invece del tetto ${CAP}`);
 assert.ok(Math.max(...out)<=CAP,'nessun punto oltre il tetto');});
// Una cupola sulla stessa barra sarebbe alta quanto la metà del suo spessore: il rilievo lineare resta molto più basso, e la penna sottile non si piega.
test('linearRelief: sulla barra sottile il rilievo resta un decimo della larghezza della barra',()=>{
 const {base,make}=bar(),{data:out}=linearRelief(base,make,{gain:2,cap:.05});
 assert.ok(Math.max(...out)/255*.36/.7*200<=10+1e-9,'al massimo 10 px su 200');});
// Il rilievo non si calcola mentre la pagina si carica: sul telefono la penna non gira mai, quindi mai.
test('makeDepth lineare: niente lavoro finché non serve un\'inclinazione, e mai sul telefono',async()=>{
 const saved={matchMedia:globalThis.matchMedia,requestIdleCallback:globalThis.requestIdleCallback},idle=[];
 globalThis.matchMedia=()=>({matches:true});globalThis.requestIdleCallback=cb=>idle.push(cb);let made=0;
 try{const depth=makeDepth({width:64,height:96},()=>{made++;return {getContext:()=>null};},{kind:'lineare',gain:2,cap:.05});
  assert.equal(made,0);assert.equal(depth.gpu,undefined);assert.equal(typeof depth.prepare,'function');assert.equal(idle.length,0,'nessuna preparazione nei tempi morti');}
 finally{Object.assign(globalThis,saved);}});
// Al primo tilt il programma del principale si prepara e la sua texture di profondità viene sostituita da quella lineare.
test('makeDepth lineare: prepare() carica il rilievo lineare sopra la texture del principale',()=>{
 const saved=globalThis.matchMedia;globalThis.matchMedia=()=>({matches:true});
 const {base,make}=bar(),uploads=[];
 const gl=new Proxy({},{get:(t,k)=>k==='texImage2D'?(...a)=>uploads.push(a):k==='getShaderParameter'||k==='getProgramParameter'?()=>true:typeof k==='string'&&/^[A-Z_0-9]+$/.test(k)?k:()=>({})});
 const canvas=()=>{const c=make();const get=c.getContext;c.getContext=type=>type==='webgl2'?gl:get(type);return c;};
 try{const depth=makeDepth(base,canvas,{kind:'lineare',gain:2,cap:.05}),gpu=depth.prepare();
  assert.ok(gpu&&gpu.gl===gl);assert.equal(depth.prepare(),gpu,'preparato una volta sola');
  const last=uploads.at(-1);assert.equal(uploads.length,2,'texture del principale, poi quella lineare');
  assert.deepEqual(last[8],linearRelief(base,make,{gain:2,cap:.05}).data);}
 finally{globalThis.matchMedia=saved;}});
// Se il rilievo lineare non si può calcolare o caricare, prepare() non lancia: resta la texture a righe del principale e la console avvisa.
test('makeDepth lineare: un errore del rilievo lineare non esce da prepare() e lascia la texture del principale',()=>{
 const saved={matchMedia:globalThis.matchMedia,warn:console.warn};globalThis.matchMedia=()=>({matches:true});
 const warned=[];console.warn=(...a)=>warned.push(a);
 const {base,make}=bar();
 try{for(const fail of ['upload','relief']){let uploads=0;warned.length=0;
  const gl=new Proxy({},{get:(t,k)=>k==='texImage2D'?()=>{if(++uploads===2&&fail==='upload')throw new Error('upload');}:k==='getShaderParameter'||k==='getProgramParameter'?()=>true:typeof k==='string'&&/^[A-Z_0-9]+$/.test(k)?k:()=>({})});
  let reads=0;
  const canvas=()=>{const c=make();const get=c.getContext.bind(c);c.getContext=(type,o)=>{if(type==='webgl2')return gl;const x=get(type,o);if(fail==='relief'&&x&&++reads>1){x.getImageData=()=>{throw new Error('relief');};}return x;};return c;};
  const depth=makeDepth(base,canvas,{kind:'lineare',gain:2,cap:.05});let gpu;
  assert.doesNotThrow(()=>{gpu=depth.prepare();},fail);
  assert.ok(gpu&&gpu.gl===gl,`${fail}: resta il programma con la texture del principale`);assert.equal(depth.prepare(),gpu,`${fail}: preparato una volta sola`);
  assert.equal(warned.length,1,`${fail}: un avviso in console`);}}
 finally{globalThis.matchMedia=saved.matchMedia;console.warn=saved.warn;}});
