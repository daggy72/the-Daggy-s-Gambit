// End-to-end smoke drive with Playwright. Runs the app both from file:// and
// from a local http server (the latter for service-worker/offline checks).
//
//   npm run smoke            (screenshots land in SMOKE_SHOTS_DIR or ./smoke-shots)
//
// Uses the globally installed playwright if no local one is present.
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';

const require = createRequire(import.meta.url);
let playwright;
try {
  playwright = require('playwright');
} catch {
  playwright = require(path.join(execSync('npm root -g').toString().trim(), 'playwright'));
}

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SHOTS = process.env.SMOKE_SHOTS_DIR || path.join(ROOT, 'smoke-shots');
fs.mkdirSync(SHOTS, { recursive: true });

const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png'
};

function serve() {
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    const file = path.join(ROOT, p);
    fs.readFile(file, (err, data) => {
      if (err) { res.writeHead(404); res.end('not found'); return; }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
      res.end(data);
    });
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server)));
}

function watchErrors(page, bucket) {
  page.on('pageerror', e => bucket.push('pageerror: ' + e.message));
  page.on('console', msg => { if (msg.type() === 'error') bucket.push('console: ' + msg.text()); });
}

async function clickContinue(page) {
  await page.click('.step-card:last-of-type .btn.primary');
}

const errors = [];
const browser = await playwright.chromium.launch();

// ---------------------------------------------------------------------------
// Pass 1: file:// — the app must work opened straight from disk.
// ---------------------------------------------------------------------------
{
  const page = await browser.newPage({ viewport: { width: 1000, height: 900 } });
  watchErrors(page, errors);
  await page.goto('file://' + path.join(ROOT, 'index.html'));

  await page.waitForSelector('.module-card');
  assert.strictEqual(await page.locator('.module-card').count(), 3, 'three module cards');
  assert.strictEqual(await page.locator('.module-card.locked').count(), 2, 'modules 2+3 locked');
  await page.screenshot({ path: path.join(SHOTS, '01-home.png'), fullPage: true });

  // Knight lesson: text → static board → explore goal (b1→d5) → quiz → recap.
  await page.goto(page.url().split('#')[0] + '#/lesson/m1-02-knight');
  await page.waitForSelector('.step-card');
  await clickContinue(page);                                  // intro text
  await clickContinue(page);                                  // static diagram
  await page.waitForSelector('.step-card[data-step="2"] .dg-board');
  await page.click('.step-card[data-step="2"] [data-sq="b1"]');
  assert.ok(await page.locator('.step-card[data-step="2"] .sq.dot').count() > 0,
    'legal destinations highlighted');
  await page.screenshot({ path: path.join(SHOTS, '02-knight-highlights.png') });
  await page.click('.step-card[data-step="2"] [data-sq="c3"]');
  await page.click('.step-card[data-step="2"] [data-sq="c3"]');
  await page.click('.step-card[data-step="2"] [data-sq="d5"]');
  await page.waitForSelector('.step-card[data-step="2"] .board-status.good');

  await page.waitForSelector('.step-card[data-step="3"]');    // quiz appeared
  await page.click('.step-card[data-step="3"] .choice[data-i="0"]');
  await page.waitForSelector('.step-card[data-step="4"]');    // recap appeared
  await page.click('.step-card[data-step="4"] .btn.primary'); // Got it
  await page.waitForSelector('.lesson-done');

  // Persistence across reload.
  await page.reload();                       // still on the lesson URL
  await page.waitForSelector('.lesson-done'); // completed lesson restored as done
  await page.evaluate(() => { location.hash = '#/'; });
  await page.waitForSelector('.module-card');
  const label = await page.locator('.module-card .progress-label').first().textContent();
  assert.ok(label.includes('1 / 9'), `module 1 progress persisted (got "${label}")`);

  // Puzzle flow (back-rank mate in m1-06): wrong move flashes and snaps back,
  // right move solves.
  await page.evaluate(() => {
    [0, 1, 2, 3].forEach(i => DG.Progress.stepDone('m1-06-check', i));
  });
  await page.goto(page.url().split('#')[0] + '#/lesson/m1-06-check');
  await page.waitForSelector('.step-card[data-step="4"] .dg-board');
  await page.click('.step-card[data-step="4"] [data-sq="e1"]');
  await page.click('.step-card[data-step="4"] [data-sq="e2"]');   // legal but wrong
  await page.waitForSelector('.step-card[data-step="4"] .board-status.bad');
  await page.waitForTimeout(700);                                  // snap-back
  assert.strictEqual(await page.evaluate(() => document.querySelector('.step-card[data-step="4"] [data-sq="e2"] .piece')?.textContent || ''), '',
    'wrong move snapped back');
  await page.click('.step-card[data-step="4"] [data-sq="e1"]');
  await page.click('.step-card[data-step="4"] [data-sq="e8"]');    // Re8#
  await page.waitForSelector('.step-card[data-step="4"] .board-status.good');
  await page.screenshot({ path: path.join(SHOTS, '03-puzzle-solved.png') });

  // Completing all of module 1 unlocks module 2.
  await page.evaluate(() => {
    DG.CONTENT.filter(l => l.module === 1).forEach(l => DG.Progress.completeLesson(l.id));
  });
  await page.goto(page.url().split('#')[0] + '#/');
  await page.reload();
  await page.waitForSelector('.module-card');
  assert.strictEqual(await page.locator('.module-card.locked').count(), 1, 'module 2 unlocked');

  // Guided sequence (Italian Game) steps and shows the move list.
  await page.evaluate(() => {
    DG.Progress.stepDone('m2-04-italian', 0);
  });
  await page.goto(page.url().split('#')[0] + '#/lesson/m2-04-italian');
  await page.waitForSelector('.step-card[data-step="1"] .seq-controls');
  for (let i = 0; i < 5; i++) await page.click('.step-card[data-step="1"] [data-seq="next"]');
  const movelist = await page.locator('.step-card[data-step="1"] .movelist').textContent();
  assert.ok(movelist.includes('3. Bc4'), `move list shows the opening (got "${movelist}")`);
  await page.screenshot({ path: path.join(SHOTS, '04-italian-sequence.png') });

  await page.close();
}

