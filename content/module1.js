/* Module 1 — The Rules of the Game. Declarative lesson data only: no DOM code. */
(function () {
  'use strict';

  DG.CONTENT.push({
    id: 'm1-01-board',
    module: 1,
    title: 'The Board and the Armies',
    minutes: 4,
    steps: [
      {
        type: 'text',
        html: '<p>Chess is played on an 8×8 grid. Every square has a unique address, like a coordinate system: ' +
          '<b>files</b> (columns) are lettered <b>a–h</b> from White’s left, and <b>ranks</b> (rows) are numbered ' +
          '<b>1–8</b> starting from White’s side. So <code>e4</code> means file e, rank 4 — one address, no ambiguity.</p>' +
          '<p>Two invariants worth fixing in memory now: the square <b>a1 is dark</b>, and each player has a ' +
          '<b>light square in their right-hand corner</b> (h1 for White, a8 for Black).</p>'
      },
      {
        type: 'board', mode: 'static', fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        highlights: { d1: 'yellow', d8: 'yellow' },
        caption: 'The starting position. Note the queens (highlighted): the queen always starts on her own colour — ' +
          'White’s queen on the light d1, Black’s on the dark d8. The coordinates are printed along the board edges.'
      },
      {
        type: 'text',
        html: '<p>Each army has sixteen pieces: eight pawns, two rooks, two knights, two bishops, one queen and one king. ' +
          'Since you’ll meet these pieces in three languages in daily life, each one is introduced here in English, ' +
          'Dutch and Italian — there’s also a <a href="#/glossary">glossary</a> you can open at any time.</p>' +
          '<p>Setup logic, from the outside in: rooks in the corners, then knights, then bishops; queen on her own ' +
          'colour; king on the remaining central square. Pawns fill the second rank.</p>'
      },
      {
        type: 'quiz',
        question: 'What colour is the square h1?',
        choices: ['Light', 'Dark', 'Depends on the board'],
        answer: 0,
        explain: 'h1 is the light square in White’s right-hand corner — the invariant from above.'
      },
      {
        type: 'quiz',
        question: 'Where does the black queen start?',
        choices: ['d8 (a dark square)', 'e8 (a light square)', 'd1'],
        answer: 0,
        explain: 'Queen on her own colour: Black’s queen is dark, so she starts on the dark square d8.'
      },
      {
        type: 'recap',
        points: [
          'Files a–h, ranks 1–8: every square has one address, e.g. e4.',
          'a1 is dark; each player has a light square on their right.',
          'Queen starts on her own colour; pawns on the second rank.'
        ]
      }
    ]
  });

  DG.CONTENT.push({
    id: 'm1-02-knight',
    module: 1,
    title: 'The Knight — the piece you already know',
    minutes: 5,
    steps: [
      {
        type: 'text',
        html: DG.pieceBanner('N') +
          '<p>You already know this one, so let’s make it precise and use it to learn how this course works. ' +
          'The knight’s move set is exactly: <b>(±1, ±2) or (±2, ±1)</b> — two squares along a rank or file, ' +
          'then one square perpendicular. Eight candidate destinations; any that fall off the board are discarded.</p>' +
          '<p>Two properties only the knight has: it is the <b>only piece that jumps</b> — pieces in between are ' +
          'irrelevant — and its every move changes square colour.</p>'
      },
      {
        type: 'board', mode: 'static', fen: '4k3/8/8/8/3N4/8/8/4K3 w - - 0 1',
        highlights: { b3: 'green', b5: 'green', c2: 'green', c6: 'green', e2: 'green', e6: 'green', f3: 'green', f5: 'green' },
        caption: 'A knight on d4 reaches eight squares. In the centre the knight is at full power.'
      },
      {
        type: 'board', mode: 'explore', solo: true, sides: 'w',
        fen: '4k3/8/8/8/8/8/8/1N2K3 w - - 0 1',
        task: 'Learn by doing: tap the knight on b1 — its legal destinations light up. Bring it to d5 (two moves).',
        goal: { type: 'reach', square: 'd5' },
        success: 'That interaction — tap a piece, see its legal moves — is how the whole course works.'
      },
      {
        type: 'quiz',
        question: 'A knight standing on a1 (a corner) can reach how many squares?',
        choices: ['2', '4', '8'],
        answer: 0,
        explain: 'Only b3 and c2 — the other six candidates are off the board. Hence the saying: “a knight on the rim is dim”.'
      },
      {
        type: 'recap',
        points: [
          'Move set: (±1, ±2) and (±2, ±1) — up to eight destinations.',
          'The only piece that jumps over others.',
          'Strongest in the centre (8 squares), weakest in a corner (2).'
        ]
      }
    ]
  });

  DG.CONTENT.push({
    id: 'm1-03-rook-bishop',
    module: 1,
    title: 'Rook and Bishop — the straight-line pieces',
    minutes: 5,
    steps: [
      {
        type: 'text',
        html: DG.pieceBanner('R') +
          '<p>The rook slides any number of squares along a <b>rank or file</b> — never diagonally. It cannot jump: ' +
          'it stops before a friendly piece, or on an enemy piece by capturing it. On an empty board a rook always ' +
          'sees exactly <b>14 squares</b>, wherever it stands — a nicely position-independent property.</p>'
      },
      {
        type: 'board', mode: 'explore', solo: true, sides: 'w',
        fen: '4k3/8/8/3R4/8/8/8/4K3 w - - 0 1',
        task: 'Tap the rook and walk it to h8 — corner to corner takes at most two moves from anywhere.',
        goal: { type: 'reach', square: 'h8' },
        success: 'Straight lines only, as far as you like.'
      },
      {
        type: 'text',
        html: DG.pieceBanner('B') +
          '<p>The bishop slides any number of squares <b>diagonally</b>. Consequence: a bishop can never change square ' +
          'colour. Each side starts with one light-squared and one dark-squared bishop, and that assignment is fixed ' +
          'for the whole game — an invariant, not a habit.</p>'
      },
      {
        type: 'board', mode: 'static', fen: '4k3/8/8/8/3B4/8/8/4K3 w - - 0 1',
        highlights: { c3: 'green', b2: 'green', a1: 'green', e5: 'green', f6: 'green', g7: 'green', h8: 'green', c5: 'green', b6: 'green', a7: 'green', e3: 'green', f2: 'green', g1: 'green' },
        caption: 'A bishop on d4 — dark squares its whole life. Central bishop: 13 squares; in a corner: 7.'
      },
      {
        type: 'quiz',
        question: 'Your light-squared bishop is on b5. Can it ever capture a piece standing on a dark square?',
        choices: ['No — never', 'Yes, by capturing', 'Only after promotion'],
        answer: 0,
        explain: 'Diagonal moves preserve square colour. A light-squared bishop lives on light squares for the entire game.'
      },
      {
        type: 'recap',
        points: [
          'Rook: ranks and files; always 14 squares on an empty board.',
          'Bishop: diagonals; permanently colour-bound.',
          'Neither can jump — the knight keeps that monopoly.'
        ]
      }
    ]
  });

  DG.CONTENT.push({
    id: 'm1-04-queen-king',
    module: 1,
    title: 'Queen and King',
    minutes: 4,
    steps: [
      {
        type: 'text',
        html: DG.pieceBanner('Q') +
          '<p>The queen’s move set is simply the <b>union of rook and bishop</b>: any number of squares along a rank, ' +
          'file or diagonal. No jumping. From d4 on an empty board she sees 27 squares — by far the strongest piece, ' +
          'which is exactly why opponents hunt her when she comes out too early (Module 2 returns to this).</p>'
      },
      {
        type: 'board', mode: 'static', fen: '4k3/8/8/8/3Q4/8/8/4K3 w - - 0 1',
        highlights: { d1: 'green', d8: 'green', a4: 'green', h4: 'green', a1: 'green', h8: 'green', a7: 'green', g1: 'green' },
        caption: 'Queen on d4: rook lines and bishop lines combined (line ends highlighted).'
      },
      {
        type: 'text',
        html: DG.pieceBanner('K') +
          '<p>The king moves <b>one square in any direction</b>. He is not a fighting piece in the opening or ' +
          'middlegame — he is the <b>win condition</b>: the entire game state resolves around whether he can be ' +
          'trapped. (In the endgame he becomes a real fighter — Module 3.) One extra rule: the two kings may never ' +
          'stand on adjacent squares — each would be stepping into the other’s reach.</p>'
      },
      {
        type: 'board', mode: 'explore', solo: true, sides: 'w',
        fen: '4k3/8/8/8/8/8/8/K7 w - - 0 1',
        task: 'March the king from a1 to e4 — one square at a time.',
        goal: { type: 'reach', square: 'e4' },
        success: 'Slow, but in the endgame this piece wins games.'
      },
      {
        type: 'quiz',
        question: 'How many squares does a queen on d4 control on an empty board?',
        choices: ['27', '14', '21'],
        answer: 0,
        explain: 'Rook component 14 + bishop component 13 = 27. More than a quarter of the board from one square.'
      },
      {
        type: 'recap',
        points: [
          'Queen = rook + bishop; strongest piece (27 squares from the centre).',
          'King: one square any direction; kings can never be adjacent.',
          'The king is the win condition, not (yet) a fighter.'
        ]
      }
    ]
  });

  DG.CONTENT.push({
    id: 'm1-05-pawn',
    module: 1,
    title: 'The Pawn — five rules and two exceptions',
    minutes: 5,
    steps: [
      {
        type: 'text',
        html: DG.pieceBanner('P') +
          '<p>The pawn is the only piece whose move and capture differ. Its logic, stated as rules:</p>' +
          '<ol>' +
          '<li><b>Forward only</b> — a pawn can never retreat.</li>' +
          '<li><b>One square</b> straight ahead, and only if that square is empty.</li>' +
          '<li><b>First-move option:</b> from its starting square it may go two squares, if both are empty.</li>' +
          '<li><b>Captures diagonally</b> forward, one square — never straight ahead.</li>' +
          '<li><b>Blocked is blocked:</b> a piece straight ahead stops it (unless a diagonal capture exists).</li>' +
          '</ol>' +
          '<p>And two exceptions, each getting its own lesson shortly: <b>promotion</b> (reach the last rank, become a ' +
          'queen, rook, bishop or knight) and <b>en passant</b> (a one-move-window special capture).</p>'
      },
      {
        type: 'board', mode: 'static', fen: '4k3/8/8/3p4/8/8/4P3/4K3 w - - 0 1',
        highlights: { e3: 'green', e4: 'green', d3: 'red', f3: 'red' },
        caption: 'The pawn on e2: green = its moves (e3, or e4 from the start square); red = the squares it captures ' +
          'on (d3, f3) — only when an enemy piece stands there.'
      },
      {
        type: 'board', mode: 'explore', sides: 'w',
        fen: '4k3/8/8/3p4/4P3/8/8/4K3 w - - 0 1',
        task: 'The black pawn on d5 is in range. Capture it.',
        goal: { type: 'capture', square: 'd5' },
        success: 'Diagonal capture — the only way a pawn takes.'
      },
      {
        type: 'quiz',
        question: 'A white pawn on e2 faces an enemy piece on e3. Which is true?',
        choices: [
          'It cannot move forward at all — captures are diagonal only',
          'It captures the piece on e3',
          'It may jump to e4 because it hasn’t moved yet'
        ],
        answer: 0,
        explain: 'Straight ahead is for moving, diagonal is for capturing — and the two-square option also needs both squares empty.'
      },
      {
        type: 'recap',
        points: [
          'Forward only; one square (two from the start).',
          'Captures diagonally — never straight.',
          'Exceptions to come: promotion and en passant.'
        ]
      }
    ]
  });

  DG.CONTENT.push({
    id: 'm1-06-check',
    module: 1,
    title: 'Check, Checkmate, Stalemate',
    minutes: 6,
    steps: [
      {
        type: 'text',
        html: '<p><b>Check</b> is a state: your king is attacked. The defining rule is that check is ' +
          '<b>illegal to ignore</b> — any move that leaves your own king attacked is simply not a legal move. ' +
          'So when in check you must resolve it, and there are exactly three ways:</p>' +
          '<ol><li><b>Move</b> the king to a safe square;</li>' +
          '<li><b>Block</b> the attack line with another piece (impossible against a knight — it jumps);</li>' +
          '<li><b>Capture</b> the attacker.</li></ol>'
      },
      {
        type: 'board', mode: 'explore', sides: 'b',
        fen: '4k3/8/r7/8/Q7/8/8/4K3 b - - 0 1',
        arrows: [{ from: 'a4', to: 'e8', colour: 'red' }],
        task: 'Black to move, in check from the queen on a4 (red arrow). All three escape types exist here: move the ' +
          'king, block with the rook (Rc6), or capture the queen (Rxa4). Pick one — notice the app refuses every move ' +
          'that doesn’t resolve the check.',
        goal: { type: 'anyMove' },
        success: 'Whatever you chose, it dealt with the check — nothing else was even offered.'
      },
      {
        type: 'text',
        html: '<p>Now the two terminal states, which differ by exactly one condition:</p>' +
          '<p><b>Checkmate</b> = in check <b>and</b> no legal move exists. The attacked side loses — the game ends ' +
          'immediately, the king is never actually captured.</p>' +
          '<p><b>Stalemate</b> = <b>not</b> in check and no legal move exists. This is a <b>draw</b> — a critical ' +
          'distinction. Winning endgames are regularly thrown away by giving the defender a stalemate.</p>'
      },
      {
        type: 'quiz',
        boardFen: '7k/5Q2/6K1/8/8/8/8/8 b - - 0 1',
        question: 'Black to move. Checkmate or stalemate?',
        choices: ['Stalemate — a draw', 'Checkmate — White wins', 'Neither'],
        answer: 0,
        explain: 'The king on h8 is NOT in check, but g8, h7 and g7 are all covered — no legal move, no check: stalemate. ' +
          'White’s huge material advantage evaporates into a draw.'
      },
      {
        type: 'puzzle',
        fen: '6k1/5ppp/8/8/8/8/8/4R2K w - - 0 1',
        solutions: [['Re8#']],
        task: 'Your first real puzzle. White to play — deliver checkmate in one move.',
        hints: ['The black king cannot leave the back rank: its own pawns are in the way.', 'Which of your pieces can reach the 8th rank?'],
        explain: 'Re8#: check along the rank; f8 is covered by the rook and the escape squares f7, g7, h7 are occupied ' +
          'by Black’s own pawns. This pattern — the back-rank mate — returns in Module 3.',
        wrongText: 'the king escapes or the check never comes. Look at the 8th rank.'
      },
      {
        type: 'recap',
        points: [
          'Check must be resolved: move, block, or capture.',
          'Checkmate: check + no legal moves → loss.',
          'Stalemate: no check + no legal moves → draw.'
        ]
      }
    ]
  });

  DG.CONTENT.push({
    id: 'm1-07-castling',
    module: 1,
    title: 'Castling — the two-piece exception',
    minutes: 5,
    steps: [
      {
        type: 'text',
        html: '<p>Castling is the only move that touches two of your pieces at once: the king moves <b>two squares</b> ' +
          'towards a rook, and that rook lands on the square the king crossed. Kingside castling is written ' +
          '<code>O-O</code>, queenside <code>O-O-O</code>. Its purpose: king safety and rook activation in one tempo.</p>' +
          '<p>It is legal if and only if <b>all</b> of these hold:</p>' +
          '<ul>' +
          '<li>neither the king nor that rook has moved earlier in the game, <b>and</b></li>' +
          '<li>the squares between them are empty, <b>and</b></li>' +
          '<li>the king is not in check, <b>and</b></li>' +
          '<li>the king does not pass through an attacked square, <b>and</b></li>' +
          '<li>the king does not land on an attacked square.</li>' +
          '</ul>' +
          '<p>Note what is <i>not</i> in the list: the rook may be attacked, and the rook may pass through attacked ' +
          'squares — the conditions guard the king only.</p>'
      },
      {
        type: 'sequence',
        moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'O-O'],
        captions: [
          'From the start: watch how quickly castling can happen.',
          '1.e4 — open lines for the bishop and queen.',
          '1…e5 — Black does the same.',
          '2.Nf3 — the knight out, clearing the kingside.',
          '2…Nc6 — development.',
          '3.Bc4 — the bishop out; now nothing stands between king and rook.',
          '3…Bc5 — Black mirrors.',
          '4.O-O — king to g1, rook to f1, one move. King safe, rook active.'
        ],
        intro: 'Step through with ▶ — the final move is the castle itself.'
      },
      {
        type: 'quiz',
        boardFen: '4k3/8/8/8/8/5r2/8/R3K2R w KQ - 0 1',
        question: 'White to move (rights intact both sides). Which castling is legal?',
        choices: ['Only queenside (O-O-O)', 'Only kingside (O-O)', 'Both', 'Neither'],
        answer: 0,
        explain: 'The rook on f3 attacks f1 — the king would pass through an attacked square, so O-O fails a condition. ' +
          'Queenside, the king’s path e1–d1–c1 is clean: O-O-O is legal.'
      },
      {
        type: 'board', mode: 'explore', sides: 'w',
        fen: '4k3/8/8/8/8/8/8/4K2R w K - 0 1',
        task: 'Do it yourself: castle kingside. Tap the king — the two-square move to g1 is offered.',
        goal: { type: 'castle' },
        success: 'King g1, rook f1 — one move, both conditions of a good opening (safety + activity) served.'
      },
      {
        type: 'recap',
        points: [
          'King two squares towards the rook; rook lands beside him.',
          'Five conditions, all king-centred: unmoved, empty path, no check, no crossing attacked squares, no landing on one.',
          'O-O = kingside, O-O-O = queenside.'
        ]
      }
    ]
  });

  DG.CONTENT.push({
    id: 'm1-08-ep-promotion',
    module: 1,
    title: 'En Passant and Promotion',
    minutes: 5,
    steps: [
      {
        type: 'text',
        html: '<p><b>En passant</b> (“in passing”) exists to stop the two-square pawn move being a free pass. The rule ' +
          'as state + condition:</p>' +
          '<ul><li><b>Trigger:</b> an enemy pawn advances two squares and lands <i>beside</i> your pawn.</li>' +
          '<li><b>Effect:</b> your pawn may capture it <i>as if</i> it had moved only one square — you land on the ' +
          'square it skipped.</li>' +
          '<li><b>Window:</b> only on your very next move. Decline, and the right evaporates.</li></ul>' +
          '<p>That one-move window is literally a field in the game state (you’ll see it in notation later as the ' +
          '“en-passant square”).</p>'
      },
      {
        type: 'sequence',
        moves: ['e4', 'a6', 'e5', 'd5', 'exd6'],
        captions: [
          'Watch the trigger build up.',
          '1.e4 — White advances.',
          '1…a6 — a waiting move.',
          '2.e5 — the white pawn reaches the 5th rank, its capturing range now covering d6 and f6.',
          '2…d5!? — Black tries to slip past with the two-square move, avoiding d6…',
          '3.exd6 — …but en passant captures it anyway: the white pawn lands on d6, the skipped square, and the d5 pawn is gone.'
        ]
      },
      {
        type: 'board', mode: 'explore', sides: 'w',
        fen: 'rnbqkbnr/1pp1pppp/p7/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 3',
        task: 'Same position, your turn: capture the d5 pawn en passant with the e5 pawn.',
        goal: { type: 'capture', square: 'd6' },
        success: 'Captured “in passing” — pawn to d6, the d5 pawn off the board.'
      },
      {
        type: 'text',
        html: '<p><b>Promotion:</b> a pawn reaching the last rank <b>must</b> immediately become a queen, rook, bishop ' +
          'or knight (your choice, regardless of what’s been captured — nine queens is theoretically legal). ' +
          '99% of the time you want the queen; the classic exception is promoting to a <b>knight</b>, whose unique ' +
          'move can fork or mate where a queen can’t.</p>'
      },
      {
        type: 'board', mode: 'explore', sides: 'w',
        fen: '8/P7/8/8/8/8/8/k6K w - - 0 1',
        task: 'Push the a-pawn to the last rank and choose a piece from the picker.',
        goal: { type: 'promote' },
        success: 'Promoted. The pawn’s slow march has a powerful payoff.'
      },
      {
        type: 'quiz',
        question: 'Your opponent’s pawn jumped two squares and landed beside yours. You play a different move now. Can you still capture en passant next turn?',
        choices: ['No — the right lasts exactly one move', 'Yes, any time', 'Only if they haven’t castled'],
        answer: 0,
        explain: 'The en-passant right exists only on the move immediately after the two-square advance. Use it or lose it.'
      },
      {
        type: 'recap',
        points: [
          'En passant: capture a just-jumped pawn as if it moved one square — one-move window.',
          'Promotion: last rank → queen, rook, bishop or knight, immediately.',
          'Underpromotion to a knight is the classic special case.'
        ]
      }
    ]
  });

  DG.CONTENT.push({
    id: 'm1-09-draws',
    module: 1,
    title: 'Draws and Table Manners',
    minutes: 4,
    steps: [
      {
        type: 'text',
        html: '<p>A game can end without a winner in five ways. As a checklist:</p>' +
          '<ol>' +
          '<li><b>Stalemate</b> — no legal move, not in check (you know this one).</li>' +
          '<li><b>Threefold repetition</b> — the same position (same side to move, same rights) occurs three times; ' +
          'either player may then claim a draw.</li>' +
          '<li><b>Fifty-move rule</b> — fifty consecutive moves by each side with no pawn move and no capture.</li>' +
          '<li><b>Insufficient material</b> — neither side can possibly mate (e.g. king v king, or king + one knight ' +
          'or bishop v king).</li>' +
          '<li><b>Agreement</b> — the players simply agree.</li>' +
          '</ol>'
      },
      {
        type: 'text',
        html: '<p><b>Table manners</b>, for when you play over the board:</p>' +
          '<ul>' +
          '<li><b>Touch-move:</b> touch one of your pieces (with legal moves) and you must move it; touch an ' +
          'opponent’s piece and you must capture it if you legally can. To adjust a piece on its square without ' +
          'committing, say <i>“j’adoube”</i> (I adjust) first.</li>' +
          '<li>A move is final once you release the piece.</li>' +
          '<li>Resigning is done by saying so or tipping your king — and a handshake ends the game either way.</li>' +
          '</ul>'
      },
      {
        type: 'quiz',
        question: 'You touch your knight, then see it’s a blunder. The knight has legal moves. What does touch-move require?',
        choices: ['You must move the knight — some knight move, your choice', 'You must play the blunder you intended', 'Nothing — only releasing commits'],
        answer: 0,
        explain: 'Touching obliges you to move that piece, but you choose which of its legal moves to make. Releasing it on a square is what finalises one specific move.'
      },
      {
        type: 'quiz',
        question: 'King + bishop versus a lone king. Result?',
        choices: ['Draw — insufficient material', 'The bishop side can win with best play', 'Depends on the bishop’s colour'],
        answer: 0,
        explain: 'No sequence of legal moves can ever mate with king + bishop alone — the game is drawn on the spot.'
      },
      {
        type: 'recap',
        points: [
          'Five draw routes: stalemate, threefold repetition, fifty moves, insufficient material, agreement.',
          'Touch-move: touching commits the piece, releasing commits the move.',
          'That’s every rule of chess — Module 2 teaches you to read and write it.'
        ]
      }
    ]
  });
})();
