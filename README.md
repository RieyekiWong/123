# The Stillwater Hotel — The Lower Register

An English-language, Backrooms-inspired interactive horror mystery hidden inside an unassuming hotel website. The public site retains its ivory paper, bronze rules, traditional typography, and deep-teal masthead. An apparently successful checkout exposes a second, corrupted website and a longer investigation below the hotel.

This edition nearly doubles the narrative material, expands the notebook from six to twelve records, replaces simulated handwritten annotations with printed record sheets, and adds seven puzzle steps beyond the original two code locks.

## Download and play

On the [GitHub repository](https://github.com/RieyekiWong/123), choose **Code → Download ZIP**. Extract the entire archive and open the root `index.html` with Chrome or Edge. Do not open the HTML from inside the compressed archive. Extract this edition into a new folder rather than mixing its scripts with an old download.

All images, scripts, and styles are included. There are no runtime packages, remote fonts, external image services, sign-ups, API keys, or backend services. If your browser or organization blocks local HTML, use the local development server below.

## Two chapters

**The public hotel** contains rooms, a history, guest messages, fictional registration, the opening-night register, security footage, and a night-desk archive. The Hotel Guide adds dining and radio information, a reading room, courtyard walks, service instructions, residents' records, and lost property. The expanded employee archive includes an incident chronology and an unresolved night audit.

**The lower register** begins when the completed public investigation reaches the service stair. The apparent group checkout is rejected. The entire site switches to a dark, red-toned presentation, and an unsettling document interrupts the departure. Public information remains available through the navigation; a persistent banner returns to the lower chapter.

Six linked stations require different kinds of reasoning:

1. Reconstruct a four-circuit service sequence.
2. Tune an FM receiver using a retained programme card.
3. Extract a word from a printed menu.
4. Restore an erased identity using original records.
5. Read a reversed message in the observation glass.
6. Put three incident events in chronological order.

A final discharge combines the recovered instructions. An alternative staff appointment is a false resolution. In total, five departure records can be remembered, including the true ending. Completed stations stay unlocked and can be reviewed without duplicating evidence.

All required clues are inside this website. No real-world contact or outside investigation is needed. Source links beside the lower puzzles let you revisit relevant documents, and the notebook gives contextual pointers to missing records.

## Horror settings and local data

This edition includes distorted figures and sudden, short visual interruptions. **Site Information** in the footer controls sudden visual effects; turning them off hides the figures and interruptions without disabling any puzzle or the second chapter. Reduced-motion preferences suppress animated interruptions. There is no rapid flashing.

Ambient audio defaults to off. When explicitly enabled, Web Audio generates a quiet ventilation hum and short, low-volume knocks during some encounters. No audio is required to solve anything: the radio has a written transcript. Press Escape or use the close button to dismiss any document. The story never opens browser windows or requests fullscreen.

Nicknames, fictional registrations, twelve collected records, solved stations, preferences, five local guestbook notes, and remembered departures stay in this browser's `localStorage`. No note or reservation is sent to a server. Clearing site data erases progress. If storage is unavailable, play continues in the current tab.

Earlier progress from the first two editions is retained when possible. Players who already completed the public story can revisit Room 404 and choose the service stair to enter the new chapter without resetting. A reset in Site Information clears both chapters, closes audio, and retains the visual-effects preference.

The hotel, people, correspondence, keypad, bookings, apparent site compromise, and error messages are fictional. The employee code is a story puzzle, not an authentication system. Images are generated hotel assets; the visitor is an original SVG illustration.

## Development

Requires Node.js 20 or newer; verified with Node.js 24.

```bash
npm ci
npm run dev
```

The server uses port `3000`. Select another port with:

```bash
npm run dev -- --port 8080
```

This is a plain HTML, CSS, and JavaScript project. The two deferred scripts use no module imports so extracted copies can be played without installing dependencies. Reload after editing source files.

## Build and deployment

```bash
npm run build
```

Publish the **contents** of `dist/` to a static host such as GitHub Pages. Relative asset paths and hash navigation support repository subdirectories. Uploading source does not enable an online website automatically. No Node.js server is required for static hosting.

## Validation

```bash
npm run build
npm test
```

Service tests validate source and built resources, the expansion script, images, 404 handling, and protection of project metadata.

```bash
npx playwright install chromium
npm run test:e2e
```

The configuration uses `/usr/bin/chromium` when present, or `CHROMIUM_PATH` if specified. Browser tests start a separate service on port `3107` and cover:

- A full unseeded investigation through both chapters, all twelve records, all five departures, and reset.
- Wrong answers, station dependencies, adjustable frequency, sequence clearing, and discharge validation.
- Saved station progress, duplicate evidence prevention, and old-edition continuation.
- Printed source documents, English text, keyboard dismissal, preference persistence, reduced motion, and disabled visual effects.
- Registration, guestbook limits, escaped text, optional audio, corrupt or blocked storage, and browser navigation.
- Public and corrupted layouts at phone, tablet, and desktop widths.

## Files

- `index.html`: public homepage, shared navigation, chapter banner, and document container.
- `app.js`: public story, registration, base clues, state migration, and audio.
- `story-expansion.js`: hotel guide, expanded documents, lower chapter, puzzle validation, and true ending.
- `style.css`: responsive public site, printed records, corrupted theme, and optional visual effects.
- `assets/`: bundled hotel photographs, monogram, and original visitor illustration.
- `server.mjs` / `build.mjs`: local server and static build.
- `tests/`: service and browser tests.

<details>
<summary>Full walkthrough — spoilers for both chapters</summary>

### Public hotel

1. Register under a nickname to receive the Room 307 key.
2. Read the bedside card or Room 307 diary. Record the stopped time: **04:04**.
3. Open the floor directory, review the security recording, and save **CAM 02** showing Room 404.
4. Save **Rowan's warning** from the guestbook.
5. Copy the **opening-night register** in Our History. The hotel opened **03 October 1987**.
6. Enter the employee code **1003**: opening day, month first.
7. Record the **maintenance log** and **Eleanor's letter**. You now have six public records.
8. Unlock Room 404 with **0404**. The red EXIT and white door retain the two short endings.
9. With a room key and all six public records, choose the service stair. The group checkout is rejected and the lower register opens.

### The lower register

1. **Switchboard:** use the facilities sheet. Reception, kitchen, linen, night desk = **3 → 1 → 4 → 2**. Clear a mistaken sequence before trying again.
2. **Receiver:** the dining-room programme lists **88.7 FM**. Tune the slider to 88.7 MHz and decode the transcript.
3. **Census cabinet:** read the first letters of the five dinner courses: Smoked, Thyme, Iced, Lemon, Lavender = **STILL**.
4. **Missing resident:** the original photograph and residents' circular identify the proprietor in Room 311 as **WALTER VALE**. The relief porter belongs to 309.
5. **Observation glass:** reverse `YEK EHT NRUT TON OD` to **DO NOT TURN THE KEY**. Spaces and punctuation are ignored.
6. **Chronology:** **doors opened → clocks stopped → first guest returned**, corresponding to 03, 04, and 05 October 1987.
7. **Final discharge:** present the **original register**, **leave the key untouched**, and take the **service stair**. This closes the accounts and reveals the true ending, **For the first time, morning**.
8. Accepting the uniform instead records **The new night porter**. You can reject that appointment and retry the final discharge without losing progress.

</details>
