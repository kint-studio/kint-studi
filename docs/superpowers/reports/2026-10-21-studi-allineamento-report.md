# Report: allineamento della landing studi al metodo del sito principale

Data: 2026-10-21. Branch `allineamento`. La landing era in Next.js (commit `7d54a63`). Ora è fatta di HTML, CSS e JavaScript statici, senza dipendenze di runtime, con la build in `dist/` e gli header del sito principale. Il lavoro riprende quello della landing palestre (`kint-palestre`, `a00ff51`), con la penna stilografica al posto del manubrio.

## Esito in breve

- **Parità visiva.** Negli screenshot a 1440x900 e 375x812, in italiano e in inglese, non ci sono differenze visibili: hero, servizi, FAQ, contatto, footer e menu. Restano solo le differenze già decise, elencate sotto. La scena della penna coincide con Next: formazione, rilievo lineare, rotazione verso il mouse, varco con l'oro, telefono, riduci movimento, immagini mancanti.
- **Scroll.** Lo scroll continuo di 10 s su desktop dà 0 long task in entrambe le prove: soglia rispettata.
- **TBT.** La soglia è rispettata, ma **senza margine su mobile**. Nel run di riferimento la landing fa 9 ms di mediana (le tre misure: 9/4/9) e il principale 9 (8/9/11): sono pari. Due misure della landing su tre sono uguali alla mediana del principale, nessuna la supera. Una seconda serie di sole misure mobile, nella stessa sessione, dà 8 (8/2/11) contro 9 (10/9/9): anche lì una misura della landing (11) supera la mediana del principale. Su desktop 0 contro 0. Next: 498 su mobile, 50 su desktop.
- **Punteggio e LCP.** Il punteggio Lighthouse mobile è 99 (Next 83, principale 92). L'LCP mobile è 1,95 s (Next 2,78 s, principale 3,08 s).
- **Nessuna ottimizzazione in questo task.** La mediana del TBT non supera quella del principale, quindi non serviva intervenire. Le correzioni della palestre (riscaldamento della tela 2D in un task a parte, rilievo preparato solo al primo tilt) sono già dentro dal Task 3.

## Numeri

Le misure usano Lighthouse 12 sul Chrome locale (`--headless=new`), con il throttling simulato dei preset, solo la categoria performance. Le tre pagine sono misurate a turno nello stesso run: per ogni prova landing, Next e principale, mobile e desktop, poi la prova successiva.
- «Landing» è la landing statica (`/studi/`, dist, porta 3103).
- «Principale» è la home di `KINT-codice-completo` (dist, porta 8091).
- «Next» è la build di produzione del commit `7d54a63` (porta 3113).

### Singole prove e mediane

| Pagina | Profilo | Prova | Perf | TBT ms | LCP ms | FCP ms | CLS |
|---|---|---|---|---|---|---|---|
| Landing | mobile | 1 / 2 / 3 | 99 / 99 / 99 | 9 / 4 / 9 | 1952 / 1952 / 1952 | 1416 / 1412 / 1416 | 0 |
| **Landing** | **mobile** | **mediana** | **99** | **9** | **1952** | **1416** | **0** |
| Principale | mobile | 1 / 2 / 3 | 92 / 92 / 92 | 8 / 9 / 11 | 3078 / 3077 / 3078 | 2103 / 2102 / 2103 | 0 |
| **Principale** | **mobile** | **mediana** | **92** | **9** | **3078** | **2103** | **0** |
| Next | mobile | 1 / 2 / 3 | 83 / 83 / 83 | 501 / 498 / 491 | 2781 / 2779 / 2781 | 755 / 753 / 754 | 0 |
| **Next** | **mobile** | **mediana** | **83** | **498** | **2781** | **754** | **0** |
| Landing | desktop | 1 / 2 / 3 | 100 / 100 / 100 | 0 / 0 / 0 | 402 / 402 / 402 | 343 / 342 / 342 | 0 |
| **Landing** | **desktop** | **mediana** | **100** | **0** | **402** | **342** | **0** |
| Principale | desktop | 1 / 2 / 3 | 100 / 100 / 100 | 0 / 0 / 0 | 639 / 637 / 638 | 476 / 472 / 473 | 0 |
| **Principale** | **desktop** | **mediana** | **100** | **0** | **638** | **473** | **0** |
| Next | desktop | 1 / 2 / 3 | 99 / 100 / 100 | 87 / 48 / 50 | 588 / 587 / 587 | 204 / 205 / 204 | 0 |
| **Next** | **desktop** | **mediana** | **100** | **50** | **587** | **204** | **0** |

