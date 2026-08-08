/*
 * app.js — hash router, lesson renderer and the content→board wiring.
 *
 * Views: #/ (home), #/lesson/<id>, #/glossary. Lessons render their steps
 * progressively: a step must be completed (read, solved, answered or
 * stepped through) before the next appears. Completion is persisted via
 * DG.Progress.
 */
(function () {
  'use strict';

  var appEl = null;
  var liveBoards = [];

  function h(html) {
    var t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstChild;
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function teardown() {
    liveBoards.forEach(function (b) { b.destroy(); });
    liveBoards = [];
    appEl.innerHTML = '';
  }

  function lessonById(id) {
    for (var i = 0; i < DG.CONTENT.length; i++) {
      if (DG.CONTENT[i].id === id) return DG.CONTENT[i];
    }
    return null;
  }

  function lessonIndex(id) {
    for (var i = 0; i < DG.CONTENT.length; i++) if (DG.CONTENT[i].id === id) return i;
    return -1;
  }

  // ---- home ---------------------------------------------------------------

  function renderHome() {
    teardown();
    var last = DG.Progress.lastLocation();
    var resume = last && lessonById(last) && DG.Progress.isModuleUnlocked(lessonById(last).module);

    var head = h(
      '<header class="home-head">' +
      '<h1>The Daggy&rsquo;s Gambit</h1>' +
      '<p class="tagline">A personal chess course: from the knight you already know to a player with a plan.</p>' +
      (resume ? '<p><a class="btn primary" href="#/lesson/' + last + '">Continue where you left off</a></p>' : '') +
      '</header>');
    appEl.appendChild(head);

    DG.MODULES.forEach(function (mod) {
      var unlocked = DG.Progress.isModuleUnlocked(mod.id);
      var prog = DG.Progress.moduleProgress(mod.id);
      var pct = prog.total ? Math.round(100 * prog.done / prog.total) : 0;

      var card = h('<section class="module-card' + (unlocked ? '' : ' locked') + '"></section>');
      card.appendChild(h('<h2>' + mod.title + '</h2>'));
      card.appendChild(h('<p class="blurb">' + mod.blurb + '</p>'));
      card.appendChild(h(
        '<div class="progress-row"><div class="progress-bar"><div class="progress-fill" style="width:' + pct + '%"></div></div>' +
        '<span class="progress-label">' + prog.done + ' / ' + prog.total + '</span></div>'));

      if (!unlocked) {
        card.appendChild(h('<p class="lock-note">🔒 Complete Module ' + (mod.id - 1) + ' to unlock.</p>'));
      } else {
        var list = h('<ol class="lesson-list"></ol>');
        DG.Progress.moduleLessons(mod.id).forEach(function (lesson) {
          var done = DG.Progress.isLessonComplete(lesson.id);
          list.appendChild(h(
            '<li class="' + (done ? 'done' : '') + '">' +
            '<a href="#/lesson/' + lesson.id + '">' +
            '<span class="tick">' + (done ? '✓' : '') + '</span>' +
            '<span class="lesson-title">' + lesson.title + '</span>' +
            '<span class="mins">' + lesson.minutes + ' min</span></a></li>'));
        });
        card.appendChild(list);
      }
      appEl.appendChild(card);
    });

    var foot = h(
      '<footer class="home-foot">' +
      '<a href="#/glossary">Piece-name glossary (EN·NL·IT)</a>' +
      '<button type="button" class="linklike" id="reset-btn">Reset progress</button>' +
      '</footer>');
    appEl.appendChild(foot);
    foot.querySelector('#reset-btn').addEventListener('click', function () {
      if (confirm('Reset all course progress?') && confirm('Really reset? This cannot be undone.')) {
        DG.Progress.reset();
        renderHome();
      }
    });
  }

  // ---- glossary -----------------------------------------------------------

  function renderGlossary() {
    teardown();
    appEl.appendChild(h('<header class="lesson-head"><a class="back" href="#/">← Overview</a><h1>Glossary</h1></header>'));
    var rows = ['K', 'Q', 'R', 'B', 'N', 'P'].map(function (k) {
      var p = DG.PIECES[k];
      return '<tr><td class="glyph-cell"><span class="piece b">' + p.glyph + '︎</span></td>' +
        '<td>' + p.en + '</td><td>' + p.nl + '</td><td>' + p.it + '</td>' +
        '<td><b>' + p.letter + '</b></td><td>' + p.value + '</td></tr>';
    }).join('');
    appEl.appendChild(h(
      '<table class="glossary"><thead><tr><th></th><th>English</th><th>Dutch</th><th>Italian</th>' +
      '<th>Letter</th><th>Value</th></tr></thead><tbody>' + rows + '</tbody></table>'));
    appEl.appendChild(h(
      '<p class="note">The pawn has no letter in notation: a pawn move is written by its destination square alone (e.g. <b>e4</b>). ' +
      'Values are the usual material heuristic in pawns — a guide, not a law; Module 3 covers the exceptions.</p>'));
  }

  // ---- lesson -------------------------------------------------------------

  function renderLesson(id) {
    teardown();
    var lesson = lessonById(id);
    if (!lesson || !DG.Progress.isModuleUnlocked(lesson.module)) { location.hash = '#/'; return; }
    DG.Progress.setLocation(id);

    var mod = DG.MODULES[lesson.module - 1];
    appEl.appendChild(h(
      '<header class="lesson-head"><a class="back" href="#/">← Overview</a>' +
      '<p class="crumb">' + mod.title + '</p><h1>' + lesson.title + '</h1></header>'));

    var stepsEl = h('<div class="steps"></div>');
    appEl.appendChild(stepsEl);

    // Furthest step already completed determines what is visible on entry.
    var firstIncomplete = 0;
    while (firstIncomplete < lesson.steps.length &&
           DG.Progress.isStepDone(lesson.id, firstIncomplete)) {
      firstIncomplete++;
    }
    for (var i = 0; i <= Math.min(firstIncomplete, lesson.steps.length - 1); i++) {
      renderStep(lesson, i, stepsEl, i < firstIncomplete);
    }
    if (firstIncomplete >= lesson.steps.length) finishLesson(lesson, stepsEl);
  }

  function completeStep(lesson, index, stepsEl) {
    var already = DG.Progress.isStepDone(lesson.id, index);
    DG.Progress.stepDone(lesson.id, index);
    if (already) return;
    var next = index + 1;
    if (next < lesson.steps.length) {
      var el = renderStep(lesson, next, stepsEl, false);
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      finishLesson(lesson, stepsEl);
    }
  }

  function finishLesson(lesson, stepsEl) {
    DG.Progress.completeLesson(lesson.id);
    var idx = lessonIndex(lesson.id);
    var next = DG.CONTENT[idx + 1] || null;
    var nextOk = next && DG.Progress.isModuleUnlocked(next.module);
    var html = '<div class="step-card lesson-done"><h3>Lesson complete ✓</h3>';
    if (next && next.module !== lesson.module) {
      html += nextOk
        ? '<p>That completes Module ' + lesson.module + '. Module ' + next.module + ' is now unlocked.</p>'
        : '<p>That completes this lesson — finish the rest of Module ' + lesson.module + ' to unlock Module ' + (lesson.module + 1) + '.</p>';
    }
    html += '<div class="btn-row"><a class="btn" href="#/">Overview</a>' +
      (nextOk ? '<a class="btn primary" href="#/lesson/' + next.id + '">Next lesson →</a>' : '') +
      '</div></div>';
    var el = h(html);
    stepsEl.appendChild(el);
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderStep(lesson, index, stepsEl, alreadyDone) {
    var step = lesson.steps[index];
    var card = h('<div class="step-card" data-step="' + index + '"></div>');
    stepsEl.appendChild(card);
    var done = function () { completeStep(lesson, index, stepsEl); };

    switch (step.type) {
      case 'text': renderTextStep(step, card, done, alreadyDone); break;
      case 'board': renderBoardStep(step, card, done, alreadyDone); break;
      case 'sequence': renderSequenceStep(step, card, done, alreadyDone); break;
      case 'quiz': renderQuizStep(step, card, done, alreadyDone); break;
      case 'puzzle': renderPuzzleStep(lesson, index, step, card, done, alreadyDone); break;
      case 'recap': renderRecapStep(step, card, done, alreadyDone); break;
      default: card.appendChild(h('<p>Unknown step type.</p>')); done();
    }
    return card;
  }

  function continueBtn(card, done, label) {
    var btn = h('<button type="button" class="btn primary">' + (label || 'Continue') + '</button>');
    card.appendChild(btn);
    btn.addEventListener('click', function () {
      btn.remove();
      done();
    });
  }

  function renderTextStep(step, card, done, alreadyDone) {
    card.appendChild(h('<div class="prose">' + step.html + '</div>'));
    if (!alreadyDone) continueBtn(card, done);
  }

  function renderRecapStep(step, card, done, alreadyDone) {
    var lis = step.points.map(function (p) { return '<li>' + p + '</li>'; }).join('');
    card.appendChild(h('<div class="recap"><h3>Recap</h3><ul>' + lis + '</ul></div>'));
    if (!alreadyDone) continueBtn(card, done, 'Got it');
  }

  function mountBoard(card, opts) {
    var wrap = h('<div class="board-slot"></div>');
    card.appendChild(wrap);
    var board = DG.Board.mount(wrap, opts);
    liveBoards.push(board);
    return board;
  }

  function turnLabel(board) {
    return board.game.turn() === 'w' ? 'White' : 'Black';
  }

  function renderBoardStep(step, card, done, alreadyDone) {
    if (step.intro) card.appendChild(h('<div class="prose">' + step.intro + '</div>'));
    var board = mountBoard(card, { orientation: step.orientation, coords: step.coords });
    var status = h('<p class="board-status">' + (step.task ? step.task : (step.caption || '')) + '</p>');
    card.appendChild(status);

    var goalMet = false;
    var cfg = {
      mode: step.mode || 'static',
      fen: step.fen,
      highlights: step.highlights,
      arrows: step.arrows,
      sides: step.sides,
      solo: step.solo,
      restrictTo: step.restrictTo,
      orientation: step.orientation,
      onMove: function (res, game) {
        if (!step.goal || goalMet) return;
        if (goalCheck(step.goal, res, game)) {
          goalMet = true;
          status.innerHTML = '✓ ' + (step.success || 'Well done.');
          status.classList.add('good');
          if (!alreadyDone) done();
        }
      }
    };
    board.setMode(cfg);

    if (step.mode === 'explore' && step.resetBtn !== false) {
      var reset = h('<button type="button" class="btn small">Reset position</button>');
      card.appendChild(reset);
      reset.addEventListener('click', function () {
        goalMet = false;
        board.setMode(cfg);
        status.innerHTML = step.task || step.caption || '';
        status.classList.remove('good');
      });
    }
    // Steps without a goal complete via an explicit Continue.
    if (!alreadyDone && (!step.goal || step.mode === 'static')) continueBtn(card, done);
  }

  function goalCheck(goal, res, game) {
    switch (goal.type) {
      case 'reach': return res.to === goal.square;
      case 'capture': return !!res.captured && (!goal.square || res.to === goal.square);
      case 'anyMove': return !goal.piece || res.piece.toUpperCase() === goal.piece;
      case 'give-check': return game.inCheck();
      case 'checkmate': return game.isCheckmate();
      case 'promote': return !!res.promotion && (!goal.piece || res.promotion.toUpperCase() === goal.piece);
      case 'castle': return res.san === 'O-O' || res.san === 'O-O-O' ||
        res.san === 'O-O+' || res.san === 'O-O-O+';
      default: return false;
    }
  }

  function renderSequenceStep(step, card, done, alreadyDone) {
    if (step.intro) card.appendChild(h('<div class="prose">' + step.intro + '</div>'));
    var board = mountBoard(card, { orientation: step.orientation });
    var caption = h('<p class="board-status">' + (step.captions && step.captions[0] ? step.captions[0] : 'Step through the moves with the arrows.') + '</p>');
    var moveList = h('<p class="movelist"></p>');
    var controls = h(
      '<div class="seq-controls">' +
      '<button type="button" class="btn" data-seq="restart" aria-label="Restart">⟲</button>' +
      '<button type="button" class="btn" data-seq="prev" aria-label="Previous move">◀</button>' +
      '<button type="button" class="btn primary" data-seq="next" aria-label="Next move">▶</button>' +
      '<span class="seq-count"></span></div>');
    card.appendChild(caption);
    card.appendChild(controls);
    card.appendChild(moveList);

    var reachedEnd = alreadyDone;
    var countEl = controls.querySelector('.seq-count');

    function refresh(index, sans) {
      var st = board.guidedState();
      countEl.textContent = st.index + ' / ' + st.total;
      // Captions are indexed by ply: captions[0] before any move, captions[n] after move n.
      var cap = step.captions && step.captions[st.index];
      caption.innerHTML = cap || (st.index === 0 ? 'Step through the moves with the arrows.' : '');
      var parts = [];
      for (var i = 0; i < sans.length; i++) {
        if (i % 2 === 0) parts.push(Math.floor(i / 2) + 1 + '.');
        parts.push(sans[i]);
      }
      moveList.textContent = parts.join(' ');
      if (st.index === st.total && !reachedEnd) {
        reachedEnd = true;
        if (!alreadyDone) done();
      }
    }

    board.setMode({
      mode: 'guided',
      fen: step.fen,
      moves: step.moves,
      orientation: step.orientation,
      onStep: refresh
    });

    controls.addEventListener('click', function (ev) {
      var btn = ev.target.closest('[data-seq]');
      if (!btn) return;
      var op = btn.getAttribute('data-seq');
      if (op === 'next') board.guidedNext();
      else if (op === 'prev') board.guidedPrev();
      else board.guidedRestart();
    });
  }

  function renderQuizStep(step, card, done, alreadyDone) {
    card.appendChild(h('<div class="prose quiz-q"><b>Quiz.</b> ' + step.question + '</div>'));
    if (step.boardFen) {
      var board = mountBoard(card, { orientation: step.orientation });
      board.setMode({ mode: 'static', fen: step.boardFen, highlights: step.highlights, arrows: step.arrows });
    }
    var choices = h('<div class="choices"></div>');
    step.choices.forEach(function (c, i) {
      choices.appendChild(h('<button type="button" class="choice" data-i="' + i + '">' + c + '</button>'));
    });
    card.appendChild(choices);
    var feedback = h('<p class="board-status"></p>');
    card.appendChild(feedback);
    var answered = alreadyDone;
    if (alreadyDone) {
      choices.querySelector('[data-i="' + step.answer + '"]').classList.add('correct');
      feedback.innerHTML = step.explain || '';
    }

    choices.addEventListener('click', function (ev) {
      var btn = ev.target.closest('.choice');
      if (!btn || answered) return;
      var i = Number(btn.getAttribute('data-i'));
      if (i === step.answer) {
        answered = true;
        btn.classList.add('correct');
        feedback.innerHTML = '✓ ' + (step.explain || 'Correct.');
        feedback.classList.add('good');
        done();
      } else {
        btn.classList.add('incorrect');
        btn.disabled = true;
        feedback.textContent = step.retryText || 'Not that one — think again.';
      }
    });
  }

  function renderPuzzleStep(lesson, index, step, card, done, alreadyDone) {
    var puzzleId = lesson.id + ':' + index;
    if (step.intro) card.appendChild(h('<div class="prose">' + step.intro + '</div>'));
    var board = mountBoard(card, { orientation: step.orientation });
    var toMove = null;
    var status = h('<p class="board-status"></p>');
    var toolbar = h('<div class="btn-row"></div>');
    card.appendChild(status);
    card.appendChild(toolbar);

    var hintBtn = null, revealBtn = null, retryBtn = null;
    var hintsUsed = 0, solvedOnce = alreadyDone;

    function setStatus(html, cls) {
      status.innerHTML = html;
      status.className = 'board-status' + (cls ? ' ' + cls : '');
    }

    function start() {
      board.setMode({
        mode: 'puzzle',
        fen: step.fen,
        solutions: step.solutions,
        orientation: step.orientation,
        replyDelayMs: 450,
        onSolved: function (tries, revealed) {
          DG.Progress.recordPuzzle(puzzleId, { attempts: tries, hintsUsed: hintsUsed, solved: !revealed, revealed: !!revealed });
          setStatus((revealed ? 'That was the solution. ' : '✓ Solved. ') + (step.explain || ''), 'good');
          if (hintBtn) hintBtn.disabled = true;
          if (revealBtn) revealBtn.remove();
          if (!solvedOnce) { solvedOnce = true; done(); }
        },
        onWrong: function (san, tries) {
          setStatus('<b>' + esc(san) + '</b> doesn’t work — ' + (step.wrongText || 'look again.'), 'bad');
          DG.Progress.recordPuzzle(puzzleId, { attempts: tries, hintsUsed: hintsUsed });
          if (tries >= 2 && !revealBtn) {
            revealBtn = h('<button type="button" class="btn small">Show solution</button>');
            toolbar.appendChild(revealBtn);
            revealBtn.addEventListener('click', function () {
              revealBtn.remove(); revealBtn = null;
              board.revealSolution();
            });
          }
        },
        onOpponentMove: function (res) {
          setStatus(turnLabel(board) + ' to move — keep going.');
        }
      });
      toMove = turnLabel(board);
      setStatus('<b>' + toMove + ' to move.</b> ' + (step.task || 'Find the strongest move.'));
    }

    if (step.hints && step.hints.length) {
      hintBtn = h('<button type="button" class="btn small">Hint</button>');
      toolbar.appendChild(hintBtn);
      hintBtn.addEventListener('click', function () {
        if (hintsUsed < step.hints.length) {
          setStatus('Hint: ' + step.hints[hintsUsed]);
          hintsUsed++;
          DG.Progress.recordPuzzle(puzzleId, { hintsUsed: hintsUsed });
          if (hintsUsed >= step.hints.length) hintBtn.disabled = true;
        }
      });
    }
    retryBtn = h('<button type="button" class="btn small">Restart puzzle</button>');
    toolbar.appendChild(retryBtn);
    retryBtn.addEventListener('click', start);

    start();
    if (alreadyDone) setStatus('Already solved — play it again if you like. ' + (step.explain || ''), 'good');
  }

  // ---- router -------------------------------------------------------------

  function route() {
    var hash = location.hash || '#/';
    var m;
    if ((m = hash.match(/^#\/lesson\/([\w-]+)$/))) renderLesson(m[1]);
    else if (hash === '#/glossary') renderGlossary();
    else renderHome();
    window.scrollTo(0, 0);
  }

  window.addEventListener('hashchange', route);
  document.addEventListener('DOMContentLoaded', function () {
    appEl = document.getElementById('app');
    route();
    // PWA service worker — only meaningful over HTTPS (or localhost);
    // guarded so the app keeps working when opened from disk.
    if ('serviceWorker' in navigator &&
        (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
      navigator.serviceWorker.register('sw.js').catch(function () { /* offline install is an enhancement */ });
    }
  });
})();
