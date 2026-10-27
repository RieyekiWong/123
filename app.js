(() => {
  "use strict";
  const STORAGE_KEY = "stillwater-hotel:v2";
  const $ = (selector) => document.querySelector(selector);
  const main = $("#page-content");
  const homeMarkup = main.innerHTML;
  const dialog = $("#story-dialog");
  const dialogBody = $("#dialog-body");
  const escape = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const fresh = () => ({
    name: "",
    checkedIn: false,
    arrival: "2026-10-27",
    nights: 1,
    roomType: "classic",
    clues: [],
    endings: [],
    staff: false,
    messages: [],
    chapter: 1,
    puzzles: [],
    scares: true,
    wrongAnswers: 0,
  });
  let expansion;
  const baseClueIds = [
    "clock",
    "door",
    "ribbon",
    "register",
    "switch",
    "letter",
  ];
  const baseReady = () =>
    state.checkedIn && baseClueIds.every((id) => state.clues.includes(id));
  const recordTarget = () => (state.chapter >= 2 ? 12 : 6);
  const clues = {
    ...window.StillwaterExpansion.clues,
    clock: {
      title: "The stopped clock",
      source: "Read the guest guidelines or the diary in Room 307.",
      text: "Every clock stops at 04:04. The lock on the unlisted door accepts four numbers, without a colon.",
    },
    door: {
      title: "A sixth door",
      source: "Look carefully at Camera 02 in the security office.",
      text: "The third-floor plan has five rooms. The recording shows a sixth door: 404. It appears when the clock stops.",
    },
    ribbon: {
      title: "Rowan’s warning",
      source: "Read the loose page in the guestbook.",
      text: "Follow the red EXIT sign. The welcoming white door brings you back to reception, not home.",
    },
    register: {
      title: "The original register",
      source: "Examine the opening-night ledger in Our History.",
      text: "The hotel opened on 03 October 1987. Eleanor Vale in Room 307 never checked out. The printed instruction says: the staff keypad uses opening day, month first.",
    },
    switch: {
      title: "The service disconnect",
      source: "Find the maintenance log in the employee archive.",
      text: "Behind the lobby clock is a brass disconnect marked STILLWATER. Take the original register, cut the power, then use the service stair instead of either exit door.",
    },
    letter: {
      title: "A letter never delivered",
      source: "Open Returned Correspondence in the employee archive.",
      text: "Eleanor left a signed group checkout slip inside the original register. With every record accounted for, one living guest can release everyone. Bring all six pieces of evidence.",
    },
  };
  let state = fresh();
  try {
    let raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!raw) {
      const old = JSON.parse(localStorage.getItem("no-return-hotel:v1"));
      if (old && typeof old === "object")
        raw = {
          ...old,
          clues: (Array.isArray(old.clues) ? old.clues : []).map(
            (c) => ({ clock: "clock", tape: "door", name: "ribbon" })[c],
          ),
          endings: old.ending
            ? [old.ending === "exit" ? "departure" : "return"]
            : [],
        };
    }
    if (raw && typeof raw === "object")
      state = {
        ...fresh(),
        name: typeof raw.name === "string" ? raw.name.slice(0, 40) : "",
        checkedIn:
          raw.checkedIn === true &&
          typeof raw.name === "string" &&
          !!raw.name.trim(),
        arrival:
          typeof raw.arrival === "string" &&
          /^\d{4}-\d{2}-\d{2}$/.test(raw.arrival)
            ? raw.arrival
            : fresh().arrival,
        nights:
          Number.isInteger(raw.nights) && raw.nights >= 1 && raw.nights <= 7
            ? raw.nights
            : 1,
        roomType: ["classic", "twin", "residence"].includes(raw.roomType)
          ? raw.roomType
          : "classic",
        clues: Array.isArray(raw.clues)
          ? [...new Set(raw.clues.filter((c) => Object.hasOwn(clues, c)))]
          : [],
        endings: Array.isArray(raw.endings)
          ? [
              ...new Set(
                raw.endings.filter((e) =>
                  [
                    "departure",
                    "return",
                    "release",
                    "custodian",
                    "dawn",
                  ].includes(e),
                ),
              ),
            ]
          : [],
        staff: raw.staff === true,
        chapter: [1, 2, 3].includes(raw.chapter) ? raw.chapter : 1,
        puzzles: Array.isArray(raw.puzzles)
          ? [
              ...new Set(
                raw.puzzles.filter((id) =>
                  [
                    "power",
                    "radio",
                    "archive",
                    "identity",
                    "mirror",
                    "chronology",
                  ].includes(id),
                ),
              ),
            ]
          : [],
        scares: raw.scares !== false,
        wrongAnswers:
          Number.isSafeInteger(raw.wrongAnswers) && raw.wrongAnswers >= 0
            ? raw.wrongAnswers
            : 0,
        messages: Array.isArray(raw.messages)
          ? raw.messages
              .filter(
                (m) =>
                  m && typeof m.name === "string" && typeof m.text === "string",
              )
              .slice(-5)
              .map((m) => ({
                name: m.name.slice(0, 40),
                text: m.text.slice(0, 400),
              }))
          : [],
      };
  } catch {
    /* A damaged or unavailable store must never prevent play. */
  }
  let toastTimer;
  let returnFocus;
  let soundContext = null;
  let storageWarning = false;
  function toast(message) {
    $("#toast").textContent = message;
    $("#toast").classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(
      () => $("#toast").classList.remove("visible"),
      4200,
    );
  }
  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      if (!storageWarning) {
        storageWarning = true;
        toast("Storage is unavailable. You can still explore in this tab.");
      }
    }
    $("#clue-count").textContent = `${state.clues.length} / ${recordTarget()}`;
    expansion?.applyTheme();
    $("#session-label").textContent = state.checkedIn
      ? `${state.name} · ROOM 307`
      : "GUEST COPY";
  }
  const clueButton = (id, label = "Keep this in my notebook") =>
    `<button class="paper-button" data-clue="${id}" ${state.clues.includes(id) ? "disabled" : ""}>${state.clues.includes(id) ? "Recorded in your notebook ✓" : label + " ＋"}</button>`;
  function collect(id) {
    if (!Object.hasOwn(clues, id) || state.clues.includes(id)) return;
    state.clues.push(id);
    save();
    document.querySelectorAll(`[data-clue="${id}"]`).forEach((button) => {
      button.textContent = "Recorded in your notebook ✓";
      button.disabled = true;
    });
    toast(
      `Added to notebook: ${clues[id].title} (${state.clues.length}/${recordTarget()})`,
    );
  }
  function show(
    title,
    content,
    label = "THE STILLWATER HOTEL / GUEST SERVICES",
  ) {
    if (!dialog.open) returnFocus = document.activeElement;
    $("#dialog-label").textContent = label;
    dialogBody.innerHTML = `<p class="eyebrow">The Stillwater Hotel · Est. 1987</p><h2 id="dialog-title">${escape(title)}</h2>${content}`;
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
    $("#dialog-close").focus({ preventScroll: true });
  }
  function close() {
    dialog.close();
  }
  $("#dialog-close").addEventListener("click", close);
  dialog.addEventListener("close", () => {
    if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
  });
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (
      event.clientX < r.left ||
      event.clientX > r.right ||
      event.clientY < r.top ||
      event.clientY > r.bottom
    )
      close();
  });
  const heading = (eyebrow, title, text, meta = "") =>
    `<header class="page-heading"><p class="eyebrow">${eyebrow}</p><h1>${title}</h1><p class="lead">${text}</p>${meta ? `<p class="heading-meta">${meta}</p>` : ""}</header>`;
  const roomCards = [
    [
      "classic",
      "A classic welcome",
      "Classic Double",
      "A well-made bed, a reading lamp, and the quiet reassurance of a room that feels like your own. Our original rooms overlook the sheltered courtyard.",
      "One double bed · Private bath · Writing desk",
      "assets/guestroom.png",
      "A warmly lit vintage bedroom with a walnut bed and a writing desk",
      "",
    ],
    [
      "twin",
      "A little more room",
      "Heritage Twin",
      "Traditional furnishings and space to settle in together. Soft lighting, crisp linens, and a sitting corner for conversations that last a little longer.",
      "Two single beds · Sitting area · Tea service",
      "assets/guestroom.png",
      "The warm furnishings of a heritage guest room",
      "room-twin",
    ],
    [
      "residence",
      "For a longer stay",
      "The Residence",
      "For guests who prefer not to hurry. Located at the quieter end of the third floor, with a private vestibule and all the time you need.",
      "Third floor · Extended stays · Turn-down service",
      "assets/hallway.png",
      "A quiet corridor leading to the Residence rooms",
      "room-long",
    ],
  ];
  function roomsPage() {
    return (
      heading(
        "Rooms & suites",
        "A place already prepared for you.",
        "Considered comforts, familiar furnishings, and no reason to rush. Every room has its own character. We will find the one that remembers you.",
      ) +
      `<div class="page-main"><div class="room-grid">${roomCards.map(([id, label, title, text, features, photo, alt, css]) => `<article class="room-card"><div class="room-image ${css}"><img src="${photo}" alt="${alt}"><span class="room-photo-label">${label}</span></div><div class="room-card-copy"><p class="eyebrow">${id === "residence" ? "Third floor / Limited availability" : "Guest accommodation"}</p><h2>${title}</h2><p>${text}</p><div class="room-features">${features}</div><button class="underlined" data-roomtype="${id}">View room details →</button></div></article>`).join("")}</div><div class="two-column"><section class="prose"><p class="eyebrow">Included in every stay</p><h2>Nothing overlooked.</h2><ul class="amenities"><li>Daily housekeeping</li><li>Fresh linens & towels</li><li>In-room tea service</li><li>24-hour front desk</li><li>Private bathroom</li><li>Complimentary wake-up calls</li></ul><p>Breakfast is served in the ground-floor dining room from 7:00 to 9:00. Please leave your key at reception before taking a walk. We are always pleased to see you return.</p><a class="button" href="#reservations">Request a room →</a></section><aside class="notice"><p class="eyebrow">For your comfort</p><h3>A few house traditions</h3><p>Quiet hours begin at 10:00 p.m. Our third-floor restoration is ongoing. Before settling in, please take a moment to read the card left on your bedside table.</p><button class="underlined" data-action="rules">Read the guest guidelines →</button></aside></div><div class="archive-teaser"><div><p class="eyebrow">A note about our floor plan</p><h3>Three floors. A familiar way home.</h3><p>If your key does not match a room on our plan, please consult reception before proceeding.</p></div><button class="unlisted-link" data-action="explore">Consult the floor directory →</button></div></div>`
    );
  }
  function historyPage() {
    return (
      heading(
        "Our history",
        "Some places stay with you.",
        "Built on a simple promise: a warm welcome, a comfortable room, and a place to return to. The Stillwater has been keeping that promise since 1987.",
      ) +
      `<div class="page-main two-column"><section><div class="timeline"><article><p class="eyebrow">03 October 1987</p><h2>Our doors open.</h2><p>Walter and Eleanor Vale welcome their first guests to a small family hotel on the old Stillwater road. Eleanor writes each name in a leather-bound register. The original book remains in our care.</p></article><article><p class="eyebrow">1996</p><h2>More room to belong.</h2><p>The east wing brings additional guest rooms and a covered courtyard. The family insists that every corridor should feel just like the first. Some guests still find it difficult to tell them apart.</p></article><article><p class="eyebrow">2003</p><h2>A gift of time.</h2><p>A returning guest donates the brass clock above the reception desk. It is the only original fixture that has never needed winding. Its maintenance records are held by the night porter.</p></article><article><p class="eyebrow">2016</p><h2>Preserving what matters.</h2><p>A careful restoration begins on the third floor. Work continues today. We thank our long-stay residents for their extraordinary patience.</p></article><article><p class="eyebrow">Today</p><h2>The same welcome, every time.</h2><p>Our family may have changed, but our promise has not. Many of our earliest guests are still with us in spirit. A few have simply never found the right time to leave.</p></article></div><p class="quote">“A hotel is not its rooms. It is the people it remembers.”<br><span class="fine-print">— Eleanor Vale, opening-night address</span></p></section><aside><img class="history-photo" src="assets/lobby.png" alt="The historic lobby, shown with an aged photographic finish"><div class="archive-box"><p class="eyebrow">From the hotel collection</p><h3>The opening-night register</h3><p>Seven entries. Seven brass keys. A page written on the first evening that our doors opened. Reproduced here by permission of the family.</p><button class="underlined" data-action="ledger">Examine the original page →</button></div><div class="archive-box" style="margin-top:22px"><p class="eyebrow">Restoration bulletin / 10.03</p><h3>A temporary inconvenience</h3><p>Third-floor access is restricted after quiet hours. Please disregard floor numbers not listed on your guest map.</p><button class="underlined" data-action="notice">Read the full bulletin →</button></div></aside></div>`
    );
  }
  function guestbookPage() {
    return (
      heading(
        "The guestbook",
        "A few words from familiar faces.",
        "For almost four decades, guests have left a little of themselves between these pages. We keep every message. Some seem to find their way back.",
      ) +
      `<div class="page-main book-layout"><section aria-label="Guest messages"><article class="guest-entry"><div class="entry-meta"><span>Margaret H. · Room 108</span><time>14 June 2026</time></div><blockquote>“I came for a quiet weekend and ended up staying a little longer. The staff remembered exactly how I take my tea. I do not recall telling them.”</blockquote><p class="signature">A very thoughtful place.</p></article><article class="guest-entry"><div class="entry-meta"><span>David & Ruth · Room 214</span><time>22 August 2026</time></div><blockquote>“The same wallpaper, the same armchair, the same gentleman at reception. Our first visit was in 1987. It is wonderful how little things change here.”</blockquote><p class="signature">We will be back. Apparently, we always are.</p></article><article class="guest-entry"><div class="entry-meta"><span>Anonymous · Long-stay guest</span><time>Date not recorded</time></div><blockquote>“The view outside my window has not changed in six days. The bird on the railing has not moved. Housekeeping says the weather is holding.”</blockquote></article><article class="guest-entry suspect"><div class="entry-meta"><span>E. Rowan · Room 307</span><span>A loose page, folded twice</span></div><blockquote>“If you are reading this, do not let them turn another page. The red EXIT is the way out. The white door only brings you back to the desk. I have signed that book so many times I no longer recognize my own handwriting.”</blockquote><p class="signature">There is a small red ribbon pressed into the paper.</p><div class="inline-actions">${clueButton("ribbon", "Keep Rowan’s warning")}</div></article>${state.messages.map((m) => `<article class="guest-entry local-guest-entry"><div class="entry-meta"><span>${escape(m.name)} · A note from this visit</span><span>Saved on this device</span></div><blockquote>${escape(m.text)}</blockquote></article>`).join("")}</section><aside class="sidebar-sticky"><form id="guestbook-form" class="form-panel"><p class="eyebrow">Leave a little of yourself</p><h2>Your page in our story.</h2><p>A memory, a thought, a message for the next person who finds this book.</p><label class="field-label" for="message-name">Your name or initials</label><input class="text-input" id="message-name" name="guestName" maxlength="40" value="${escape(state.name)}" required autocomplete="nickname"><label class="field-label" for="guest-message">Your message</label><textarea class="text-input text-area" id="guest-message" name="message" maxlength="400" placeholder="Something worth remembering…" required></textarea><div class="character-count"><span id="message-count">0</span> / 400</div><div id="guestbook-error" class="form-error" role="status"></div><button class="button full-width" type="submit">Leave a note →</button><p class="local-note">This is a fictional guestbook. Notes are kept only in your browser, never published or sent. The five most recent notes are retained.</p></form><div class="notice" style="margin-top:23px"><p class="eyebrow">Looking for someone?</p><h3>We keep our records.</h3><p>If a name seems familiar, our opening-night register may help you remember why.</p><a class="underlined" href="#history">Visit the hotel collection →</a></div></aside></div>`
    );
  }
  function reservationForm() {
    return `<form id="reservation-form" class="form-panel"><p class="eyebrow">Guest registration</p><h2>Let us keep a room for you.</h2><p>Please use a nickname. This is part of the story, not a real reservation.</p><label class="field-label" for="guest-name">Guest name</label><input class="text-input" id="guest-name" name="guestName" maxlength="40" value="${escape(state.name)}" placeholder="The name on your invitation" autocomplete="nickname" required><div class="form-row"><div><label class="field-label" for="arrival-date">Arrival date</label><input class="text-input" id="arrival-date" type="date" name="arrival" value="${state.arrival}" min="1987-10-03" max="2099-12-31" required></div><div><label class="field-label" for="stay-length">Length of stay</label><select class="text-input" name="nights" id="stay-length">${[1, 2, 3, 4, 5, 6, 7].map((n) => `<option value="${n}" ${state.nights === n ? "selected" : ""}>${n} night${n > 1 ? "s" : ""}</option>`).join("")}</select></div></div><label class="field-label" for="room-preference">Room preference</label><select class="text-input" name="roomType" id="room-preference">${roomCards.map(([id, , title]) => `<option value="${id}" ${state.roomType === id ? "selected" : ""}>${title}</option>`).join("")}</select><div class="check-row"><input type="checkbox" name="guidelines" id="agree-guidelines" required><label for="agree-guidelines">I have read the <button type="button" class="underlined" data-action="rules">guest guidelines</button> and agree to remain on the floors listed on my map.</label></div><div class="form-error" id="reservation-error" role="status"></div><button class="button full-width" type="submit">Collect my room key <span>→</span></button><p class="local-note">No payment, email, or personal identification is needed. Your registration stays on this device.</p></form>`;
  }
  function confirmation() {
    return `<section class="form-panel"><p class="eyebrow">Your registration is complete</p><h2>Welcome back, ${escape(state.name)}.</h2><p>We have taken care of your room preference. As always, the key waiting at reception is yours.</p><div class="welcome-key"><p class="eyebrow">Your room is ready</p><div class="key-number">307</div><p>Third floor · The end of the west corridor</p></div><ul class="details-list"><li><span>Guest</span><span>${escape(state.name)}</span></li><li><span>Arrival</span><span>${state.arrival}</span></li><li><span>Requested stay</span><span>${state.nights} night${state.nights > 1 ? "s" : ""}</span></li><li><span>Departure</span><span>To be confirmed</span></li></ul><div class="inline-actions"><button class="button" data-action="explore">Go to my room →</button><button class="underlined" data-action="edit-reservation">Amend registration</button></div><p class="local-note">A fictional registration, saved only on this device.</p></section>`;
  }
  function reservationsPage(edit = false) {
    return (
      heading(
        "Reservations",
        "We have been expecting you.",
        "A night away. A fresh beginning. A familiar place to rest. Tell us what to call you, and we will take care of the rest.",
      ) +
      `<div class="page-main reservation-layout">${state.checkedIn && !edit ? confirmation() : reservationForm()}<aside class="reservation-aside"><p class="eyebrow">The small details</p><h2>Make yourself at home.</h2><p>Reception is staffed day and night. There is no need to hurry your arrival; a lamp will be left on until you are settled.</p><ul class="details-list"><li><span>Check-in</span><span>From 3:00 p.m.</span></li><li><span>Quiet hours</span><span>10:00 p.m. – 7:00 a.m.</span></li><li><span>Breakfast</span><span>7:00 – 9:00 a.m.</span></li><li><span>Front desk</span><span>Always here</span></li></ul><div class="notice"><p class="eyebrow">Before you settle in</p><h3>A familiar routine.</h3><p>Please read the guest guidelines, keep your room key with you, and do not follow voices into an unlit corridor. A member of staff will find you if you need us.</p><button class="underlined" data-action="rules">Read the guest guidelines →</button></div><div class="inline-actions"><button class="underlined" data-action="lookup">Already have a room number? →</button></div></aside></div>`
    );
  }
  function employeesPage() {
    if (!state.staff)
      return (
        heading(
          "Hotel resources",
          "Employee access",
          "For current Stillwater staff and the night porter. Guest services can be reached through reception.",
        ) +
        `<div class="page-main"><div class="employee-intro"><form id="employee-form" class="form-panel"><p class="eyebrow">Internal records / Authorized staff</p><h2>Night desk sign-in</h2><p>Enter the four-digit access code from your induction card.</p><label class="field-label" for="staff-code">Staff access code</label><input class="text-input" id="staff-code" name="staffCode" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" autocomplete="off" placeholder="Four digits" required><div class="form-error" id="employee-error" role="status"></div><button class="button full-width" type="submit">Open staff records →</button><p class="employee-notice">Forgotten the code? Mr. Vale’s old instruction still applies: “Opening day. Month first.” The date is preserved in our public history.</p><p class="local-note">This is a story puzzle, not a real account or authentication system.</p></form><div class="inline-actions"><a class="underlined" href="#history">Consult the hotel history →</a></div></div></div>`
      );
    return (
      heading(
        "Internal hotel resources",
        "The night desk archive",
        "Please return every file to the drawer in which you found it. Do not amend a guest’s departure date without their consent.",
      ) +
      `<div class="page-main"><div class="staff-status"><span>ACCESS GRANTED · NIGHT PORTER / SESSION STORED LOCALLY</span><button data-action="staff-logout">Lock archive</button></div><div class="staff-tools"><button class="button" data-action="monitor">Security monitors →</button><button class="button button-secondary" data-action="explore">Third-floor directory →</button></div><div class="document-grid"><button class="document-card" data-action="maintenance"><p class="eyebrow">File 01 / Facilities</p><h2>Maintenance log</h2><p>Repeated clock failures, a service stair not shown on public plans, and an electrical disconnect that must never be touched.</p><span class="underlined">Read the log →</span></button><button class="document-card" data-action="letter"><p class="eyebrow">File 02 / Undelivered mail</p><h2>Returned correspondence</h2><p>A letter addressed to the next occupant of Room 307. It has been opened, resealed, and returned for thirty-nine years.</p><span class="underlined">Open the letter →</span></button><button class="document-card" data-action="ledger"><p class="eyebrow">File 03 / Guest records</p><h2>The original register</h2><p>Opening-night guest names. All seven entries share the same unresolved departure field.</p><span class="underlined">Examine the register →</span></button><button class="document-card" data-action="nightmemo"><p class="eyebrow">File 04 / Personnel</p><h2>Instructions for the relief porter</h2><p>The face behind the desk may change. The instructions do not. Please do not read the final paragraph aloud.</p><span class="underlined">Read shift instructions →</span></button><button class="document-card" data-action="incident"><p class="eyebrow">File 05 / Incident review</p><h2>The first three days</h2><p>Opening, interruption, and the first returned guest. The clocks say these events happened together. The report disagrees.</p><span class="underlined">Read the retained chronology →</span></button><button class="document-card" data-action="nightaudit"><p class="eyebrow">File 06 / Night audit</p><h2>Two sets of books</h2><p>An unsigned audit explains why an apparently successful group checkout may only be a reconstruction.</p><span class="underlined">Compare the accounts →</span></button></div></div>`
    );
  }
  const pageTitles = {
    home: "A familiar place, every time",
    rooms: "Rooms & Suites",
    history: "Our History",
    guestbook: "Guestbook",
    reservations: "Reservations",
    employees: "Employee Access",
    guide: "Hotel Guide",
    below: "The Lower Register",
  };
  function render(moveFocus = false, editReservation = false) {
    expansion?.applyTheme();
    let route = location.hash.slice(1).split("?")[0] || "home";
    if (!Object.hasOwn(pageTitles, route)) route = "home";
    main.innerHTML =
      route === "home"
        ? homeMarkup
        : {
            ...expansion.pages,
            rooms: roomsPage,
            history: historyPage,
            guestbook: guestbookPage,
            reservations: () => reservationsPage(editReservation),
            employees: employeesPage,
          }[route]();
    document.title = `The Stillwater Hotel — ${pageTitles[route]}`;
    document.querySelectorAll("[data-nav]").forEach((a) => {
      if (a.dataset.nav === route) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    if (moveFocus) {
      window.scrollTo(0, 0);
      main.focus({ preventScroll: true });
    }
  }
  function go(route) {
    if (dialog.open) close();
    if (location.hash === "#" + route) render(true);
    else location.hash = route;
  }
  window.addEventListener("hashchange", () => {
    if (dialog.open) close();
    render(true);
  });
  const actions = {
    rules() {
      show(
        "A few house traditions",
        `<p class="document-intro">A copy of this card is placed in every guest room. Following these small courtesies helps everyone enjoy a peaceful stay.</p><ol class="rules-list"><li><span>The Stillwater has three floors. Should the lift announce a fourth, close your eyes until the bell has stopped.</span></li><li><span>Keep your assigned key. Do not accept a replacement from a person who resembles you.</span></li><li><span>After <b>04:04 a.m.</b>, please remain in your room. A stopped clock is not a fault that requires your attention.</span></li><li><span>We do not accommodate children in the west wing. If you hear laughter, turn your television down and do not investigate.</span></li><li><span>Before opening your door at night, check for a shadow beneath it. If there is no shadow, do not open the door.</span></li><li><span>For departure, follow the <b>red EXIT</b> signs. We have never installed a white exit door.</span></li><li><span>If you discover a second guest register, do not sign it. The original belongs behind the reception desk.</span></li></ol><p class="file-note">Printed on the reverse:<br>“The unlisted door keeps the time we lost. Four digits. Leave out the colon.”</p>${clueButton("clock", "Copy the reverse-side note")}<div class="dialog-actions"><button class="paper-button" data-page="reservations">Return to registration →</button></div>`,
        "GUEST SERVICES / BEDSIDE CARD 01",
      );
    },
    notice() {
      show(
        "Third-floor maintenance",
        `<p class="eyebrow">Restoration bulletin · Updated 10/03</p><p>As part of our continuing conservation work, the west end of the third floor is temporarily unavailable after quiet hours. Guests are asked to use only the rooms marked on their printed map.</p><p>The elevator may occasionally display an incorrect floor number. Please remain inside until it returns to a listed floor. Do not use the service stair without a member of staff.</p><p class="file-note">Typewritten addendum:<br>“There is no fourth floor. Any reference to a fourth floor in earlier bulletins was an administrative error.”</p><p>We appreciate your patience.<br><i>The Management</i></p><div class="dialog-actions"><button class="paper-button" data-action="explore">View the approved floor plan →</button><button class="paper-button" data-action="rules">Read the guest guidelines</button></div>`,
        "HOTEL NOTICE / CONSERVATION OFFICE",
      );
    },
    explore() {
      show(
        "The third-floor directory",
        `<p class="document-intro">The lift opens onto a long, quiet corridor. According to the framed plan beside the door, there are five rooms on this floor.</p><div class="floor-map"><button data-room="301">301<small>Do not disturb</small></button><button data-room="303">303<small>A light under the door</small></button><button data-room="307">307<small>${state.checkedIn ? "Your room" : "A key is waiting"}</small></button><button data-room="309">309<small>Awaiting service</small></button><button data-room="311">311<small>Housekeeping</small></button><button class="locked" data-room="404">404<small>Not on the plan</small></button></div><p class="file-note">You count the doors twice. There are six.<br>The last one was not there when you stepped out of the lift.</p><div class="dialog-actions"><button class="paper-button" data-action="monitor">Consult the corridor recording →</button>${!state.checkedIn ? '<button class="paper-button" data-page="reservations">Collect your room key</button>' : ""}</div>`,
        "FLOOR DIRECTORY / LEVEL THREE",
      );
    },
    lookup() {
      show(
        "Find your room",
        `<p class="document-intro">Please enter the number stamped on your key. If you have not collected one, reception will be happy to help.</p><form id="lookup-form"><label class="field-label" for="room-number">Room number</label><input class="text-input" id="room-number" name="roomNumber" inputmode="numeric" pattern="[0-9]{3}" maxlength="3" placeholder="For example, 307" required><div id="lookup-error" class="form-error" role="status"></div><button class="button full-width" type="submit">Find my room →</button></form><div class="dialog-actions"><button class="paper-button" data-page="reservations">Return to reception</button></div>`,
      );
    },
    ledger() {
      show(
        "The opening-night register",
        `<p class="eyebrow">Original guest ledger / 03 October 1987</p><p class="document-intro">The page is stained with tea. The ink on the names is faded, but the departure column looks freshly written.</p><table class="ledger-table"><thead><tr><th>ROOM</th><th>GUEST</th><th>DEPARTURE</th></tr></thead><tbody><tr><td>108</td><td>Margaret H.</td><td>Pending</td></tr><tr><td>214</td><td>David & Ruth</td><td>Pending</td></tr><tr><td>301</td><td>Arthur Bell</td><td>Pending</td></tr><tr><td>303</td><td>E. Rowan</td><td>Pending</td></tr><tr class="marked"><td>307</td><td>Eleanor Vale</td><td>Waiting</td></tr><tr><td>309</td><td>The relief porter</td><td>Pending</td></tr><tr><td>311</td><td><i>Name removed</i></td><td>Pending</td></tr></tbody></table><p class="file-note">In the margin: “Night desk keypad: opening day, month first. Nothing here should be difficult to remember.”</p><p>Below the final line, in smaller handwriting: “Every name on this page is still checked in. Do not leave them behind.”</p>${clueButton("register", "Copy the opening-night record")}<div class="dialog-actions"><button class="paper-button" data-page="employees">Find the night desk archive →</button></div>`,
        "HOTEL COLLECTION / REGISTER NO. 001",
      );
    },
    monitor() {
      camera(1);
    },
    maintenance() {
      if (!state.staff) return go("employees");
      show(
        "Maintenance log",
        `<p class="eyebrow">Facilities / Retained by the night porter</p><article class="entry"><p><b>03 October 1987, 04:04.</b> All guest-room clocks stopped simultaneously. The west corridor now measures six doors longer than the building. Main supply remains energized despite isolation at the street.</p><p><b>04 October, same time.</b> Found a second supply behind the reception clock. Brass lever, marked STILLWATER. It feeds the hotel, not the lights. Pulling it briefly revealed a stairwell where the wall should be.</p><p><b>Date no longer advancing.</b> The hotel will offer two exits. Both belong to it. The service stair does not.</p></article><p class="file-note">Take the original register. Cut the supply at the brass disconnect. Only then use the service stair. Do not let the book close before the last guest has crossed.</p>${clueButton("switch", "Record the service-stair procedure")}`,
        "STAFF ARCHIVE / MAINTENANCE FILE 01",
      );
    },
    letter() {
      if (!state.staff) return go("employees");
      show(
        "A letter to the next guest",
        `<p class="eyebrow">Returned correspondence / Room 307</p><p class="document-intro">The envelope has your room number on it. Beneath the stamps, someone has written “PLEASE TRY AGAIN.”</p><p><i>Dear whoever finally finds this,</i></p><p>My name is Eleanor Vale. We built a place where nobody would have to feel alone. I asked it to keep our guests safe. I did not understand what it meant to keep them.</p><p>The register is the promise. The clock is the lock. The doors are only distractions.</p><p>I have signed a group checkout slip and left it inside the original book. A living guest must complete the record: the stopped time, the extra door, Rowan’s warning, the opening page, the disconnect, and this letter. Six things the hotel would rather you forget.</p><p>Carry the book to the service stair after cutting the supply. Do not sign a new page. Let the last guest leave before you do.</p><p><i>With all the apologies a lifetime can hold,<br>Eleanor</i></p>${clueButton("letter", "Keep Eleanor’s letter")}`,
        "STAFF ARCHIVE / UNDELIVERED ITEM 0307",
      );
    },
    nightmemo() {
      if (!state.staff) return go("employees");
      show(
        "Instructions for the relief porter",
        `<p class="document-intro">Please familiarize yourself with the following before beginning your first shift.</p><ol class="rules-list"><li><span>Keep a lamp lit at reception. A guest arriving after midnight may not remember making a reservation. This is normal.</span></li><li><span>Offer Room 307. Regardless of the requested room type, offer Room 307.</span></li><li><span>If a guest asks to leave, indicate the red sign. Do not mention the white door.</span></li><li><span>Do not open returned mail. Mrs. Vale’s correspondence concerns the original booking only.</span></li><li><span>If the ventilation hum stops, do not restart it. Take your personal belongings and wait by the service stair.</span></li></ol><p class="file-note">At the bottom, written in a different hand:<br>“You are not the porter. You were a guest. Check the ledger.”</p><div class="dialog-actions"><button class="paper-button" data-action="ledger">Reopen the original register →</button></div>`,
        "STAFF ARCHIVE / NIGHT SHIFT HANDOVER",
      );
    },
    diary() {
      show(
        "The notebook under the pillow",
        `<p class="document-intro">The cover has softened with age. On the first page, someone has written your room number over and over.</p><article class="entry"><p><i>First night.</i> It was raining. I came inside to ask for directions. The porter said my room had been ready for years.</p><p><i>Third night.</i> At <b>04:04</b>, a door appears at the end of the corridor. Its lock accepts four digits. I wrote the time on my palm. When I woke, it was in someone else’s handwriting.</p><p><i>A later night.</i> I found a loose page in the guestbook. Rowan knows about the exits. Eleanor knows about the hotel. I think leaving and ending this are two different things.</p></article><p class="file-note">“If you can, do not leave alone.”</p>${clueButton("clock", "Record the time in the notebook")}<div class="dialog-actions"><button class="paper-button" data-page="guestbook">Find Rowan’s page →</button><button class="paper-button" data-page="history">Find Eleanor’s history →</button></div>`,
        "PERSONAL EFFECTS / ROOM 307",
      );
    },
    journal() {
      const titles = {
        departure: "The road home",
        return: "A familiar place",
        release: "The last checkout — rejected",
        custodian: "The new night porter",
        dawn: "For the first time, morning",
      };
      show(
        "Your guest notebook",
        `<p class="document-intro">${state.checkedIn ? escape(state.name) + " · Room 307" : "An unregistered guest"}<br>${state.clues.length} of ${recordTarget()} records recovered. ${baseReady() ? (state.chapter >= 2 ? "The public record was only the first layer." : "The public record is complete. The service stair is ready.") : "Take your time. The small details are usually the ones worth keeping."}</p><div class="progress-track"><div style="width:${(state.clues.length / 6) * 100}%"></div></div><ul class="journal-list">${Object.entries(
          clues,
        )
          .filter(([id]) => state.chapter >= 2 || baseClueIds.includes(id))
          .sort(
            ([a], [b]) =>
              (baseClueIds.indexOf(a) < 0 ? 99 : baseClueIds.indexOf(a)) -
              (baseClueIds.indexOf(b) < 0 ? 99 : baseClueIds.indexOf(b)),
          )
          .map(
            ([id, clue], i) =>
              `<li><span class="journal-number">0${i + 1}</span><div>${state.clues.includes(id) ? `<strong>${clue.title}</strong><p>${clue.text}</p>` : `<span class="journal-missing">A missing piece</span><p>${clue.source}</p>`}</div></li>`,
          )
          .join(
            "",
          )}</ul>${state.endings.length ? `<h3>Departures remembered</h3><p>${state.endings.map((e) => titles[e]).join(" · ")}</p>` : ""}${expansion.extraNotebook()}<div class="dialog-actions"><button class="button" data-room="404">Find the unlisted door →</button><button class="paper-button" data-page="employees">Visit the night desk</button></div><p class="local-note">Notes are saved on this device. All story clues can be found on this website; no outside investigation is required.</p>`,
        "PERSONAL EFFECTS / GUEST NOTEBOOK",
      );
    },
    inquiry() {
      show(
        "At your service",
        `<p>Our front desk is open at every hour, in every season. Whether you are looking for a room or someone you remember, we are pleased to help.</p><h3>Before you arrive</h3><p>Rooms may be requested through our reservations page. The guest guidelines explain our quiet hours and a few hotel traditions. Our public history includes the dates and details most visitors need.</p><h3>If you are already here</h3><p>Keep your key with you. Consult the third-floor directory if a room number seems unfamiliar. Messages for past guests are kept in the guestbook.</p><div class="dialog-actions"><button class="button" data-page="reservations">Visit reception →</button><button class="paper-button" data-action="lookup">Find my room</button></div><p class="local-note">This hotel and its contact details are fictional. No inquiry is sent, and no real reservation is made.</p>`,
      );
    },
    about() {
      show(
        "About your stay",
        `<p><i>The Stillwater Hotel</i> is an original, fictional, Backrooms-inspired interactive mystery. Its comfortable public website conceals an ongoing story told through guest records, security footage, and staff correspondence.</p><h3>How to explore</h3><p>Register under a nickname, collect your key, and read carefully. Save discoveries to your notebook. Two doors offer two endings; a complete public record reveals what lies below. The apparent third ending is the beginning of a second, more demanding chapter. Use the Hotel Guide to cross-check menus, service orders, and incident reports. All clues are inside this site. You never need to contact anyone or visit a real place.</p><h3>Comfort & accessibility</h3><p>Contains unsettling figures, sudden visual interruptions, and a second horror chapter after the apparent ending. Sudden effects can be disabled below without losing any puzzles. There is no rapid flashing. Audio remains off until you choose; reduced-motion preferences are respected. Press Escape to close a document.</p><button class="sound-button" id="sound-button" data-action="sound" aria-pressed="${!!soundContext}">Ambient sound: ${soundContext ? "on" : "off"}</button><div class="inline-actions"><button class="sound-button" data-action="toggle-scares" aria-pressed="${state.scares}">Sudden visual effects: ${state.scares ? "on" : "off"}</button></div><h3>Your information</h3><p>Your nickname, registration, notes, and progress stay in this browser. They are not sent to a server. Clearing site data erases them. The employee keypad is a fictional puzzle, not real security. Images are generated; characters, hotel, and bookings are fictional.</p><p class="local-note">Source files can be opened locally after extracting the ZIP, or served using the included Node.js development server.</p><div class="dialog-actions"><button class="danger-link" data-action="reset-prompt">Start over / clear this device’s story progress</button></div>`,
        "HOTEL RESOURCES / SITE INFORMATION",
      );
    },
    "reset-prompt"() {
      show(
        "Begin a new stay?",
        `<p>This clears both chapters, registration, notebook, local messages, solved stations, archive access, and discovered endings. The hotel will remember you as a first-time visitor. Your visual-effects preference is retained; audio will be switched off.</p><div class="dialog-actions"><button class="button" data-action="reset-confirm">Clear progress & begin again</button><button class="paper-button" data-action="about">Keep my records</button></div>`,
      );
    },
    "reset-confirm"() {
      const retainedScares = state.scares;
      state = fresh();
      state.scares = retainedScares;
      try {
        localStorage.removeItem("no-return-hotel:v1");
      } catch {
        /* Optional migration record. */
      }
      save();
      if (soundContext) {
        void soundContext.close();
        soundContext = null;
      }
      close();
      go("home");
      toast("A fresh page. Welcome to your first stay.");
    },
    "edit-reservation"() {
      render(true, true);
    },
    "staff-logout"() {
      state.staff = false;
      save();
      render(true);
      toast("The archive is locked.");
    },
    "ending-departure"() {
      ending("departure");
    },
    "ending-return"() {
      ending("return");
    },
    "ending-release"() {
      if (!baseReady())
        return toast(
          "A living, registered guest must complete all six records first.",
        );
      expansion.breach();
    },
    async sound() {
      if (soundContext) {
        await soundContext.close();
        soundContext = null;
        updateSound();
        return;
      }
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const context = new AudioContext();
        soundContext = context;
        await context.resume();
        const gain = context.createGain();
        gain.gain.setValueAtTime(0, context.currentTime);
        gain.gain.linearRampToValueAtTime(0.025, context.currentTime + 2);
        gain.connect(context.destination);
        for (const frequency of [55, 55.4, 110]) {
          const oscillator = context.createOscillator();
          oscillator.frequency.value = frequency;
          oscillator.connect(gain);
          oscillator.start();
        }
        updateSound();
      } catch {
        if (soundContext) void soundContext.close();
        soundContext = null;
        updateSound();
        toast(
          "Ambient sound is not supported here. You can continue without it.",
        );
      }
    },
  };
  function updateSound() {
    const button = $("#sound-button");
    if (button) {
      button.textContent = `Ambient sound: ${soundContext ? "on" : "off"}`;
      button.setAttribute("aria-pressed", String(!!soundContext));
    }
  }
  function camera(id) {
    const feeds = {
      1: [
        "MAIN LOBBY",
        "03:17:02",
        "The desk is unattended. The register is open to a clean page. A lamp has been left on for the next guest.",
      ],
      2: [
        "WEST CORRIDOR / LEVEL 03",
        "04:04:00",
        "There should be five doors. A sixth stands at the end of the hall. The brass plate reads 404. The clock above it is not moving.",
      ],
      3: [
        "SERVICE LIFT",
        "04:04:00",
        "The lift opens onto another copy of the same corridor. Someone has taped a note over the fourth-floor button: “DO NOT COMPLETE THE CIRCUIT.”",
      ],
    };
    const [name, time, note] = feeds[id];
    show(
      "Public-area security",
      `<p class="document-intro">Archived footage is available for guest safety. The date and time shown by older cameras may not reflect current conditions.</p><div class="camera-screen" style="background-image:linear-gradient(#50604844,#1a23135c),url('assets/${id === 1 ? "lobby" : "hallway"}.png');background-position:${id === 3 ? "20%" : "center"} center"><div class="camera-top"><span>● REC &nbsp; CAM 0${id}</span><span>${time}</span></div>${id === 2 ? '<span class="camera-door">404</span>' : ""}<div class="camera-bottom">${name} / 03.10.1987</div></div><div class="camera-controls">${[1, 2, 3].map((n) => `<button data-camera="${n}" aria-pressed="${id === n}">CAM 0${n}</button>`).join("")}</div><p class="camera-note">${note}</p>${id === 2 ? clueButton("door", "Save the anomalous frame") : '<p class="fine-print">Select another camera to review the other public areas.</p>'}${id === 3 ? '<div class="dialog-actions"><button class="paper-button" data-action="inspect-shadow">Inspect the unoccupied reception frame</button></div>' : ""}`,
      "SECURITY OFFICE / RETAINED RECORDING",
    );
  }
  function roomDetail(id) {
    const card = roomCards.find((c) => c[0] === id);
    if (!card) return;
    show(
      card[2],
      `<p class="eyebrow">${card[1]}</p><p class="document-intro">${card[3]}</p><img class="history-photo" src="${card[5]}" alt="${card[6]}"><ul class="amenities">${card[4]
        .split(" · ")
        .map((t) => `<li>${t}</li>`)
        .join(
          "",
        )}<li>Daily housekeeping</li><li>Private bathroom</li><li>24-hour reception</li></ul><p>${id === "residence" ? "The Residence is on our original third floor. Guests are asked to keep the bedside card and their room key close at hand. The view is particularly consistent." : "Our team will prepare your room before you arrive. Please note that final room assignments are made at reception."}</p><div class="dialog-actions"><button class="button" data-book="${id}">Request this room →</button><button class="paper-button" data-action="rules">Guest guidelines</button></div>`,
    );
  }
  function room(number) {
    if (number === "404")
      return show(
        "Room 404",
        `<p class="document-intro">The brass plate is cold. This room is not listed in any hotel brochure. There is no keyhole, only four tarnished number wheels.</p><p>The corridor has become very quiet. Behind the door, a clock ticks once.</p><form id="unlock-form"><label class="field-label" for="door-code">Four-digit door code</label><input class="text-input" id="door-code" name="code" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" autocomplete="off" placeholder="— — — —" required><div class="form-error" id="unlock-error" role="status"></div><button class="button full-width" type="submit">Turn the lock →</button></form><div class="dialog-actions"><button class="paper-button" data-action="journal">Consult my notebook</button><button class="paper-button" data-action="rules">Recall the bedside card</button></div>`,
        "UNLISTED ACCOMMODATION / 404",
      );
    if (number === "307") {
      if (!state.checkedIn)
        return show(
          "A key is waiting for you",
          `<p>The door will not open without your key. A small paper tag on the handle says: “Please collect at reception. Your room has already been prepared.”</p><div class="dialog-actions"><button class="button" data-page="reservations">Visit reception →</button></div>`,
        );
      return show(
        "Room 307 — your room",
        `<p class="document-intro">Your key turns twice. The door opens onto a room that smells faintly of cedar and old rain.</p><img class="history-photo" src="assets/guestroom.png" alt="Your quiet, warmly lit hotel room"><p>A single lamp is lit. Your slippers are beside the bed, in your size. The clock reads <b>04:04</b>. Through a gap in the curtains you see another corridor, exactly like the one outside.</p><p>There is a worn notebook under the pillow. Its cover has your room number on it.</p><div class="dialog-actions"><button class="button" data-action="diary">Read the notebook →</button><button class="paper-button" data-action="explore">Return to the corridor</button></div>`,
        "GUEST ACCOMMODATION / ROOM 307",
      );
    }
    const descriptions = {
      301: "Slow footsteps stop just behind the door. The handle moves. You decide not to disturb the occupant.",
      303: "The strip of light beneath the door goes dark. A voice says, very gently, “Your room is farther down.”",
      309: "A housekeeping card hangs from the handle. Its service date is tomorrow. The ink is still wet.",
      311: "Someone is mopping behind the door. You remember that every floor in this wing is carpeted.",
    };
    show(
      `Room ${number} — do not disturb`,
      `<p>${descriptions[number] || "This accommodation is currently unavailable."}</p><div class="dialog-actions"><button class="paper-button" data-action="explore">← Return to the corridor</button></div>`,
    );
  }
  function beyondDoor() {
    const ready = baseReady();
    show(
      "A choice of departures",
      `<p class="document-intro">The lock clicks. Beyond the door is a small lift with no buttons. It descends for a long time. When it opens, you are back in the lobby. This time, nobody is behind the desk.</p><section class="ending-option"><h3>The red EXIT</h3><p>A rusted iron door. Cold air moves beneath it, carrying the smell of rain on a road you almost remember.</p><button class="button" data-action="ending-departure">Follow the red sign →</button></section><section class="ending-option"><h3>The white door</h3><p>Warm light. A voice you have missed. “Your room is waiting,” it says. “You do not have to go anywhere.”</p><button class="paper-button" data-action="ending-return">Step into the white light →</button></section><section class="ending-option special"><h3>${ready ? "The service stair" : "A third possibility"}</h3><p>${ready ? "The record is complete. You recognize the brass disconnect behind the clock. The original register lies open beside it, Eleanor’s signed checkout slip between its pages. There is still time to bring the others." : "Behind the reception clock, a seam in the wallpaper catches your eye. Something here is unfinished. Recover all six records and register as a guest to understand it."}</p><button class="paper-button" data-action="ending-release" ${ready ? "" : "disabled"}>Take the register & cut the supply →</button></section><div class="dialog-actions"><button class="underlined" data-action="journal">Review what you remember →</button></div>`,
      "GROUND FLOOR / AFTER QUIET HOURS",
    );
  }
  function ending(id) {
    if (!state.endings.includes(id)) {
      state.endings.push(id);
      save();
    }
    const contents = {
      departure: [
        "01 / THE ROAD HOME",
        "The road home",
        "☼",
        '<p>You push the red door open.<br>Morning air touches your face. You are standing on an ordinary road, beside an ordinary, empty field.</p><p>There is no hotel behind you.</p><p>In your palm, the brass key is still warm. On its reverse, a new line has appeared:</p><p class="file-note">“We look forward to your next visit.”</p>',
      ],
      return: [
        "02 / A FAMILIAR PLACE",
        "A familiar place",
        "S",
        '<p>The light is warm. You close your eyes for just a moment.</p><p>When you open them, you are at reception. The porter smiles as though you have only stepped outside for a little air.</p><p>“Your room is waiting,” he says, turning the register toward you.</p><p class="file-note">This time, your name is already on the page.</p>',
      ],
    };
    const [code, title, icon, text] = contents[id];
    show(
      title,
      `<div class="ending"><div class="ending-icon">${icon}</div><p class="ending-code">${code}</p>${text}<div class="dialog-actions"><button class="button" data-action="journal">Keep the story in my notebook</button><button class="paper-button" data-room="404">Revisit the last door</button></div><p class="local-note">${state.endings.length} of 5 departure records remembered. Your progress remains saved. The service-stair checkout conceals another chapter; you can keep exploring without starting over.</p></div>`,
      "THE STILLWATER HOTEL / DEPARTURE RECORD",
    );
  }
  document.addEventListener("click", (event) => {
    const trigger = event.target.closest(
      "[data-action],[data-page],[data-room],[data-camera],[data-clue],[data-roomtype],[data-book]",
    );
    if (!trigger || trigger.disabled) return;
    if (trigger.dataset.action) void actions[trigger.dataset.action]?.();
    else if (trigger.dataset.page) go(trigger.dataset.page);
    else if (trigger.dataset.room) room(trigger.dataset.room);
    else if (trigger.dataset.camera) camera(Number(trigger.dataset.camera));
    else if (trigger.dataset.clue) collect(trigger.dataset.clue);
    else if (trigger.dataset.roomtype) roomDetail(trigger.dataset.roomtype);
    else if (trigger.dataset.book) {
      state.roomType = trigger.dataset.book;
      save();
      go("reservations");
    }
  });
  document.addEventListener("input", (event) => {
    if (event.target.id === "guest-message")
      $("#message-count").textContent = event.target.value.length;
  });
  document.addEventListener("submit", (event) => {
    const form = event.target;
    if (
      ![
        "reservation-form",
        "guestbook-form",
        "lookup-form",
        "unlock-form",
        "employee-form",
      ].includes(form.id)
    )
      return;
    event.preventDefault();
    if (form.id === "reservation-form") {
      const name = form.elements.guestName.value.trim();
      if (!name) {
        $("#reservation-error").textContent =
          "Please leave a name for the register.";
        return;
      }
      state.name = name.slice(0, 40);
      state.arrival = form.elements.arrival.value;
      state.nights = Number(form.elements.nights.value);
      state.roomType = form.elements.roomType.value;
      state.checkedIn = true;
      save();
      render(true);
      toast("Your key is ready. Welcome to Room 307.");
    } else if (form.id === "guestbook-form") {
      const name = form.elements.guestName.value.trim();
      const text = form.elements.message.value.trim();
      if (!name || !text) {
        $("#guestbook-error").textContent =
          "Please leave both a name and a message.";
        return;
      }
      state.messages.push({
        name: name.slice(0, 40),
        text: text.slice(0, 400),
      });
      state.messages = state.messages.slice(-5);
      save();
      render();
      toast(
        "Your note is saved on this device. Nothing was sent or published.",
      );
    } else if (form.id === "lookup-form") {
      const number = form.elements.roomNumber.value;
      if (["301", "303", "307", "309", "311", "404"].includes(number))
        room(number);
      else
        $("#lookup-error").textContent =
          "That number is not in our records. Please check your key or return to reception.";
    } else if (form.id === "unlock-form") {
      if (form.elements.code.value === "0404") beyondDoor();
      else {
        $("#unlock-error").textContent =
          "The lock does not move. What time did the bedside card ask you to remember?";
        form.elements.code.select();
        expansion.onWrongCode();
      }
    } else if (form.id === "employee-form") {
      if (form.elements.staffCode.value === "1003") {
        state.staff = true;
        save();
        render(true);
        toast("Night desk access granted. Please return every file.");
      } else {
        $("#employee-error").textContent =
          "Code not recognized. Opening day, month first: consult Our History.";
        form.elements.staffCode.select();
      }
    }
  });
  function playKnock() {
    if (!soundContext || soundContext.state !== "running") return;
    for (let i = 0; i < 3; i++) {
      const start = soundContext.currentTime + i * 0.23;
      const oscillator = soundContext.createOscillator();
      const gain = soundContext.createGain();
      oscillator.frequency.setValueAtTime(95, start);
      oscillator.frequency.exponentialRampToValueAtTime(38, start + 0.09);
      gain.gain.setValueAtTime(0.035, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.12);
      oscillator.connect(gain);
      gain.connect(soundContext.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.13);
    }
  }
  expansion = window.StillwaterExpansion.create({
    getState: () => state,
    show,
    save,
    collect,
    go,
    render,
    escape,
    toast,
    heading,
    baseReady,
    playKnock,
  });
  Object.assign(actions, expansion.actions);
  save();
  render();
})();
