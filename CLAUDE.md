# DealCheck — Project Memory

## Site
- URL: https://dealcheck-app.pages.dev
- Stack: Vanilla HTML/CSS/JS, PWA (Service Worker), Cloudflare Pages
- No backend, no build step — deploy by pushing to main

## Keys / IDs
- GA4 Measurement ID: `G-ZEYCFH10JN` (init ที่ `/src/analytics.js`)
- AdSense client: `ca-pub-7049269744581719`

## Service Worker
- Current version: `dealcheck-v21` (ใน `sw.js`)
- เวลา bump ต้อง update `const CACHE = 'dealcheck-vXX'` และเพิ่ม assets ใหม่ใน ASSETS array

## Blog Articles
| Slug | TH | EN | วันที่ |
|------|----|----|--------|
| bogo-vs-discount | ✅ | ✅ | 18 พ.ค. 2026 |
| supermarket-tips | ✅ | ✅ | 18 พ.ค. 2026 |
| pack-vs-bottle | ✅ | ✅ | 18 พ.ค. 2026 |
| bulk-vs-single | ✅ | ✅ | 24 พ.ค. 2026 |
| unit-price-guide | ✅ | ✅ | 24 พ.ค. 2026 |

## เวลาเพิ่มบทความใหม่ ต้องอัปเดต
1. `blog/index.html` — เพิ่ม post card
2. `en/blog/index.html` — เพิ่ม post card (EN)
3. `sitemap.xml` — เพิ่ม 2 URL (TH + EN)
4. `sw.js` — bump version + เพิ่ม slug ใน ASSETS

## Product Hunt
- Scheduled launch: จันทร์ 26 พ.ค. 2026 14:01 น. ไทย (00:01 PT)
- แชร์ link ให้เพื่อนช่วย upvote ชั่วโมงแรกสำคัญที่สุด
