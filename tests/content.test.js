import {test} from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {existsSync,readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
// Testi della landing studi: nessun residuo delle landing da cui è stato portato il codice (ristoranti e palestre), titolo e numeri di src/lib/content.ts al commit 7d54a63.
const root=fileURLToPath(new URL('..',import.meta.url));
// La licenza di Geist è condivisa byte per byte con il sito principale e contiene «FITNESS FOR A PARTICULAR PURPOSE»: resta fuori.
const SKIP=/^(?:docs\/|tools\/perf\/|\.baseline\/|tests\/content\.test\.js$|assets\/geist-LICENSE\.txt$)/;
// Parole dei settori precedenti, cercate senza distinzione tra maiuscole e minuscole. Nessuna compare nei testi di studi a 7d54a63 (content.ts, i18n.ts, landing-i18n.ts, site.ts).
const BANNED=['forchetta','fork-3d','Ristorazione','ristorant','ristorator','per il tuo locale','manubrio','palestr','Retail, bellezza','fitness','dumbbell'];
// numeri e titolo di src/lib/content.ts al commit 7d54a63, scritti a mano
const SERVICES=4,FAQ=5;
const TITLE={before:'kint per il ',accent:'tuo studio'};
// titolo della pagina Machine: in italiano fisso (site.ts a 7d54a63), nelle altre lingue «Machine: <label>» di landing-i18n.ts
const MACHINE_TITLES={'ai/studi/index.html':'Machine view: studi — kint','en/ai/studi/index.html':'Machine: Professional firms — kint','fr/ai/studi/index.html':'Machine: Cabinets professionnels — kint','de/ai/studi/index.html':'Machine: Kanzleien und Beratungen — kint'};
const tracked=()=>execFileSync('git',['ls-files'],{cwd:root,encoding:'utf8'}).split('\n').filter(f=>f&&!SKIP.test(f)&&existsSync(root+f));
const page=()=>readFileSync(root+'studi/index.html','utf8');
const text=s=>s.replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
test('nessun file tracciato contiene parole delle landing ristoranti e palestre',()=>{
 const bad=[];
 for(const f of tracked()){const s=readFileSync(root+f);if(s.includes(0))continue;const t=s.toString('utf8').toLowerCase();for(const w of BANNED)if(t.includes(w.toLowerCase()))bad.push(`${f}: ${w}`);}
 assert.deepEqual(bad,[]);
});
test('studi/index.html: h1 uguale al titolo di content.ts',()=>{
 const h1=page().match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/);assert.ok(h1,'h1 mancante');
 assert.equal(text(h1[1]),`${TITLE.before}${TITLE.accent}.`);
});
test('studi/index.html: servizi e FAQ quanti in content.ts',()=>{
 const html=page(),group=id=>{const m=html.match(new RegExp(`<section id="${id}"[\\s\\S]*?</section>`));assert.ok(m,id);return (m[0].match(/\bdata-accordion-item\b/g)||[]).length;};
 assert.equal(group('servizi'),SERVICES);assert.equal(group('faq'),FAQ);
});
test('pagine Machine: titolo italiano «Machine view: studi», nelle altre lingue «Machine: <label>»',()=>{
 for(const [f,title] of Object.entries(MACHINE_TITLES)){assert.ok(existsSync(root+f),f);assert.equal(readFileSync(root+f,'utf8').match(/<title>([^<]*)<\/title>/)?.[1],title,f);}
});
