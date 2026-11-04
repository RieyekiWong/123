V2.11 revises shop, forum-interface, recruitment, hotel and later-chapter copy. Chat and authored forum threads and replies are preserved. See the [release notes](docs/v2.11/DELIVERY.zh-CN.md) and [full copy review](docs/V2_11-COPY-REVIEW.zh-CN.md).

AI chat is live in the [current edition](https://rieyekiwong.github.io/123/index.html?v=4.11.0#chat). Choose **AI chat → Agree and enable** to opt in; local replies remain available. See the [Cloudflare Edit code guide](workers/chat/dashboard/README.zh-CN.md), [integration report](docs/V2_10-AI-CHAT.zh-CN.md), and [real production browser checks](docs/v2.10/live-frontend.json).

# The Stillwater Hotel — V2.5

A bilingual browser ARG that begins in a local group chat with friends. GGbond shares a forum post about a part-time job, which opens the existing Night Owl BBS thread. A modern careers page leads to a hotel website and its retained 2006 records, night-audit records and two evidence-based dispositions. V2.3 preserves Night Owl BBS, the seven fictional shops and the original case, then adds a mirrored hotel, spatial camera relay, operable circuit graph and a third disposition.

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

New visitors begin at `#chat` after the content/settings preface. The 54-message opening now takes roughly three minutes, with free text and local replies. The forum card arrives automatically within two minutes of active conversation, even if the player is reading older messages; no keyword is required. Asking for the link can bring the share forward; it opens `#forum?topic=job` immediately. Follow the job preview, then review the sample to reach the reservation search. Existing V2 saves continue from a usable record; **Back to the forum** revisits the opening. Explicit hash links and language switches keep their destination.

Local adverts appear as early-web popup windows in random screen corners, with bevelled borders, blue title bars and selected blinking labels or border lights. They can be closed, kept, minimized, restored or opened from **My ad folder**. Up to two occupy opposite desktop edges; phones and tablets show one. Windows cover the page directly without resizing it or taking over scrolling. Popups pause during forms and never appear in the investigation’s serious records. Advertising stops after Mara’s note and during the altered chapters; saved adverts are preserved and return after the true ending. The shops have complete bilingual local pages, existing licensed photographs and no external tracking, media, orders or data collection. They are scenery, not puzzle clues.

Saved adverts use `stillwater-ads:v1`; sessionStorage holds per-tab cooldown and display history. Chat uses a separate `stillwater-chat:v1` record for messages, drafts and reading position. Refreshing or switching languages preserves it; a confirmed game restart clears the chat and current case together. Restarting the main case preserves the ad folder. Remove saved adverts individually in the folder.

## Saves and settings

The V2 save is `stillwater-case:v2`, with a versioned schema. Sources, unfinished sorting and selections, camera directions and connections, circuit rotations and switches, undo history, dispositions and viewing preferences survive refreshes and language changes on the same origin. **Case Notes** reopens sources already observed. Unavailable deep links offer a usable source link. If storage is blocked, the current tab remains playable and the footer explains that progress cannot be retained.

First visits show a bilingual preface with fiction/content notes, controls, credits and two choices. **Audio defaults off; faces and jump scares default on.** Players can disable them before entering or reopen How to play in the header. Explicit skip choices and device Reduce Motion remain respected.

**Sound & settings** in the footer controls volume, motion and scares. Breathing enters automatically with enabled sound in the deeper chapter. The first successful escape shows its distinct full-screen face, then a clear GAME OVER screen. Skip/reduced-motion modes reach the same completion directly. Reloading or revisiting an ending never replays that effect.

No form collects a name, email, phone, CV, payment information or real application. No answers are submitted to a server. The footer identifies the hotel, recruitment and records as fiction.

## Current-edition scope

This website, its default development server and the `dist/` release are independent of the archived edition. There are no edition-switch links or redirects. Archived source files and their separate saves remain intact; current development and browser checks target V2 only.

## Development and release

```sh
npm run build
npm test
npm run test:e2e
```

`build` produces a standalone V2 `dist/` using `site-files.mjs`, excluding archived pages and scripts. Node tests cover source/dist delivery, edition separation and case transitions. Playwright runs the V2 browser project only. Chromium uses `CHROMIUM_PATH`, `/usr/bin/chromium` when available, or Playwright's installed browser.

GitHub Pages publishes `main` from `/ (root)`. Relative asset links support the repository path `/123/`. Upload the contents of `dist/` when using another static host. No build-time secrets or environment variables are required.

`case-data.js` holds canonical facts and clue provenance; `case-state.js` validates dependencies, saves and decisions; `case-pages.js` renders documents; `case-app.js` controls routing and forms; `case-comfort.js` controls optional effects. The classic runtime remains separate.

Photo authors and licenses are retained in [assets/CREDITS.md](assets/CREDITS.md), `assets/photo-credits.json` and the in-site credits. The real photographed properties and photographers are not part of this fictional story. Annotation layers are illustrative overlays. No reference-brand logos or website screenshots are shipped.

Production notes: [V2.1 delivery and screenshots](docs/V2_1-DELIVERY.zh-CN.md), [migration and staged checks](docs/V2-MIGRATION.md). **Spoilers:** [complete investigation route](docs/V2-PLAYER-ROUTE.zh-CN.md). [中文说明](README.zh-CN.md).


## V2.3 equipment chapters

The original forum, advertisements, case sources and classic edition remain. After the final source review, synchronize the directory to enter a persistent altered hotel, a camera-panning spatial relay and a six-junction circuit puzzle with actual reciprocal-port graph traversal. Isolate auto-write, select manual mode and lock the original archive for the new hidden disposition. Schema-two saves retain their original clues, drafts and past endings.

All raster images have local low-resolution display copies; originals and licenses are preserved. Shared CCTV treatment covers both editions. The night terminal includes optional soft synthesized breathing, a single explicitly triggered, skippable mask frame and a small pointer-local glass ripple that respects reduced motion and touch input.

See [implementation and route](docs/V2_3-IMPLEMENTATION.zh-CN.md), [complete Chinese copy audit](COPY-AUDIT.zh-CN.md), [verification](docs/V2_3-VERIFICATION.zh-CN.md) and [image derivatives / licenses](assets/RETRO-IMAGES.md).


### V2.4 · Connected service space

The preserved case now leads through altered public pages into a connected 317 / B-3 point-and-click passage. Six action-authored, persistent scare events use three distinct existing portraits; sudden effects default on with a clear preface choice and complete skip-mode story parity. Camera spaces use a shared, on-demand 320×240 software renderer with separate canonical-date HUDs. Existing deep saves do not require replaying the new passage. See [implementation](docs/V2_4-EXPLORATION.zh-CN.md), [walkthrough](WALKTHROUGH.zh-CN.md), [visual audit](VISUAL-AUDIT.md) and [copy inventory](COPY-AUDIT-V2_4.zh-CN.md).


### V2.4.1 · Preface & final escape scare

See [implementation and verification](docs/V2_4_1-WELCOME.zh-CN.md). Sound remains gesture-enabled; past automatic skip defaults migrate without resetting the case.

### V2.4.2 · Distinct scare actions & physical wiring

The new edition now uses four newly generated scenes with visibly different bodies and actions: looking over a shoulder, crawling from a cabinet, pressing both palms against glass, and leaning inverted from a ceiling beam. Scare images retain their complete composition, use bundled low-resolution copies, and wait for image decoding before their visible duration starts. [Static image preview](https://rieyekiwong.github.io/123/haunt-preview.html) contains spoilers but no automatic scares or sound.

B-3's existing six-junction puzzle gains screw terminals, clamps, shielding, a cable duct and indicators driven by the real circuit state. Ports, solution, undo/reset, story, preferences and schema-two saves remain unchanged. Sources and image hashes: [asset manifest](assets/haunt-v442/manifest.json).

### V2.4.3 · Independent release & explicit endings

All three outcomes now have completion cards. Saving or restoring a missing frame brings the next device control into view; locking the archive focuses the real exit button. The true ending finishes its final scare before showing GAME OVER. Cancelling, skipping or failing to load the image cannot prevent completion, and reloading never repeats the scare. Restart remains a confirmed action and preserves unrelated saves and saved adverts.

### V2.4.4 · Millennium popup advertisements

The fixed forum banner and the proposed manual carousel are replaced by randomly appearing ad windows. Initial cooldown is 12–24 seconds, followed by 18–36 seconds of eligible quiet browsing; the forum also has an eight-second opening grace. Seven different campaigns can appear in a tab without requiring navigation. Previously saved shops and session history are retained. Text blinking and border lights stop with Reduce Motion, and all popup activity still stops after Mara's note and during the altered chapters.

### V2.5 · Friends, the forum and the night shift

The new messenger opening joins the existing case without replacing its clues, equipment or endings. Its local response bank distinguishes everyday topics, job questions, link requests and unknown story terms, and never writes messages as the player. No chat account or online AI service is connected. Existing case saves and explicit deep links retain their destinations; the forum footer provides Back to chat. Automatic closure now issues Rieyeki’s staff card, while the true ending still locks the originals, ends the assignment and shows GAME OVER.

[Implementation and verification](docs/V2_5-DELIVERY.zh-CN.md) · [Copy review](docs/V2_5-COPY.zh-CN.md) · [Screenshots](docs/v2.5/visual-results.json).


### V2.6 · An automatic invitation and the unlisted chapter

The messenger now follows a full-window desktop layout, with licensed, bundled animal photo avatars, clearer speaker ownership and faster, context-aware replies. GGbond handles the job, pay and share card. Quiet-browsing ad cooldowns are 6–12 seconds initially and 9–18 seconds thereafter, with the same overlay, limits, saved folder and serious-page exclusions.

After a valid saved B-3 circuit and restored frame, open **View the unlisted picture**. A separate low-resolution black space offers three physical/observational interactions: a deterministic corridor, draggable fragments and a classification terminal. Two distinct faces appear only on deliberate review/look-back actions and honor all existing comfort preferences. Return to B-3 to lock the original archive and choose an existing ending; no fourth ending is added. Previously completed saves remain complete and may visit voluntarily; incomplete saves retain their case, equipment and choices.

[Delivery and verification](docs/V2_6-DELIVERY.zh-CN.md) · [Walkthrough (spoilers)](WALKTHROUGH.zh-CN.md) · [Avatar attribution](assets/chat-avatars/SOURCES.md) · [Chapter art provenance](assets/void-v26/SOURCES.md) · [Visual records](docs/v2.6/visual-results.json).


### V2.6.2 · Doors in the black chapter

Doors now have recessed panels, handles, hinges and thresholds. The four outgoing floor lines beneath the corridor doors are removed; chipped thresholds retain the same left/right clue. Puzzle solutions, scares and saves are preserved. The requested introductory paragraph is removed in both languages. See [changes and verification](docs/V2_6_2-DOORS.zh-CN.md).


### V2.7 · Mixed early-web popup campaigns

The original seven adverts remain alongside seven new layouts: visitor prizes, cinema posters, PC utilities, clearance grids, coupons, message invitations and weather widgets. Eligible browsing cooldowns are now 4–7 seconds initially and 6–11 seconds thereafter. Ads continue after the first seven distinct shops, with a 45-second cooldown after closing a shop. Bottom-right placements are more frequent, including on phones. Existing saved adverts, story progress, motion preferences and serious-page exclusions remain supported. [Changes and verification](docs/V2_7-ADS.zh-CN.md).
