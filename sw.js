const CACHE = 'dealcheck-v22';
const ASSETS = [
  '/',
  '/index.html',
  '/landing.html',
  '/privacy.html',
  '/en/',
  '/en/index.html',
  '/en/landing.html',
  '/en/privacy.html',
  '/about.html',
  '/en/about.html',
  '/src/core.js',
  '/src/app.js',
  '/src/analytics.js',
  '/src/lang-redirect.js',
  '/blog/',
  '/blog/index.html',
  '/blog/bogo-vs-discount',
  '/blog/bogo-vs-discount.html',
  '/blog/supermarket-tips',
  '/blog/supermarket-tips.html',
  '/blog/pack-vs-bottle',
  '/blog/pack-vs-bottle.html',
  '/en/blog/',
  '/en/blog/index.html',
  '/en/blog/bogo-vs-discount',
  '/en/blog/bogo-vs-discount.html',
  '/en/blog/supermarket-tips',
  '/en/blog/supermarket-tips.html',
  '/en/blog/pack-vs-bottle',
  '/en/blog/pack-vs-bottle.html',
  '/img/blog/bogo-chart.svg',
  '/img/blog/shopping-tips.svg',
  '/img/blog/pack-vs-single.svg',
  '/img/blog/bulk-vs-single.svg',
  '/img/blog/unit-price.svg',
  '/blog/bulk-vs-single',
  '/blog/bulk-vs-single.html',
  '/blog/unit-price-guide',
  '/blog/unit-price-guide.html',
  '/en/blog/bulk-vs-single',
  '/en/blog/bulk-vs-single.html',
  '/en/blog/unit-price-guide',
  '/en/blog/unit-price-guide.html',
  '/blog/store-brand-vs-name-brand',
  '/blog/store-brand-vs-name-brand.html',
  '/en/blog/store-brand-vs-name-brand',
  '/en/blog/store-brand-vs-name-brand.html',
  '/blog/flash-sale-tips',
  '/blog/flash-sale-tips.html',
  '/en/blog/flash-sale-tips',
  '/en/blog/flash-sale-tips.html',
  '/blog/grocery-budget',
  '/blog/grocery-budget.html',
  '/en/blog/grocery-budget',
  '/en/blog/grocery-budget.html',
  '/blog/fresh-market-vs-supermarket',
  '/blog/fresh-market-vs-supermarket.html',
  '/en/blog/fresh-market-vs-supermarket',
  '/en/blog/fresh-market-vs-supermarket.html',
  '/blog/cooking-oil-comparison',
  '/blog/cooking-oil-comparison.html',
  '/en/blog/cooking-oil-comparison',
  '/en/blog/cooking-oil-comparison.html',
  '/blog/store-layout-tricks',
  '/blog/store-layout-tricks.html',
  '/blog/promo-bundling',
  '/blog/promo-bundling.html',
  '/blog/online-vs-offline-grocery',
  '/blog/online-vs-offline-grocery.html',
  '/blog/seasonal-shopping',
  '/blog/seasonal-shopping.html',
  '/blog/expired-soon-deals',
  '/blog/expired-soon-deals.html',
  '/en/blog/store-layout-tricks',
  '/en/blog/store-layout-tricks.html',
  '/en/blog/promo-bundling',
  '/en/blog/promo-bundling.html',
  '/en/blog/online-vs-offline-grocery',
  '/en/blog/online-vs-offline-grocery.html',
  '/en/blog/seasonal-shopping',
  '/en/blog/seasonal-shopping.html',
  '/en/blog/expired-soon-deals',
  '/en/blog/expired-soon-deals.html',
  '/manifest.json',
  '/en/manifest.json',
  '/favicon-32.png',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/logo-68.webp',
  '/logo-68.png',
  '/fonts/fonts.css',
  '/fonts/sarabun-400-thai.woff2',
  '/fonts/sarabun-400-latin.woff2',
  '/fonts/sarabun-700-thai.woff2',
  '/fonts/sarabun-700-latin.woff2',
  '/fonts/sarabun-800-thai.woff2',
  '/fonts/sarabun-800-latin.woff2',
  '/fonts/nunito-700-latin.woff2',
  '/fonts/nunito-900-latin.woff2'
];

// Install — pre-cache core assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — network-first for HTML so updates propagate; cache-first for static assets
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  // Skip third-party scripts (AdSense, Analytics) — let browser handle freshly
  if (url.hostname.includes('googlesyndication') ||
      url.hostname.includes('google-analytics') ||
      url.hostname.includes('googletagmanager')) {
    return;
  }

  const isHTML = e.request.mode === 'navigate' ||
                 (e.request.headers.get('accept') || '').includes('text/html');

  if (isHTML) {
    // Network-first for HTML — always try fresh, fall back to cache offline
    e.respondWith(
      fetch(e.request).then(res => {
        if (res.ok && url.origin === self.location.origin) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => caches.match(e.request).then(cached => cached || caches.match('/')))
    );
  } else {
    // Cache-first for static assets (icons, fonts, manifest)
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(res => {
          if (res.ok && url.origin === self.location.origin) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        });
      })
    );
  }
});
