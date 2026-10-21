# Landing studi allineata al sito principale — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Riscrivere la landing studi (Next.js) come sito statico, portando il lavoro già revisionato di kint-palestre (`main` a `a00ff51`), identica a vista e veloce almeno quanto il sito principale.

**Architecture:** Si porta kint-palestre dentro kint-studi e si sostituiscono:
- `palestre` con `studi`;
- testi e traduzioni (dai sorgenti Next di studi a `7d54a63`);
- immagini;
- parametri della scena della penna: BOUNDS, rilievo lineare, `k = 1.08`, `MAX_DPR = 2`;
- titolo Machine italiano.

**Tech Stack:** come kint-palestre.

**Spec:** `docs/superpowers/specs/2026-10-21-studi-allineamento-design.md`. Rimanda alle spec di palestre e ristoranti, da leggere entrambe.

## Global Constraints

- **Vincoli ereditati:** tutte le Global Constraints del piano palestre (`C:\_EDOARDO\z_kint\kint-palestre\docs\superpowers\plans\2026-10-21-palestre-allineamento.md`), con `palestre` sostituito da `studi` ovunque.
- **Indirizzi:**

  | Indirizzo | Pagina |
  |---|---|
  | `/studi/`, `/en/studi/`, `/fr/studi/`, `/de/studi/` | Human |
  | `/ai/studi/`, `/en/ai/studi/`, `/fr/ai/studi/`, `/de/ai/studi/` | Machine |

  `/`, `/en/`, `/fr/` e `/de/` rimandano alla landing della lingua con 301.
- **Base e indicizzazione:**
  - `BASE = 'https://kint-perf.pages.dev'`;
  - noindex, salvo `INDEX=1` nella sola build.
- **Asset condivisi:** i file in `assets/` fuori da `assets/studi/` sono byte-identici a `C:\_EDOARDO\z_kint\KINT-codice-completo\assets\` (confronta i blob git).
- **Versioni:** `?v=` ovunque, con bump a ogni modifica.
- **Header:**
  - CSP senza `'unsafe-inline'` negli script;
  - `worker-src 'self'`;
  - Permissions-Policy senza `interest-cohort`.
- **Dipendenze e parole vietate:**
  - nessuna dipendenza di runtime;
  - nessuna parola dello stack vecchio, né `edoardo` né `workers.dev`, nei file tracciati (esclusi `docs/`, `tools/perf/`, lockfile);
  - nessun residuo di ristoranti o palestre (forchetta, manubrio, `ristorant`, `palestr`, `Retail, bellezza`, `fitness`, `Ristorazione`) nei file tracciati fuori da `docs/`, salvo testi studi che li contengano davvero (da verificare sui sorgenti).
- **Commit:** in italiano, che finiscono con `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Nessun push.
- **Verità visiva:** la Next di studi a `7d54a63` in produzione su `http://localhost:3113/`, dal worktree `C:\_EDOARDO\z_kint\kint-studi-next`.
- **Soglie:**
  - 0 long task oltre 50 ms nello scroll desktop di 10 s;
  - TBT Lighthouse mobile e desktop (mediana di 3) non peggiore della home del principale nello stesso run.

  Il report riporta le singole prove.
- **Server locale:** porta 3103.

## Review Focus

1. **Rilievo lineare** (`gain 2`, `cap .05`) uguale alla Next: la penna sottile non si «piega» e non si strappa quando gira. Va verificato con un test della texture di profondità nel Task 3.
2. **`layout` desktop con `k = 1.08`** e telefono senza fattore. Test con valori calcolati a mano nel Task 3.
3. **`imageUrl` con `MAX_DPR = 2` anche su desktop**: su touch non restituisce mai la 2048 px. Test nel Task 3.
4. **Titolo Machine italiano** `Machine view: studi`. Test nel Task 2.
5. **Nessun residuo** di ristoranti o palestre. Test nel Task 2.

---

### Task 1: Riferimento «prima» e strumenti di misura

Come il Task 1 della palestre, con queste differenze: worktree `../kint-studi-next` su `7d54a63`, porta **3113**, strumenti copiati da kint-palestre (`tools/perf/**`, `.gitattributes`).

- [ ] **Step 1:** Crea il worktree ed esegui `npm ci`, `npx next build` e `npx next start -p 3113` in background, lasciandolo acceso. Atteso: 200 su `/` e `/en`.
- [ ] **Step 2:** Con `shots.mjs` cattura `/` e `/en` in `.baseline/next/`. Misura con Lighthouse mobile e desktop (3 run, mediana) e con `scroll-profile` sia Next (porta 3113) sia la home del principale (porta 8091, da fermare alla fine). Scrivi i numeri, comprese le singole prove, in `.baseline/numbers.md`.
- [ ] **Step 3:** Committa solo `tools/perf`, `.gitattributes`, `.gitignore`, `package.json` e il lockfile, con il messaggio «chore: strumenti di misura e riferimento della versione Next».

### Task 2: Porting dalla palestre: scheletro, pagina, interazioni, generatore, build

Come il Task 2 della palestre, con kint-palestre `a00ff51` come sorgente.

