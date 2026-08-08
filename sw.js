/*
 * Service worker — precaches the whole app so it works fully offline once
 * installed. Bump CACHE_VERSION on every release; old caches are cleared on
 * activate. All paths are relative because GitHub Pages serves the app from
 * a repository sub-path.
 */
'use strict';

const CACHE_VERSION = 'daggy-v1';

const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/style.css',
  './js/engine.js',
  './js/content-schema.js',
  './js/board.js',
  './js/progress.js',
  './js/app.js',
  './content/module1.js',
  './content/module2.js',
  './content/module3.js',
  './icons/icon.svg',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(resp => {
        // Cache successful same-origin responses so updates land in cache too.
        if (resp.ok && new URL(event.request.url).origin === location.origin) {
          const copy = resp.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(event.request, copy));
        }
        return resp;
      }).catch(() => {
        // Offline navigation fallback: serve the app shell.
        if (event.request.mode === 'navigate') return caches.match('./index.html');
        throw new Error('offline and not cached');
      });
    })
  );
});
