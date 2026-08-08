/*
 * board.js — the single reusable chessboard component.
 *
 * DG.Board.mount(el, opts) returns a board instance used by every diagram
 * in the app. Four modes:
 *   static  — diagram only, optional highlights/arrows
 *   explore — free legal play with click-to-highlight destinations
 *   guided  — scripted SAN sequence, stepped with next()/prev()
 *   puzzle  — find-the-move with scripted opponent replies
 *
 * Depends on DG.Engine only. Knows nothing about lessons or storage.
 */
(function () {
  'use strict';

  var GLYPHS = { K: '♚', Q: '♛', R: '♜', B: '♝', N: '♞', P: '♟' };
  var FILES = 'abcdefgh';

  function mount(container, opts) {
    opts = opts || {};
    var game = DG.Engine.create(opts.fen);
    var mode = { mode: 'static' };
    var orientation = opts.orientation || 'white';
    var showCoords = opts.coords !== false;
    var selected = null;        // 'e2' while a piece is selected
    var targets = [];           // movesFrom(selected)
    var lastMove = null;        // {from, to}
    var marks = { highlights: {}, arrows: [] };
    var guided = null;          // {baseFen, moves, captions, index}
    var puzzle = null;          // {lines, ply, solvedLine, tries}
    var pendingPromotion = null;
    var replyTimer = null;
    var locked = false;         // during opponent reply / wrong-move flash

    var root = document.createElement('div');
    root.className = 'dg-board-wrap' + (showCoords ? ' coords' : '');
    root.innerHTML =
      '<div class="dg-board" role="grid" aria-label="Chessboard"></div>' +
      '<svg class="dg-arrows" viewBox="0 0 80 80" aria-hidden="true"></svg>' +
      '<div class="dg-promo hidden"></div>';
    container.appendChild(root);
    var boardEl = root.querySelector('.dg-board');
    var arrowsEl = root.querySelector('.dg-arrows');
    var promoEl = root.querySelector('.dg-promo');

    boardEl.addEventListener('click', onClick);

    function visualSquares() {
      // Squares in DOM order for the current orientation.
      var list = [];
      for (var vr = 0; vr < 8; vr++) {
        for (var vf = 0; vf < 8; vf++) {
          var file = orientation === 'white' ? vf : 7 - vf;
          var rank = orientation === 'white' ? 7 - vr : vr;
          list.push(FILES[file] + (rank + 1));
        }
      }
      return list;
    }

    function render() {
      var squares = visualSquares();
      var checkSq = game.inCheck() ? game.kingSquare(game.turn()) : null;
      var html = '';
      for (var i = 0; i < 64; i++) {
        var sq = squares[i];
        var file = FILES.indexOf(sq[0]);
        var rank = sq.charCodeAt(1) - 49;
        var dark = (file + rank) % 2 === 0;
        var cls = 'sq ' + (dark ? 'dark' : 'light');
        if (selected === sq) cls += ' sel';
        if (lastMove && (lastMove.from === sq || lastMove.to === sq)) cls += ' last-move';
        if (checkSq === sq) cls += ' check';
        var hl = marks.highlights[sq];
        if (hl) cls += ' hl-' + hl;
        var t = null;
        for (var j = 0; j < targets.length; j++) if (targets[j].to === sq) { t = targets[j]; break; }
        if (t) cls += t.capture ? ' ring' : ' dot';

        var piece = game.get(sq);
        var inner = '';
        if (piece !== null) {
          var colour = piece >= 'A' && piece <= 'Z' ? 'w' : 'b';
          inner = '<span class="piece ' + colour + '">' +
            GLYPHS[piece.toUpperCase()] + '︎</span>';
        }
        // Coordinate labels along the two edges nearest the viewer.
        var isLastCol = i % 8 === 7, isLastRow = i >= 56;
        if (showCoords && isLastRow) inner += '<span class="coord file">' + sq[0] + '</span>';
        if (showCoords && isLastCol) inner += '<span class="coord rank">' + sq[1] + '</span>';

        html += '<div class="' + cls + '" data-sq="' + sq + '" role="gridcell" aria-label="' +
          sq + (piece ? ' ' + piece : '') + '">' + inner + '</div>';
      }
      boardEl.innerHTML = html;
      renderArrows();
    }

    function renderArrows() {
      var defs =
        '<defs><marker id="dg-ah" viewBox="0 0 10 10" refX="7" refY="5" ' +
        'markerWidth="3.2" markerHeight="3.2" orient="auto-start-reverse">' +
        '<path d="M 0 0 L 10 5 L 0 10 z"/></marker></defs>';
      var body = '';
      for (var i = 0; i < marks.arrows.length; i++) {
        var a = marks.arrows[i];
        var p1 = centre(a.from), p2 = centre(a.to);
        body += '<line class="arrow ' + (a.colour || 'green') + '" x1="' + p1[0] +
          '" y1="' + p1[1] + '" x2="' + p2[0] + '" y2="' + p2[1] +
          '" marker-end="url(#dg-ah)"/>';
      }
      arrowsEl.innerHTML = defs + body;
      arrowsEl.style.display = marks.arrows.length ? '' : 'none';
    }

    function centre(sq) {
      var file = FILES.indexOf(sq[0]);
      var rank = sq.charCodeAt(1) - 49;
      var vf = orientation === 'white' ? file : 7 - file;
      var vr = orientation === 'white' ? 7 - rank : rank;
      return [vf * 10 + 5, vr * 10 + 5];
    }

    function clearSelection() {
      selected = null;
      targets = [];
    }

    function interactive() {
      return !locked && (mode.mode === 'explore' || mode.mode === 'puzzle');
    }

    function mayPick(sq) {
      var piece = game.get(sq);
      if (piece === null) return false;
      var colour = piece >= 'A' && piece <= 'Z' ? 'w' : 'b';
      if (colour !== game.turn()) return false;
      if (mode.mode === 'explore') {
        if (mode.sides && mode.sides !== 'both' && mode.sides !== colour) return false;
        if (mode.restrictTo && mode.restrictTo.indexOf(sq) === -1) return false;
      }
      if (mode.mode === 'puzzle' && puzzle && puzzle.playerColour !== colour) return false;
      return true;
    }

    function onClick(ev) {
      var cell = ev.target.closest('[data-sq]');
      if (!cell || !interactive()) return;
      var sq = cell.getAttribute('data-sq');

      if (selected) {
        var t = null;
        for (var i = 0; i < targets.length; i++) if (targets[i].to === sq) { t = targets[i]; break; }
        if (t) {
          if (t.promotion) {
            askPromotion(selected, sq);
          } else {
            playUserMove({ from: selected, to: sq });
          }
          return;
        }
      }
      if (mayPick(sq) && sq !== selected) {
        selected = sq;
        targets = game.movesFrom(sq);
      } else {
        clearSelection();
      }
      render();
      if (mode.showLegal === false) {
        // Destinations stay clickable but are not visually marked.
        var dots = boardEl.querySelectorAll('.dot, .ring');
        for (var d = 0; d < dots.length; d++) dots[d].classList.remove('dot', 'ring');
      }
    }

    function askPromotion(from, to) {
      pendingPromotion = { from: from, to: to };
      var colour = game.turn();
      var choices = ['Q', 'R', 'B', 'N'];
      promoEl.innerHTML = choices.map(function (c) {
        return '<button type="button" data-promo="' + c + '">' +
          '<span class="piece ' + colour + '">' + GLYPHS[c] + '︎</span></button>';
      }).join('');
      promoEl.classList.remove('hidden');
    }

    promoEl.addEventListener('click', function (ev) {
      var btn = ev.target.closest('[data-promo]');
      if (!btn || !pendingPromotion) return;
      var spec = {
        from: pendingPromotion.from,
        to: pendingPromotion.to,
        promotion: btn.getAttribute('data-promo')
      };
      promoEl.classList.add('hidden');
      pendingPromotion = null;
      playUserMove(spec);
    });

    function playUserMove(spec) {
      var mover = game.turn();
      var res = game.move(spec);
      if (!res) { clearSelection(); render(); return; }
      lastMove = { from: res.from, to: res.to };
      clearSelection();

      if (mode.mode === 'puzzle') {
        handlePuzzleMove(res);
        return;
      }
      // Solo practice (piece tours): hand the move back to the same side so
      // one piece can be walked around the board.
      if (mode.solo) {
        var parts = game.fen().split(' ');
        parts[1] = mover;
        parts[3] = '-';
        game.load(parts.join(' '));
      }
      render();
      if (mode.onMove) mode.onMove(res, game);
    }

    // ---- puzzle mode -----------------------------------------------------

    function normSan(s) {
      return String(s).replace(/[+#!?]+$/, '').replace(/\s*e\.p\.?$/i, '').replace(/0/g, 'O');
    }

    function handlePuzzleMove(res) {
      var played = normSan(res.san);
      var matched = null;
      for (var i = 0; i < puzzle.lines.length; i++) {
        if (puzzle.eliminated[i]) continue;
        var expected = puzzle.lines[i][puzzle.ply];
        if (expected !== undefined && normSan(expected) === played) { matched = i; break; }
      }

      if (matched === null) {
        puzzle.tries++;
        locked = true;
        render();
        flashWrong(res.to, function () {
          game.undo();
          lastMove = puzzle.lastGoodMove;
          locked = false;
          render();
          if (mode.onWrong) mode.onWrong(res.san, puzzle.tries);
        });
        return;
      }

      // Eliminate lines that no longer match the played move.
      for (var j = 0; j < puzzle.lines.length; j++) {
        var e = puzzle.lines[j][puzzle.ply];
        if (e === undefined || normSan(e) !== played) puzzle.eliminated[j] = true;
      }
      puzzle.ply++;
      puzzle.lastGoodMove = lastMove;
      render();

      var line = puzzle.lines[matched];
      if (puzzle.ply >= line.length) { solve(); return; }

      // Scripted opponent reply.
      locked = true;
      replyTimer = setTimeout(function () {
        var reply = game.moveSan(line[puzzle.ply]);
        if (reply) {
          lastMove = { from: reply.from, to: reply.to };
          puzzle.lastGoodMove = lastMove;
          puzzle.ply++;
        }
        locked = false;
        render();
        if (reply && mode.onOpponentMove) mode.onOpponentMove(reply);
        if (puzzle.ply >= line.length) solve();
      }, mode.replyDelayMs || 450);
    }

    function solve() {
      locked = true;
      if (mode.onSolved) mode.onSolved(puzzle.tries);
    }

    function flashWrong(sq, done) {
      var cell = boardEl.querySelector('[data-sq="' + sq + '"]');
      if (cell) cell.classList.add('wrong');
      setTimeout(done, 500);
    }

    // Reveal the first still-viable solution line by playing it out.
    function revealSolution() {
      if (mode.mode !== 'puzzle' || !puzzle) return;
      locked = true;
      var line = null;
      for (var i = 0; i < puzzle.lines.length; i++) {
        if (!puzzle.eliminated[i]) { line = puzzle.lines[i]; break; }
      }
      if (!line) line = puzzle.lines[0];
      var step = function () {
        if (puzzle.ply >= line.length) {
          if (mode.onSolved) mode.onSolved(puzzle.tries, true);
          return;
        }
        var res = game.moveSan(line[puzzle.ply]);
        if (!res) return; // content is test-validated; defensive only
        lastMove = { from: res.from, to: res.to };
        puzzle.ply++;
        render();
        replyTimer = setTimeout(step, 650);
      };
      step();
    }

    // ---- guided mode -----------------------------------------------------

    function guidedGoto(index) {
      // Stateless: always replay from the base position.
      game.load(guided.baseFen);
      lastMove = null;
      for (var i = 0; i < index; i++) {
        var res = game.moveSan(guided.moves[i]);
        if (res) lastMove = { from: res.from, to: res.to };
      }
      guided.index = index;
      render();
      if (mode.onStep) {
        mode.onStep(index, guided.moves.slice(0, index), game);
      }
    }

    // ---- public API ------------------------------------------------------

    var api = {
      game: game,
      el: root,
      setPosition: function (fen) {
        game.load(fen || DG.Engine.START_FEN);
        lastMove = null;
        clearSelection();
        render();
      },
      setOrientation: function (o) { orientation = o; render(); },
      setMarks: function (m) {
        marks = { highlights: (m && m.highlights) || {}, arrows: (m && m.arrows) || [] };
        render();
      },
      setMode: function (cfg) {
        if (replyTimer) { clearTimeout(replyTimer); replyTimer = null; }
        mode = cfg || { mode: 'static' };
        locked = false;
        guided = null;
        puzzle = null;
        clearSelection();
        pendingPromotion = null;
        promoEl.classList.add('hidden');
        if (cfg.fen !== undefined || cfg.mode === 'guided' || cfg.mode === 'puzzle') {
          game.load(cfg.fen || DG.Engine.START_FEN);
          lastMove = null;
        }
        if (cfg.orientation) orientation = cfg.orientation;
        marks = { highlights: cfg.highlights || {}, arrows: cfg.arrows || [] };

        if (cfg.mode === 'guided') {
          guided = { baseFen: game.fen(), moves: cfg.moves || [], index: 0 };
          render();
          if (mode.onStep) mode.onStep(0, [], game);
        } else if (cfg.mode === 'puzzle') {
          puzzle = {
            lines: cfg.solutions || [],
            eliminated: cfg.solutions ? cfg.solutions.map(function () { return false; }) : [],
            ply: 0,
            tries: 0,
            lastGoodMove: null,
            playerColour: game.turn()
          };
          render();
        } else {
          render();
        }
      },
      guidedNext: function () {
        if (guided && guided.index < guided.moves.length) guidedGoto(guided.index + 1);
        return guided ? guided.index : 0;
      },
      guidedPrev: function () {
        if (guided && guided.index > 0) guidedGoto(guided.index - 1);
        return guided ? guided.index : 0;
      },
      guidedRestart: function () { if (guided) guidedGoto(0); },
      guidedState: function () {
        return guided ? { index: guided.index, total: guided.moves.length } : null;
      },
      revealSolution: revealSolution,
      render: render,
      destroy: function () {
        if (replyTimer) clearTimeout(replyTimer);
        root.remove();
      }
    };

    render();
    return api;
  }

  window.DG = window.DG || {};
  window.DG.Board = { mount: mount };
})();
