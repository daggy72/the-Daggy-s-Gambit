/*
 * content-schema.js — shared constants for lesson content.
 *
 * DG.PIECES is the single source of truth for the trilingual piece names
 * (English / Dutch / Italian), notation letters and glyphs. Module 1
 * templates its piece-introduction headers from this table so the three
 * languages are always presented consistently.
 */
(function () {
  'use strict';
  window.DG = window.DG || {};

  DG.PIECES = {
    K: { en: 'King', nl: 'Koning', it: 'Re', letter: 'K', glyph: '♚', value: '—' },
    Q: { en: 'Queen', nl: 'Dame', it: 'Regina', letter: 'Q', glyph: '♛', value: 9 },
    R: { en: 'Rook', nl: 'Toren', it: 'Torre', letter: 'R', glyph: '♜', value: 5 },
    B: { en: 'Bishop', nl: 'Loper', it: 'Alfiere', letter: 'B', glyph: '♝', value: 3 },
    N: { en: 'Knight', nl: 'Paard', it: 'Cavallo', letter: 'N', glyph: '♞', value: 3 },
    P: { en: 'Pawn', nl: 'Pion', it: 'Pedone', letter: '(none)', glyph: '♟', value: 1 }
  };

  // Renders the trilingual name banner used at the top of piece lessons.
  DG.pieceBanner = function (letter) {
    var p = DG.PIECES[letter];
    return '<div class="piece-banner">' +
      '<span class="piece-banner-glyph">' + p.glyph + '︎</span>' +
      '<table class="piece-names"><tbody>' +
      '<tr><th>English</th><td>' + p.en + '</td></tr>' +
      '<tr><th>Dutch</th><td>' + p.nl + '</td></tr>' +
      '<tr><th>Italian</th><td>' + p.it + '</td></tr>' +
      '<tr><th>Notation</th><td><b>' + p.letter + '</b></td></tr>' +
      '</tbody></table></div>';
  };

  // Lesson registry; content/module*.js files push into this.
  DG.CONTENT = [];

  DG.MODULES = [
    { id: 1, title: 'Module 1 — The Rules of the Game', blurb: 'Every piece, every rule, learnt by moving pieces yourself.' },
    { id: 2, title: 'Module 2 — Reading, Writing and Opening the Game', blurb: 'Algebraic notation, opening principles and five named openings.' },
    { id: 3, title: 'Module 3 — Tactics, Strategy and How to Think', blurb: 'Winning patterns, positional judgement and a thinking checklist.' }
  ];
})();
