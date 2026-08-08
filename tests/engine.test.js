'use strict';
const test = require('node:test');
const assert = require('node:assert');
const Engine = require('../js/engine.js');

// ---------------------------------------------------------------------------
// Perft — node counts from the Chess Programming Wiki. These four positions
// jointly exercise castling, en passant (including the horizontal-pin case),
// promotions and pins.
// ---------------------------------------------------------------------------

const PERFT_CASES = [
  {
    name: 'startpos',
    fen: Engine.START_FEN,
    counts: { 1: 20, 2: 400, 3: 8902, 4: 197281 }
  },
  {
    name: 'kiwipete',
    fen: 'r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1',
    counts: { 1: 48, 2: 2039, 3: 97862 }
  },
  {
    name: 'cpw-position-3 (en-passant pin)',
    fen: '8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1',
    counts: { 1: 14, 2: 191, 3: 2812, 4: 43238 }
  },
  {
    name: 'cpw-position-4 (promotions)',
    fen: 'r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1',
    counts: { 1: 6, 2: 264, 3: 9467 }
  }
];

for (const c of PERFT_CASES) {
  test(`perft: ${c.name}`, () => {
    const g = Engine.create(c.fen);
    for (const [depth, expected] of Object.entries(c.counts)) {
      assert.strictEqual(g.perft(Number(depth)), expected,
        `${c.name} perft(${depth})`);
    }
  });
}

// ---------------------------------------------------------------------------
// FEN handling
// ---------------------------------------------------------------------------

test('FEN round-trips', () => {
  const g = Engine.create();
  assert.strictEqual(g.fen(), Engine.START_FEN);
  const kiwi = 'r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1';
  g.load(kiwi);
  assert.strictEqual(g.fen(), kiwi);
});

