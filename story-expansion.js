/* Stillwater: The Lower Register. Plain scripts keep extracted ZIPs playable. */
window.StillwaterExpansion = {
  clues: {
    power: {
      title: "The backfeed circuit",
      source: "Restore the lower switchboard after the failed checkout.",
      text: "Reception, kitchen, linen, night desk: circuits 3–1–4–2. The hotel is powered from below. Cutting the lobby lever only woke its other supply.",
    },
    broadcast: {
      title: "The breakfast transmission",
      source: "Restore power, then find the breakfast radio station.",
      text: "WSTL broadcasts on 88.7 FM. Rowan says the menu cabinet uses the first letter of every dinner course. The voice behind his voice is reading your arrival date.",
    },
    acrostic: {
      title: "The original census",
      source: "Decode the dinner menu and open the sealed archive.",
      text: "The five courses spell STILL. The uncropped staff photograph identifies the missing resident: Walter Vale, the founder. His key is 311, not the porter’s 309.",
    },
    identity: {
      title: "The guest the hotel removed",
      source:
        "Reconcile the staff photograph, roster, and missing ledger entry.",
      text: "Walter Vale is the occupant of 311. The hotel removed his name to make the register impossible to complete. Restoring it opens the observation room.",
    },
    reflection: {
      title: "The instruction behind the glass",
      source: "Read the reversed message in the observation room.",
      text: "DO NOT TURN THE KEY. The first checkout was a rehearsal written by the hotel. Carry the ORIGINAL register, leave the brass key untouched, and take the SERVICE STAIR.",
    },
    chronology: {
      title: "Three days, in their proper order",
      source: "Reconstruct the incident timeline at the lower checkout desk.",
      text: "03 October: doors open. 04 October: clocks stop. 05 October: the first returned guest. The hotel must admit that a departure comes after an arrival. The final discharge can now be signed.",
    },
  },
  create(api) {
    const {
      getState,
      show,
      save,
      collect,
      go,
      render,
      escape,
      toast,
      heading,
    } = api;
    const $ = (selector) => document.querySelector(selector);
    const dialog = $("#story-dialog");
    const state = () => getState();
    const steps = [
      "power",
      "radio",
      "archive",
      "identity",
      "mirror",
      "chronology",
    ];
    const evidence = {
      power: "power",
      radio: "broadcast",
      archive: "acrostic",
      identity: "identity",
      mirror: "reflection",
      chronology: "chronology",
    };
    let circuit = [];
    let dates = [];
    const sourceNotes = {
      power: ["设备资料 SW-14 与当前面板使用同一套部门名称。供电说明保留在旅馆设施原件中。", "Facilities sheet SW-14 uses the same department names as this panel. The original service sheet retains the wiring procedure."],
      radio: ["餐厅保留的早餐节目单注明了原接收机使用的电台。", "The dining-room programme identifies the station used by the original receiver."],
      archive: ["广播提到了菜单的读法。晚餐菜单保留了厨房原来的排版。", "The transmission refers to the way the menu was read. The dinner menu retains the kitchen’s original layout."],
      identity: ["原照片的身份卡与登记簿使用相同房号。长住客通知也保留了当时的称呼。", "The original photograph’s identification cards use the register’s room numbers. The residents’ circular retains the names used at the time."],
      mirror: ["阅览室的留存说明提到过反射文字。", "The retained reading-room information refers to reflected writing."],
      chronology: ["事件报告记录了三天不同的事，录像显示的日期并不可靠。", "The incident report records three separate days. The camera dates are unreliable."],
      discharge: ["夜间核查、维修文件与玻璃后的原纸条可相互核对。", "The night audit, maintenance file and original card behind the glass can be checked against one another."],
    };
    function documentHelp(content) {
      const id = content.match(/id="lower-(\w+)-form"/)?.[1];
      if (!sourceNotes[id]) return "";
      const zh = document.documentElement.lang === 'zh-CN';
      return `<details class="puzzle-help" data-puzzle-original><summary>${zh ? '原件出处' : 'Source record'}</summary><p>${sourceNotes[id][zh ? 0 : 1]}</p></details>`;
    }
    function updateSequence(kind) {
      const values = kind === "circuit" ? circuit : dates;
      document.querySelectorAll(`[data-${kind}]`).forEach((button) => {
        button.disabled = values.includes(button.dataset[kind]);
      });
      const labels = {
        open: "OPENING",
        stop: "CLOCK FAILURE",
        return: "FIRST RETURN",
      };
      $(`#${kind === "circuit" ? "circuit" : "dates"}-readout`).textContent =
        values.length
          ? values
              .map((value) => (kind === "circuit" ? value : labels[value]))
              .join(" → ")
          : kind === "circuit"
            ? "NO CIRCUITS SELECTED"
            : "NO EVENTS SELECTED";
      $(`#${kind}-count`).textContent =
        `${values.length} / ${kind === "circuit" ? 4 : 3}`;
    }
    let threatTimer;
    let lastScare = -1;
    const scareDeck = [
      {
        id: "porter",
        file: "assets/scare-porter.png",
        title: "There is someone at the desk",
        alt: "A gaunt night porter with a distorted face",
        headline: "THAT IS NOT<br>THE PORTER.",
        caption: "THE FRAME WAS EMPTY WHEN YOU OPENED IT.",
        description:
          "The figure wears the same jacket as the night porter. When it turns, its mouth keeps moving after the rest of its face has stopped.",
      },
      {
        id: "veil",
        file: "assets/scare-veil.png",
        title: "The woman on the landing",
        alt: "A veiled figure with a dark open mouth behind the glass",
        headline: "DO NOT<br>LET HER IN.",
        caption: "CAM 03 / THE LIFT HAS NOT MOVED",
        description:
          "A woman stands between the lift doors. Her veil catches on something outside the frame. The doors close, but her face stays on the screen.",
      },
      {
        id: "reflection",
        file: "assets/scare-reflection.png",
        title: "The wrong reflection",
        alt: "An unfamiliar face and long fingers pressed against observation glass",
        headline: "IT MOVES<br>BEFORE YOU DO.",
        caption: "OBSERVATION FEED / DO NOT TOUCH THE GLASS",
        description:
          "You move the pointer. The hand in the glass moves first. You take your hand off the mouse. The other hand keeps going.",
      },
    ];
    let portraitsReady = null;
    function preloadScares() {
      if (!state().scares) return Promise.resolve();
      if (!portraitsReady)
        portraitsReady = Promise.all(
          scareDeck.map(
            (encounter) =>
              new Promise((resolve) => {
                const image = new Image();
                image.onload = image.onerror = () => resolve();
                image.src = encounter.file;
              }),
          ),
        );
      return portraitsReady;
    }
    function chooseScare(preferred) {
      let index = preferred
        ? scareDeck.findIndex((item) => item.id === preferred)
        : (lastScare + 1) % scareDeck.length;
      if (index < 0) index = 0;
      if (index === lastScare) index = (index + 1) % scareDeck.length;
      lastScare = index;
      const encounter = scareDeck[index];
      document.body.dataset.encounter = encounter.id;
      document.body.style.setProperty(
        "--scare-image",
        `url("${encounter.file}")`,
      );
      return encounter;
    }

    const normalize = (text) =>
      String(text)
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "");
    const solved = (id) => state().puzzles.includes(id);
    function available(id) {
      const index = steps.indexOf(id);
      return (
        state().chapter >= 2 &&
        index >= 0 &&
        (index === 0 || solved(steps[index - 1]))
      );
    }
    function guard(id) {
      if (available(id)) return true;
      toast("The line is not ready. Complete the preceding station first.");
      return false;
    }
    function complete(id, title, text) {
      if (!guard(id)) return;
      if (!solved(id)) state().puzzles.push(id);
      collect(evidence[id]);
      save();
      render();
      const next = steps[steps.indexOf(id) + 1];
      show(
        title,
        `<p class="document-intro">LOWER REGISTER / RECORD VERIFIED</p><p>${text}</p><div class="dialog-actions">${next ? `<button class="button" data-action="puzzle-${next}">${({radio:"Open the powered receiver",archive:"Open the kitchen cabinet file",identity:"Read entry 311",mirror:"Open the observation room",chronology:"Review the dated incident file"})[next]} →</button>` : '<button class="button" data-action="final-discharge">Prepare the final discharge →</button>'}<button class="paper-button" data-page="below">Return to lower register</button></div>`,
        "LOWER REGISTER / VERIFIED RECORD",
      );
    }
    function reject(message, target = "#puzzle-error") {
      const error = $(target);
      if (error) error.textContent = message;
      state().wrongAnswers += 1;
      save();
      if (state().scares && state().wrongAnswers % 3 === 0) {
        chooseScare();
        document.body.classList.remove("intrusion-hit");
        void document.body.offsetWidth;
        document.body.classList.add("intrusion-hit");
        api.playKnock();
        clearTimeout(threatTimer);
        threatTimer = setTimeout(
          () => document.body.classList.remove("intrusion-hit"),
          650,
        );
        toast("A second set of hands moves beneath yours. Try again.");
      }
    }
    function breach() {
      if (!api.baseReady())
        return toast(
          "Finish the six hotel records and collect a room key first.",
        );
      api.resetDocuments();
      void preloadScares();
      state().chapter = 2;
      if (!state().endings.includes("release")) state().endings.push("release");
      save();
      history.pushState(null, "", "#below");
      render(true);
      const encounter = chooseScare("porter");
      if (state().scares) api.playKnock();
      show(
        "CHECKOUT REJECTED",
        `<div class="intrusion-frame ${state().scares ? "" : "quiet-intrusion"}">${state().scares ? `<img class="intrusion-figure" data-encounter="${encounter.id}" src="${encounter.file}" alt="${encounter.alt}">` : ""}<span class="intrusion-status">DEPARTURE RECORD: FALSE</span><strong>YOU LEFT<br>ONE NAME<br>BEHIND.</strong><span>IT WAS NOT ELEANOR WHO FOLLOWED YOU.</span></div><p>The stair ends where it began. The seven names in your register rearrange themselves. Behind the desk, the porter raises a hand. You count too many fingers.</p><p>The screen goes black. When it comes back, the welcome message has been replaced by these lines.</p><div class="system-log"><span>PUBLIC SITE .......... OFFLINE</span><span>SECOND SUPPLY ........ ACTIVE</span><span>YOUR CHECKOUT ........ REVOKED</span><span>LOWER REGISTER ....... LISTENING</span></div><div class="dialog-actions"><button class="button" data-action="continue-below">Continue below →</button><button class="paper-button" data-action="toggle-scares">${state().scares ? "Disable" : "Enable"} sudden visual effects</button></div><p class="local-note">This is the second chapter, not a real browser or system error. Sound remains off unless you enabled it.</p>`,
        "UNAUTHORIZED DEPARTURE / HOTEL RESPONSE",
      );
    }
    const docs = {
      dining() {
        show(
          "The dining room",
          `<p class="document-intro">Guest information / Ground floor / Issued by the kitchen</p><p>Breakfast is served between seven and nine. The dining room has twelve tables. During busy periods, a member of staff may direct you to a thirteenth. Please ask for a different table. There is no thirteenth table on the fire plan.</p><p>The breakfast radio is tuned to <b>WSTL, 88.7 FM</b>. Our longest-staying guests find the familiar weather reports reassuring. The announcer has not changed since opening week. If a report mentions your name, leave the radio on and notify the night desk.</p><h3>Our five-course dinner</h3><p class="fine-print">Served in the order printed. The chef asks that the first letter of every course remain visible when the menu is folded; it is also the old kitchen cabinet word.</p><ol class="printed-menu"><li><b>S</b>moked tomato consommé <span>18:00</span></li><li><b>T</b>hyme-roasted squash <span>18:15</span></li><li><b>I</b>ced cucumber salad <span>18:30</span></li><li><b>L</b>emon-butter sole <span>18:45</span></li><li><b>L</b>avender shortbread <span>19:00</span></li></ol><p>Dietary requests can be left at reception. We have a record of your preferences, even if this is your first visit. Do not eat from a place setting that was already warm when you sat down.</p><p class="file-note">Kitchen circulation notice: the menu cabinet and the lower census archive were fitted with identical five-letter locks in 1987. The engineer did not record a second word.</p><div class="dialog-actions"><button class="paper-button" data-action="weather">Read the breakfast radio card</button><button class="paper-button" data-page="guide">Back to the hotel guide</button></div>`,
          "GUEST FACILITIES / DINING CARD 02",
        );
      },
      weather() {
        show(
          "The breakfast programme",
          `<p class="document-intro">WSTL / 88.7 FM / Programme card retained by the dining staff</p><p><b>07:00 — The road report.</b> No delays on the Stillwater road. No departures recorded.</p><p><b>07:15 — Local weather.</b> Still overcast. Wind from the north. The bird on the courtyard rail has moved to the left. If you remember it moving to the right, remain indoors.</p><p><b>07:30 — Messages for travelers.</b> Names are read in the order in which their owners arrived. Never answer a name spoken twice.</p><p><b>07:45 — A familiar melody.</b> The piano arrangement ends one note early. Please do not provide the last note yourself.</p><p><b>08:00 — Reception handover.</b> During a power failure, the lower receiver may be tuned to the same frequency. A transcript is available for staff who cannot hear the transmission.</p><p class="file-note">The card is dated 05 October 1987. Every replacement ordered since then has arrived with the same date. The print shop denies having our account.</p><div class="dialog-actions"><button class="paper-button" data-action="dining">View the dinner menu</button></div>`,
          "DINING ROOM / BROADCAST SCHEDULE",
        );
      },
      switchboard() {
        show(
          "Service restoration order",
          `<p class="document-intro">Facilities sheet SW-14 / Keep beside both switchboards</p><p>Following a supply interruption, do not energize the hotel in numerical order. The original wiring crosses the west-wing extension. The numbered circuits are listed below.</p><table class="ledger-table"><thead><tr><th>CIRCUIT</th><th>DEPARTMENT</th><th>WHY IT MUST ANSWER</th></tr></thead><tbody><tr><td>1</td><td>Kitchen heat</td><td>Keep the boiler steady</td></tr><tr><td>2</td><td>Night desk</td><td>Record the restored guests</td></tr><tr><td>3</td><td>Reception bell</td><td>Ask whether anyone is waiting</td></tr><tr><td>4</td><td>Linen service</td><td>Prepare the occupied rooms</td></tr></tbody></table><p><b>Restoration procedure:</b> first ring reception. Then supply the kitchen. Bring the linen service online next. The night desk must be last; it may only begin counting after the rooms have been prepared.</p><p>Once all four circuits are acknowledged, the radio receiver will resume. A circuit energized twice returns the board to its initial state. If a hand appears in an unused socket, stop working and count your own fingers before continuing.</p><p class="file-note">The lobby lever is an isolator, not a main disconnect. A supply still exists beneath the building. Cutting the visible power makes the lower equipment accessible.</p><div class="dialog-actions"><button class="paper-button" data-page="guide">Return to hotel facilities</button></div>`,
          "FACILITIES / SWITCHBOARD PROCEDURE",
        );
      },
      residents() {
        show(
          "A circular for long-stay residents",
          `<p class="document-intro">Residence committee / Seven copies circulated / Eighth copy destroyed</p><p>Margaret would like her teapot returned to the dining room. Arthur can mend coat linings; leave them at 301. David and Ruth have asked us to stop putting their anniversary on the noticeboard. We have announced it three times this week.</p><p>Rowan reports that the room numbers change when photographed. Refer to the original ledger, not the labels on the doors. The man wearing the porter’s uniform is assigned 309. This does not mean he is the porter.</p><p>Eleanor requests that nobody ask the person in 311 to speak. He has been repeating the last sentence he said before the clocks stopped. The sentence is not an instruction, even when it uses your voice.</p><h3>Meeting notes</h3><p>The founder pictured with the brass key in the opening photograph is <b>Walter Vale</b>. His room was <b>311</b>. The public copy of the photograph crops out his identification card. No vote was taken to erase his ledger entry.</p><p class="file-note">Use the opening-night records to check names. The room labels have changed several times, but the first register has not.</p><div class="dialog-actions"><button class="paper-button" data-action="photograph">Examine the staff photograph →</button></div>`,
          "RESIDENCE COMMITTEE / CIRCULAR 07",
        );
      },
      photograph() {
        show(
          "Original photograph captions",
          `<p class="document-intro">Hotel collection / Contact sheet 001-B</p><div class="caption-record"><span>CONTACT SHEET 001-B</span><p>CAPTION COPY / ORIGINAL NEGATIVE DAMAGED</p></div><p>The original photograph is damaged. These captions were copied from its mount before the right-hand strip was removed.</p><table class="ledger-table"><tbody><tr><th>LEFT</th><td>ELEANOR VALE</td><td>HOST / 307</td></tr><tr><th>RIGHT</th><td>WALTER VALE</td><td>PROPRIETOR / 311</td></tr><tr><th>BACKGROUND</th><td>RELIEF PORTER</td><td>STAFF QUARTERS / 309</td></tr></tbody></table><p>A strip of the original ledger is visible at the bottom of the frame. The final name begins with W. On every public reproduction, that strip has been painted over.</p><p class="file-note">The photographer noted a fourth person in the reception glass. None of the three staff members could identify them. The negative has the same outline.</p><div class="dialog-actions"><button class="paper-button" data-action="residents">Read the residents’ circular</button></div>`,
          "HOTEL COLLECTION / PHOTOGRAPH 001-B",
        );
      },
      readingroom() {
        show(
          "The reading room",
          `<p class="document-intro">East wing / Open until the last guest has finished</p><p>The library contains local histories, travel writing, and a shelf of books left by previous guests. Nothing is loaned outside the building. Each time a book leaves, a room becomes more difficult to find.</p><p>Arthur Bell spent his first evening repairing the atlas. He found the Stillwater road on page 41, leading into a town that had not existed for eighty years. On his second evening, the page showed the hotel. On the third, it showed his own room from above.</p><h3>Catalogue corrections</h3><p>Books bearing a white label are ordinary donations. Red labels indicate material belonging to the original hotel collection. A book with no label may contain a page from the guest register. Return that page to its original binding; loose names are easily misplaced.</p><p>At the back of the room is a visitor’s desk with a mirror instead of a window. The porter insists that the glass faces the outside wall. You can hear pages turning on the other side.</p><p class="file-note">Conservation note: reflected writing must be read in reverse. Do not turn the physical object to face the glass. The reversal belongs to the message, not to your hands.</p><div class="dialog-actions"><button class="paper-button" data-action="inventory">Consult lost property →</button></div>`,
          "GUEST FACILITIES / READING ROOM",
        );
      },
      garden() {
        show(
          "The courtyard walk",
          `<p class="document-intro">A short walk for residents / Revised route</p><p>From reception, take the door beside the fern. The courtyard is paved in a loop around a dry fountain. There are seven lamps, eight benches, and one gate. The gate is decorative. If it is standing open, your walk has not yet begun.</p><p>The northern bench bears a plaque: FOR THOSE WHO WILL RETURN. It was ordered before the hotel opened. The supplier has no record of the inscription, but their ledger shows that Walter collected it himself.</p><p>Guests sometimes report seeing their own room through a ground-floor window. Do not wave. A person standing behind that glass may assume you are inviting them outside.</p><h3>After dusk</h3><p>If the lamps go out in a clockwise sequence, return by the route you remember. If they go out all at once, remain still until you can see your own shadow. A second shadow is not evidence of another guest.</p><p class="file-note">Groundskeeper’s report, 05 October: the first guest to leave came back through the courtyard gate wearing the same wet coat. He said the road ended at reception. Walter ordered a new page in the register.</p>`,
          "GUEST FACILITIES / COURTYARD GUIDE",
        );
      },
      inventory() {
        show(
          "Lost property, awaiting collection",
          `<p class="document-intro">Reception inventory / Items held indefinitely</p><table class="ledger-table"><thead><tr><th>ITEM</th><th>FOUND</th><th>STATUS</th></tr></thead><tbody><tr><td>Red ribbon</td><td>Guestbook</td><td>Returned to Rowan</td></tr><tr><td>Brass key, 307</td><td>Departure stair</td><td>Do not turn</td></tr><tr><td>Black coat</td><td>Courtyard gate</td><td>Still wet</td></tr><tr><td>Photograph 001-B</td><td>Kitchen cabinet</td><td>Original retained</td></tr><tr><td>Unlabelled cassette</td><td>Room 311</td><td>Claimant unknown</td></tr></tbody></table><p>Keys are held for their owners, not issued as replacements. A key recovered from the departure stair must remain in its found position. There is no lock on the stair itself; an invitation to use a key there is a request to complete the circuit.</p><p>The black coat is still wet after three days in the drying room. There is a name sewn into the lining. Please do not read it aloud; the last person who did heard an answer from 311.</p><p class="file-note">The cassette was found outside 311. The voice on it sounds like the person holding the recorder, even when the tape has not been changed.</p><div class="dialog-actions"><button class="paper-button" data-action="residents">Read the residents’ circular</button></div>`,
          "RECEPTION / LOST PROPERTY REGISTER",
        );
      },
      incident() {
        show(
          "The first three days",
          `<p class="document-intro">Incident review / The dates have not been corrected to match the hotel clock</p><article class="entry"><p><b>03 October 1987 — OPENING.</b> The doors open. Seven entries are made in the register. Walter retains 311 and asks the porter not to allocate it.</p><p><b>04 October 1987 — INTERRUPTION.</b> At 04:04, the clocks stop. The town telephone exchange can no longer locate our address. The reception bell continues to ring with nobody at the desk.</p><p><b>05 October 1987 — FIRST RETURN.</b> Arthur leaves in a black coat. At breakfast he returns through the courtyard, wet from rain nobody else remembers. A second entry appears under his first.</p></article><p>The order matters. The opening came first, the interruption second, the return third. Any version in which a guest returns before arriving is the hotel’s reconstruction, not our record.</p><p class="file-note">Use this chronology to restore the date order in the lower register. Do not use the times stamped on the surveillance tapes; they all show the same minute.</p><div class="dialog-actions"><button class="paper-button" data-action="nightaudit">Read the audit comparison</button></div>`,
          "STAFF ARCHIVE / INCIDENT REVIEW 03",
        );
      },
      nightaudit() {
        show(
          "Night audit: two sets of books",
          `<p class="document-intro">Accounting exception / Prepared but never filed</p><p>There are two registers. The original records arrival and departure as separate events. The duplicate copies whichever event will keep a room occupied. A guest who leaves through the red door is marked “expected.” A guest who chooses the white door is marked “arrived.” Neither entry closes an account.</p><p>We previously believed a signed group checkout would empty the building. The attempt did stop the visible clock. It did not silence the second supply. The service stair returned the guests to a lower version of reception.</p><h3>Discharge requirements</h3><p>Restore the lower circuits in the printed order. Identify the name erased from 311. Recover the instruction reflected in the observation glass. Put the first three days in order. At the final desk, present the <b>original</b> register, <b>leave the brass key untouched</b>, and choose the <b>service stair</b>.</p><p>A staff appointment is not a discharge. If the desk offers you a uniform, you have not escaped. You have been made responsible for the next arrival.</p><p class="file-note">The porter says this audit has already been completed. The signature at the bottom is yours. You have not signed it yet.</p>`,
          "NIGHT DESK / UNRESOLVED AUDIT",
        );
      },
    };
    function guidePage() {
      const cards = [
        ["dining", "Dining", "Breakfast & dining", "Breakfast is served in the ground-floor dining room, daily from 7:00 to 9:00. View meal information and our sample dinner menu."],
        ["readingroom", "Reading room", "A quiet place to read", "Books, local histories and a writing desk in the east wing. Browse the reading-room information and lending records."],
        ["garden", "Courtyard", "Take a seat outside", "The courtyard is reached from the lobby, with seating beside the fountain. Read our garden and access information."],
        ["inventory", "Reception services", "Lost property", "Left something behind? Reception keeps a record of items handed in by guests and housekeeping."],
      ];
      return heading("Facilities & services", "During your stay", "Breakfast, shared spaces and practical information for your visit. Our reception team is available around the clock.") +
        `<div class="page-main"><dl class="service-facts"><div><dt>Front desk</dt><dd>24 hours</dd></div><div><dt>Breakfast</dt><dd>07:00–09:00</dd></div><div><dt>Wi-Fi</dt><dd>Complimentary in guest rooms</dd></div></dl><div class="document-grid guide-grid">${cards.map(([id, label, title, text]) => `<button class="document-card" data-action="${id}"><p class="eyebrow">${label}</p><h2>${title}</h2><p>${text}</p><span class="underlined">View information →</span></button>`).join("")}</div><section class="service-contact"><div><h2>How can we help?</h2><p>For extra bedding, arrival arrangements or questions about the hotel, contact our front desk.</p></div><button class="button" data-action="inquiry">Contact support →</button></section><details class="service-notices"><summary>Guest information & notices</summary><p>Quiet hours are 22:00–07:00. Some third-floor areas are being refurbished; please ask reception about access.</p><div class="collection-links"><button class="underlined" data-action="rules">Read the guest guidelines →</button><button class="underlined" data-action="notice">Read the full bulletin →</button><button class="underlined" data-action="switchboard">Service circuit sheet →</button><button class="underlined" data-action="residents">Residents’ notices →</button><button class="underlined" data-action="photograph">View contact sheet 001-B →</button></div></details></div>`;
    }
    function lowerPage() {
      if (state().chapter < 2)
        return (
          heading(
            "Hotel resources",
            "Record unavailable.",
            "This retained record is not associated with your current stay. Reception can help you find the correct registration.",
          ) +
          '<div class="page-main"><button class="button" data-page="reservations">Return to reception →</button></div>'
        );
      if (state().chapter === 3) return epilogue();
      const cards = [
        [
          "power",
          "01 / RESTORE",
          "The second switchboard",
          "Four circuits. A printed service order. Something else is touching the wires.",
        ],
        [
          "radio",
          "02 / RECEIVE",
          "The voice at breakfast",
          "Find the station the guests were listening to when the day stopped.",
        ],
        [
          "archive",
          "03 / EXTRACT",
          "The sealed census",
          "A five-letter cabinet lock. The kitchen has kept its instructions in plain sight.",
        ],
        [
          "identity",
          "04 / IDENTIFY",
          "The name in 311",
          "One entry was erased. Compare the original photograph with the residents’ account.",
        ],
        [
          "mirror",
          "05 / REVERSE",
          "The observation glass",
          "The person on the other side moves a little before you do. Read what they are holding.",
        ],
        [
          "chronology",
          "06 / RECONSTRUCT",
          "The first three days",
          "Separate the hotel’s version of events from the sequence that actually happened.",
        ],
      ];
      const current = steps.find(id => !solved(id));
      const card = ([id, label, title, text]) => `<button class="lower-card" data-action="puzzle-${id}" ${available(id) ? '' : 'disabled hidden'}><h2>${title}</h2><p>${text}</p><span class="underlined">Open equipment record →</span></button>`;
      return `<div class="page-main lower-register"><header class="breach-heading"><p class="eyebrow">UNINDEXED FLOOR / YOUR DEPARTURE WAS NOT ACCEPTED</p><div class="breach-heading-row"><h1>IT IS STILL<br>KEEPING YOU.</h1><div class="visitor-window"><img src="assets/scare-porter.png" alt="A figure behind the reception glass"><span>CAM 00 / DO NOT ANSWER</span></div></div><p>You are back at the desk. The checkout slip is blank again, and somebody has crossed out Room 311 in the book. A second register is wedged under the counter. Its last line has never been filled in.</p></header><div class="lower-intro"><p data-puzzle-original>${document.documentElement.lang === 'zh-CN' ? (current ? '柜台上的终端没有关机。其中一台设备还在响应。' : '终端重新连上了前台。旧登记簿的退房栏终于可以填写。') : (current ? 'The desk terminals are still on. One device is responding.' : 'The terminal has reconnected to reception. The departure field in the original register can now be completed.')}</p></div><div class="lower-current">${current ? card(cards.find(c => c[0] === current)) : ''}</div><details class="lower-directory" ${state().puzzles.length ? '' : 'hidden'}><summary data-puzzle-original>${document.documentElement.lang === 'zh-CN' ? '柜台设备目录' : 'Desk equipment index'}</summary><div class="lower-grid">${cards.filter(c => c[0] !== current).map(card).join('')}</div></details><div class="inline-actions"><button class="underlined" data-page="guide">Recover the hotel guide ↑</button><button class="underlined" data-action="journal">Open your notebook</button><button class="underlined" data-action="about">Visual & audio settings</button></div><section class="discharge-bar" ${current ? 'hidden' : ''}><div><h2>The final discharge</h2></div><button class="button" data-action="final-discharge" ${current ? 'disabled' : ''}>Approach the desk →</button></section></div>`;
    }

    function form(id, label, placeholder, prompt) {
      return `<form id="lower-${id}-form"><label class="field-label" for="answer-${id}">${label}</label><input class="text-input" id="answer-${id}" name="answer" maxlength="80" placeholder="${placeholder}" autocomplete="off" required><div class="form-error" id="puzzle-error" role="status"></div><button class="button full-width" type="submit">${prompt} →</button></form>`;
    }
    const actions = {
      ...docs,
      "continue-below"() {
        if (dialog.open) dialog.close();
        go("below");
      },
      "enter-below"() {
        if (state().chapter < 2) breach();
        else go("below");
      },
      "toggle-scares"() {
        state().scares = !state().scares;
        if (!state().scares) {
          clearTimeout(threatTimer);
          document.body.classList.remove("intrusion-hit");
        }
        save();
        document.body.classList.toggle("quiet-effects", !state().scares);
        document
          .querySelectorAll('[data-action="toggle-scares"]')
          .forEach((button) => {
            button.textContent = `Sudden visual effects: ${state().scares ? "on" : "off"}`;
            button.setAttribute("aria-pressed", String(state().scares));
          });
        toast(
          state().scares
            ? "Sudden visual effects enabled. Audio is controlled separately."
            : "Sudden visual effects disabled. All puzzles remain playable.",
        );
      },
      "puzzle-power"() {
        if (!guard("power")) return;
        circuit = [];
        show(
          "01 / The second switchboard",
          `<p class="document-intro">The copper contacts are warm. There are four circuits, but the instructions say not to restore them in numerical order.</p><p>A label reads: “Use the printed service restoration procedure. Each department must answer once.” You can hear the reception bell from inside the panel.</p><div class="circuit-buttons">${[
            ["1", "KITCHEN HEAT"],
            ["2", "NIGHT DESK"],
            ["3", "RECEPTION BELL"],
            ["4", "LINEN SERVICE"],
          ]
            .map(
              ([id, label]) =>
                `<button data-circuit="${id}"><b>${id}</b><span>${label}</span></button>`,
            )
            .join(
              "",
            )}</div><p class="sequence-readout" id="circuit-readout" aria-live="polite">NO CIRCUITS SELECTED</p><p class="selection-count"><span>Selected circuits</span><output id="circuit-count">0 / 4</output></p><form id="lower-power-form"><div class="form-error" id="puzzle-error" role="status"></div><div class="dialog-actions"><button class="button" type="submit">Energize selected sequence →</button><button class="paper-button" type="button" data-action="clear-circuits">Clear sequence</button><button class="paper-button" type="button" data-action="undo-circuit">Undo last selection</button></div></form><div class="dialog-actions"><button class="underlined" data-action="switchboard">Read the retained service sheet →</button><button class="underlined" data-page="below">Return to the lower register</button></div>`,
          "SECOND SUPPLY / MANUAL RESTORATION",
        );
      },
      "clear-circuits"() {
        circuit = [];
        updateSequence("circuit");
      },
      "undo-circuit"() {
        circuit.pop();
        updateSequence("circuit");
      },
      "puzzle-radio"() {
        if (!guard("radio")) return;
        show(
          "02 / The voice at breakfast",
          `<p class="document-intro">The receiver has power. Between stations, the static sounds like people trying to say the same word at different speeds.</p><p>The dining staff kept a programme card. Tune to the station played at breakfast. Audio is not required; a decoded transcript appears when the carrier locks.</p><form id="lower-radio-form"><label class="field-label" for="radio-frequency">Receiver frequency / FM</label><div class="radio-tuner"><output id="frequency-output" for="radio-frequency">86.0 MHz</output><input id="radio-frequency" name="frequency" type="range" min="860" max="920" step="1" value="860"><div><span>86.0</span><span>92.0</span></div></div><label class="field-label" for="radio-frequency-number">Or enter a frequency / MHz</label><input class="text-input frequency-number" id="radio-frequency-number" name="frequencyNumber" type="number" inputmode="decimal" min="86" max="92" step="0.1" value="86.0" required><div class="form-error" id="puzzle-error" role="status"></div><button class="button full-width" type="submit">Lock carrier & decode transcript →</button></form><div class="dialog-actions"><button class="underlined" data-action="weather">Consult the programme card →</button></div>`,
          "LOWER RECEIVER / NO SIGNAL",
        );
      },
      "puzzle-archive"() {
        if (!guard("archive")) return;
        show(
          "03 / The sealed census",
          `<p class="document-intro">The radio transcript mentions the old kitchen lock. The same five-letter mechanism is fitted to a steel box below the reception desk.</p><p>“Begin each course,” the label says. There are five courses, served in a fixed order. Read their beginnings, not their ingredients.</p>${form("archive", "Five-letter cabinet word", "Five letters", "Open the census box")}<div class="dialog-actions"><button class="underlined" data-action="dining">Recover the dinner menu →</button></div>`,
          "CENSUS ARCHIVE / LETTER LOCK",
        );
      },
      "puzzle-identity"() {
        if (!guard("identity")) return;
        show(
          "04 / The name in 311",
          `<p class="document-intro">Inside the cabinet is contact sheet 001-B. Unlike the public print, it includes the identification cards and the final line of the opening register.</p><p>The hotel replaced one name with “NAME REMOVED.” Restore the resident’s full name. The person in the porter’s uniform belongs to 309; the missing resident does not.</p>${form("identity", "Full name of the original occupant of Room 311", "First and last name", "Restore the missing name")}<div class="dialog-actions"><button class="underlined" data-action="photograph">Compare the uncropped photograph →</button><button class="underlined" data-action="residents">Read the residents’ circular</button></div>`,
          "ORIGINAL CENSUS / ENTRY 311",
        );
      },
      "puzzle-mirror"() {
        if (!guard("mirror")) return;
        show(
          "05 / The observation glass",
          `<p class="document-intro">Walter’s restored name unlocks the observation room. Behind the glass, a person wearing your clothes is holding up a printed card. They are not quite still.</p><div class="mirror-record"><div class="mirror-face" aria-hidden="true"></div><p>YEK EHT NRUT TON OD</p><span>OBSERVATION CAMERA / REVERSE SIDE OF CARD</span></div><p>The writing was printed on the back of the card. Read the characters in reverse order. Enter the instruction in ordinary English. Punctuation and spaces do not matter.</p>${form("mirror", "Decoded instruction", "Read the reflected line", "Record the instruction")}<div class="dialog-actions"><button class="underlined" data-action="inventory">Consult the brass-key inventory →</button></div>`,
          "OBSERVATION ROOM / SUBJECT NOT ALONE",
        );
      },
      "puzzle-chronology"() {
        if (!guard("chronology")) return;
        dates = [];
        show(
          "06 / The first three days",
          `<p class="document-intro">The lower register has three incident cards arranged in the wrong order. Its date stamps cannot be trusted. Use the incident review, not the frozen clock.</p><p>Select all three events in the order they happened: earliest first. Each card can be used once.</p><div class="date-buttons"><button data-date="return">The first guest returned</button><button data-date="stop">All clocks stopped</button><button data-date="open">The hotel doors opened</button></div><p class="sequence-readout" id="dates-readout" aria-live="polite">NO EVENTS SELECTED</p><p class="selection-count"><span>Selected events</span><output id="date-count">0 / 3</output></p><form id="lower-chronology-form"><div class="form-error" id="puzzle-error" role="status"></div><div class="dialog-actions"><button class="button" type="submit">Commit the corrected sequence →</button><button class="paper-button" type="button" data-action="clear-dates">Clear sequence</button><button class="paper-button" type="button" data-action="undo-date">Undo last selection</button></div></form><div class="dialog-actions"><button class="underlined" data-action="incident">Read the incident review →</button></div>`,
          "DEPARTURE DESK / CHRONOLOGY EXCEPTION",
        );
      },
      "clear-dates"() {
        dates = [];
        updateSequence("date");
      },
      "undo-date"() {
        dates.pop();
        updateSequence("date");
      },
      "final-discharge"() {
        if (state().chapter < 2 || steps.some((id) => !solved(id)))
          return toast(
            "Restore all six lower stations before approaching the final desk.",
          );
        show(
          "The final discharge",
          `<p class="document-intro">The original register is open. A living guest’s signature is required. Behind the desk, the empty uniform turns toward you.</p><p>A clean register and a brass key have been placed on the desk. Beside them is a checkout form. The name field has already been filled in with your name.</p><form id="lower-discharge-form"><label class="field-label" for="discharge-register">Which register will you present?</label><select class="text-input" id="discharge-register" name="register"><option value="" selected disabled>Choose the record</option><option value="copy">The new, clean duplicate</option><option value="original">The original opening-night register</option></select><label class="field-label" for="discharge-key">What will you do with the brass key?</label><select class="text-input" id="discharge-key" name="key"><option value="" selected disabled>Choose what happens to the key</option><option value="turn">Turn it in the offered lock</option><option value="leave">Leave it untouched</option></select><label class="field-label" for="discharge-route">Which departure will you record?</label><select class="text-input" id="discharge-route" name="route"><option value="" selected disabled>Choose the way out</option><option value="white">The welcoming white doorway</option><option value="stair">The service stair</option><option value="red">The red EXIT door</option></select><div class="form-error" id="puzzle-error" role="status"></div><button class="button full-width" type="submit">Sign as ${escape(state().name)} & close the accounts →</button></form><div class="dialog-actions"><button class="underlined" data-action="nightaudit">Review the discharge requirements</button><button class="danger-link" data-action="accept-uniform">Stay and take the night shift</button></div>`,
          "FINAL DISCHARGE / NO COPIES ACCEPTED",
        );
      },
      "accept-uniform"() {
        if (state().chapter < 2 || steps.some((id) => !solved(id))) return;
        if (!state().endings.includes("custodian"))
          state().endings.push("custodian");
        save();
        show(
          "The new night porter",
          `<p class="ending-code">ENDING 04 / THE POSITION IS NOW FILLED</p><p>You reach for the uniform. The next thing you notice is a tight collar against your neck. The register is open in front of you. Someone is ringing the bell.</p><p>Beyond the glass doors, someone is sheltering from rain. You reach for the key to 307 before they can ask for a room.</p><p class="file-note">Your checkout slip has been stamped “NIGHT STAFF.” Your room key is now hanging on the board behind you.</p><div class="dialog-actions"><button class="button" data-action="final-discharge">Refuse the appointment & try again →</button></div>`,
          "NIGHT DESK / APPOINTMENT CONFIRMED",
        );
      },
      "inspect-shadow"() {
        api.stopHotelMusic();
        const encounter = chooseScare();
        show(
          encounter.title,
          `<div class="intrusion-frame ${state().scares ? "" : "quiet-intrusion"}" data-encounter="${encounter.id}">${state().scares ? `<img class="intrusion-figure" src="${encounter.file}" alt="${encounter.alt}">` : ""}<strong>${encounter.headline}</strong><span>${encounter.caption}</span></div><p>${encounter.description}</p><div class="dialog-actions"><button class="paper-button" data-action="inspect-shadow">Review the next anomalous frame →</button><button class="paper-button" data-action="monitor">Return to the ordinary recording</button></div>`,
          "SECURITY EXCEPTION / FRAME 0000",
        );
        if (state().scares) api.playKnock();
      },
    };
    for (const id of steps) {
      const openPuzzle = actions[`puzzle-${id}`];
      actions[`replay-${id}`] = openPuzzle;
      actions[`puzzle-${id}`] = () => {
        if (!solved(id)) return openPuzzle();
        const clue = window.StillwaterExpansion.clues[evidence[id]];
        show(
          clue.title,
          `<p class="document-intro">This station is complete. Your record is saved.</p><p>${clue.text}</p><div class="dialog-actions"><button class="button" data-action="replay-${id}">Try this puzzle again →</button><button class="paper-button" data-page="below">Return to lower register</button></div>`,
          "LOWER REGISTER / VERIFIED RECORD",
        );
      };
    }
    function submit(event) {
      const form = event.target;
      if (!form.id.startsWith("lower-")) return;
      event.preventDefault();
      const id = form.id.slice(6, -5);
      if (id === "discharge") {
        if (
          state().chapter < 2 ||
          steps.some((step) => !solved(step)) ||
          !state().checkedIn
        )
          return reject(
            "The desk needs all twelve records and a registered living guest.",
          );
        if (
          form.elements.register.value === "original" &&
          form.elements.key.value === "leave" &&
          form.elements.route.value === "stair"
        ) {
          state().chapter = 3;
          if (!state().endings.includes("dawn")) state().endings.push("dawn");
          save();
          dialog.close();
          go("below");
          render(true);
          toast("All accounts closed. There are no guests waiting.");
          api.startAfterword();
        } else
          reject(
            "The duplicate, the key, or the offered doors keep the circuit closed. Re-read the night audit and the reflected instruction.",
          );
        return;
      }
      if (!guard(id)) return;
      if (id === "power") {
        if (circuit.join("") === "3142")
          complete(
            id,
            "The second supply answers",
            "The bell rings once. Kitchen heat steadies, linen service answers, and the night desk begins counting. The receiver lights up. Under the switchboard, a hand withdraws into a socket too small to hold it.",
          );
        else
          reject(
            "The board rejects the sequence. Reception first, night desk last. The facilities card gives the full order.",
          );
      } else if (id === "radio") {
        if (form.elements.frequency.value === "887")
          complete(
            id,
            "A voice beneath the weather",
            "TRANSCRIPT / WSTL 88.7 FM: “Still overcast. Do not return to the desk. This is Rowan. The census box uses the kitchen cabinet word. Read the FIRST LETTER of each dinner course, in serving order. The hotel has removed a name, not a room.” A second voice begins reading your arrival date before the carrier drops.",
          );
        else
          reject(
            "Only static. Check the breakfast programme card in the hotel guide; the old receiver uses the same FM station.",
          );
      } else if (id === "archive") {
        if (normalize(form.elements.answer.value) === "STILL")
          complete(
            id,
            "The census box opens",
            "The five letters align. Inside is the uncropped photograph and a residents’ circular. One founder wears a 311 key. The relief porter is clearly marked 309. Restore the missing name, not the uniformed one.",
          );
        else
          reject(
            "The five beginnings do not align. Read the FIRST LETTER of each printed dinner course.",
          );
      } else if (id === "identity") {
        if (
          normalize(form.elements.answer.value) === "WALTERVALE" ||
          ["沃尔特维尔", "沃爾特維爾"].includes(
            form.elements.answer.value
              .normalize("NFKC")
              .replace(/[\s·・。，,.]/g, ""),
          )
        )
          complete(
            id,
            "Entry 311 restored",
            "WALTER VALE appears in the erased field. Something knocks from the inside of the ledger. You do not answer. A door beside the observation glass opens, and the figure beyond it lowers its head.",
          );
        else
          reject(
            "That name belongs to another entry. Compare the uncropped identification cards: PROPRIETOR / 311.",
          );
      } else if (id === "mirror") {
        if (
          normalize(form.elements.answer.value) === "DONOTTURNTHEKEY" ||
          [
            "不要转动钥匙",
            "别转动钥匙",
            "不要转钥匙",
            "勿转动钥匙",
            "不要转动这把钥匙",
            "不要轉動鑰匙",
          ].includes(
            form.elements.answer.value
              .normalize("NFKC")
              .replace(/[\s。，、,.!！?？]/g, ""),
          )
        )
          complete(
            id,
            "The key stays still",
            "DO NOT TURN THE KEY. The reflected card is a warning, not an invitation. The brass key has no place in the final discharge. You will need the original register and the service stair.",
          );
        else
          reject(
            "Read all characters from right to left. The instruction has five ordinary English words.",
          );
      } else if (id === "chronology") {
        if (dates.join(",") === "open,stop,return")
          complete(
            id,
            "The dates are back in order",
            "03 October: opening. 04 October: clock failure. 05 October: first return. The register stops changing the dates. A checkout form prints behind the desk.",
          );
        else
          reject(
            "The arrival must precede the interruption, and the first return comes last. The incident review preserves all three dates.",
          );
      }
    }
    document.addEventListener("submit", submit);
    document.addEventListener("click", (event) => {
      const circuitButton = event.target.closest("[data-circuit]");
      if (circuitButton && !circuitButton.disabled && available("power")) {
        circuit.push(circuitButton.dataset.circuit);
        updateSequence("circuit");
      }
      const dateButton = event.target.closest("[data-date]");
      if (dateButton && !dateButton.disabled && available("chronology")) {
        dates.push(dateButton.dataset.date);
        updateSequence("date");
      }
    });
    document.addEventListener("input", (event) => {
      if (event.target.id === "radio-frequency") {
        $("#radio-frequency-number").value = (
          Number(event.target.value) / 10
        ).toFixed(1);
        $("#frequency-output").textContent =
          `${(Number(event.target.value) / 10).toFixed(1)} MHz`;
      } else if (event.target.id === "radio-frequency-number") {
        const value = Number(event.target.value);
        if (event.target.value && value >= 86 && value <= 92) {
          $("#radio-frequency").value = String(Math.round(value * 10));
          $("#frequency-output").textContent = `${value.toFixed(1)} MHz`;
        }
      }
    });
    function epilogue() {
      return `<div class="page-main epilogue"><p class="eyebrow">DEPARTURE RECORD / ALL ACCOUNTS CLOSED</p><h1>Outside, it is morning.</h1><p class="epilogue-number">05</p><h2>The hotel no longer remembers you.</h2><p>You carry the original book to the stair. The key remains on the desk. Behind you, the offered lock closes around nothing.</p><p>The guests cross quietly. David counts Ruth’s steps. Margaret leaves her empty cup on the last landing. Arthur folds the coat that has finally dried. Rowan unties the ribbon. Eleanor pauses for the name that has been missing from every version of this morning.</p><p>Walter comes down last. Without the uniform’s reflection, he looks old, exhausted, and entirely human. He signs beside his wife. The final departure field accepts its date.</p><p>You step onto a road that continues in both directions. Behind you is an unoccupied building with a printed sign that someone has turned face down. There is no bell. No light remains at reception.</p><p class="file-note">YOUR ACCOUNT: CLOSED<br>ROOMS AWAITING RETURN: 0<br>NEXT GUEST: NONE</p><p class="epilogue-last">This time, you do not look back.</p><div class="inline-actions"><button class="button" data-action="journal">Read the completed records</button><button class="paper-button" data-page="home">Return to the public hotel archive</button><button class="paper-button" data-action="about">Settings & start a new stay</button></div><p class="local-note">True ending remembered. Your records remain saved. To replay the lower chapter, start a new stay in Site Information. Earlier “release” endings now lead into this chapter when revisited.</p></div>`;
    }
    function applyTheme() {
      document.body.classList.toggle("breached", state().chapter === 2);
      document.body.classList.toggle("aftermath", state().chapter === 3);
      document.body.classList.toggle("quiet-effects", !state().scares);
      const banner = $("#chapter-return");
      if (banner) banner.hidden = state().chapter < 2;
      const label = $("#chapter-return-label");
      if (label)
        label.textContent =
          state().chapter === 3
            ? "Read the final departure record"
            : "PUBLIC SITE COMPROMISED · RETURN TO LOWER REGISTER";
    }
    return {
      pages: { guide: guidePage, below: lowerPage },
      actions,
      breach,
      applyTheme,
      publicClues: ["clock", "door", "ribbon", "register", "switch", "letter"],
      preloadScares,
      documentHelp,
      captureDocumentState: () => ({
        circuit: [...circuit],
        dates: [...dates],
      }),
      restoreDocumentState: (saved) => {
        if (!saved) return;
        circuit = [...saved.circuit];
        dates = [...saved.dates];
      },
      extraNotebook: () =>
        state().chapter >= 2
          ? `<p class="system-note">${state().chapter === 3 ? "The final discharge is complete." : "The first checkout was not the end."}</p><button class="button" data-page="below">${state().chapter === 3 ? "Read the true ending" : "Return below"} →</button>`
          : "",
      onWrongCode: () => {
        state().wrongAnswers++;
        save();
      },
    };
  },
};
