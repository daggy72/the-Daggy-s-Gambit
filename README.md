# The Daggy's Gambit

A personal, self-contained interactive chess course — from complete beginner (well, the knight's
move was already known) to a confident club-level beginner, in three progressive modules:

1. **The Rules of the Game** — every piece (with English/Dutch/Italian names), every rule,
   learnt on a clickable board.
2. **Reading, Writing and Opening the Game** — algebraic notation, opening principles, and five
   named openings (Italian, Ruy López, Queen's Gambit, Sicilian, London).
3. **Tactics, Strategy and How to Think** — pins, forks, skewers, discovered attacks, back-rank
   patterns, pawn structure, outposts, endgame fundamentals and a per-move thinking checklist.

28 bite-sized lessons, interactive puzzles and quizzes throughout, progress saved locally,
Module 2/3 unlock as the previous module is completed.

## Running it

No build step, no dependencies, no network needed. Either:

- open `index.html` straight from disk, or
- serve the folder with any static server, or
- use the GitHub Pages deployment (see below) — which also enables phone installation.

## Installing on iPhone (PWA)

One-time setup, once this repo is on `main`:

1. **GitHub Pages needs a public repo** (or a paid GitHub plan). If the repo is private on a free
   plan, flip it to public in *Settings → General → Danger Zone → Change visibility*.
2. Enable Pages: *Settings → Pages → Build and deployment → Source: **GitHub Actions***.
   The included workflow (`.github/workflows/pages.yml`) runs the tests and deploys on every push
   to `main`.
3. On the iPhone, open the Pages URL in **Safari** (it will look like
   `https://<username>.github.io/the-Daggy-s-Gambit/`).
4. Tap **Share → Add to Home Screen**. The app installs with its own icon, runs full-screen,
   and works fully offline from then on.

## Development

The app is plain HTML/CSS/JS (classic scripts, no modules) so it works over `file://`.
The chess rules engine (`js/engine.js`) is dependency-free and loads in Node for testing.

```bash
npm test         # engine tests (perft + rules) and content validation
npm run smoke    # Playwright end-to-end smoke drive (needs: npm i, plus a Chromium for Playwright)
```

`tests/content.test.js` validates every FEN, move sequence and puzzle solution in the lesson
content against the engine — a chess-illegal diagram or unsolvable puzzle fails CI.

### Layout

```
index.html            app shell (single page, hash routing)
js/engine.js          legal-move engine: 0x88 board, full rules incl. castling/en passant/promotion,
                      check/checkmate/stalemate/draw detection, SAN in and out, perft
js/board.js           the one reusable board component (static / explore / guided / puzzle modes)
js/app.js             router, lesson renderer, progress wiring
js/content-schema.js  trilingual piece table + content registry
js/progress.js        localStorage persistence and module gating
content/module*.js    declarative lesson data (positions as FEN, moves as SAN)
sw.js                 offline service worker (precache-all)
manifest.webmanifest  PWA manifest
```
