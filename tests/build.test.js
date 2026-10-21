import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync,mkdtempSync,rmSync,readdirSync} from 'node:fs';
import {join,relative,sep} from 'node:path';
import {tmpdir} from 'node:os';
import {execFileSync} from 'node:child_process';
import {buildSite,assetsToPublish,linkWorkers,root} from '../tools/build.mjs';
import {inlineScriptHashes} from '../tools/export.mjs';
// Test sul risultato della build (tools/build.mjs), come tests/build.test.js del sito principale: ogni test costruisce in una cartella temporanea.
const HUMAN=['studi/index.html','en/studi/index.html','fr/studi/index.html','de/studi/index.html'];
const MACHINE=['ai/studi/index.html','en/ai/studi/index.html','fr/ai/studi/index.html','de/ai/studi/index.html'];
const walk=d=>readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(d,e.name)):[join(d,e.name)]);
const withBuild=async(fn,opts)=>{const out=mkdtempSync(join(tmpdir(),'kint-studi-build-'));try{const r=await buildSite(out,opts);await fn(out,r);}finally{rmSync(out,{recursive:true,force:true});}};
const read=(out,f)=>readFileSync(join(out,f),'utf8');
test('build: gli 8 indirizzi, la radice, 404, _headers e _redirects esistono',()=>withBuild(out=>{
 for(const f of [...HUMAN,...MACHINE,'index.html','404.html','_headers','_redirects','robots.txt','sitemap.xml','favicon.ico','apple-touch-icon.png','assets/og-kint.jpg'])assert.ok(existsSync(join(out,f)),f);
}));
test('build: ogni pagina Human carica un solo CSS e un solo JS con hash di 10 caratteri, senza modulepreload',()=>withBuild((out,r)=>{
 assert.match(r.css,/^assets\/studi\/landing\.[0-9a-f]{10}\.css$/);assert.match(r.js,/^assets\/studi\/landing\.[0-9a-f]{10}\.js$/);
 for(const f of HUMAN){const h=read(out,f);
  assert.deepEqual([...h.matchAll(/<link rel="stylesheet" href="([^"]+)">/g)].map(m=>m[1]),['/'+r.css],f);
  assert.deepEqual([...h.matchAll(/<script type="module" src="([^"]+)">/g)].map(m=>m[1]),['/'+r.js],f);
  assert.ok(!h.includes('modulepreload'),f);}
 for(const f of [r.css,r.js])assert.ok(existsSync(join(out,f)),f);
 assert.doesNotMatch(read(out,r.js),/from"\.\/[\w-]+\.js/,'import non risolti nel bundle');
}));
test('build: le pagine Machine e gli asset condivisi sono copiati invariati',()=>withBuild(out=>{
 for(const f of MACHINE)assert.deepEqual(readFileSync(join(out,f)),readFileSync(join(root,f)),f);
 for(const f of ['assets/machine.css','assets/mode-switch.js','assets/mode-switch.css','assets/geist-sub.woff2'])assert.deepEqual(readFileSync(join(out,f)),readFileSync(join(root,f)),f);
 const assets=readdirSync(join(out,'assets/studi'));
 for(const f of ['landing.js','hero.js','material.js','material-worker.js'])assert.ok(!assets.includes(f),`${f} è già nel bundle`);
 assert.ok(assets.some(f=>f.endsWith('.webp')));
 const list=assetsToPublish(root);assert.ok(list.includes('assets/mode-switch.js')&&!list.includes('assets/studi/landing.js'));
}));
test('build: ogni immagine della penna, anche quella con percorso a template, è nel dist',()=>withBuild((out,r)=>{
 const bundle=read(out,r.js);assert.match(bundle,/\/assets\/studi\/stilografica-\$\{/,'percorso a template delle immagini nel bundle');
 for(const f of readdirSync(join(root,'assets/studi')).filter(f=>f.endsWith('.webp')))assert.ok(existsSync(join(out,'assets/studi',f)),f);
 for(const m of bundle.matchAll(/\/assets\/[\w./-]+\.(?:webp|woff2|jpg)/g))assert.ok(existsSync(join(out,m[0])),m[0]);
}));
// Nel dist finiscono solo le immagini della penna che la pagina può chiedere: imageUrl su tutte le finestre e risoluzioni plausibili, più il preload.
test('build: nel dist solo le immagini stilografica-* referenziate',async()=>{
 const {layout,imageUrl}=await import('../assets/studi/pen-scene.js');
 const used=new Set();
 for(let w=320;w<=3840;w+=40)for(let h=480;h<=2160;h+=40)for(const touch of [false,true])for(const dpr of [1,1.25,1.5,2,2.625,3])for(const kind of ['ceramic','kintsugi'])used.add(imageUrl(kind,layout(w,h).w,{touch,dpr}).replace(/^\//,''));
 for(const m of readFileSync(join(root,'studi/index.html'),'utf8').matchAll(/href="\/(assets\/studi\/stilografica-[^"]+)"/g))used.add(m[1]);
 await withBuild(out=>{
  const published=readdirSync(join(out,'assets/studi')).filter(f=>f.startsWith('stilografica-')).map(f=>'assets/studi/'+f).sort();
  assert.deepEqual(published,[...used].sort(),'immagini stilografica-* nel dist = quelle referenziate');
 });
});
test('build: il worker del materiale è un bundle a parte con hash e il bundle lo richiama per nome',()=>withBuild((out,r)=>{
 const bundle=read(out,r.js);
 for(const name of ['material-worker']){const m=bundle.match(new RegExp('new URL\\("\\./('+name+'\\.[0-9a-f]{10}\\.js)"'));
  assert.ok(m,`URL del worker ${name} con hash nel bundle`);assert.ok(existsSync(join(out,'assets/studi',m[1])),m[1]);
  assert.doesNotMatch(read(out,'assets/studi/'+m[1]),/import[^(]/,`${m[1]}: nessun import da risolvere`);
  assert.ok(!existsSync(join(out,`assets/studi/${name}.js`)));assert.doesNotMatch(bundle,new RegExp(name+'\\.js'));}
}));
// Un worker si salta solo se il bundle non lo richiama; se lo richiama e il file non c'è, la build fallisce.
test('build: linkWorkers collega i worker richiamati, salta gli altri e fallisce se un file manca',async()=>{
 const bundle=async f=>`worker(${f.split(/[\\/]/).pop()})`;
 const none=await linkWorkers('console.log(1)',{names:['material-worker'],dir:'x',exists:()=>true,bundle});
 assert.equal(none.js,'console.log(1)');assert.deepEqual(none.files,[]);
 const js='new URL("./material-worker.js?v=s3-1",import.meta.url)';
 const one=await linkWorkers(js,{names:['material-worker'],dir:'x',exists:()=>true,bundle});
 assert.equal(one.files.length,1);assert.match(one.files[0].name,/^material-worker\.[0-9a-f]{10}\.js$/);assert.equal(one.files[0].code,'worker(material-worker.js)');
 assert.equal(one.js,`new URL("./${one.files[0].name}",import.meta.url)`);
 await assert.rejects(linkWorkers(js,{names:['material-worker'],dir:'x',exists:()=>false,bundle}),/material-worker/);
});
test('build: ogni hash della CSP di _headers corrisponde a uno script inline del dist e viceversa',()=>withBuild(out=>{
 const hdr=read(out,'_headers').split(/\r?\n/),i=hdr.findIndex(l=>l==='/*');assert.ok(i>=0,'regola /* mancante');
 const csp=hdr.slice(i+1).find(l=>/^\s*Content-Security-Policy:/.test(l));assert.ok(csp,'CSP mancante');
 const inCsp=[...csp.matchAll(/'(sha256-[^']+)'/g)].map(m=>m[1]).sort();
 const inDist=[...new Set(walk(out).filter(f=>f.endsWith('.html')).flatMap(f=>inlineScriptHashes(readFileSync(f,'utf8'))))].map(h=>h.slice(1,-1)).sort();
 assert.deepEqual(inCsp,inDist);assert.match(csp,/worker-src 'self'/);assert.doesNotMatch(csp,/script-src[^;]*unsafe-inline/);
 assert.match(read(out,'_headers'),/\/assets\/\*\.js\r?\n\s+Cache-Control: public, max-age=31536000, immutable/,'regole di cache a mano mantenute');
}));
test('build: nessun file del dist contiene node_modules, tools/ o .ts',()=>withBuild(out=>{
 for(const f of walk(out)){const p=relative(out,f).split(sep).join('/');
  assert.ok(!/node_modules|(^|\/)tools\/|\.ts$/.test(p),p);
  if(/\.(?:html|js|css|json|txt|xml)$/.test(p))assert.doesNotMatch(readFileSync(f,'utf8'),/node_modules|\btools\/|\.ts\b/,p);}
 for(const f of ['README.md','AGENTS.md','CLAUDE.md','docs','tests','i18n'])assert.ok(!existsSync(join(out,f)),f);
}));
test('build: INDEX=1 rende indicizzabili le pagine Human e robots.txt solo nel dist; le sorgenti non cambiano',()=>{
 const tracked=['studi/index.html','en/studi/index.html','robots.txt','_headers','sitemap.xml'],before=tracked.map(f=>readFileSync(join(root,f),'utf8'));
 return withBuild(out=>{
  for(const f of HUMAN)assert.doesNotMatch(read(out,f),/noindex/,f);
  for(const f of MACHINE)assert.match(read(out,f),/<meta name="robots" content="noindex/,f);
  const robots=read(out,'robots.txt');assert.match(robots,/Allow: \//);assert.doesNotMatch(robots,/Disallow/);assert.match(robots,/Sitemap: https:\/\/[^\s]+\/sitemap\.xml/);
  assert.deepEqual(tracked.map(f=>readFileSync(join(root,f),'utf8')),before,'sorgenti cambiate');
  execFileSync(process.execPath,[join(root,'tools/export.mjs'),'--check'],{env:{...process.env,INDEX:'1'}});
 },{index:true});
});
test('build: senza INDEX le pagine Human restano noindex e robots.txt vieta tutto',()=>withBuild(out=>{
 for(const f of HUMAN)assert.match(read(out,f),/<meta name="robots" content="noindex, nofollow">/,f);
 assert.match(read(out,'robots.txt'),/Disallow: \//);
},{index:false}));
