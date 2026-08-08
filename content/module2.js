/* Module 2 — Reading, Writing and Opening the Game. Declarative lesson data only. */
(function () {
  'use strict';

  DG.CONTENT.push({
    id: 'm2-01-notation-1',
    module: 2,
    title: 'Algebraic Notation I — naming squares and moves',
    minutes: 4,
    steps: [
      {
        type: 'text',
        html: '<p>Notation is the coordinate system you already met, turned into a language. A move is written as ' +
          '<b>piece letter + destination square</b>:</p>' +
          '<ul><li><code>K</code> king, <code>Q</code> queen, <code>R</code> rook, <code>B</code> bishop, ' +
          '<code>N</code> knight (K is taken, and in your other languages it’s a horse anyway).</li>' +
          '<li>The <b>pawn has no letter</b>: a pawn move is just the destination — <code>e4</code> means “pawn to e4”.</li></ul>' +
          '<p>So <code>Nf3</code> = knight to f3, <code>Qd2</code> = queen to d2, <code>c5</code> = pawn to c5. ' +
          'Moves are numbered in pairs: <code>1.e4 c5</code> is White’s first move then Black’s.</p>'
      },
      {
        type: 'quiz',
        boardFen: '4k3/8/8/8/4N3/8/8/4K3 w - - 0 1',
        highlights: { e4: 'yellow' },
        question: 'The knight stands on the highlighted square. Which square is it?',
        choices: ['e4', 'd4', 'e5', 'd5'],
        answer: 0,
        explain: 'File e (fifth from the left, from White’s view), rank 4 (fourth from the bottom): e4.'
      },
      {
        type: 'quiz',
        question: 'How would you write “knight moves to c6”?',
        choices: ['Nc6', 'Kc6', 'c6', 'N–c6'],
        answer: 0,
        explain: 'Piece letter + destination, no separator. Kc6 would be the king; bare c6 would be a pawn move.'
      },
      {
        type: 'quiz',
        question: 'What does the bare move «e5» mean?',
        choices: ['A pawn moves to e5', 'Any piece moves to e5', 'The e-pawn is captured'],
        answer: 0,
        explain: 'No letter = pawn. Most moves in a game score are pawn moves and read exactly like this.'
      },
      {
        type: 'recap',
        points: [
          'Move = piece letter + destination: Nf3, Qd2.',
          'Pawns have no letter: e4 is a pawn move.',
          'Numbered in pairs: 1.e4 c5 2.Nf3 …'
        ]
      }
    ]
  });

  DG.CONTENT.push({
    id: 'm2-02-notation-2',
    module: 2,
    title: 'Algebraic Notation II — captures, check and special moves',
    minutes: 5,
    steps: [
      {
        type: 'text',
        html: '<p>The remaining symbols, and then you can read any chess book or app:</p>' +
          '<ul>' +
          '<li><code>x</code> — capture: <code>Nxe5</code>. A pawn capturing states its file first: <code>exd5</code>.</li>' +
          '<li><code>+</code> — check: <code>Bb5+</code>. &nbsp;<code>#</code> — checkmate: <code>Qf7#</code>.</li>' +
          '<li><code>O-O</code> / <code>O-O-O</code> — kingside / queenside castling.</li>' +
          '<li><code>=Q</code> — promotion: <code>e8=Q</code> (or <code>=N</code>, <code>=R</code>, <code>=B</code>).</li>' +
          '<li><b>Disambiguation:</b> if two identical pieces can reach the square, add the origin file (or rank): ' +
          '<code>Nbd2</code> = the knight <i>from the b-file</i> goes to d2; <code>R1e2</code> = the rook from rank 1.</li>' +
          '</ul>'
      },
      {
        type: 'sequence',
        moves: ['e4', 'e5', 'Bc4', 'Nc6', 'Qh5', 'Nf6', 'Qxf7#'],
        captions: [
          'Read a whole (in)famous game — Scholar’s Mate — while watching the move list grow below the board.',
          '1.e4 — pawn move: destination only.',
          '1…e5 — the ellipsis (…) marks a Black move quoted alone.',
          '2.Bc4 — piece letter + square.',
          '2…Nc6 — develops, but misses the building threat.',
          '3.Qh5 — the queen eyes both e5 and f7; premature, but instructive.',
          '3…Nf6?? — attacks the queen yet ignores f7. A losing blunder — the ?? suffix marks it.',
          '4.Qxf7# — capture (x) plus checkmate (#) in one symbol-dense move. Defend f7 early!'
        ],
        intro: 'Step through and read each move’s notation in the caption and the move list.'
      },
      {
        type: 'quiz',
        question: 'What does «exd5» say, precisely?',
        choices: ['The e-file pawn captures on d5', 'The e-pawn moves to d5', 'A bishop captures on d5'],
        answer: 0,
        explain: 'A pawn capture names its origin file, then x, then the destination.'
      },
      {
        type: 'quiz',
        question: 'Both your knights (on b1 and f3) can reach d2. How do you write “the b-knight goes to d2”?',
        choices: ['Nbd2', 'N1d2', 'Nd2b', 'Nd2'],
        answer: 0,
        explain: 'Add the origin file straight after the piece letter. Bare Nd2 would be ambiguous, so it’s not legal notation here.'
      },
      {
        type: 'recap',
        points: [
          'x capture, + check, # mate, O-O castling, =Q promotion.',
          'Pawn captures: origin file first (exd5).',
          'Ambiguity resolved by origin file or rank (Nbd2, R1e2).'
        ]
      }
    ]
  });

  DG.CONTENT.push({
    id: 'm2-03-principles',
    module: 2,
    title: 'Opening Principles — three rules and their reasons',
    minutes: 5,
    steps: [
      {
        type: 'text',
        html: '<p>The opening phase has a clear objective function, and three rules serve it:</p>' +
          '<ol>' +
          '<li><b>Control the centre.</b> The four squares e4, d4, e5, d5 are where pieces reach maximum power ' +
          '(remember: knight in the centre = 8 squares, in the corner = 2). Occupy or aim at them.</li>' +
          '<li><b>Develop minor pieces before the queen.</b> Knights and bishops out early; the queen entering too ' +
          'soon becomes a target — every attack on her costs you a move to save her.</li>' +
          '<li><b>Castle early.</b> Usually within the first ten moves — an uncastled king in the centre is where ' +
          'most quick losses happen (you watched one in the last lesson).</li>' +
          '</ol>' +
          '<p>A useful corollary: <b>don’t move the same piece twice</b> in the opening without a concrete reason — ' +
          'each repeat move is a development move your opponent gets for free.</p>'
      },
      {
        type: 'board', mode: 'static', fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        highlights: { e4: 'yellow', d4: 'yellow', e5: 'yellow', d5: 'yellow' },
        caption: 'The centre. Every opening you’ll learn is, at heart, a plan for these four squares.'
      },
      {
        type: 'quiz',
        boardFen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
        question: 'After 1.e4, which Black reply best follows the principles?',
        choices: ['e5 — stake a claim in the centre', 'a5 — expand on the wing', 'Qh4?? — attack at once', 'Nh6 — develop to the rim'],
        answer: 0,
        explain: 'e5 contests the centre immediately. a5 ignores it, Nh6 develops to the board’s weakest region, and the ' +
          'early queen sortie invites attacks that develop White’s pieces for free.'
      },
      {
        type: 'quiz',
        question: 'You’ve played 1.e4 and 2.Nf3. Your knight is attacked by a pawn and must move again. Is the “don’t move twice” rule broken?',
        choices: ['No — a concrete threat overrides the guideline', 'Yes — you must leave the knight', 'Yes — the rule is absolute'],
        answer: 0,
        explain: 'The principles are heuristics serving a goal, not laws. Concrete tactics — a hanging piece, a threat — ' +
          'always take priority. Module 3’s checklist makes this explicit.'
      },
      {
        type: 'recap',
        points: [
          'Centre, development, castling — in roughly that order of thought.',
          'Queen out late; minor pieces out early.',
          'Principles yield to concrete tactics — always.'
        ]
      }
    ]
  });

  DG.CONTENT.push({
    id: 'm2-04-italian',
    module: 2,
    title: 'The Italian Game',
    minutes: 4,
    steps: [
      {
        type: 'text',
        html: '<p>Your first named opening — and given your daily Italian, a fitting start: the <b>Italian Game</b> ' +
          '(<i>Giuoco Piano</i>, “quiet game”, in its classical form).</p>' +
          '<p><b>The idea in one line:</b> develop fast and point the bishop at f7 — Black’s weakest square, defended ' +
          'only by the king.</p>'
      },
      {
        type: 'sequence',
        moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4'],
        captions: [
          'The Italian in three White moves.',
          '1.e4 — centre.',
          '1…e5 — symmetric reply.',
          '2.Nf3 — develops and attacks e5: development with a threat.',
          '2…Nc6 — develops and defends e5: the economical answer.',
          '3.Bc4 — the Italian bishop. It eyes f7 and White is one move from castling. Every principle satisfied.'
        ]
      },
      {
        type: 'quiz',
        boardFen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
        question: 'You’re White, move 3 (position after 2…Nc6). Which move enters the Italian Game — and best fits the principles?',
        choices: ['Bc4', 'Qh5', 'a3', 'Ng5'],
        answer: 0,
        explain: 'Bc4 develops a new piece towards the centre and f7. Qh5 is the premature queen, a3 develops nothing, ' +
          'and Ng5 moves the same piece twice for a threat Black parries with one move.'
      },
      {
        type: 'recap',
        points: [
          '1.e4 e5 2.Nf3 Nc6 3.Bc4.',
          'Idea: rapid development, bishop aimed at f7.',
          'Calm, principled, and playable for a lifetime.'
        ]
      }
    ]
  });

  DG.CONTENT.push({
    id: 'm2-05-ruy',
    module: 2,
    title: 'The Ruy López',
    minutes: 4,
    steps: [
      {
        type: 'text',
        html: '<p>Same start, one different bishop square — and a different philosophy. The <b>Ruy López</b> ' +
          '(or Spanish Game) is perhaps the most analysed opening in chess.</p>' +
          '<p><b>The idea in one line:</b> attack the c6-knight — the defender of e5 — and build long-term pressure ' +
          'on the centre rather than a quick strike.</p>'
      },
      {
        type: 'sequence',
        moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5'],
        captions: [
          'Two moves shared with the Italian, then the fork in the road.',
          '1.e4 — as before.',
          '1…e5 — as before.',
          '2.Nf3 — attacking e5, as before.',
          '2…Nc6 — defending e5, as before.',
          '3.Bb5 — the Spanish bishop. Not aimed at f7 but at c6: pressure the piece that defends e5. Slower poison than the Italian.'
        ]
      },
      {
        type: 'quiz',
        question: 'Italian (3.Bc4) versus Ruy López (3.Bb5): what is the essential difference in the bishop’s target?',
        choices: [
          'Bc4 targets the f7 square; Bb5 targets the knight defending e5',
          'Bb5 is aimed at f7 from further away',
          'No real difference — both just develop'
        ],
        answer: 0,
        explain: 'That’s the whole story: c4 points at the king’s weakest square, b5 points at e5’s defender. One square, two strategies.'
      },
      {
        type: 'recap',
        points: [
          '1.e4 e5 2.Nf3 Nc6 3.Bb5.',
          'Idea: pressure the defender of e5; long-term central pressure.',
          'Same moves as the Italian until move 3 — compare them consciously.'
        ]
      }
    ]
  });

  DG.CONTENT.push({
    id: 'm2-06-queens-gambit',
    module: 2,
    title: 'The Queen’s Gambit',
    minutes: 4,
    steps: [
      {
        type: 'text',
        html: '<p>Now the other half of the opening universe: games that start <b>1.d4</b>. The <b>Queen’s Gambit</b> ' +
          'is its classical main road.</p>' +
          '<p><b>The idea in one line:</b> offer the c-pawn to lure Black’s d-pawn away from the centre — a ' +
          '“gambit” that isn’t really a sacrifice, because the pawn is almost always recoverable.</p>'
      },
      {
        type: 'sequence',
        moves: ['d4', 'd5', 'c4', 'dxc4', 'e3', 'b5', 'a4', 'c6', 'axb5', 'cxb5', 'Qf3'],
        captions: [
          'The offer — and what happens if Black greedily tries to keep the pawn.',
          '1.d4 — centre, queen’s side of it.',
          '1…d5 — the symmetric reply.',
          '2.c4 — the Queen’s Gambit: take me, says the c-pawn.',
          '2…dxc4 — “Gambit Accepted”. Black’s d-pawn has left the centre — which was the point.',
          '3.e3 — opening the bishop’s path to c4 to recover the pawn.',
          '3…b5? — trying to keep it. Watch this fail.',
          '4.a4 — attacking the pawn chain’s base.',
          '4…c6 — propping up b5.',
          '5.axb5 — removing the prop…',
          '5…cxb5 — recapturing, but now the a8-rook hangs behind it…',
          '6.Qf3! — the long diagonal is open all the way to the loose rook on a8, and Black cannot defend it properly. The material comes back with interest. Moral: accept the gambit if you like, but don’t cling to the pawn.'
        ]
      },
      {
        type: 'quiz',
        question: 'Why is the Queen’s Gambit “not really a sacrifice”?',
        choices: [
          'White regains the pawn easily if Black tries to keep it',
          'Because Black must decline it',
          'Because a c-pawn has no value'
        ],
        answer: 0,
        explain: 'As the sequence showed: clinging to c4 with …b5 collapses to a4 and axb5. Black does better returning it and developing.'
      },
      {
        type: 'recap',
        points: [
          '1.d4 d5 2.c4 — offer the wing pawn, bend the centre.',
          'Accepted or declined, White gets central pressure.',
          'A “gambit” in name; the pawn is recoverable.'
        ]
      }
    ]
  });

  DG.CONTENT.push({
    id: 'm2-07-sicilian',
    module: 2,
    title: 'The Sicilian Defence',
    minutes: 4,
    steps: [
      {
        type: 'text',
        html: '<p>Black’s most popular — and sharpest — answer to 1.e4, and another Italian name for your collection.</p>' +
          '<p><b>The idea in one line:</b> fight for the centre <b>asymmetrically</b> — instead of mirroring with ' +
          '1…e5, the c-pawn contests d4 from the side, keeping winning chances alive for Black at the cost of sharper play.</p>'
      },
      {
        type: 'sequence',
        moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3'],
        captions: [
          'The Open Sicilian — the main battlefield.',
          '1.e4 — White claims the centre.',
          '1…c5 — the Sicilian: no mirror, but d4 is now contested from c5.',
          '2.Nf3 — preparing d4 anyway.',
          '2…d6 — restraining e4–e5 and freeing the c8-bishop.',
          '3.d4 — White insists.',
          '3…cxd4 — Black trades the wing pawn for a central one — a structural bargain.',
          '4.Nxd4 — recapture; White has more central space.',
          '4…Nf6 — developing with an attack on e4.',
          '5.Nc3 — defending e4. Both sides armed: White has space, Black has the long-term pawn-structure trade in the bank.'
        ]
      },
      {
        type: 'quiz',
        boardFen: 'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
        question: 'You’re White facing 1…c5. Which follow-up leads into the main, principled Open Sicilian plan?',
        choices: ['Nf3 then d4', 'Qh5 immediately', 'a4 to stop …b5', 'Bb5 at once'],
        answer: 0,
        explain: 'Nf3 prepares d4; after …cxd4 Nxd4 White develops with a space advantage. The queen sortie and wing moves ignore the centre.'
      },
      {
        type: 'recap',
        points: [
          '1.e4 c5 — asymmetry by design.',
          'Black trades the c-pawn for White’s d-pawn: structure v space.',
          'Sharpest mainstream defence; enormous theory, simple core idea.'
        ]
      }
    ]
  });

  DG.CONTENT.push({
    id: 'm2-08-london',
    module: 2,
    title: 'The London System — and naming what you see',
    minutes: 5,
    steps: [
      {
        type: 'text',
        html: '<p>Last of the five: the <b>London System</b> — less an opening than a <b>setup</b> White can aim for ' +
          'against almost anything Black does. Popular from club level to world champions precisely because the plan ' +
          'is the same every game.</p>' +
          '<p><b>The idea in one line:</b> d4, Bf4 (the bishop OUT before the pawn chain closes it in), e3, c3, Bd3, ' +
          'Nbd2, castle — a solid pyramid with no early theory required.</p>'
      },
      {
        type: 'sequence',
        moves: ['d4', 'd5', 'Nf3', 'Nf6', 'Bf4', 'e6', 'e3', 'Bd6', 'Bg3'],
        captions: [
          'The London setup taking shape.',
          '1.d4 — as in the Queen’s Gambit.',
          '1…d5 — Black holds the centre.',
          '2.Nf3 — flexible development.',
          '2…Nf6 — likewise.',
          '3.Bf4 — the London move: this bishop gets out <i>before</i> e3 would lock it behind the pawns.',
          '3…e6 — Black frees the other bishop.',
          '4.e3 — now the pawn triangle c3–d4–e3 can form behind the developed bishop.',
          '4…Bd6 — challenging the London bishop.',
          '5.Bg3 — keeping it: the structure stays intact, and the plan (Bd3, Nbd2, O-O) continues regardless of what Black plays.'
        ]
      },
      {
        type: 'quiz',
        question: 'What makes 3.Bf4 the defining London move?',
        choices: [
          'The bishop develops outside the pawn chain before e3 closes it in',
          'It attacks f7',
          'It prepares queenside castling'
        ],
        answer: 0,
        explain: 'Play e3 first and the c1-bishop is walled in. Bishop first, pawns after — that ordering is the system.'
      },
      {
        type: 'text',
        html: '<p><b>Closing test:</b> can you recognise the five openings from their positions alone? ' +
          'This is exactly the skill of reading a position like a sentence.</p>'
      },
      {
        type: 'quiz',
        boardFen: 'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
        question: 'Name this opening.',
        choices: ['Ruy López', 'Italian Game', 'London System', 'Queen’s Gambit'],
        answer: 0,
        explain: 'Bishop on b5 pressuring the c6-knight: the Spanish bishop. On c4 it would be the Italian.'
      },
      {
        type: 'quiz',
        boardFen: 'rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 2',
        question: 'And this one?',
        choices: ['Queen’s Gambit', 'Sicilian Defence', 'London System', 'Italian Game'],
        answer: 0,
        explain: 'd4 + c4 versus …d5: the c-pawn offer is the Queen’s Gambit signature.'
      },
      {
        type: 'quiz',
        boardFen: 'rnbqkb1r/ppp1pppp/5n2/3p4/3P1B2/5N2/PPP1PPPP/RN1QKB1R b KQkq - 3 3',
        question: 'Last one.',
        choices: ['London System', 'Ruy López', 'Queen’s Gambit', 'Sicilian Defence'],
        answer: 0,
        explain: 'd4 with the bishop already on f4, pawn still on e2: the London pyramid under construction. ' +
          'That completes Module 2 — Module 3 turns to winning ideas.'
      },
      {
        type: 'recap',
        points: [
          'London: same solid setup against nearly everything — d4, Bf4, e3, c3.',
          'Five openings known: Italian, Ruy López, Queen’s Gambit, Sicilian, London.',
          'You can now read, write and name chess — next: tactics.'
        ]
      }
    ]
  });
})();
