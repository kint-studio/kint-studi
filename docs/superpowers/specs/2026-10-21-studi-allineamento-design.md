# Landing studi allineata al sito principale

Data: 2026-10-21 · Repository: `kint-studio/kint-studi` (cartella locale `C:\_EDOARDO\z_kint\kint-studi`).

## In una riga

Si fa per la landing studi **esattamente** quello che è stato fatto per ristoranti e palestre. Il modello diretto è `C:\_EDOARDO\z_kint\kint-palestre` (`main` a `a00ff51`): la palestre è la più vicina, perché anche lì l'oggetto è una foto in rilievo senza WebGL. Da leggere:
- la spec della palestre: `docs/superpowers/specs/2026-10-21-palestre-allineamento-design.md`;
- il report della palestre: `docs/superpowers/reports/2026-10-21-palestre-allineamento-report.md`;
- le regole della spec ristoranti: `C:\_EDOARDO\z_kint\kint-ristoranti\docs\superpowers\specs\2026-10-20-ristoranti-allineamento-design.md`.

Valgono tutti i loro obiettivi, non obiettivi, anti-obiettivi, vincoli e regole per i casi dubbi.

## Decisioni dell'utente

- «Esattamente come fatto per le altre 2». Si mantengono le stesse scelte:
  - Geist Mono nella pillola;
  - scroll nativo;
  - focus visibile nel modulo;
  - contatto mailto;
  - noindex con `INDEX=1` solo nella build;
  - `.gitattributes` LF;
  - merge e push su `main` alla fine, su richiesta.
- Esecuzione con subagenti.

## Sostituzioni rispetto alla palestre

| Palestre | Studi |
|---|---|
| `/palestre/`, `assets/palestre/` | `/studi/`, `assets/studi/` |
| Next di riferimento `342e8a9` (kint-palestre), porta 3112 | `7d54a63` (kint-studi), porta **3113**, worktree `C:\_EDOARDO\z_kint\kint-studi-next` |
| manubrio, `manubrio-*.webp` | **penna stilografica**, `stilografica-{ceramic,kintsugi}{,-640,-1024}.webp` (solo quelle usate) |
| `BOUNDS {top:.181,bottom:.819,left:.104,right:.896}` | `BOUNDS {top:.208,bottom:.792,left:.229,right:.792}` |
| rilievo a cupola (default) | `DEPTH_STYLE = {kind:'lineare', gain:2, cap:.05}`. La variante `depth-surface.js` della ristoranti supporta già `lineare`: si riprende da lì e la si unisce alla preparazione pigra della palestre. |
| `layout`: desktop `h*0.68`, `w*0.36` | desktop con fattore `k = 1.08`: `ih = min(h*0.68*k/hf, w*0.36*k/(wf*2/3))`; telefono uguale |
| `maxDprFor(touch)`: 2 su touch, 1,5 su desktop | `MAX_DPR = 2` sempre, anche per la scelta dell'immagine |
| preload `manubrio-ceramic-1024.webp` | preload `stilografica-ceramic-1024.webp` con `media="(hover: none)"` e `fetchpriority="high"` |
| titolo Machine italiano `Machine view: ${label minuscolo}` | **`Machine view: studi`** in italiano, `Machine: <label>` nelle altre lingue |
| testi palestre, settore «Retail, bellezza & fitness» | testi studi da `src/lib/{content,i18n,landing-i18n}.ts` a `7d54a63`, settore «Studi professionali & consulenti» |
| touch: l'oggetto resta fermo, il dito apre il varco | **uguale** |

Tutto il resto è byte-identico alla palestre a meno dei testi: `globals.css`, menu, fisarmonica, modulo, footer, Machine, switch e motori. Si porta tutto dalla palestre.

## Verifica

Le stesse soglie:
- parità visiva con la Next di studi;
- 0 long task oltre 50 ms nello scroll;
- TBT Lighthouse mobile e desktop (mediana di 3) non peggiore della home del principale nello stesso run.

Il report deve riportare le singole prove, non solo la mediana, come nella palestre.

Server locale: porta **3103**. La voce `studi-dev` di `KINT-codice-completo/.claude/launch.json` deve avviare `python C:/_EDOARDO/z_kint/kint-studi/tools/dev_server.py --port 3103`.
