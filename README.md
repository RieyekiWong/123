# The Stillwater Hotel

An original, English-language, Backrooms-inspired browser mystery hidden inside an unassuming hotel website. Warm ivory paper, bronze rules, traditional typography, and a restrained deep-teal masthead conceal a story told through guest records, impossible architecture, and undelivered letters.

## Download and play

On the [GitHub repository](https://github.com/RieyekiWong/123), choose **Code → Download ZIP**. Extract the entire archive, then open the root `index.html` with Chrome or Edge. Do not open the HTML from inside the compressed archive.

There are no runtime dependencies, remote fonts, image services, sign-ups, API keys, or backend services. All images and scripts are included. If your browser or organization blocks local HTML files, use the local development server below.

## What is inside

- **Home:** the hotel's invitation, historic lobby, and maintenance notice.
- **Rooms & Suites:** three room descriptions, room details, amenities, guest guidelines, and an interactive floor directory.
- **Our History:** a five-part history and the original opening-night register.
- **Guestbook:** returning guests, a loose page from E. Rowan, and a local-only guest note form.
- **Reservations:** fictional registration, room preferences, a room key, and editable arrival details.
- **Employee Access:** a story keypad protecting maintenance logs, returned correspondence, security recordings, and shift instructions.
- **Guest notebook:** six recoverable records, contextual hints, and three remembered endings.

This is a fictional narrative. No real booking is made. No note is published. Nicknames, registrations, story progress, and the five most recent notes stay in this browser's `localStorage`. Clearing site data erases them. If storage is unavailable, play can continue in the current tab. The employee keypad is a puzzle, not an authentication mechanism. No investigation outside this site is required.

Optional ambient sound is generated locally with Web Audio and defaults to off. There are no sudden jump scares or flashing images. Reduced-motion preferences are respected. Documents support keyboard focus, Escape dismissal, and focus restoration.

## Development

Requires Node.js 20 or newer; verified with Node.js 24.

```bash
npm ci
npm run dev
```

The development server listens on port `3000`. To use another port:

```bash
npm run dev -- --port 8080
```

The project uses plain HTML, CSS, JavaScript, and a small Node.js static server. Files can be edited directly; reload the browser to see changes.

## Build and deployment

```bash
npm run build
```

Publish the **contents** of `dist/` to a static host such as GitHub Pages. Relative asset paths and hash-based navigation support repository subdirectories. Uploading code does not automatically enable an online website. The Node.js development server is not needed for static hosting.

## Validation

```bash
npm run build
npm test
```

The service tests check the source and built websites, local image delivery, 404 handling, and protection of project metadata.

For browser tests:

```bash
npx playwright install chromium
npm run test:e2e
```

If `/usr/bin/chromium` exists, it is used automatically. `CHROMIUM_PATH` can override the executable. Browser tests start an independent server on port `3107` and cover:

- The full six-record investigation and all three endings.
- Wrong codes, locked ending conditions, employee access, and archive logout.
- Room preferences, registration validation, editing, lookup, and local guest notes.
- Escaping user-provided text and keeping at most five local messages.
- Persistence, reset, corrupt or unavailable storage, and migration from the earlier edition.
- Keyboard dismissal, optional sound, browser navigation, English content, image delivery, and layouts at 320, 390, 768, 1320, and 1440 pixels.

## Files

- `index.html`: hotel home, navigation, footer, and document container.
- `style.css`: responsive public pages and archive document styles.
- `app.js`: navigation, story documents, puzzles, local state, and optional audio.
- `assets/`: bundled generated hotel imagery and the Stillwater monogram.
- `server.mjs` / `build.mjs`: local server and static build.
- `tests/`: service and browser tests.

The hotel, characters, events, reservations, and correspondence are fictional. The supplied visual reference inspired the public website's presentation; story text and interactions are original. Hotel images are generated assets. Earlier local story progress is migrated when possible without deleting the old record; an explicit reset clears both editions.

<details>
<summary>Story walkthrough — spoilers</summary>

1. Register under a nickname and collect the Room 307 key.
2. Read the guest guidelines or the diary under the pillow. Record the stopped time, **04:04**.
3. From the floor directory, consult the security recording and switch to **CAM 02**. Save the frame showing the extra door.
4. In the guestbook, record **E. Rowan's warning** about red and white doors.
5. In Our History, open the **opening-night register** and copy the record. Opening day was **03 October 1987**.
6. Open Employee Access. The night desk code is the opening date, month first: **1003**.
7. Record the **maintenance log** and **Eleanor's letter**. You now have all six records.
8. Open the guest notebook and find Room 404. Its lock code is the stopped time without the colon: **0404**.
9. The red EXIT leads to **The road home**. The white door leads to **A familiar place**. With an active registration and all six records, the service disconnect leads to **The last checkout**.

You can remember all three endings without resetting. Use Site Information in the footer to start a new stay.

</details>
