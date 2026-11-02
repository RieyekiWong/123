# The Stillwater Hotel — V2.1

A bilingual browser ARG that begins with an ordinary forum post: someone wants help checking a part-time job. A modern careers page leads to a hotel website and its retained 2006 records, night-audit records and two evidence-based dispositions. V2.1 adds Night Owl BBS, seven fictional local-shop adverts and plainer Chinese puzzle instructions without changing the case or its answers.

**Play:** [简体中文](https://rieyekiwong.github.io/123/index-zh.html) · [English](https://rieyekiwong.github.io/123/index.html)

The new case uses reservation R-4829, a discrepancy between the guest directory and a key sleeve, reviewer Mara Ellis and a current temporary assignment. Search, compare documents, inspect a floor plan, order timestamped records and review revisions. All necessary information is on the site. No external investigation or random password guessing is needed.

## Run or download

Download **Code → Download ZIP**, extract the entire folder and open `index-zh.html` or `index.html` in Chrome or Edge. The application uses ordinary deferred scripts and bundled images; there are no runtime dependencies, remote fonts, sign-ups, backend services or API keys. A local server is recommended for consistent browser storage:

```sh
npm ci
npm run dev
```

Open `http://localhost:3000/index-zh.html`. Node.js 20 or newer is required for the development tools, not for the static game.

## Forum and local adverts

The forum and careers page have their own footers; hotel operations appear on the hotel site. The public hotel now uses an early-2010s cream-and-bronze layout and a ten-photo album. Fifteen existing photographs were sourced from Wikimedia Commons and bundled locally, with no newly generated logos or images. See [photo sources and licenses](assets/WEB-PHOTOS.md).

New visitors start at Night Owl BBS. Follow the job preview, then review the sample to reach the reservation search. Existing V2 saves continue from a usable record; **Back to the forum** revisits the opening. Explicit hash links and language switches keep their destination.

Local adverts can be closed, kept, folded or opened from **My ad folder**. They appear infrequently on public pages, pause during forms and never appear in the investigation’s serious records. All advertising stops after Mara’s note. The shops have complete bilingual local pages, existing licensed photographs and no external tracking, media, orders or data collection. They are scenery, not puzzle clues.

Saved adverts use `stillwater-ads:v1`; sessionStorage holds per-tab cooldown and display history. Restarting the main case preserves the folder. Remove saved adverts individually in the folder.

## Saves and settings

The V2 save is `stillwater-case:v2`, with a versioned schema. Sources, unfinished sorting and selections, dispositions and viewing preferences survive refreshes and language changes on the same origin. **Case Notes** reopens sources already observed. Unavailable deep links offer a usable source link. If storage is blocked, the current tab remains playable and the footer explains that progress cannot be retained.

**Sound & settings** in the footer has opt-in low-volume notification audio, Reduce Motion, Skip Scares and a confirmed restart of this case. Sound starts off on every load. Brief connection effects are skipped by default; this edition has no monster-face interruptions, screams or embedded video. Audio is never necessary for a finding.

No form collects a name, email, phone, CV, payment information or real application. No answers are submitted to a server. The footer identifies the hotel, recruitment and records as fiction.

## Previous edition

The full previous story, support conversations, surveillance branch, lobby player and existing saves remain available at [classic-zh.html](https://rieyekiwong.github.io/123/classic-zh.html) / [classic.html](https://rieyekiwong.github.io/123/classic.html). Its original scripts and assets remain in the repository. Resetting V2 does not clear previous-edition storage. Guides: [English](README.classic.md) · [中文](README.classic.zh-CN.md).

## Development and release

```sh
npm run build
npm test
npm run test:e2e
```

`build` produces a complete static `dist/`. Node tests cover source/dist delivery and case transitions. Playwright runs separate `v2` and `classic` projects against actual edition-specific servers; use `npx playwright test --project=v2` for the new case. Chromium uses `CHROMIUM_PATH`, `/usr/bin/chromium` when available, or Playwright's installed browser.

GitHub Pages publishes `main` from `/ (root)`. Relative asset links support the repository path `/123/`. Upload the contents of `dist/` when using another static host. No build-time secrets or environment variables are required.

`case-data.js` holds canonical facts and clue provenance; `case-state.js` validates dependencies, saves and decisions; `case-pages.js` renders documents; `case-app.js` controls routing and forms; `case-comfort.js` controls optional effects. The classic runtime remains separate.

Photo authors and licenses are retained in [assets/CREDITS.md](assets/CREDITS.md), `assets/photo-credits.json` and the in-site credits. The real photographed properties and photographers are not part of this fictional story. Annotation layers are illustrative overlays. No reference-brand logos or website screenshots are shipped.

Production notes: [V2.1 delivery and screenshots](docs/V2_1-DELIVERY.zh-CN.md), [migration and staged checks](docs/V2-MIGRATION.md). **Spoilers:** [complete investigation route](docs/V2-PLAYER-ROUTE.zh-CN.md). [中文说明](README.zh-CN.md).
