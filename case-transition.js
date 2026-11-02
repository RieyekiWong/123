/* Presentation only: progression remains in case-state. Deadlines survive reload. */
globalThis.StillwaterCaseTransition = {
  create({ getState, onBegin, complete, t }) {
    const KEY = "stillwater-transition:v1";
    let timer = null,
      active = false;
    const clear = () => {
      try {
        localStorage.removeItem(KEY);
      } catch {}
    };
    function cancel() {
      clearTimeout(timer);
      active = false;
      clear();
      document.querySelector("#phase-blackout")?.remove();
      document.body.classList.remove("case-switching");
      document.querySelector("#case-shell")?.removeAttribute("aria-hidden");
      const shell = document.querySelector("#case-shell");
      if (shell) shell.inert = false;
    }
    function show(until) {
      if (active) return;
      active = true;
      onBegin();
      const shell = document.querySelector("#case-shell");
      shell.inert = true;
      shell.setAttribute("aria-hidden", "true");
      document.body.classList.add("case-switching");
      const overlay = document.createElement("div");
      overlay.id = "phase-blackout";
      overlay.setAttribute("aria-hidden", "true");
      document.body.append(overlay);
      document.querySelector("#case-status").textContent = t(
        "正在连接酒店页面。",
        "Connecting to the hotel.",
      );
      timer = setTimeout(
        () => {
          active = false;
          clear();
          shell.inert = false;
          shell.removeAttribute("aria-hidden");
          document.body.classList.remove("case-switching");
          complete();
          overlay.remove();
        },
        Math.max(0, Math.min(2000, until - Date.now())),
      );
    }
    function begin() {
      const until = Date.now() + 2000;
      try {
        localStorage.setItem(KEY, JSON.stringify({ schema: 1, until }));
      } catch {}
      show(until);
    }
    function resume() {
      let raw;
      try {
        raw = JSON.parse(localStorage.getItem(KEY));
      } catch {}
      if (
        !getState().night.started ||
        !raw ||
        raw.schema !== 1 ||
        !Number.isFinite(raw.until)
      ) {
        clear();
        return;
      }
      show(raw.until);
    }
    document.addEventListener(
      "keydown",
      (event) => {
        if (active && ["Tab", "Enter", " ", "Escape"].includes(event.key))
          event.preventDefault();
      },
      true,
    );
    return { begin, resume, cancel, isActive: () => active };
  },
};