Seconda serie, solo mobile, landing e principale a turno, subito dopo:

| Pagina | TBT ms (3 prove) | Mediana | LCP ms | Perf |
|---|---|---|---|---|
| Landing | 8 / 2 / 11 | 8 | 1952 | 99 |
| Principale | 10 / 9 / 9 | 9 | 3078 | 92 |

Il riferimento del Task 1 (`.baseline/numbers.md`) dava per Next 83 / 2784 / 508 su mobile e per il principale 92 / 3078 / 9. Le misure di oggi sono coerenti; il TBT desktop di Next varia molto (87 nella prima prova, 48-50 nelle altre).

### Da dove viene il TBT mobile

Nelle tre prove della landing Lighthouse vede due long task, come nella palestre:
- uno a 0,75 s da 289-298 ms simulati: è il riscaldamento della tela 2D insieme al primo layout. Cade prima del First Contentful Paint, quindi non entra nel TBT;
- uno a 1,8 s da 54-59 ms simulati: è il residuo già visto nella palestre (53-67 ms), senza lavoro individuabile. Contribuisce 4-9 ms al TBT.

Il principale ha un task di `mode-switch.js` a 1,35 s (53-88 ms) e due o tre task tra 3,3 e 3,5 s. Il pareggio è quindi un confronto fra pochi millisecondi in entrambe le pagine: basta la variabilità di una misura per spostarlo.

### Scroll

Scroll continuo di 10 s a 1440x900 (`tools/perf/scroll-profile.mjs`), due prove per pagina:

| Pagina | long task | max ms | scripting ms | frame | frame persi % |
|---|---|---|---|---|---|
| **Landing** | **0 / 0** | 0 | 83 / 86 | 1439 / 1440 | 0 |
| Next | 0 / 0 | 0 | 139 / 137 | 1440 | 0 |
| Principale | 0 / 1 | 70 | 1298 / 1301 | 1271 / 1278 | 1,50 / 1,49 |

## Verifiche

- **Screenshot affiancati** Next contro landing (`/` contro `/studi/`, `/en` contro `/en/studi/`), a 1440x900 e 375x812, con sei sezioni ciascuno (`tools/perf/shots.mjs`). I pixel diversi (soglia 40/255) vanno dallo 0,00% allo 0,04% a 1440 e fino allo 0,17% a 375. Sono tutti nella pillola Human/Machine e, nel footer, nella freccia «↗» dei link (differenze note, sotto). Ritagliata e confrontata a occhio, la sezione servizi è uguale.
- **`prefers-reduced-motion: reduce`** (1440x900, WebGL via SwiftShader). La penna è subito formata e non ruota col mouse, come in Next: differenza media fra Next e landing 0,011 su 255, fra prima e dopo il mouse 0,006 in entrambe. Console pulita.
- **Telefono (tocco emulato, 375x812, DPR 2).** La penna resta ferma, come in Next: differenza media fra Next e landing 0,063 su 255, prima e dopo il dito. Le immagini richieste sono le stesse, `stilografica-ceramic-1024.webp` e `stilografica-kintsugi-1024.webp`; Next le chiede tre volte, la landing due. Console pulita.
- **Immagini nel `dist`.** Un test controlla che nel `dist` finiscano solo le `stilografica-*` che la pagina può chiedere (`imageUrl` su finestre da 320 a 3840 px, DPR da 1 a 3, tocco e mouse, più il preload). Oggi lo sono tutte e sei. Con un file in più (`stilografica-ceramic-320.webp`, provato e tolto) il test fallisce.
- **Rilievo lineare robusto** (commit `90b9f86`). Se il rilievo lineare non si riesce a calcolare o a caricare nella texture, `prepare()` lo segnala in console e tiene la texture a righe del principale: l'errore non arriva a `drawDepth`. Il test copre i due casi. `?v=` portato a `s4-1` per `depth-surface.js` e per i moduli che lo importano.
- **Test.** `npm test` passa 111 test e non ne fallisce nessuno.