// ---------------------------------------------------------------------------
// Pass 2: iPhone-sized viewport — board fits, tap targets big enough.
// ---------------------------------------------------------------------------
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  watchErrors(page, errors);
  await page.goto('file://' + path.join(ROOT, 'index.html'));
  await page.waitForSelector('.module-card');
  await page.screenshot({ path: path.join(SHOTS, '05-mobile-home.png'), fullPage: true });

  await page.goto(page.url().split('#')[0] + '#/lesson/m1-02-knight');
  await page.click('.step-card:last-of-type .btn.primary');
  await page.waitForSelector('.dg-board .sq');
  const box = await page.locator('.dg-board .sq').first().boundingBox();
  assert.ok(box.width >= 40, `squares are tappable on a phone (${box.width.toFixed(1)}px)`);
  const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
  assert.ok(bodyWidth <= 390, `no horizontal scroll on phone (${bodyWidth}px)`);
  await page.screenshot({ path: path.join(SHOTS, '06-mobile-lesson.png') });
  await page.close();
}

// ---------------------------------------------------------------------------
// Pass 3: http + service worker — offline reload must still work.
// ---------------------------------------------------------------------------
{
  const server = await serve();
  const origin = 'http://127.0.0.1:' + server.address().port;
  const context = await browser.newContext();
  const page = await context.newPage();
  watchErrors(page, errors);
  await page.goto(origin + '/');
  await page.waitForSelector('.module-card');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForTimeout(500); // let precache finish

  await context.setOffline(true);
  await page.reload();
  await page.waitForSelector('.module-card');
  assert.strictEqual(await page.locator('.module-card').count(), 3, 'app works offline via SW');
  await context.setOffline(false);
  await page.close();
  await context.close();
  server.close();
}

await browser.close();

const fatal = errors.filter(e => !/favicon/i.test(e));
if (fatal.length) {
  console.error('Errors captured during smoke run:');
  fatal.forEach(e => console.error('  ' + e));
  process.exit(1);
}
console.log('Smoke drive passed. Screenshots in ' + SHOTS);
