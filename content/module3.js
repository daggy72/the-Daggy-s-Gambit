/* Module 3 — Tactics, Strategy and How to Think. Declarative lesson data only. */
(function () {
  'use strict';

  DG.CONTENT.push({
    id: 'm3-01-pin',
    module: 3,
    title: 'The Pin',
    minutes: 5,
    steps: [
      {
        type: 'text',
        html: '<p>Tactics are short forcing sequences that win material or mate. First pattern: the <b>pin</b> — ' +
          'a straight-line attack through one piece onto a more valuable one behind it. The front piece is “pinned”: ' +
          'moving it exposes what’s behind.</p>' +
          '<ul><li><b>Absolute pin:</b> the piece behind is the king — moving the pinned piece is <i>illegal</i>.</li>' +
          '<li><b>Relative pin:</b> the piece behind is merely valuable — moving is legal but loses material.</li></ul>' +
          '<p>Only line pieces pin: bishops, rooks, queens. Never the jumping knight.</p>'
      },
      {
        type: 'board', mode: 'static', fen: '4k3/8/2n5/1B6/8/8/8/4K3 b - - 0 1',
        arrows: [{ from: 'b5', to: 'e8', colour: 'red' }],
        caption: 'An absolute pin: the bishop’s line runs through the knight to the king. Tap-test it mentally — the ' +
          'knight has zero legal moves. It is temporarily not a piece, only an obstacle.'
      },
      {
        type: 'puzzle',
        fen: 'r3k3/8/2n5/1B6/3P4/8/8/4K3 w - - 0 1',
        solutions: [['d5']],
        task: 'The knight on c6 is pinned. Exploit it: win the knight.',
        hints: ['A pinned piece cannot run away. Attack it again — with your cheapest attacker.', 'Which pawn move attacks c6?'],
        explain: 'd5 attacks the pinned knight with a pawn. It cannot move (absolute pin), and anything that defends it ' +
          'still loses knight-for-pawn. Attack pinned pieces with pawns — maximum profit.',
        wrongText: 'the knight survives. It cannot move — so attack it again, cheaply.'
      },
      {
        type: 'quiz',
        boardFen: '3qk3/8/5n2/6B1/8/8/8/4K3 b - - 0 1',
        question: 'Black to move. The knight on f6 is attacked by the bishop. May it move — and should it?',
        choices: [
          'It may move (relative pin), but then Bxd8 wins the queen',
          'It may not move — the pin is absolute',
          'It should move — there is no pin here'
        ],
        answer: 0,
        explain: 'Behind the knight sits the queen, not the king: a relative pin. Moving is legal but catastrophic. ' +
          'In practice, relative pins on the king’s knight are among the most common tactics at every level.'
      },
      {
        type: 'recap',
        points: [
          'Pin = line attack through a piece onto something bigger behind it.',
          'Absolute (king behind): moving is illegal. Relative: legal but losing.',
          'Exploit pins by attacking the pinned piece again — ideally with a pawn.'
        ]
      }
    ]
  });

  DG.CONTENT.push({
    id: 'm3-02-fork',
    module: 3,
    title: 'The Fork',
    minutes: 5,
    steps: [
      {
        type: 'text',
        html: '<p>A <b>fork</b> is one piece attacking two (or more) targets at once. The defender can save one; ' +
          'you take the other. Every piece can fork — even the king — but the <b>knight</b> is the specialist: ' +
          'its unique move attacks queens and rooks that can never attack it back, and its forks are hardest to see ' +
          'coming. Your anchor piece pays its rent here.</p>'
      },
      {
        type: 'board', mode: 'static', fen: 'r3k3/2N5/8/8/8/8/8/4K3 b - - 0 1',
        arrows: [{ from: 'c7', to: 'e8', colour: 'green' }, { from: 'c7', to: 'a8', colour: 'green' }],
        caption: 'The royal family fork shape: a knight on c7 hits king AND rook. Check forces the king to move; the rook falls.'
      },
      {
        type: 'puzzle',
        fen: 'r1k5/8/8/P2N4/8/8/8/4K3 w - - 0 1',
        solutions: [['Nb6+', 'Kc7', 'Nxa8+']],
        task: 'White to move. Fork king and rook — and note why the a5-pawn matters.',
        hints: ['Which knight jump gives check?', 'Nb6+ — and the pawn on a5 guards b6, so the king cannot simply take the knight.'],
        explain: 'Nb6+ forks c8 and a8; the a5-pawn defends b6 so the king can’t capture. After the king steps aside, ' +
          'Nxa8 wins the rook. Forks need safe squares — always check who defends the forking square.',
        wrongText: 'no fork yet. You want a check that also touches a8.'
      },
      {
        type: 'puzzle',
        fen: '4k3/8/2n1n3/8/3P4/8/8/4K3 w - - 0 1',
        solutions: [['d5']],
        task: 'Forks aren’t only for knights. White to move: win a piece with the humble pawn.',
        hints: ['One pawn move attacks both knights at once.'],
        explain: 'd5 attacks c6 and e6 simultaneously. One knight saves itself; the other is captured. A one-pawn ' +
          'investment, a three-point return.',
        wrongText: 'both knights are still safe. Find the move that attacks both at once.'
      },
      {
        type: 'quiz',
        question: 'Why are knight forks in particular so dangerous to queens and rooks?',
        choices: [
          'The attacked pieces can never counter-attack the knight from where they stand',
          'Knights are worth more than rooks',
          'They can’t be — queens escape easily'
        ],
        answer: 0,
        explain: 'A queen or rook standing on a knight-fork square does not itself attack that knight (their move sets ' +
          'don’t overlap the knight’s). The fork is safe from its own victims — unique to the knight.'
      },
      {
        type: 'recap',
        points: [
          'Fork = one move, two targets; the defender saves only one.',
          'Knight forks are the classic — check + heavy piece is the royal pattern.',
          'The forking square must be safe: count its defenders first.'
        ]
      }
    ]
  });

  DG.CONTENT.push({
    id: 'm3-03-skewer',
    module: 3,
    title: 'The Skewer',
    minutes: 4,
    steps: [
      {
        type: 'text',
        html: '<p>The <b>skewer</b> is the pin inverted: a line attack where the <b>more</b> valuable piece stands in ' +
          'front and must move, exposing the piece <b>behind</b> it. Same geometry, opposite ordering:</p>' +
          '<ul><li>Pin: small piece in front, big piece behind → front piece is stuck.</li>' +
          '<li>Skewer: big piece in front, small piece behind → front piece flees, you take the back one.</li></ul>' +
          '<p>Like pins, skewers belong to the line pieces: bishop, rook, queen.</p>'
      },
      {
        type: 'puzzle',
        fen: '5q2/8/5k2/8/8/8/1K6/R7 w - - 0 1',
        solutions: [['Rf1+', 'Ke5', 'Rxf8']],
        task: 'King in front, queen behind — the alignment on the f-file is begging. White to move.',
        hints: ['Give check along the file the king and queen share.', 'Rf1+ — the king must step off the file, abandoning the queen.'],
        explain: 'Rf1+ skewers king and queen: the check forces the king aside, and Rxf8 collects. A whole queen for ' +
          'nothing, from one alignment. Train your eye to spot pieces standing on one line.',
        wrongText: 'the queen still lives. Use the f-file alignment.'
      },
      {
        type: 'quiz',
        boardFen: '4k3/8/2q5/8/8/8/8/R3K3 b - - 0 1',
        question: 'Look at White’s rook and king on the first rank. If Black plays Qc1+, what pattern is that?',
        choices: [
          'A skewer — the king must move and the rook on a1 falls',
          'A pin — the king cannot move',
          'A fork — two separate targets'
        ],
        answer: 0,
        explain: 'Qc1+ attacks along the rank: king (big) in front from the queen’s viewpoint… after he steps away, ' +
          'Qxa1. Skewers work for both sides — spot your own alignments before your opponent does.'
      },
      {
        type: 'recap',
        points: [
          'Skewer = pin with the values swapped: big in front, small behind.',
          'A check-skewer is unanswerable — the king must move.',
          'Watch for any two pieces sharing a rank, file or diagonal.'
        ]
      }
    ]
  });

  DG.CONTENT.push({
    id: 'm3-04-discovered',
    module: 3,
    title: 'Discovered and Double Attacks',
    minutes: 5,
    steps: [
      {
        type: 'text',
        html: '<p>A <b>discovered attack</b>: one of your pieces moves off a line, unmasking an attack from the piece ' +
          'behind it. The power: the moving piece makes its <i>own</i> threat too — <b>two threats from one move</b>, ' +
          'from two different pieces. Your opponent answers one; you execute the other.</p>' +
          '<p>Special cases, in ascending brutality:</p>' +
          '<ul><li><b>Discovered check</b> — the unmasked piece gives check, so the moving piece may grab anything with impunity.</li>' +
          '<li><b>Double check</b> — both pieces give check at once. Blocking is impossible and capturing one attacker ' +
          'still leaves the other: <b>only a king move</b> can answer it.</li></ul>'
      },
      {
        type: 'board', mode: 'static', fen: '4k3/8/8/8/4N3/8/8/4R1K1 w - - 0 1',
        arrows: [{ from: 'e1', to: 'e4', colour: 'yellow' }, { from: 'e4', to: 'f6', colour: 'green' }, { from: 'e4', to: 'd6', colour: 'green' }],
        caption: 'The battery: rook behind, knight in front on the same file as the enemy king. Any knight move ' +
          'unmasks check — and the knight chooses its destination freely.'
      },
      {
        type: 'puzzle',
        fen: '8/4q1k1/8/8/3N4/8/1B6/1K6 w - - 0 1',
        solutions: [['Nf5+', 'Kg8', 'Nxe7+']],
        task: 'Bishop b2 aims at g7 through your own knight on d4. Use the battery: win the queen.',
        hints: ['Move the knight so that it ALSO attacks something — with check behind it.', 'Nf5+ is double check: bishop and knight together. Only a king move answers.'],
        explain: 'Nf5+ is a double check (bishop on the long diagonal, knight attacking g7). The king must move — no ' +
          'block, no capture helps — and Nxe7 takes the queen, with check for good measure. Two threats, one move.',
        wrongText: 'the queen escapes. Your knight move must come with check from behind.'
      },
      {
        type: 'quiz',
        question: 'You are in double check. Which responses are even worth considering?',
        choices: ['King moves only', 'Blocking one of the checks', 'Capturing one of the checkers', 'Any of the three'],
        answer: 0,
        explain: 'Blocking or capturing answers one checker; the other still checks. By elimination: the king moves, ' +
          'or it is mate. This is why double check is the most forcing move in chess.'
      },
      {
        type: 'recap',
        points: [
          'Discovered attack: unmask a line piece while the mover makes its own threat.',
          'Discovered check: the mover can take anything.',
          'Double check: only a king move replies — maximal force.'
        ]
      }
    ]
  });

  DG.CONTENT.push({
    id: 'm3-05-backrank',
    module: 3,
    title: 'The Back Rank',
    minutes: 4,
    steps: [
      {
        type: 'text',
        html: '<p>You met it in Module 1; now it becomes a weapon. After castling, the three pawns in front of the ' +
          'king are shelter — and a wall. If the back rank has no defender, a rook or queen arriving there is ' +
          '<b>mate</b>: the king’s own shelter blocks every escape.</p>' +
          '<p>The prophylaxis is one pawn move — h3 (or …h6), called giving the king <b>luft</b> (air). The condition ' +
          'to monitor all game: <i>how many pieces defend my back rank, and how many attack it?</i></p>'
      },
      {
        type: 'puzzle',
        fen: '6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1',
        solutions: [['Ra8#']],
        task: 'White to move. One move ends it.',
        hints: ['Count the defenders of Black’s back rank. Zero.'],
        explain: 'Ra8#: the pawns that guard the king also imprison him. Undefended back rank + heavy piece = mate.',
        wrongText: 'not mate. The 8th rank is the target.'
      },
      {
        type: 'puzzle',
        fen: '1r4k1/8/8/8/8/8/5PPP/6K1 b - - 0 1',
        orientation: 'black',
        solutions: [['Rb1#']],
        task: 'Now from Black’s side (board flipped). Black to move — same pattern, other direction.',
        hints: ['White never made luft either.'],
        explain: 'Rb1#. The pattern is colour-blind — and so is the cure: one early pawn step (h3/h6) buys the king an escape square.',
        wrongText: 'White survives. Deliver the mirror image of the last puzzle.'
      },
      {
        type: 'quiz',
        question: 'Cheapest permanent insurance against a back-rank mate?',
        choices: ['A small pawn move like h3, giving the king “luft”', 'Keeping the queen at home forever', 'Never castling'],
        answer: 0,
        explain: 'One tempo, one escape square, threat neutralised for good. Strong players make luft routinely once heavy pieces start eyeing the back rank.'
      },
      {
        type: 'recap',
        points: [
          'Castled king + no back-rank defender = mate-in-one geometry.',
          'Monitor attackers v defenders of the back rank continuously.',
          'Luft (h3/…h6) is the standing cure.'
        ]
      }
    ]
  });

  DG.CONTENT.push({
    id: 'm3-06-mixed',
    module: 3,
    title: 'Mixed Tactics — no labels',
    minutes: 6,
    steps: [
      {
        type: 'text',
        html: '<p>In a real game nobody announces “fork available”. This set has <b>no labels</b> — the pattern ' +
          'recognition is the exercise. For each: find the winning move. (The motifs are the four you know: pin, ' +
          'fork, skewer, discovered/double attack, back rank.)</p>'
      },
      {
        type: 'puzzle',
        fen: 'r1k5/8/8/P2N4/8/8/8/4K3 w - - 0 1',
        solutions: [['Nb6+', 'Kc7', 'Nxa8+']],
        task: 'White to move. Win material.',
        hints: ['Two black pieces, one knight-move apart.'],
        explain: 'The royal fork again — recognised without its label this time?',
        wrongText: 'no. Look for a check that hits two targets.'
      },
      {
        type: 'puzzle',
        fen: '3qk3/7p/5n2/6B1/4P3/8/8/4K3 w - - 0 1',
        solutions: [['e5', 'h6', 'exf6']],
        task: 'White to move. The f6-knight looks defended by its queen… is it safe?',
        hints: ['The knight is relatively pinned by your bishop.', 'Attack the piece that cannot afford to move.'],
        explain: 'e5! The knight is pinned to its queen: if it moves, Bxd8; if it stays, exf6 wins it. Attacking a ' +
          'relatively pinned piece with a pawn converts the pin into material.',
        wrongText: 'the knight wriggles out. Use the g5–d8 diagonal.'
      },
      {
        type: 'puzzle',
        fen: '5q2/8/5k2/8/8/8/1K6/R7 w - - 0 1',
        solutions: [['Rf1+', 'Ke5', 'Rxf8']],
        task: 'White to move. Win the queen.',
        hints: ['Which line do the king and queen share?'],
        explain: 'The check-skewer along the f-file. Alignments are the tell — scan for them every move.',
        wrongText: 'the alignment is still there — use it.'
      },
      {
        type: 'puzzle',
        fen: '3r2k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1',
        solutions: [['Rxd8#']],
        task: 'White to move. Rooks are facing off — what does the capture count say?',
        hints: ['If you take on d8, what recaptures? And what escapes?'],
        explain: 'Rxd8#: the recapture count is zero and the back rank does the rest. Trading into an undefended back ' +
          'rank is a standard finishing pattern.',
        wrongText: 'look again at d8 — count defenders, then count escape squares.'
      },
      {
        type: 'recap',
        points: [
          'Real games hide the label — scan for the shapes: alignments, fork distances, back ranks.',
          'The scan is systematic, not magic: checks, captures, threats — every move.',
          'That scan becomes your formal checklist in the final lesson.'
        ]
      }
    ]
  });

  DG.CONTENT.push({
    id: 'm3-07-pawn-structure',
    module: 3,
    title: 'Pawn Structure',
    minutes: 5,
    steps: [
      {
        type: 'text',
        html: '<p>From tactics (moves) to strategy (positions). Pawns move slowly and never backwards, so the pawn ' +
          'structure is the most <b>permanent</b> feature of a position — its skeleton. Three weaknesses to name:</p>' +
          '<ul>' +
          '<li><b>Isolated pawn:</b> no friendly pawn on either adjacent file — it can never be defended by a pawn, ' +
          'so pieces get tied to babysitting it.</li>' +
          '<li><b>Doubled pawns:</b> two friendly pawns on one file — they obstruct each other and can’t defend each other.</li>' +
          '<li><b>Passed pawn:</b> no enemy pawn can block or capture it on its way to promotion — a long-term asset ' +
          'that grows with every trade.</li>' +
          '</ul>'
      },
      {
        type: 'board', mode: 'static', fen: '4k3/pp3ppp/8/8/3P4/8/PP3PPP/4K3 w - - 0 1',
        highlights: { d4: 'yellow' },
        caption: 'The isolated d-pawn: no white pawn on the c- or e-file, ever again. In middlegames its open ' +
          'neighbouring files give activity; in endgames it is usually just a patient.'
      },
      {
        type: 'board', mode: 'static', fen: '4k3/pp3ppp/8/8/8/5P2/PP3P1P/4K3 w - - 0 1',
        highlights: { f2: 'yellow', f3: 'yellow' },
        caption: 'Doubled f-pawns. Note the g-file gap they imply — doubling always comes from a capture.'
      },
      {
        type: 'board', mode: 'static', fen: '4k3/pp4pp/8/3P4/8/8/PP4PP/4K3 w - - 0 1',
        highlights: { d5: 'yellow', d6: 'green', d7: 'green', d8: 'green' },
        caption: 'A passed pawn on d5: no black pawn on c-, d- or e-file can ever stop it. Its path (green) is a ' +
          'standing threat both sides must budget for.'
      },
      {
        type: 'quiz',
        boardFen: '4k3/pp2pp1p/8/8/8/2P5/PP2PP1P/4K3 w - - 0 1',
        question: 'Which white pawn here is isolated?',
        choices: ['The h2 pawn — the g-file is empty', 'The c3 pawn', 'None — every white pawn has a neighbour'],
        answer: 0,
        explain: 'Run the definition over each pawn: a2 has b2, b2 has a2 and c3, c3 has b2, e2 has f2, f2 has e2 — but ' +
          'h2’s only possible neighbour file is g, and there is no white g-pawn. Isolated. (c3 merely looks lonely — ' +
          'the b2 pawn can still defend it by advancing.)'
      },
      {
        type: 'recap',
        points: [
          'Structure is the position’s skeleton — pawns don’t come back.',
          'Isolated: no pawn neighbours. Doubled: same file. Passed: no opposition ahead.',
          'Weak pawns tie pieces down; passed pawns win endgames.'
        ]
      }
    ]
  });

  DG.CONTENT.push({
    id: 'm3-08-material',
    module: 3,
    title: 'Activity v Material — and “the Exchange”',
    minutes: 4,
    steps: [
      {
        type: 'text',
        html: '<p>The point values (♟1 ♞3 ♝3 ♜5 ♛9) are a <b>heuristic, not a law</b>. What they approximate is ' +
          'expected <i>activity</i> — and when actual activity diverges from the table, trust the board:</p>' +
          '<ul><li>A rook on its starting square doing nothing is worth less, right now, than a knight on a central outpost.</li>' +
          '<li>A “good” trade that activates your opponent’s pieces is a bad trade.</li></ul>' +
          '<p>Vocabulary: winning rook-for-minor-piece (5 v 3) is called <b>winning the exchange</b>. And a piece ' +
          'given deliberately for position or attack is a <b>sacrifice</b> — sound when the activity purchased ' +
          'exceeds the points spent.</p>'
      },
      {
        type: 'quiz',
        question: 'You can trade your bishop (3) for a rook (5). Almost always right — what’s this called?',
        choices: ['Winning the exchange', 'A gambit', 'Promotion'],
        answer: 0,
        explain: '“The exchange” specifically means the rook-v-minor-piece differential. Winning it is roughly a ' +
          'two-point profit — significant, though not as decisive as a whole piece.'
      },
      {
        type: 'quiz',
        question: 'Your opponent offers a queen trade. You are two pawns UP. Trading queens is generally…',
        choices: [
          'Good for you — fewer pieces magnify a material lead',
          'Bad for you — keep the strongest piece',
          'Neutral — queens are equal'
        ],
        answer: 0,
        explain: 'A rule with real force: when ahead in material, simplify; when behind, keep pieces on and complicate. ' +
          'Two extra pawns in a queen endgame are murky; in a king-and-pawn endgame they are trivially decisive.'
      },
      {
        type: 'recap',
        points: [
          'Point values estimate activity — the board outranks the table.',
          '“The exchange” = rook v minor piece.',
          'Ahead in material → trade pieces, simplify towards the endgame.'
        ]
      }
    ]
  });

  DG.CONTENT.push({
    id: 'm3-09-weak-squares',
    module: 3,
    title: 'Weak Squares and Outposts',
    minutes: 4,
    steps: [
      {
        type: 'text',
        html: '<p>A <b>weak square</b> (or “hole”) is a square that can <b>never again be defended by a pawn</b> — ' +
          'the enemy pawns that could have covered it have advanced past or vanished. A weakness is only real if it ' +
          'can be used: a hole in <i>your opponent’s</i> camp is your target.</p>' +
          '<p>A piece planted on a hole, defended by your own pawn, is an <b>outpost</b> — and the ideal tenant is ' +
          'the knight: short-range, so it wants a permanent advanced base, and impossible to evict without pawns.</p>'
      },
      {
        type: 'board', mode: 'explore', sides: 'w',
        fen: '4k3/1p3pp1/3p4/4p3/4P3/2N5/PP3PP1/4K3 w - - 0 1',
        task: 'Black’s pawns on d6 and e5 can never cover d5 again — it is a hole, and your e4-pawn guards it. ' +
          'Plant the knight on the outpost.',
        goal: { type: 'reach', square: 'd5' },
        success: 'A knight on d5 like that can be worth a rook. Black can only ever evict it by giving something up.',
        highlights: { d5: 'yellow' }
      },
      {
        type: 'quiz',
        question: 'Why is the knight the classic outpost piece, rather than the bishop?',
        choices: [
          'Short range: it needs an advanced base to matter, and only pawns can evict it cheaply',
          'Knights are worth more than bishops',
          'Bishops cannot be defended by pawns'
        ],
        answer: 0,
        explain: 'A bishop influences from afar and often does better on a long diagonal; the knight’s power is local, ' +
          'so a protected forward station transforms it. No pawn can ever attack a true hole — the knight sits forever.'
      },
      {
        type: 'recap',
        points: [
          'Hole = square no enemy pawn can ever defend again.',
          'Outpost = your piece on their hole, guarded by your pawn.',
          'Knights crave outposts; create them by provoking pawn advances.'
        ]
      }
    ]
  });

  DG.CONTENT.push({
    id: 'm3-10-endgame-1',
    module: 3,
    title: 'Endgames I — King Activity and the Opposition',
    minutes: 6,
    steps: [
      {
        type: 'text',
        html: '<p>The endgame inverts one rule you learnt in Module 1: with queens off and few pieces left, the king ' +
          'stops hiding and becomes a fighting piece — often <i>the</i> decisive one. Rule of thumb: the moment the ' +
          'endgame starts, centralise the king.</p>' +
          '<p>The fundamental duel is king v king, and it has a name: <b>the opposition</b>. Kings facing each other ' +
          'with <b>one square between them</b> cannot approach (kings may never touch). Whoever must move loses ' +
          'ground — so <i>having</i> the opposition means it is your <b>opponent’s</b> turn. A parity rule: ' +
          'you want to be the one <b>not</b> moving.</p>'
      },
      {
        type: 'sequence',
        fen: '4k3/8/4K3/4P3/8/8/8/8 w - - 0 1',
        moves: ['Kd6', 'Kd8', 'e6', 'Ke8', 'e7', 'Kf7', 'Kd7', 'Kf6', 'e8=Q'],
        captions: [
          'King and pawn v king — THE fundamental endgame. White’s king stands in front of its pawn: winning. Watch how.',
          '1.Kd6 — sidestep. Black must give way on one side…',
          '1…Kd8 — taking the direct opposition, but…',
          '2.e6 — …the pawn advances behind the king’s shoulder. (Note: king first, pawn after — never the reverse.)',
          '2…Ke8 — back to block.',
          '3.e7 — one square from glory. Careful: this is check-free, and Black has exactly one move.',
          '3…Kf7 — forced away from e8…',
          '4.Kd7 — …and the king seizes the promotion square’s guard. The pawn is unstoppable.',
          '4…Kf6 — nothing helps.',
          '5.e8=Q — promotion. From here the queen mates in a few moves (a drill for another day).'
        ],
        intro: 'The single most important endgame sequence in chess — step through it slowly.'
      },
      {
        type: 'quiz',
        boardFen: '4k3/8/8/8/8/8/8/4K3 w - - 0 1',
        question: 'Bare kings on e1 and e8 (imagine a pawn race pending). White to move — which move takes the distant opposition?',
        choices: ['Ke2 — same file, odd number of squares between', 'Kd2 — step diagonally', 'Kf1 — stay flexible'],
        answer: 0,
        explain: 'Opposition generalises: same line, odd gap, opponent to move. Ke2 leaves five squares between the ' +
          'kings with Black to move — Black must commit first, and White mirrors until the gap closes to one.'
      },
      {
        type: 'quiz',
        question: 'King + pawn v king: the single most important factor for the win is…',
        choices: [
          'Getting your king IN FRONT of the pawn',
          'Pushing the pawn as fast as possible',
          'Keeping the pawn defended from behind'
        ],
        answer: 0,
        explain: 'King in front + opposition = win; pawn racing ahead alone = usually draw (or stalemate tricks). ' +
          'The king clears the path, the pawn strolls after. You watched exactly this in the sequence.'
      },
      {
        type: 'recap',
        points: [
          'Endgame: the king becomes a fighting piece — centralise it.',
          'Opposition: facing kings, one square apart — the side NOT to move wins ground.',
          'K+P v K: king in front of the pawn first, pawn second.'
        ]
      }
    ]
  });

  DG.CONTENT.push({
    id: 'm3-11-checklist',
    module: 3,
    title: 'Endgames II — and the Thinking Checklist',
    minutes: 6,
    steps: [
      {
        type: 'text',
        html: '<p>Rook endgames are the most common endgames in real chess. Three signposts to remember (each a study ' +
          'topic for later, but the headlines pay immediately):</p>' +
          '<ul>' +
          '<li><b>Rooks belong behind passed pawns</b> — yours or the opponent’s. Behind, the rook’s power grows ' +
          'with every pawn step; in front, it shrinks.</li>' +
          '<li><b>Cut the king off:</b> a rook controlling a file is a fence the enemy king cannot cross.</li>' +
          '<li>Two names worth knowing exist for the critical positions — <b>Lucena</b> (the winning method) and ' +
          '<b>Philidor</b> (the drawing method). File them away for when you’re ready.</li>' +
          '</ul>'
      },
      {
        type: 'board', mode: 'static', fen: '4k3/8/8/P7/8/8/8/R3K3 w - - 0 1',
        arrows: [{ from: 'a1', to: 'a5', colour: 'green' }],
        caption: 'Rook behind its passed pawn: as the pawn advances a6, a7 — the rook’s scope grows and the pawn is ' +
          'permanently escorted. Swap the rook to a8, in front, and every advance would shorten its own leash.'
      },
      {
        type: 'text',
        html: '<p>Finally — the promised algorithm. Run this <b>every move, both for you and for your opponent’s ' +
          'last move</b>. It costs thirty seconds and eliminates the majority of beginner losses:</p>' +
          '<ol>' +
          '<li><b>Checks</b> — list every check (theirs and yours). Forcing moves first, always.</li>' +
          '<li><b>Captures</b> — every capture, even ugly ones. Count attackers v defenders.</li>' +
          '<li><b>Threats</b> — what did their last move attack? Is anything of mine hanging (attacked and not defended)?</li>' +
          '<li><b>Plan</b> — only now: candidate moves that serve development, structure, weak squares.</li>' +
          '<li><b>Blunder-check</b> — before releasing the piece: after my move, repeat steps 1–3 from THEIR side.</li>' +
          '</ol>' +
          '<p>Conditions before plans; forcing moves before quiet ones. You have run this scan informally throughout ' +
          'Module 3 — now it’s explicit.</p>'
      },
      {
        type: 'puzzle',
        fen: 'r2r2k1/5ppp/8/8/3Q4/8/5PPP/3R2K1 w - - 0 1',
        solutions: [['Qxd8+', 'Rxd8', 'Rxd8#']],
        task: 'The capstone. White to move. Run the checklist — checks, captures, count — and play the sequence that wins.',
        hints: ['Step 2: list every capture on d8 and count what recaptures.', 'Your queen AND rook both attack d8; only the a8-rook defends it — and think about what the LAST capture lands on.'],
        explain: 'Qxd8+ Rxd8 Rxd8#: two attackers against one defender on d8, and the final recapture lands on an ' +
          'undefended back rank. Spending the queen looks alarming until you count to the end — checks, captures, ' +
          'count. That is the whole course in one sequence.',
        wrongText: 'run the numbers on d8 again: attackers, defenders, and what the final capture delivers.'
      },
      {
        type: 'text',
        html: '<p><b>That’s the course.</b> You know every rule, you read and write the language, you know five ' +
          'openings by name and idea, the five tactical patterns, the strategic vocabulary, and the fundamental ' +
          'endgame. What remains is volume: play slow games, run the checklist every move, and solve a few puzzles ' +
          'daily. Replay any lesson from the overview — and when a term slips your mind in the wrong language, ' +
          'the <a href="#/glossary">glossary</a> is always there. <i>Veel succes, in bocca al lupo — good luck!</i></p>'
      },
      {
        type: 'recap',
        points: [
          'Rooks behind passed pawns; rooks cut kings off.',
          'Every move: Checks → Captures → Threats → Plan → Blunder-check.',
          'Improvement from here = slow games + daily puzzles + the checklist.'
        ]
      }
    ]
  });
})();
