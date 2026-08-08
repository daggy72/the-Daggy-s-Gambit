/*
 * progress.js — localStorage persistence and module gating.
 *
 * Single versioned key. Storage may be unavailable (privacy modes) or
 * corrupt — the app must keep working without persistence, so every
 * access is wrapped and a corrupt blob is backed up rather than crashed on.
 */
(function () {
  'use strict';
  window.DG = window.DG || {};

  var KEY = 'daggy.chess.v1';
  var state = null;

  function blank() {
    return { schemaVersion: 1, lessons: {}, puzzles: {}, lastLocation: null };
  }

  function loadState() {
    if (state) return state;
    state = blank();
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && parsed.schemaVersion === 1) state = parsed;
      }
    } catch (e) {
      try { localStorage.setItem(KEY + '.corrupt', localStorage.getItem(KEY) || ''); } catch (e2) { /* unavailable */ }
    }
    return state;
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* unavailable — keep in-memory */ }
  }

  function lessonEntry(id) {
    var s = loadState();
    if (!s.lessons[id]) s.lessons[id] = { completed: false, steps: {} };
    return s.lessons[id];
  }

  DG.Progress = {
    stepDone: function (lessonId, stepIndex) {
      var e = lessonEntry(lessonId);
      if (e.steps[stepIndex]) return;
      e.steps[stepIndex] = true;
      save();
    },
    isStepDone: function (lessonId, stepIndex) {
      return !!lessonEntry(lessonId).steps[stepIndex];
    },
    completeLesson: function (lessonId) {
      var e = lessonEntry(lessonId);
      if (!e.completed) {
        e.completed = true;
        e.completedAt = new Date().toISOString();
        save();
      }
    },
    isLessonComplete: function (lessonId) {
      return !!lessonEntry(lessonId).completed;
    },
    recordPuzzle: function (puzzleId, info) {
      var s = loadState();
      var p = s.puzzles[puzzleId] || { attempts: 0, hintsUsed: 0, solved: false, revealed: false };
      if (info.attempts !== undefined) p.attempts = info.attempts;
      if (info.hintsUsed !== undefined) p.hintsUsed = info.hintsUsed;
      if (info.solved) p.solved = true;
      if (info.revealed) p.revealed = true;
      s.puzzles[puzzleId] = p;
      save();
    },
    setLocation: function (lessonId) {
      loadState().lastLocation = lessonId;
      save();
    },
    lastLocation: function () { return loadState().lastLocation; },

    moduleLessons: function (moduleId) {
      return DG.CONTENT.filter(function (l) { return l.module === moduleId; });
    },
    moduleProgress: function (moduleId) {
      var lessons = DG.Progress.moduleLessons(moduleId);
      var done = lessons.filter(function (l) { return DG.Progress.isLessonComplete(l.id); }).length;
      return { done: done, total: lessons.length };
    },
    isModuleComplete: function (moduleId) {
      var p = DG.Progress.moduleProgress(moduleId);
      return p.total > 0 && p.done === p.total;
    },
    isModuleUnlocked: function (moduleId) {
      if (moduleId === 1) return true;
      return DG.Progress.isModuleComplete(moduleId - 1);
    },
    reset: function () {
      state = blank();
      try { localStorage.removeItem(KEY); } catch (e) { /* unavailable */ }
    }
  };
})();
