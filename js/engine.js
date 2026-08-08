/*
 * engine.js — self-contained chess rules engine for The Daggy's Gambit.
 *
 * 0x88 board representation. Pseudo-legal move generation with a
 * make/unmake legality filter, which keeps pins and the horizontal-pin
 * en-passant case correct without special-casing.
 *
 * Zero DOM / storage references: loadable both as a classic browser
 * script (window.DG.Engine) and via require() in Node for tests.
 */
(function (root, factory) {
  var Engine = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Engine;
  } else {
    root.DG = root.DG || {};
    root.DG.Engine = Engine;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

  var KNIGHT_OFFSETS = [33, 31, 18, 14, -33, -31, -18, -14];
  var KING_OFFSETS = [16, -16, 1, -1, 17, 15, -17, -15];
  var BISHOP_DIRS = [17, 15, -17, -15];
  var ROOK_DIRS = [16, -16, 1, -1];
  var QUEEN_DIRS = KING_OFFSETS;

  // Move flags
  var F_CAPTURE = 1, F_DOUBLE = 2, F_EP = 4, F_CASTLE_K = 8, F_CASTLE_Q = 16, F_PROMO = 32;

  // 0x88 helpers: file = sq & 7, rank = sq >> 4, off-board when (sq & 0x88) !== 0.
  function fileOf(sq) { return sq & 7; }
  function rankOf(sq) { return sq >> 4; }
  function toAlg(sq) { return 'abcdefgh'[fileOf(sq)] + (rankOf(sq) + 1); }
  function fromAlg(alg) {
    if (typeof alg !== 'string' || alg.length !== 2) return -1;
    var f = alg.charCodeAt(0) - 97;
    var r = alg.charCodeAt(1) - 49;
    if (f < 0 || f > 7 || r < 0 || r > 7) return -1;
    return r * 16 + f;
  }
  function isWhitePiece(p) { return p !== null && p >= 'A' && p <= 'Z'; }
  function colourOf(p) { return isWhitePiece(p) ? 'w' : 'b'; }
  function typeOf(p) { return p === null ? null : p.toUpperCase(); }

  function parseFen(fen) {
    if (typeof fen !== 'string') throw new Error('FEN must be a string');
    var parts = fen.trim().split(/\s+/);
    if (parts.length !== 6) throw new Error('FEN must have 6 fields, got ' + parts.length);

    var board = new Array(128).fill(null);
    var ranks = parts[0].split('/');
    if (ranks.length !== 8) throw new Error('FEN board must have 8 ranks');
    for (var r = 0; r < 8; r++) {
      var rank = 7 - r; // FEN starts at rank 8
      var file = 0;
      var row = ranks[r];
      for (var i = 0; i < row.length; i++) {
        var c = row[i];
        if (c >= '1' && c <= '8') {
          file += c.charCodeAt(0) - 48;
        } else if ('pnbrqkPNBRQK'.indexOf(c) !== -1) {
          if (file > 7) throw new Error('FEN rank ' + (rank + 1) + ' overflows');
          board[rank * 16 + file] = c;
          file++;
        } else {
          throw new Error('Invalid FEN character: ' + c);
        }
      }
      if (file !== 8) throw new Error('FEN rank ' + (rank + 1) + ' has ' + file + ' files');
    }

    if (parts[1] !== 'w' && parts[1] !== 'b') throw new Error('FEN side to move must be w or b');

    if (!/^(-|K?Q?k?q?)$/.test(parts[2]) || parts[2] === '') {
      throw new Error('Invalid FEN castling field: ' + parts[2]);
    }
    var castling = {
      K: parts[2].indexOf('K') !== -1,
      Q: parts[2].indexOf('Q') !== -1,
      k: parts[2].indexOf('k') !== -1,
      q: parts[2].indexOf('q') !== -1
    };

    var ep = -1;
    if (parts[3] !== '-') {
      ep = fromAlg(parts[3]);
      if (ep === -1) throw new Error('Invalid FEN en-passant square: ' + parts[3]);
      var epRank = rankOf(ep);
      if ((parts[1] === 'w' && epRank !== 5) || (parts[1] === 'b' && epRank !== 2)) {
        throw new Error('En-passant square inconsistent with side to move');
      }
    }

    var halfmove = parseInt(parts[4], 10);
    var fullmove = parseInt(parts[5], 10);
    if (!(halfmove >= 0)) throw new Error('Invalid halfmove clock');
    if (!(fullmove >= 1)) throw new Error('Invalid fullmove number');

    return { board: board, turn: parts[1], castling: castling, ep: ep, halfmove: halfmove, fullmove: fullmove };
  }

  function create(initialFen) {
    var S = null; // engine state, set by load()

    function load(f) {
      var parsed = parseFen(f || START_FEN);
      var kings = { w: -1, b: -1 };
      for (var sq = 0; sq < 128; sq++) {
        if (sq & 0x88) continue;
        if (parsed.board[sq] === 'K') kings.w = sq;
        if (parsed.board[sq] === 'k') kings.b = sq;
      }
      if (kings.w === -1 || kings.b === -1) throw new Error('FEN must contain both kings');
      S = {
        board: parsed.board,
        turn: parsed.turn,
        castling: parsed.castling,
        ep: parsed.ep,
        halfmove: parsed.halfmove,
        fullmove: parsed.fullmove,
        kings: kings,
        undoStack: [],
        sanHistory: [],
        keys: []
      };
      S.keys.push(positionKey());
    }

    function positionKey() {
      // First four FEN fields identify a position for repetition purposes.
      return fenBoardField() + ' ' + S.turn + ' ' + fenCastlingField() + ' ' + fenEpField();
    }

    function fenBoardField() {
      var out = [];
      for (var rank = 7; rank >= 0; rank--) {
        var row = '', empty = 0;
        for (var file = 0; file < 8; file++) {
          var p = S.board[rank * 16 + file];
          if (p === null) { empty++; continue; }
          if (empty) { row += empty; empty = 0; }
          row += p;
        }
        if (empty) row += empty;
        out.push(row);
      }
      return out.join('/');
    }

    function fenCastlingField() {
      var c = (S.castling.K ? 'K' : '') + (S.castling.Q ? 'Q' : '') +
              (S.castling.k ? 'k' : '') + (S.castling.q ? 'q' : '');
      return c || '-';
    }

    function fenEpField() {
      // Only report the ep square when an en-passant capture is actually
      // possible, so repetition keys compare equal positions equal.
      if (S.ep === -1) return '-';
      var pawn = S.turn === 'w' ? 'P' : 'p';
      var behind = S.turn === 'w' ? -16 : 16;
      var a = S.ep + behind - 1, b = S.ep + behind + 1;
      var possible = (!(a & 0x88) && S.board[a] === pawn) || (!(b & 0x88) && S.board[b] === pawn);
      return possible ? toAlg(S.ep) : '-';
    }

    function fen() {
      return fenBoardField() + ' ' + S.turn + ' ' + fenCastlingField() + ' ' + fenEpField() +
        ' ' + S.halfmove + ' ' + S.fullmove;
    }

    function isSquareAttacked(sq, by) {
      var i, o, from, p;
      // Pawns: a white pawn on sq-15/sq-17 attacks sq; black on sq+15/sq+17.
      if (by === 'w') {
        for (i = 0; i < 2; i++) {
          from = sq - (i === 0 ? 15 : 17);
          if (!(from & 0x88) && S.board[from] === 'P') return true;
        }
      } else {
        for (i = 0; i < 2; i++) {
          from = sq + (i === 0 ? 15 : 17);
          if (!(from & 0x88) && S.board[from] === 'p') return true;
        }
      }
      // Knights and kings
      var knight = by === 'w' ? 'N' : 'n';
      for (i = 0; i < 8; i++) {
        from = sq + KNIGHT_OFFSETS[i];
        if (!(from & 0x88) && S.board[from] === knight) return true;
      }
      var king = by === 'w' ? 'K' : 'k';
      for (i = 0; i < 8; i++) {
        from = sq + KING_OFFSETS[i];
        if (!(from & 0x88) && S.board[from] === king) return true;
      }
      // Sliders
      var rook = by === 'w' ? 'R' : 'r', queen = by === 'w' ? 'Q' : 'q';
      for (i = 0; i < 4; i++) {
        o = ROOK_DIRS[i];
        from = sq + o;
        while (!(from & 0x88)) {
          p = S.board[from];
          if (p !== null) {
            if (p === rook || p === queen) return true;
            break;
          }
          from += o;
        }
      }
      var bishop = by === 'w' ? 'B' : 'b';
      for (i = 0; i < 4; i++) {
        o = BISHOP_DIRS[i];
        from = sq + o;
        while (!(from & 0x88)) {
          p = S.board[from];
          if (p !== null) {
            if (p === bishop || p === queen) return true;
            break;
          }
          from += o;
        }
      }
      return false;
    }

    function pseudoMoves() {
      var moves = [];
      var us = S.turn, them = us === 'w' ? 'b' : 'w';

      function push(from, to, piece, flags, captured, promotion) {
        moves.push({
          from: from, to: to, piece: piece,
          captured: captured || null, promotion: promotion || null, flags: flags
        });
      }

      function pushPawn(from, to, piece, flags, captured) {
        var lastRank = us === 'w' ? 7 : 0;
        if (rankOf(to) === lastRank) {
          var promos = us === 'w' ? ['Q', 'R', 'B', 'N'] : ['q', 'r', 'b', 'n'];
          for (var i = 0; i < 4; i++) push(from, to, piece, flags | F_PROMO, captured, promos[i]);
        } else {
          push(from, to, piece, flags, captured);
        }
      }

      for (var sq = 0; sq < 128; sq++) {
        if (sq & 0x88) continue;
        var p = S.board[sq];
        if (p === null || colourOf(p) !== us) continue;
        var t = typeOf(p), i, o, to, target;

        if (t === 'P') {
          var fwd = us === 'w' ? 16 : -16;
          var startRank = us === 'w' ? 1 : 6;
          to = sq + fwd;
          if (!(to & 0x88) && S.board[to] === null) {
            pushPawn(sq, to, p, 0, null);
            var to2 = sq + 2 * fwd;
            if (rankOf(sq) === startRank && S.board[to2] === null) {
              push(sq, to2, p, F_DOUBLE, null);
            }
          }
          for (i = 0; i < 2; i++) {
            to = sq + fwd + (i === 0 ? -1 : 1);
            if (to & 0x88) continue;
            target = S.board[to];
            if (target !== null && colourOf(target) === them) {
              pushPawn(sq, to, p, F_CAPTURE, target);
            } else if (to === S.ep) {
              push(sq, to, p, F_CAPTURE | F_EP, us === 'w' ? 'p' : 'P');
            }
          }
        } else if (t === 'N' || t === 'K') {
          var offsets = t === 'N' ? KNIGHT_OFFSETS : KING_OFFSETS;
          for (i = 0; i < 8; i++) {
            to = sq + offsets[i];
            if (to & 0x88) continue;
            target = S.board[to];
            if (target === null) push(sq, to, p, 0, null);
            else if (colourOf(target) === them) push(sq, to, p, F_CAPTURE, target);
          }
        } else {
          var dirs = t === 'B' ? BISHOP_DIRS : t === 'R' ? ROOK_DIRS : QUEEN_DIRS;
          for (i = 0; i < dirs.length; i++) {
            o = dirs[i];
            to = sq + o;
            while (!(to & 0x88)) {
              target = S.board[to];
              if (target === null) {
                push(sq, to, p, 0, null);
              } else {
                if (colourOf(target) === them) push(sq, to, p, F_CAPTURE, target);
                break;
              }
              to += o;
            }
          }
        }
      }

      // Castling. Empty path, king not in check, and the squares the king
      // crosses/lands on not attacked. b-file square only needs to be empty.
      var e = us === 'w' ? fromAlg('e1') : fromAlg('e8');
      if (S.board[e] === (us === 'w' ? 'K' : 'k') && !isSquareAttacked(e, them)) {
        var rightK = us === 'w' ? S.castling.K : S.castling.k;
        var rightQ = us === 'w' ? S.castling.Q : S.castling.q;
        if (rightK && S.board[e + 1] === null && S.board[e + 2] === null &&
            !isSquareAttacked(e + 1, them) && !isSquareAttacked(e + 2, them)) {
          push(e, e + 2, S.board[e], F_CASTLE_K, null);
        }
        if (rightQ && S.board[e - 1] === null && S.board[e - 2] === null && S.board[e - 3] === null &&
            !isSquareAttacked(e - 1, them) && !isSquareAttacked(e - 2, them)) {
          push(e, e - 2, S.board[e], F_CASTLE_Q, null);
        }
      }

      return moves;
    }

    function makeMove(m) {
      var us = S.turn, them = us === 'w' ? 'b' : 'w';
      var undo = {
        move: m,
        castling: { K: S.castling.K, Q: S.castling.Q, k: S.castling.k, q: S.castling.q },
        ep: S.ep,
        halfmove: S.halfmove,
        epCapturedSq: -1
      };

      S.board[m.from] = null;
      S.board[m.to] = m.promotion || m.piece;

      if (m.flags & F_EP) {
        var capSq = m.to + (us === 'w' ? -16 : 16);
        S.board[capSq] = null;
        undo.epCapturedSq = capSq;
      }
      if (m.flags & F_CASTLE_K) {
        S.board[m.to - 1] = S.board[m.to + 1];
        S.board[m.to + 1] = null;
      }
      if (m.flags & F_CASTLE_Q) {
        S.board[m.to + 1] = S.board[m.to - 2];
        S.board[m.to - 2] = null;
      }

      if (typeOf(m.piece) === 'K') {
        S.kings[us] = m.to;
        if (us === 'w') { S.castling.K = false; S.castling.Q = false; }
        else { S.castling.k = false; S.castling.q = false; }
      }
      // Rook moved off, or anything captured on, a rook home square.
      var A1 = 0, H1 = 7, A8 = 112, H8 = 119;
      if (m.from === H1 || m.to === H1) S.castling.K = false;
      if (m.from === A1 || m.to === A1) S.castling.Q = false;
      if (m.from === H8 || m.to === H8) S.castling.k = false;
      if (m.from === A8 || m.to === A8) S.castling.q = false;

      S.ep = (m.flags & F_DOUBLE) ? (m.from + m.to) / 2 : -1;
      S.halfmove = (typeOf(m.piece) === 'P' || (m.flags & F_CAPTURE)) ? 0 : S.halfmove + 1;
      if (us === 'b') S.fullmove++;
      S.turn = them;

      S.undoStack.push(undo);
      S.keys.push(positionKey());
      return undo;
    }

    function unmakeMove() {
      var undo = S.undoStack.pop();
      if (!undo) return null;
      S.keys.pop();
      var m = undo.move;
      var them = S.turn, us = them === 'w' ? 'b' : 'w';

      S.board[m.from] = m.piece;
      S.board[m.to] = null;
      if (m.flags & F_EP) {
        S.board[undo.epCapturedSq] = m.captured;
      } else if (m.captured) {
        S.board[m.to] = m.captured;
      }
      if (m.flags & F_CASTLE_K) {
        S.board[m.to + 1] = S.board[m.to - 1];
        S.board[m.to - 1] = null;
      }
      if (m.flags & F_CASTLE_Q) {
        S.board[m.to - 2] = S.board[m.to + 1];
        S.board[m.to + 1] = null;
      }
      if (typeOf(m.piece) === 'K') S.kings[us] = m.from;

      S.castling = undo.castling;
      S.ep = undo.ep;
      S.halfmove = undo.halfmove;
      if (us === 'b') S.fullmove--;
      S.turn = us;
      return m;
    }

    function legalMoves() {
      var us = S.turn, them = us === 'w' ? 'b' : 'w';
      var pseudo = pseudoMoves();
      var legal = [];
      for (var i = 0; i < pseudo.length; i++) {
        makeMove(pseudo[i]);
        if (!isSquareAttacked(S.kings[us], them)) legal.push(pseudo[i]);
        unmakeMove();
      }
      return legal;
    }

    function inCheck() {
      var them = S.turn === 'w' ? 'b' : 'w';
      return isSquareAttacked(S.kings[S.turn], them);
    }

    function isCheckmate() { return inCheck() && legalMoves().length === 0; }
    function isStalemate() { return !inCheck() && legalMoves().length === 0; }

    function countRepetitions() {
      var key = S.keys[S.keys.length - 1];
      var n = 0;
      for (var i = 0; i < S.keys.length; i++) if (S.keys[i] === key) n++;
      return n;
    }

    function insufficientMaterial() {
      var minors = { w: 0, b: 0 };
      var bishopColours = [];
      for (var sq = 0; sq < 128; sq++) {
        if (sq & 0x88) continue;
        var p = S.board[sq];
        if (p === null) continue;
        var t = typeOf(p);
        if (t === 'K') continue;
        if (t === 'P' || t === 'R' || t === 'Q') return false;
        minors[colourOf(p)]++;
        if (t === 'B') bishopColours.push((fileOf(sq) + rankOf(sq)) % 2);
      }
      var total = minors.w + minors.b;
      if (total <= 1) return true; // K vs K, or K+minor vs K
      // Only bishops, all on the same square colour (any number, either side).
      if (bishopColours.length === total) {
        var first = bishopColours[0];
        return bishopColours.every(function (c) { return c === first; });
      }
      return false;
    }

    function isDraw() {
      if (isStalemate()) return { draw: true, reason: 'stalemate' };
      if (S.halfmove >= 100 && !isCheckmate()) return { draw: true, reason: 'fifty' };
      if (countRepetitions() >= 3) return { draw: true, reason: 'threefold' };
      if (insufficientMaterial()) return { draw: true, reason: 'material' };
      return { draw: false, reason: null };
    }

    // SAN for a legal move, without the +/# suffix.
    function sanBase(m, legal) {
      if (m.flags & F_CASTLE_K) return 'O-O';
      if (m.flags & F_CASTLE_Q) return 'O-O-O';
      var t = typeOf(m.piece);
      var out = '';
      if (t === 'P') {
        if (m.flags & F_CAPTURE) out += 'abcdefgh'[fileOf(m.from)] + 'x';
        out += toAlg(m.to);
        if (m.promotion) out += '=' + typeOf(m.promotion);
        return out;
      }
      out = t;
      // Disambiguation against other legal moves of the same piece type to
      // the same destination.
      var sameFile = false, sameRank = false, ambiguous = false;
      for (var i = 0; i < legal.length; i++) {
        var o = legal[i];
        if (o.from === m.from) continue;
        if (o.to !== m.to || typeOf(o.piece) !== t) continue;
        ambiguous = true;
        if (fileOf(o.from) === fileOf(m.from)) sameFile = true;
        if (rankOf(o.from) === rankOf(m.from)) sameRank = true;
      }
      if (ambiguous) {
        if (!sameFile) out += 'abcdefgh'[fileOf(m.from)];
        else if (!sameRank) out += (rankOf(m.from) + 1);
        else out += toAlg(m.from);
      }
      if (m.flags & F_CAPTURE) out += 'x';
      out += toAlg(m.to);
      return out;
    }

    function sanSuffix(m) {
      makeMove(m);
      var suffix = '';
      if (inCheck()) suffix = legalMoves().length === 0 ? '#' : '+';
      unmakeMove();
      return suffix;
    }

    function san(m) {
      return sanBase(m, legalMoves()) + sanSuffix(m);
    }

    function moveResult(m, legal) {
      return {
        from: toAlg(m.from),
        to: toAlg(m.to),
        piece: m.piece,
        captured: m.captured,
        promotion: m.promotion,
        san: sanBase(m, legal),
        flags: m.flags
      };
    }

    // Applies a legal move given as {from:'e2', to:'e4', promotion:'q'?}.
    // Returns {san, from, to, ...} or null if not legal.
    function move(spec) {
      var from = fromAlg(spec.from), to = fromAlg(spec.to);
      var promo = spec.promotion ? typeOf(spec.promotion) : null;
      var legal = legalMoves();
      for (var i = 0; i < legal.length; i++) {
        var m = legal[i];
        if (m.from !== from || m.to !== to) continue;
        if (m.promotion && typeOf(m.promotion) !== (promo || 'Q')) continue;
        var res = moveResult(m, legal);
        res.san += sanSuffix(m);
        makeMove(m);
        S.sanHistory.push(res.san);
        return res;
      }
      return null;
    }

    function normaliseSan(s) {
      return s.replace(/[+#!?]+$/, '').replace(/\s*e\.p\.?$/i, '').replace(/0/g, 'O');
    }

    // Applies a move given in SAN (e.g. 'Nf3', 'exd6', 'O-O', 'e8=Q#').
    function moveSan(sanIn) {
      var want = normaliseSan(String(sanIn).trim());
      var legal = legalMoves();
      for (var i = 0; i < legal.length; i++) {
        if (normaliseSan(sanBase(legal[i], legal)) === want) {
          var res = moveResult(legal[i], legal);
          res.san += sanSuffix(legal[i]);
          makeMove(legal[i]);
          S.sanHistory.push(res.san);
          return res;
        }
      }
      return null;
    }

    function undo() {
      var m = unmakeMove();
      if (m) S.sanHistory.pop();
      return m ? { from: toAlg(m.from), to: toAlg(m.to) } : null;
    }

    function boardGrid() {
      var grid = [];
      for (var rank = 7; rank >= 0; rank--) {
        var row = [];
        for (var file = 0; file < 8; file++) row.push(S.board[rank * 16 + file]);
        grid.push(row);
      }
      return grid;
    }

    function movesFrom(alg) {
      var from = fromAlg(alg);
      if (from === -1) return [];
      return legalMoves().filter(function (m) { return m.from === from; })
        .map(function (m) {
          return {
            from: toAlg(m.from), to: toAlg(m.to),
            capture: !!(m.flags & F_CAPTURE),
            promotion: !!(m.flags & F_PROMO),
            castle: !!(m.flags & (F_CASTLE_K | F_CASTLE_Q))
          };
        });
    }

    function moves() {
      var legal = legalMoves();
      return legal.map(function (m) {
        var res = moveResult(m, legal);
        res.san += sanSuffix(m);
        return res;
      });
    }

    function perft(depth) {
      if (depth === 0) return 1;
      var legal = legalMoves();
      if (depth === 1) return legal.length;
      var nodes = 0;
      for (var i = 0; i < legal.length; i++) {
        makeMove(legal[i]);
        nodes += perft(depth - 1);
        unmakeMove();
      }
      return nodes;
    }

    load(initialFen);

    return {
      load: load,
      fen: fen,
      turn: function () { return S.turn; },
      get: function (alg) { var sq = fromAlg(alg); return sq === -1 ? null : S.board[sq]; },
      board: boardGrid,
      movesFrom: movesFrom,
      moves: moves,
      move: move,
      moveSan: moveSan,
      undo: undo,
      inCheck: inCheck,
      isCheckmate: isCheckmate,
      isStalemate: isStalemate,
      isDraw: isDraw,
      history: function () { return S.sanHistory.slice(); },
      kingSquare: function (colour) { return toAlg(S.kings[colour || S.turn]); },
      perft: perft
    };
  }

  function validateFen(fen) {
    var parsed;
    try {
      parsed = parseFen(fen);
    } catch (e) {
      return { ok: false, error: e.message };
    }
    var kings = { K: 0, k: 0 };
    for (var sq = 0; sq < 128; sq++) {
      if (sq & 0x88) continue;
      var p = parsed.board[sq];
      if (p === 'K') kings.K++;
      if (p === 'k') kings.k++;
      if ((p === 'P' || p === 'p') && (rankOf(sq) === 0 || rankOf(sq) === 7)) {
        return { ok: false, error: 'Pawn on rank ' + (rankOf(sq) + 1) };
      }
    }
    if (kings.K !== 1 || kings.k !== 1) {
      return { ok: false, error: 'Each side must have exactly one king' };
    }
    try {
      create(fen);
      // The side NOT to move must not be in check (otherwise the position is
      // unreachable/illegal). Reload with the turn swapped and ep cleared —
      // the ep field would be inconsistent for the other side.
      var parts = fen.trim().split(/\s+/);
      parts[1] = parts[1] === 'w' ? 'b' : 'w';
      parts[3] = '-';
      if (create(parts.join(' ')).inCheck()) {
        return { ok: false, error: 'Side not to move is in check' };
      }
    } catch (e) {
      return { ok: false, error: e.message };
    }
    return { ok: true };
  }

  return {
    create: create,
    validateFen: validateFen,
    START_FEN: START_FEN,
    toAlg: toAlg,
    fromAlg: fromAlg
  };
});