- **Si porta:** tutto tranne la scena, cioè niente `hero.js`, `scene-images.js`, varianti dei motori, `material-worker` né test della scena. `landing.js` non avvia la scena.
- **Pagina e testi:**
  - `studi/index.html` con i testi italiani di studi e `data-sector="Studi professionali &amp; consulenti"`;
  - `i18n/*.json` dai sorgenti studi;
  - la pagina Machine con il titolo italiano `Machine view: studi`.
- **Immagini:** le `stilografica-*` in `assets/studi/`.
- **Configurazione locale:** voce `studi-dev` in `launch.json` → `{"name":"studi-dev","runtimeExecutable":"python","runtimeArgs":["C:/_EDOARDO/z_kint/kint-studi/tools/dev_server.py","--port","3103"],"port":3103}`.

- [ ] **Step 1:** Scrivi `tests/content.test.js` sul modello di quello della palestre:
  - parole vietate di ristoranti e palestre;
  - `h1` della studi;
  - conteggi di servizi e FAQ da `content.ts` a `7d54a63`;
  - titolo Machine italiano uguale a `Machine view: studi`.

  Esegui i test: devono fallire.
- [ ] **Step 2:** Fai il porting. Poi `npm install`, `npm run export`, `--check`, `npm test`: devono passare.
- [ ] **Step 3:** Esegui `npm run build` e avvia il server su 3103 con `--dist`. Atteso: 200 sugli 8 indirizzi e 301 da `/`. Confronta gli shot con `.baseline/next/` a 1440 e 375, escludendo la scena.
- [ ] **Step 4:** Committa con il messaggio «refactor: landing studi statica come il sito principale (dal lavoro della palestre)».

### Task 3: Scena della penna

Come il Task 3 della palestre, con kint-palestre `a00ff51` come sorgente: `assets/palestre/*` della scena e i test. Si tengono la misura pigra, ImageBitmap, il riscaldamento del contesto 2D, `startHero` in try/catch e l'abort del materiale.

- **`assets/studi/pen-scene.js`:**
  - `BOUNDS = {top:.208,bottom:.792,left:.229,right:.792}`;
  - `DEPTH_STYLE = {kind:'lineare',gain:2,cap:.05}`;
  - `layout(w,h)` come `KfScene.tsx` a `7d54a63` (desktop con `k = 1.08`);
  - `MAX_DPR = 2`;
  - `imageUrl(kind, rectWidth)` come `KfScene.tsx`.
- **`assets/studi/scene-images.js`:** `penImage(kind, size)` restituisce `/assets/studi/stilografica-${kind}${size}.webp`.
- **`assets/studi/depth-surface.js`:** prende il ramo `lineare` dalla variante della ristoranti (`C:\_EDOARDO\z_kint\kint-ristoranti\assets\ristoranti\depth-surface.js`) e la preparazione pigra dalla palestre. Il commento in testa dice cosa differisce dal principale.
- **Preload:** solo `stilografica-ceramic-1024.webp`, con `media="(hover: none)"` e `fetchpriority="high"`.

- [ ] **Step 1:** Scrivi i test, che devono fallire:
  - `layout(1440,900)` e `layout(375,812)` con valori calcolati a mano;
  - `imageUrl`: su touch mai la 2048 px; su desktop con DPR 2 la scelta usa `MAX_DPR = 2`;
  - il rilievo lineare cresce con la distanza dal bordo ed è limitato da `cap`, su una sagoma sintetica sottile;
  - test hero (a)–(f) come nella palestre, compreso touch fermo con varco.
- [ ] **Step 2:** Implementa e attiva la scena in `landing.js`. Confronta in affiancato con `http://localhost:3113/`: formazione, rilievo, rotazione, varco, telefono, reduced motion, immagini mancanti.
- [ ] **Step 3:** Esegui `npm run export`, `npm run build` e `npm test`: devono passare. Poi `scroll-profile` sul dist (atteso 0 long task) e una passata di Lighthouse mobile, riportando il TBT.
- [ ] **Step 4:** Committa con il messaggio «feat: scena della penna con i motori del sito principale».

### Task 4: Verifica finale e report

Come il Task 4 della palestre.

- [ ] **Step 1:** Aggiungi il test che nel dist ci siano solo le `stilografica-*` referenziate.
- [ ] **Step 2:** Esegui gli shot del dist contro la Next a 1440 e 375 per `/` e `/en`. Misura Lighthouse (3 run, mediana più singole prove) e `scroll-profile` su landing, Next e principale nello stesso run. Controlla reduced motion e touch.
- [ ] **Step 3:** Se il TBT supera quello del principale, applica ottimizzazioni invisibili, sul modello di quelle della palestre. Non fare modifiche visibili: se servono, riportale.
- [ ] **Step 4:** Scrivi il report `docs/superpowers/reports/2026-10-21-studi-allineamento-report.md`:
  - singole prove e margine;
  - differenze visive;
  - file condivisi e varianti;
  - checklist del trasloco.

  Poi `npm test` e commit con il messaggio «docs: report dell'allineamento della landing studi».
