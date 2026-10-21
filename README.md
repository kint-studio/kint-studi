# KINT Studi

Landing statica di KINT per gli studi professionali, costruita con lo stesso metodo del sito principale: HTML, CSS e JavaScript senza framework, nessuna dipendenza di runtime.

## Comandi

- `npm install`: installa gli strumenti di sviluppo.
- `npm run dev`: server locale su http://localhost:3103/ (pagina: http://localhost:3103/studi/).
- `npm test`: esegue i test (`node --test`).
- `npm run build`: genera `dist/` (pagine, export per le AI, `_headers`, `_redirects`); esegue prima `npm run export` e poi costruisce `dist/`.
- `npm run export`: rigenera i file generati, che sono nel repository (pagine en/fr/de, pagine Machine, sitemap, robots, `_redirects`, blocco generato di `_headers`, 404), a partire da `studi/index.html` e dai dizionari i18n. Va eseguito dopo ogni modifica ai sorgenti: `npm test` fallisce se i file generati sono vecchi.
- `tools/perf/` (shots, scroll-profile, Lighthouse): vedi `tools/perf/README.md`; servono Chrome e Node >= 22.12.
- `python tools/dev_server.py --dist`: serve `dist/` applicando `_headers` e `_redirects` (`--root <cartella>` fa lo stesso su un'altra cartella).

## Indirizzi

| Indirizzo | Pagina |
|---|---|
| `/studi/` | Human italiana |
| `/en/studi/`, `/fr/studi/`, `/de/studi/` | Human tradotte |
| `/ai/studi/`, `/en/ai/studi/`, `/fr/ai/studi/`, `/de/ai/studi/` | Machine |

`/`, `/en/`, `/fr/` e `/de/` rimandano con 301 alla landing della lingua.

## Variabili

- `BASE`: indirizzo del sito principale, una sola costante in `tools/export.mjs`.
- `INDEX=1`: abilita l'indicizzazione. Senza, le pagine sono `noindex, nofollow` e `robots.txt` vieta tutto.

## File condivisi

I file in `assets/` presenti anche nel repository principale (`../KINT-codice-completo/assets/`) devono essere identici: lo verifica `tests/shared-assets.test.js`. Le varianti per questa pagina stanno in `assets/studi/`.

## Trasloco futuro

Il progetto è pensato per confluire in `kint-website-official`: le pagine diventano cartelle del sito principale e `assets/studi/` si aggiunge a `assets/`.