## Differenze visive note (già decise)

- Il selettore Human/Machine usa Geist Mono al posto di JetBrains Mono.
- Scroll nativo al posto di Lenis.
- I link interni a una sezione sono ancore native e aggiungono voci alla cronologia del browser.
- La freccia «↗» dei link LinkedIn e Instagram viene dal subset `geist-mono-sub.woff2` condiviso col principale. È circa 1 px più stretta. Il font condiviso deve restare identico a quello del principale.
- I campi del modulo hanno il bordo di focus più visibile (riga da 2 px in inchiostro, etichetta scurita), come nella palestre.
- La formazione della penna parte circa 0,7 s prima che in Next, perché non c'è l'idratazione. Durata e tempi sono gli stessi.

## File condivisi e varianti

I file in `assets/` fuori da `assets/studi/` sono identici al principale (`tests/shared-assets.test.js`). Nel checkout di `KINT-codice-completo` alcuni hanno fine riga CRLF, mentre qui sono LF per `.gitattributes`; il contenuto è lo stesso. I file sono:
- `depth-surface.js`, `fluid-field.js`, `footer-wordmark.js`, `i18n.js`, `idle-cursor.js`, `service-trail.js`;
- `machine.css`, `mode-switch.css`, `mode-switch.js`;
- `geist-sub.woff2`, `geist-mono-sub.woff2`, `geist-LICENSE.txt`, `og-kint.jpg`.

Le varianti stanno in `assets/studi/`. Ciascun motore ha in testa un commento che dice cosa cambia rispetto al principale:

| File | Motivo |
|---|---|
| `trail-engine.js` | Motore della scia: DPR massimo, layout dell'oggetto, stile del rilievo e «a terra» come opzioni. Rotazione verso il mouse come in Next. |
| `formation-engine.js` | Tempi della formazione della landing in millisecondi reali. |
| `scene-engine.js` | Senza pavimento, piano e ombra di contatto, perché l'oggetto sfuma in basso. |
| `depth-surface.js` | Rilievo **lineare** (`gain 2`, `cap .05`, distanza dal bordo della sagoma, sfocato 3x3), come `depth-surface.ts` di Next: con il rilievo a righe del principale la penna sottile si piegava e il pennino si strappava ruotando. Si prepara al primo tilt, quindi mai sul telefono; se fallisce resta la texture del principale. Usa il programma GPU e il `drawDepth` del principale. |
| `material.js`, `material-worker.js` | Materiale sotto il varco: argento satinato (come Next) e arresto del calcolo quando la scena si ferma. |
| `pen-scene.js`, `scene-images.js` | Scena della penna: posizione nell'immagine (`BOUNDS`), layout con `k = 1.08` su desktop, `MAX_DPR = 2` sempre, scelta della misura dell'immagine (mai la 2048 px su touch). |
| `hero.js`, `landing.js`, `menu.js`, `accordion.js`, `contact.js` | Comportamenti della landing, assenti nel principale. |
| `studi.css` | Stile della landing. |

Le immagini `stilografica-ceramic{,-640,-1024}.webp` e `stilografica-kintsugi{,-640,-1024}.webp` appartengono alla landing.

## Checklist del trasloco in kint-website-official