test('validateFen rejects broken positions', () => {
  assert.ok(Engine.validateFen(Engine.START_FEN).ok);
  assert.ok(!Engine.validateFen('8/8/8/8/8/8/8/8 w - - 0 1').ok, 'no kings');
  assert.ok(!Engine.validateFen('K6k/P7/8/8/8/8/8/7p w - - 0 1').ok, 'pawn on rank 1');
  assert.ok(!Engine.validateFen('4k3/8/8/8/8/8/4r3/4K3 b - - 0 1').ok, 'side not to move in check');
  assert.ok(!Engine.validateFen('rubbish').ok);
  assert.ok(!Engine.validateFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0').ok, 'five fields');
});

// ---------------------------------------------------------------------------
// Rules edge cases
// ---------------------------------------------------------------------------

test('castling is refused through an attacked square but allowed elsewhere', () => {
  // Black rook on f3 attacks f1: O-O is illegal, O-O-O is fine.
  const g = Engine.create('4k3/8/8/8/8/5r2/8/R3K2R w KQ - 0 1');
  const kingMoves = g.movesFrom('e1').map(m => m.to);
  assert.ok(!kingMoves.includes('g1'), 'O-O must be refused (f1 attacked)');
  assert.ok(kingMoves.includes('c1'), 'O-O-O must be allowed');
  const res = g.moveSan('O-O-O');
  assert.ok(res);
  assert.strictEqual(g.get('c1'), 'K');
  assert.strictEqual(g.get('d1'), 'R');
});

test('castling rights lost when the rook is captured on its home square', () => {
  const g = Engine.create('4k3/8/8/8/8/8/6b1/4K2R b K - 0 1');
  assert.ok(g.moveSan('Bxh1'));
  assert.ok(g.fen().includes(' - '), 'white kingside right must be gone');
});

test('en passant capture that would expose the king is rejected', () => {
  // Kxc6 aside: after ...c5, dxc6 e.p. would clear rank 5 and leave the
  // white king on a5 skewered by the queen on h5.
  const g = Engine.create('8/8/8/K1pP3q/8/8/8/7k w - c6 0 1');
  assert.strictEqual(g.moveSan('dxc6'), null);
  assert.ok(g.moveSan('d6'), 'ordinary push still legal');
});

test('legal en passant works and removes the captured pawn', () => {
  const g = Engine.create();
  ['e4', 'a6', 'e5', 'd5'].forEach(s => assert.ok(g.moveSan(s), s));
  const res = g.moveSan('exd6');
  assert.ok(res, 'exd6 e.p. must be legal');
  assert.strictEqual(g.get('d5'), null, 'captured pawn removed from d5');
  assert.strictEqual(g.get('d6'), 'P');
});

test('checkmate and stalemate are distinguished', () => {
  const mate = Engine.create('6k1/5ppp/8/8/8/8/8/4R2K w - - 0 1');
  assert.ok(mate.moveSan('Re8#'));
  assert.ok(mate.isCheckmate());
  assert.ok(!mate.isStalemate());

  const stale = Engine.create('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1');
  assert.ok(stale.isStalemate());
  assert.ok(!stale.isCheckmate());
  assert.strictEqual(stale.isDraw().reason, 'stalemate');
});

test('promotion offers all four pieces', () => {
  const g = Engine.create('8/P7/8/8/8/8/8/k6K w - - 0 1');
  const promos = g.moves().filter(m => m.to === 'a8').map(m => m.promotion);
  assert.deepStrictEqual(promos.sort(), ['B', 'N', 'Q', 'R']);
  assert.ok(g.moveSan('a8=N'));
  assert.strictEqual(g.get('a8'), 'N');
});

test('threefold repetition is detected', () => {
  const g = Engine.create();
  const shuffle = ['Nf3', 'Nf6', 'Ng1', 'Ng8'];
  for (let i = 0; i < 2; i++) shuffle.forEach(s => assert.ok(g.moveSan(s)));
  assert.strictEqual(g.isDraw().reason, 'threefold');
});

test('fifty-move rule is detected', () => {
  const g = Engine.create('7k/8/8/8/8/8/8/R6K w - - 100 60');
  assert.strictEqual(g.isDraw().reason, 'fifty');
});

test('insufficient material is detected', () => {
  assert.strictEqual(Engine.create('8/8/8/8/8/8/8/Kb5k w - - 0 1').isDraw().reason, 'material');
  assert.strictEqual(Engine.create('8/8/8/8/8/8/8/K6k w - - 0 1').isDraw().reason, 'material');
  assert.strictEqual(Engine.create('8/8/8/8/8/8/P7/K6k w - - 0 1').isDraw().draw, false);
});

// ---------------------------------------------------------------------------
// SAN
// ---------------------------------------------------------------------------

test('SAN disambiguation (two knights to the same square)', () => {
  const g = Engine.create('k7/8/8/8/8/5N2/8/1N2K3 w - - 0 1');
  const sans = g.moves().map(m => m.san);
  assert.ok(sans.includes('Nbd2'), `expected Nbd2 in ${sans}`);
  assert.ok(sans.includes('Nfd2'), `expected Nfd2 in ${sans}`);
  assert.ok(g.moveSan('Nbd2'));
  assert.strictEqual(g.get('d2'), 'N');
});

test('a full short game plays through SAN with correct suffixes', () => {
  const g = Engine.create();
  const score = ['e4', 'e5', 'Bc4', 'Nc6', 'Qh5', 'Nf6'];
  score.forEach(s => assert.ok(g.moveSan(s), s));
  const res = g.moveSan('Qxf7#');
  assert.ok(res, 'scholar\'s mate final move');
  assert.strictEqual(res.san, 'Qxf7#');
  assert.ok(g.isCheckmate());
  assert.deepStrictEqual(g.history(), [...score, 'Qxf7#']);
});

test('undo restores position and history', () => {
  const g = Engine.create();
  const before = g.fen();
  g.moveSan('e4');
  g.moveSan('c5');
  g.undo();
  g.undo();
  assert.strictEqual(g.fen(), before);
  assert.deepStrictEqual(g.history(), []);
});

test('movesFrom powers click-highlighting', () => {
  const g = Engine.create();
  const knight = g.movesFrom('g1').map(m => m.to).sort();
  assert.deepStrictEqual(knight, ['f3', 'h3']);
  assert.deepStrictEqual(g.movesFrom('e1'), [], 'boxed-in king has no moves');
  assert.deepStrictEqual(g.movesFrom('z9'), [], 'nonsense square is empty');
});
