'use strict';
// Validates every position, move sequence and puzzle solution in the lesson
// content, using the same engine the app plays with. If this file is green,
// no chess-illegal diagram or broken puzzle can ship.
const test = require('node:test');
const assert = require('node:assert');

// Content files are classic browser scripts; give them a window-like global.
global.window = global;
const Engine = require('../js/engine.js');
global.DG = { Engine };
require('../js/content-schema.js');
require('../content/module1.js');
require('../content/module2.js');
require('../content/module3.js');

const CONTENT = global.DG.CONTENT;
const STEP_TYPES = ['text', 'board', 'sequence', 'quiz', 'puzzle', 'recap'];
const GOAL_TYPES = ['reach', 'capture', 'anyMove', 'give-check', 'checkmate', 'promote', 'castle'];

const norm = s => String(s).replace(/[+#!?]+$/, '');
const isSquare = s => /^[a-h][1-8]$/.test(s);

function checkFen(fen, where) {
  const v = Engine.validateFen(fen);
  assert.ok(v.ok, `${where}: invalid FEN "${fen}" — ${v.error}`);
}

test('course structure', () => {
  assert.strictEqual(CONTENT.length, 28, 'expected 28 lessons');
  const ids = new Set();
  for (const lesson of CONTENT) {
    assert.ok(!ids.has(lesson.id), `duplicate lesson id ${lesson.id}`);
    ids.add(lesson.id);
    assert.ok([1, 2, 3].includes(lesson.module), `${lesson.id}: bad module`);
    assert.ok(lesson.title && lesson.minutes > 0 && lesson.steps.length > 0, `${lesson.id}: incomplete`);
  }
  assert.strictEqual(CONTENT.filter(l => l.module === 1).length, 9);
  assert.strictEqual(CONTENT.filter(l => l.module === 2).length, 8);
  assert.strictEqual(CONTENT.filter(l => l.module === 3).length, 11);
});

for (const lesson of CONTENT) {
  test(`lesson ${lesson.id}`, () => {
    lesson.steps.forEach((step, i) => {
      const where = `${lesson.id} step ${i} (${step.type})`;
      assert.ok(STEP_TYPES.includes(step.type), `${where}: unknown type`);

      // Squares referenced in highlights/arrows/goals must be real squares.
      for (const sq of Object.keys(step.highlights || {})) {
        assert.ok(isSquare(sq), `${where}: bad highlight square ${sq}`);
      }
      for (const a of step.arrows || []) {
        assert.ok(isSquare(a.from) && isSquare(a.to), `${where}: bad arrow ${a.from}-${a.to}`);
      }
      if (step.goal) {
        assert.ok(GOAL_TYPES.includes(step.goal.type), `${where}: unknown goal ${step.goal.type}`);
        if (step.goal.square) assert.ok(isSquare(step.goal.square), `${where}: bad goal square`);
      }

      if (step.type === 'board') {
        assert.ok(['static', 'explore', 'guided', 'puzzle'].includes(step.mode), `${where}: bad mode`);
        checkFen(step.fen, where);
        if (step.goal && step.goal.type === 'reach') {
          // A reach goal must be attainable: with solo practice any square is
          // fair game, otherwise it must be a single legal move away.
          if (!step.solo) {
            const g = Engine.create(step.fen);
            const all = g.moves().map(m => m.to);
            assert.ok(all.includes(step.goal.square),
              `${where}: reach goal ${step.goal.square} is not one move away and step is not solo`);
          }
        }
      }

      if (step.type === 'quiz') {
        assert.ok(Array.isArray(step.choices) && step.choices.length >= 2, `${where}: needs choices`);
        assert.ok(Number.isInteger(step.answer) && step.answer >= 0 && step.answer < step.choices.length,
          `${where}: answer index out of range`);
        if (step.boardFen) checkFen(step.boardFen, where);
      }

      if (step.type === 'sequence') {
        const base = step.fen || Engine.START_FEN;
        checkFen(base, where);
        const g = Engine.create(base);
        step.moves.forEach((san, j) => {
          const res = g.moveSan(san);
          assert.ok(res, `${where}: move ${j + 1} "${san}" is not legal`);
          // If the author annotated check/mate, the engine must agree.
          if (/#$/.test(san)) assert.ok(g.isCheckmate(), `${where}: "${san}" claims mate`);
          else if (/\+$/.test(san)) assert.ok(g.inCheck(), `${where}: "${san}" claims check`);
        });
        if (step.captions) {
          assert.ok(step.captions.length <= step.moves.length + 1,
            `${where}: more captions than positions`);
        }
      }

      if (step.type === 'puzzle') {
        checkFen(step.fen, where);
        assert.ok(Array.isArray(step.solutions) && step.solutions.length > 0, `${where}: no solutions`);
        for (const line of step.solutions) {
          const g = Engine.create(step.fen);
          line.forEach((san, j) => {
            const res = g.moveSan(san);
            assert.ok(res, `${where}: solution move "${san}" (ply ${j}) is not legal`);
            if (/#$/.test(san)) assert.ok(g.isCheckmate(), `${where}: "${san}" claims mate but position is not mate`);
            else if (/\+$/.test(san)) assert.ok(g.inCheck(), `${where}: "${san}" claims check but there is none`);
            if (j === line.length - 1 && /#$/.test(san)) {
              assert.ok(g.isCheckmate(), `${where}: line does not end in the claimed mate`);
            }
          });
        }
        // Mate-in-one puzzles must list EVERY mating move, or a correct
        // player answer would be rejected as wrong.
        const isMateInOne = step.solutions.every(l => l.length === 1 && /#$/.test(l[0]));
        if (isMateInOne) {
          const g = Engine.create(step.fen);
          const mates = g.moves().filter(m => /#$/.test(m.san)).map(m => norm(m.san));
          const listed = step.solutions.map(l => norm(l[0]));
          for (const m of mates) {
            assert.ok(listed.includes(m), `${where}: mating move ${m} missing from solutions`);
          }
        }
        // Multi-move lines: odd plies are scripted opponent replies and must
        // exist; player plies are even. Lines must end on a player move.
        for (const line of step.solutions) {
          assert.ok(line.length % 2 === 1, `${where}: solution line should end on the solver's move`);
        }
      }
    });
  });
}