1. Copiare `assets/studi/` dentro `assets/` del sito principale. I file di `assets/` in radice non vanno copiati: sono identici a quelli del principale (elenco sopra) e si scartano.
2. Copiare le cartelle delle pagine:
   - le Human `studi/`, `en/studi/`, `fr/studi/` e `de/studi/`;
   - le Machine `ai/studi/`, `en/ai/studi/`, `fr/ai/studi/` e `de/ai/studi/`.

   Vanno unite alle cartelle esistenti, senza sovrascrivere altre pagine.
3. Unire il blocco generato di `_headers` (tra `# --- ai-export: inizio` e `fine`) con quello del principale. La CSP deve avere `worker-src 'self'`, per il worker del materiale, e gli hash sha256 degli script inline delle nuove pagine. Le regole di cache sono già uguali.
4. `_redirects`: le righe `/`, `/en/`, `/fr/` e `/de/` (e le varianti senza barra) verso la landing NON vanno portate, perché nel principale sono la home. Se servono ancora, si portano solo gli indirizzi vecchi della versione Next (`/machine` e simili verso le Machine studi), cambiandone i percorsi.
5. `sitemap.xml`: aggiungere le 4 pagine Human con gli alternate e `x-default`. Le Machine non vanno in sitemap.
6. `robots.txt` non si porta: vale quello del principale. Le pagine studi restano `noindex` finché non si esporta con `INDEX=1`.
7. `BASE` (`https://kint-perf.pages.dev` in `tools/export.mjs`): nel principale i link a `BASE + '/'` diventano relativi o puntano al dominio definitivo.
8. Portare i test pertinenti, adattando i percorsi:
   - `dist-links`, `cache-headers`, `hero`, `pen-scene`, `material`, `landing`, `contact`, `module-graph`;
   - i test delle immagini della penna in `build.test.js` (percorso a template e «solo le referenziate»).

   Va portato anche il passaggio di build che crea il bundle e il worker del materiale con hash (`WORKERS` in `tools/build.mjs`). Il percorso delle immagini è a template (`stilografica-${kind}${size}.webp`): la build del principale deve pubblicarle tutte e sei.
9. Se nella stessa pagina del principale un'altra tela disegna prima della scena, il riscaldamento in `hero.js` non costa nulla e si può lasciare.
10. Dopo il trasloco, rieseguire Lighthouse (3 misure, mobile e desktop) e `scroll-profile`, e confermare TBT e long task. Il margine del TBT mobile sulla home del principale è **nullo**: mediana 9 contro 9 (landing 9/4/9, principale 8/9/11); in una seconda serie 8 contro 9 con una misura della landing (11) sopra la mediana del principale.

## Punti aperti

- **Spazi non separabili nelle pagine Machine francesi.** La funzione `text` di `tools/export.mjs` normalizza gli spazi con `\s+`, che in JavaScript comprende anche lo spazio non separabile (e `&nbsp;` viene decodificato in uno spazio normale): nei testi che passano di lì lo spazio prima di «:», «?» e «»» diventa uno spazio normale e può andare a capo. La pagina Human francese ha 25 spazi non separabili, la Machine francese 12. Il codice viene dall'export condiviso, quindi lo stesso succede nelle landing ristoranti e palestre. Va corretto insieme nelle tre landing; qui non è stato toccato.
- Al primo tilt `depth-surface.js` calcola anche il rilievo a righe del principale, che viene subito sostituito da quello lineare. È lavoro sprecato una volta, nei tempi morti e mai su touch; si accetta per non toccare il file condiviso.
- I confronti della scena usano WebGL via SwiftShader headless: la GPU reale non è stata provata.
- Il residuo di 54-59 ms simulati a 1,8 s nel Lighthouse mobile non corrisponde a lavoro individuabile, come nella palestre.

## Comandi

Vedi `README.md`:
- `npm test`, `npm run dev`, `npm run build`;
- `python tools/dev_server.py --port 3103 --dist`;
- gli strumenti in `tools/perf/`.
