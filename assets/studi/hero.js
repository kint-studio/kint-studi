import {IdleCursor} from '../idle-cursor.js?v=36';
import {loadMaterial as loadSatinMaterial} from './material.js?v=s3-1';
import {PenScene,FORMATION_DONE_MS,layout,imageUrl} from './pen-scene.js?v=s4-1';
// Resolves on load, then waits for decode() for at most 500 ms: in a hidden tab decode() may never settle.
// Then, where the browser can, the image becomes an ImageBitmap that stays decoded: an <img> is decoded again on the main thread each time a canvas draws it at a new size (two decodes of 10 ms, unthrottled, while the scene starts).
export const decoded=src=>new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=reject;image.src=src;}).then(async image=>{await Promise.race([image.decode().catch(()=>{}),new Promise(r=>setTimeout(r,500))]);
 if(typeof createImageBitmap==='function')try{return await createImageBitmap(image);}catch{}return image;});
// The hero scene: the pen forms from binary digits, then the pointer opens a reveal with the gold seams underneath and the object turns towards the mouse. Starts at 35% visibility; draws nothing off screen or in a hidden tab (the loop stops itself, like frame() in the main site's app.js); 4 frames per second when still.
// On touch screens the pen never turns: the finger and the idle cursor only open the reveal. The satin silver material is computed in a worker. If anything fails, the scene layer is hidden and the hero keeps its text on the plain section background.
// Every browser dependency can be injected for the tests.
export function startHero(root,{matchMedia=q=>globalThis.matchMedia(q),IntersectionObserver=globalThis.IntersectionObserver,ResizeObserver=globalThis.ResizeObserver,document=globalThis.document,window=globalThis,loadImage=decoded,createCanvas=()=>document.createElement('canvas'),loadMaterial=loadSatinMaterial,Engine=PenScene,raf=cb=>globalThis.requestAnimationFrame(cb),now=()=>performance.now(),dpr}={}){
 const ratio=()=>dpr??globalThis.devicePixelRatio??1,canvas=root.querySelector('canvas'),cursor=root.querySelector('.kf-cursor'),section=root.parentElement;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,touch=matchMedia('(hover: none)').matches,idle=new IdleCursor(),cleanups=[],stopped=new AbortController();
 let alive=true,engine=null,visible=false,pageVisible=!document.hidden,running=false,last=0,activeUntil=0,lastDraw=-Infinity,size=null,sized;
 const listen=(target,type,fn,options)=>{target.addEventListener(type,fn,options);cleanups.push(()=>target.removeEventListener(type,fn,options));};
 // stop() also stops the material worker
 cleanups.push(()=>stopped.abort());
 // Still (formation over, no pointer, no gesture): no need for 60 fps, 4 frames per second keep the light of the background moving.
 const keepActive=(t=now())=>{activeUntil=Math.max(activeUntil,t+1800);};
 const frame=time=>{if(!alive||!visible||!pageVisible){running=false;idle.suspend();last=0;return;}raf(frame);
  const dt=last?Math.min((time-last)/1000,.05):0;last=time;engine.advance(dt);
  const auto=idle.step(dt,!reduced&&engine.done);
  if(auto){// the idle cursor travels over the object, not the whole section; it only opens the reveal and never turns the pen
   const r=engine.rect;engine.addPointer(r.x+(auto.x+1)/2*r.w,r.y+(1-auto.y)/2*r.h,time);
   cursor.style.opacity='0';keepActive(time);}
  if(!engine.done)keepActive(time);
  if(time>activeUntil&&time-lastDraw<250)return;
  lastDraw=time;engine.frame(time,0);};
 const resume=()=>{if(alive&&engine&&!running&&visible&&pageVisible){running=true;last=0;raf(frame);}};
 const fail=()=>{root.hidden=true;canvas.hidden=true;return null;};
 // The first canvas the page draws on costs 10-30 ms on a cold start (the browser sets up its canvas machinery on first use, not when the context is created). A throwaway canvas pays it now, in a task of its own while the image loads, so it does not add up with the construction of the scene into one long task. Nothing visible is drawn.
 setTimeout(()=>{if(alive)try{createCanvas().getContext('2d').setTransform(1,0,0,1,0,0);}catch{}},0);
 // The hero is never measured while the module runs (that would force a layout of the page inside the script): its size comes from the ResizeObserver, which reports it after the browser's own layout; the same observer resizes the scene later.
 const measured=new Promise(resolve=>{sized=resolve;});
 const ro=new ResizeObserver(entries=>{const {width,height}=entries[entries.length-1].contentRect;size={width,height};sized(size);
  if(engine&&(Math.abs(engine.w-width)>1||Math.abs(engine.h-height)>1)){engine.resize(width,height,ratio());keepActive();}});
 ro.observe(root);cleanups.push(()=>ro.disconnect());
 const ready=(async()=>{
  const box=await measured;if(!alive)return null;
  // The smallest images that are enough for the size the pen is drawn at: the silhouette first (it draws the digits and the object), the gold one afterwards, in the worker.
  const rectWidth=layout(box.width,box.height).w,media={touch,dpr:ratio()};
  const base=await loadImage(imageUrl('ceramic',rectWidth,media));
  // a new task for the scene: the end of the image decode and the construction of the scene do not add up to one long task
  await new Promise(r=>setTimeout(r,0));
  if(!alive)return null;
  engine=new Engine({canvas,createCanvas,base,width:size.width,height:size.height,dpr:ratio(),reduced,touch});
  // The material under the reveal is computed in a worker, so the page never blocks; the pen stays satin silver there too.
  loadMaterial(imageUrl('kintsugi',rectWidth,media),{workerUrl:new URL('./material-worker.js?v=s3-1',import.meta.url),load:loadImage,make:createCanvas,satin:true,signal:stopped.signal}).then(tech=>{if(alive&&tech)engine.setTech(tech);},()=>{});
  // Every real gesture stops the idle cursor.
  const cancelIdle=()=>{if(idle.activity()&&engine.flow){engine.flow.pointer=null;engine.flow.old=null;}};
  const pointer=e=>{if(!engine.done||e.target?.closest?.('a,button,input,textarea,summary'))return;keepActive();const r=root.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)return;
   // the pen turns towards the mouse; on touch screens it stays still and the finger only opens the reveal
   if(!reduced&&!touch)engine.setPointer(e.clientX-r.left,e.clientY-r.top);
   const t=now(),points=e.getCoalescedEvents?.()||[e];for(const p of points.length?points:[e])engine.addPointer(p.clientX-r.left,p.clientY-r.top,t);
   cursor.style.left=`${e.clientX-r.left}px`;cursor.style.top=`${e.clientY-r.top}px`;cursor.style.opacity=e.pointerType==='mouse'?'1':'0';};
  listen(window,'pointermove',cancelIdle,{capture:true,passive:true});listen(window,'pointerdown',cancelIdle,{capture:true,passive:true});listen(window,'pointermove',pointer,{capture:true,passive:true});
  if(section)listen(section,'pointerleave',()=>{cursor.style.opacity='0';engine.resetPointer();});
  const io=new IntersectionObserver(entries=>{const entry=entries[entries.length-1];visible=entry.isIntersecting;last=0;
   if(entry.intersectionRatio>=.35&&!engine.started){engine.start();if(reduced)engine.elapsed=FORMATION_DONE_MS;}resume();},{threshold:[0,.35]});io.observe(root);
  listen(document,'visibilitychange',()=>{pageVisible=!document.hidden;last=0;keepActive();resume();});
  cleanups.push(()=>io.disconnect());
  return engine;})().catch(fail);
 return {ready,get engine(){return engine;},stop(){alive=false;cleanups.forEach(c=>c());}};}
