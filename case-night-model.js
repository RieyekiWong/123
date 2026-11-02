/* Pure graph/state helpers. Stored exclusively inside stillwater-case:v2. */
globalThis.StillwaterNightModel = (() => {
  const initial = [0, 0, 0, 2, 2, 2];
  const fresh = () => ({
    started: false,
    pans: [1, 1, 1],
    links: [],
    door: false,
    frame: false,
    orientations: [...initial],
    isolated: false,
    manual: false,
    saved: false,
    locked: false,
    released: false,
    operations: 0,
    undo: [],
  });
  const ports = (turn) => [turn % 4, (turn + 1) % 4]; // N E S W, clockwise elbow
  function trace(rotations, start, entry) {
    if (!ports(rotations[start]).includes(entry)) return [];
    const visited = new Set([start]),
      queue = [start],
      delta = [
        [0, -1],
        [1, 0],
        [0, 1],
        [-1, 0],
      ];
    while (queue.length) {
      const node = queue.shift(),
        x = node % 3,
        y = Math.floor(node / 3);
      for (const d of ports(rotations[node])) {
        const [dx, dy] = delta[d],
          nx = x + dx,
          ny = y + dy;
        if (nx < 0 || nx > 2 || ny < 0 || ny > 1) continue;
        const next = ny * 3 + nx;
        if (
          ports(rotations[next]).includes((d + 2) % 4) &&
          !visited.has(next)
        ) {
          visited.add(next);
          queue.push(next);
        }
      }
    }
    return [...visited];
  }
  function circuit(n) {
    const original = trace(n.orientations, 0, 3),
      write = n.isolated ? [] : trace(n.orientations, 3, 0);
    const readable =
        original.includes(5) && ports(n.orientations[5]).includes(1),
      register = write.includes(5) && ports(n.orientations[5]).includes(1);
    return {
      original,
      write,
      readable,
      register,
      valid: readable && n.isolated && n.manual && !register,
    };
  }
  const anchor = (cam, pan) =>
    cam === 0
      ? pan === 2
        ? "cart"
        : ""
      : cam === 1
        ? pan === 0
          ? "cart"
          : pan === 2
            ? "notice"
            : ""
        : pan === 0
          ? "notice"
          : pan === 2
            ? "door"
            : "";
  function hydrate(raw, eligible) {
    const n = fresh();
    if (!eligible || !raw?.started) return n;
    n.started = true;
    n.pans = n.pans.map((v, i) =>
      [0, 1, 2].includes(raw.pans?.[i]) ? raw.pans[i] : v,
    );
    n.links = [0, 1].filter(
      (v) => Array.isArray(raw.links) && raw.links.includes(v),
    );
    n.door = n.links.length === 2 && raw.door === true;
    n.frame = n.door && raw.frame === true;
    n.orientations = initial.map((v, i) =>
      Number.isInteger(raw.orientations?.[i]) &&
      raw.orientations[i] >= 0 &&
      raw.orientations[i] < 4
        ? raw.orientations[i]
        : v,
    );
    n.isolated = raw.isolated === true;
    n.manual = raw.manual === true;
    n.operations = Math.max(0, Math.min(10000, Number(raw.operations) || 0));
    n.saved = n.door && raw.saved === true && circuit(n).valid;
    n.locked = n.saved && raw.locked === true;
    n.released = raw.released === true || n.locked;
    n.undo = Array.isArray(raw.undo)
      ? raw.undo
          .filter(
            (v) =>
              Array.isArray(v?.orientations) &&
              v.orientations.length === 6 &&
              v.orientations.every(
                (x) => Number.isInteger(x) && x >= 0 && x < 4,
              ) &&
              typeof v.isolated === "boolean" &&
              typeof v.manual === "boolean",
          )
          .slice(-30)
          .map((v) => ({
            orientations: [...v.orientations],
            isolated: v.isolated,
            manual: v.manual,
          }))
      : [];
    return n;
  }
  return Object.freeze({ fresh, hydrate, ports, trace, circuit, anchor });
})();
