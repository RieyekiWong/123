/* On-demand low-poly software renderer. Geometry/textures are game graphics,
   never screenshots with baked UI. No network, animation loop or GPU dependency. */
globalThis.StillwaterScenes = (() => {
  const W = 320,
    H = 240,
    textures = new Map();
  function texture(kind) {
    if (textures.has(kind)) return textures.get(kind);
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const x = c.getContext("2d");
    let seed = kind.split("").reduce((s, v) => s + v.charCodeAt(0), 31);
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    const palette = {
      wall: [96, 88, 65],
      service: [76, 76, 59],
      floor: [68, 48, 37],
      ceiling: [43, 42, 33],
      wood: [58, 36, 26],
      metal: [63, 68, 53],
      paper: [148, 140, 113],
      cloth: [125, 117, 91],
      black: [18, 23, 17],
      carpet: [74, 43, 36],
    };
    const base = palette[kind] || palette.wall;
    for (let y = 0; y < 64; y++)
      for (let xx = 0; xx < 64; xx++) {
        let noise = (rand() - 0.5) * 25;
        if (kind === "carpet") noise += (xx + y) % 12 < 3 ? 14 : -4;
        if (kind === "wood") noise += Math.sin(xx * 0.7) * 9;
        if (kind === "wall" && y % 14 === 0) noise -= 18;
        x.fillStyle = `rgb(${base.map((v) => Math.max(0, Math.min(255, Math.round((v + noise) / 8) * 8))).join(",")})`;
        x.fillRect(xx, y, 1, 1);
      }
    textures.set(kind, c);
    return c;
  }
  function render(canvas, options = {}) {
    const c = canvas.getContext("2d");
    if (!c) return;
    canvas.width = W;
    canvas.height = H;
    c.imageSmoothingEnabled = false;
    c.fillStyle = "#10150e";
    c.fillRect(0, 0, W, H);
    const scene = options.scene || "hall",
      yaw = (Number(options.pan ?? 1) - 1) * 0.16,
      cy = 1.55,
      faces = [],
      width = scene === "lobby" ? 3.7 : scene === "room" ? 2.4 : 1.85,
      length = scene === "lobby" ? 13 : 18;
    const project = ([x, y, z]) => {
      const nx = x * Math.cos(yaw) - z * Math.sin(yaw),
        nz = x * Math.sin(yaw) + z * Math.cos(yaw);
      return [
        Math.round(W / 2 + (nx * 170) / Math.max(0.15, nz)),
        Math.round(H / 2 - ((y - cy) * 170) / Math.max(0.15, nz)),
        nz,
      ];
    };
    const face = (v, mat = "wall", shade = 0.4, label = "") =>
      faces.push({
        v,
        mat,
        shade,
        label,
        z: v.reduce((n, p) => n + p[2], 0) / v.length,
      });
    const box = (x, y, z, w, h, d, mat = "wood") => {
      face(
        [
          [x, y, z],
          [x + w, y, z],
          [x + w, y + h, z],
          [x, y + h, z],
        ],
        mat,
        0.22,
      );
      face(
        [
          [x, y + h, z],
          [x + w, y + h, z],
          [x + w, y + h, z + d],
          [x, y + h, z + d],
        ],
        mat,
        0.06,
      );
      face(
        [
          [x, y, z],
          [x, y + h, z],
          [x, y + h, z + d],
          [x, y, z + d],
        ],
        mat,
        0.5,
      );
      face(
        [
          [x + w, y, z],
          [x + w, y, z + d],
          [x + w, y + h, z + d],
          [x + w, y + h, z],
        ],
        mat,
        0.37,
      );
    };
    // Short textured polygons retain perspective while keeping the PS1 affine wobble.
    for (let z = 0.7; z < length; z += 1.2) {
      const end = Math.min(length, z + 1.2);
      for (let x = -width; x < width; x += 0.9) {
        const r = Math.min(width, x + 0.9);
        face(
          [
            [x, 0, z],
            [r, 0, z],
            [r, 0, end],
            [x, 0, end],
          ],
          scene === "service" ? "floor" : "carpet",
          0.18,
        );
        face(
          [
            [x, 3.25, z],
            [x, 3.25, end],
            [r, 3.25, end],
            [r, 3.25, z],
          ],
          "ceiling",
          0.25,
        );
      }
      for (const side of [-1, 1])
        for (let y = 0; y < 3.25; y += 1.1) {
          const xx = side * width,
            top = Math.min(3.25, y + 1.1);
          face(
            [
              [xx, y, z],
              [xx, y, end],
              [xx, top, end],
              [xx, top, z],
            ],
            scene === "service" ? "service" : "wall",
            side < 0 ? 0.3 : 0.18,
          );
        }
    }
    face(
      [
        [-width, 0, length],
        [width, 0, length],
        [width, 3.25, length],
        [-width, 3.25, length],
      ],
      "wood",
      0.62,
    );
    for (const z of [3.8, 7.8, 11.8, 15.8])
      for (const side of [-1, 1]) {
        const xx = side * (width - 0.015),
          open = !!options.openDoor && z === 3.8 && side === -1;
        face(
          [
            [xx, 0.05, z],
            [xx, 0.05, z + 1.15],
            [xx, 2.55, z + 1.15],
            [xx, 2.55, z],
          ],
          open ? "black" : "wood",
          open ? 0.08 : 0.28,
        );
        if (open)
          box(xx + (side < 0 ? 0.1 : -0.7), 0, z + 0.08, 0.6, 2.4, 0.1, "wood");
        face(
          [
            [xx, 1.72, z + 0.3],
            [xx, 1.72, z + 0.82],
            [xx, 2.04, z + 0.82],
            [xx, 2.04, z + 0.3],
          ],
          "paper",
          0.24,
          z === 3.8 ? (options.classic ? "307" : side < 0 ? "318" : "317") : "",
        );
        box(side * (width - 0.12), 2.23, z - 0.35, 0.13, 0.32, 0.2, "metal");
      }
    for (const side of [-1, 1]) {
      box(
        side < 0 ? -width : width - 0.08,
        0,
        1,
        0.08,
        0.6,
        length - 1,
        "wood",
      );
    }
    if (scene === "hall") {
      const x = -width + 0.025,
        z = 2.8;
      face(
        [
          [x, 1.4, z],
          [x, 1.4, z + 0.9],
          [x, 2.18, z + 0.9],
          [x, 2.18, z],
        ],
        "wood",
        0.15,
      );
      face(
        [
          [x, 1.47, z + 0.08],
          [x, 1.47, z + 0.82],
          [x, 2.1, z + 0.82],
          [x, 2.1, z + 0.08],
        ],
        "paper",
        0.34,
      );
      for (const dz of [0.17, 0.36, 0.55])
        box(x + 0.01, 1.53, z + dz, 0.07, 0.35, 0.12, "black");
    }
    if (scene === "lobby") {
      box(-2.7, 0, 5.3, 4.3, 1.15, 0.9, "wood");
      box(-2.85, 1.1, 5.15, 4.6, 0.13, 1.2, "wood");
      box(-1.95, 1.3, 7, 0.13, 1.5, 0.2, "wood");
      for (let row = 0; row < 4; row++)
        for (let col = 0; col < 9; col++)
          box(
            -2.4 + col * 0.4,
            1.38 + row * 0.28,
            8,
            0.25,
            0.18,
            0.06,
            "black",
          );
      for (let step = 0; step < 7; step++)
        box(1.9, 0, 4.4 + step * 0.42, 1.6, (step + 1) * 0.2, 0.45, "wood");
    } else if (scene === "room") {
      box(-1.35, 0, 4.3, 2.5, 0.5, 3.4, "wood");
      box(-1.3, 0.5, 4.3, 2.4, 0.22, 3.3, "cloth");
      box(-1.1, 0.75, 6.65, 1.9, 0.12, 0.6, "paper");
      box(-2, 0.0, 4.6, 0.5, 0.7, 0.55, "wood");
    } else if (scene === "service") {
      for (const x of [-1.2, 0.7]) box(x, 2.8, 0.8, 0.18, 0.18, 15, "metal");
      for (const z of [3.5, 7.5, 11.5])
        box(-1.7, 3.0, z, 3.4, 0.12, 0.18, "metal");
      box(0.2, 0.8, 7.2, 0.7, 0.8, 0.15, "metal");
    }
    if (options.landmark === "cart" || options.cart) {
      const x = scene === "lobby" ? 1.2 : -1.1,
        z = scene === "lobby" ? 5.6 : 5.3,
        move = options.cartMoved ? 0.3 : 0;
      box(x + move, 0.12, z, 0.65, 0.8, 0.5, "metal");
      box(x + 0.05 + move, 0.92, z + 0.04, 0.55, 0.2, 0.42, "cloth");
      for (const dx of [0, 0.6])
        box(x + dx + move, 0.2, z + 0.48, 0.035, 1.2, 0.04, "metal");
      box(x + move, 1.37, z + 0.48, 0.64, 0.04, 0.04, "metal");
      face(
        [
          [x + 0.2 + move, 1.35, z + 0.45],
          [x + 0.4 + move, 1.35, z + 0.45],
          [x + 0.4 + move, 1.42, z + 0.45],
          [x + 0.2 + move, 1.42, z + 0.45],
        ],
        "paper",
        0.02,
        "TAPE",
      );
      for (const dx of [0.1, 0.53])
        box(x + dx + move, 0.0, z + 0.1, 0.11, 0.13, 0.14, "black");
    }
    if (options.landmark === "notice" || options.notice) {
      const xx = scene === "service" ? -width + 0.025 : width - 0.025,
        z = 4.4;
      face(
        [
          [xx, 1.38, z],
          [xx, 1.38, z + 0.63],
          [xx, 1.85, z + 0.77],
          [xx, 2.2, z + 0.77],
          [xx, 2.2, z],
        ],
        "paper",
        0.18,
        "MAINT",
      );
    }
    if (options.landmark === "door" || options.b3) {
      const xx = width - 0.03,
        z = 3.3;
      face(
        [
          [xx, 0.04, z],
          [xx, 0.04, z + 1.5],
          [xx, 2.66, z + 1.5],
          [xx, 2.66, z],
        ],
        "metal",
        0.2,
      );
      face(
        [
          [xx, 1.75, z + 0.23],
          [xx, 1.75, z + 1.18],
          [xx, 2.15, z + 1.18],
          [xx, 2.15, z + 0.23],
        ],
        "paper",
        0.12,
        "B-3",
      );
      box(width - 0.17, 2.78, z + 0.67, 0.12, 0.2, 0.2, "metal");
    }
    if (options.cabinet) {
      box(
        -width + 0.03,
        0.65,
        3.3,
        0.16,
        1.2,
        0.9,
        options.cabinetOpen ? "black" : "metal",
      );
      face(
        [
          [-width + 0.2, 1.1, 3.48],
          [-width + 0.2, 1.1, 3.91],
          [-width + 0.2, 1.5, 3.91],
          [-width + 0.2, 1.5, 3.48],
        ],
        "paper",
        0.1,
        "POWER",
      );
    }
    if (options.silhouette) {
      box(-0.27, 0, 12, 0.5, 1.4, 0.18, "black");
      box(-0.16, 1.4, 12, 0.28, 0.36, 0.2, "black");
    }
    function triangle(img, src, dst) {
      c.save();
      c.beginPath();
      c.moveTo(dst[0][0], dst[0][1]);
      c.lineTo(dst[1][0], dst[1][1]);
      c.lineTo(dst[2][0], dst[2][1]);
      c.closePath();
      c.clip();
      const [u0, v0] = src[0],
        [u1, v1] = src[1],
        [u2, v2] = src[2],
        den = u0 * (v1 - v2) + u1 * (v2 - v0) + u2 * (v0 - v1);
      if (!den) {
        c.restore();
        return;
      }
      const solve = (k) => [
          (dst[0][k] * (v1 - v2) +
            dst[1][k] * (v2 - v0) +
            dst[2][k] * (v0 - v1)) /
            den,
          (dst[0][k] * (u2 - u1) +
            dst[1][k] * (u0 - u2) +
            dst[2][k] * (u1 - u0)) /
            den,
          (dst[0][k] * (u1 * v2 - u2 * v1) +
            dst[1][k] * (u2 * v0 - u0 * v2) +
            dst[2][k] * (u0 * v1 - u1 * v0)) /
            den,
        ],
        a = solve(0),
        b = solve(1);
      c.transform(a[0], b[0], a[1], b[1], a[2], b[2]);
      c.drawImage(img, 0, 0);
      c.restore();
    }
    for (const f of faces.sort((a, b) => b.z - a.z)) {
      const q = f.v.map(project);
      if (q.every((p) => p[2] < 0.2)) continue;
      const image = texture(f.mat);
      if (q.length === 4) {
        triangle(
          image,
          [
            [0, 0],
            [64, 0],
            [64, 64],
          ],
          q.slice(0, 3),
        );
        triangle(
          image,
          [
            [0, 0],
            [64, 64],
            [0, 64],
          ],
          [q[0], q[2], q[3]],
        );
      } else {
        c.fillStyle = "#aaa18a";
        c.beginPath();
        q.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])));
        c.closePath();
        c.fill();
      }
      c.fillStyle = `rgba(0,8,2,${f.shade})`;
      c.beginPath();
      q.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])));
      c.closePath();
      c.fill();
      if (f.label) {
        const center = q.reduce(
            (a, p) => [a[0] + p[0] / q.length, a[1] + p[1] / q.length],
            [0, 0],
          ),
          size = Math.max(3, Math.min(10, 80 / f.z));
        c.font = `${Math.round(size)}px monospace`;
        c.fillStyle = f.label === "TAPE" ? "#b9a85b" : "#282b20";
        c.textAlign = "center";
        c.fillText(f.label === "TAPE" ? "" : f.label, center[0], center[1]);
      }
    }
    for (const z of [3, 6.8, 11, 15]) {
      const p = project([0, 3.08, z]);
      const size = Math.max(2, 23 / z);
      c.fillStyle = scene === "service" ? "#9b3c27" : "#d5bf88";
      c.fillRect(p[0] - size, p[1] - 2, size * 2, 3);
      const glow = c.createRadialGradient(p[0], p[1], 0, p[0], p[1], size * 7);
      glow.addColorStop(0, scene === "service" ? "#b03e2d45" : "#d7ba6230");
      glow.addColorStop(1, "transparent");
      c.fillStyle = glow;
      c.fillRect(p[0] - size * 7, p[1] - size * 7, size * 14, size * 14);
    }
    if (scene === "service") {
      const p = project([width - 0.12, 2.8, 4.0]),
        glow = c.createRadialGradient(p[0], p[1], 2, p[0], p[1], 70);
      glow.addColorStop(0, options.power ? "#9caa594d" : "#c529284f");
      glow.addColorStop(1, "transparent");
      c.fillStyle = glow;
      c.fillRect(0, 0, W, H);
      c.fillStyle = options.power ? "#b2d785" : "#e66744";
      c.fillRect(p[0] - 2, p[1] - 2, 4, 4);
    }
    const shade = c.createRadialGradient(160, 110, 60, 160, 120, 210);
    shade.addColorStop(0, "#0000");
    shade.addColorStop(1, "#010703c0");
    c.fillStyle = shade;
    c.fillRect(0, 0, W, H);
    canvas.dataset.rendered = "yes";
    canvas.setAttribute("aria-hidden", "true");
  }
  const portraitCache = new Map();
  async function portrait(im) {
    const src = im.getAttribute("src");
    if (!src || im.dataset.psxSource === src) return;
    im.dataset.psxSource = src;
    try {
      await im.decode();
      if (im.getAttribute("src") !== src) return;
      if (!portraitCache.has(src)) {
        const c = document.createElement("canvas");
        c.width = 160;
        c.height = 120;
        const x = c.getContext("2d");
        x.drawImage(im, 0, 0, 160, 120);
        const data = x.getImageData(0, 0, 160, 120);
        for (let i = 0; i < data.data.length; i += 4) {
          const g =
            data.data[i] * 0.3 +
            data.data[i + 1] * 0.5 +
            data.data[i + 2] * 0.2;
          data.data[i] = Math.round(g / 24) * 24 * 0.82;
          data.data[i + 1] = Math.round(g / 24) * 24;
          data.data[i + 2] = Math.round(g / 24) * 24 * 0.76;
        }
        x.putImageData(data, 0, 0);
        portraitCache.set(src, c.toDataURL("image/jpeg", 0.58));
      }
      im.srcset = portraitCache.get(src) + " 1x";
    } catch {
      im.dataset.psxSource = "";
    }
  }
  function decorate(root) {
    if (!root.querySelectorAll) return;
    const frames = [
      ...(root.matches?.(
        ".cctv-frame[data-camera-view],.passage-frame,.camera-screen,.shift-feed",
      )
        ? [root]
        : []),
      ...root.querySelectorAll(
        ".cctv-frame[data-camera-view],.passage-frame,.camera-screen,.shift-feed",
      ),
    ];
    for (const frame of frames) {
      let picture = frame.querySelector(".cctv-picture,.shift-scene");
      if (!picture) continue;
      let canvas = picture.querySelector(".psx-scene");
      if (!canvas) {
        canvas = document.createElement("canvas");
        canvas.className = "psx-scene";
        picture.prepend(canvas);
      }
      if (canvas.dataset.rendered) continue;
      const feed = frame.dataset.feed,
        cam = frame.hasAttribute("data-camera-view")
          ? Number(frame.dataset.cameraView)
          : NaN;
      let scene =
        picture.dataset.scene ||
        (feed === "room"
          ? "room"
          : feed === "lobby"
            ? "lobby"
            : feed === "corridor"
              ? "hall"
              : Number.isInteger(cam)
                ? cam === 0
                  ? "lobby"
                  : cam === 2
                    ? "service"
                    : "hall"
                : /LOBBY|大堂/.test(frame.textContent)
                  ? "lobby"
                  : "hall");
      render(canvas, {
        scene,
        pan: Number(picture.dataset.pan ?? 1),
        landmark: picture.dataset.landmark || "",
        cart: picture.dataset.cart === "true",
        cartMoved: picture.dataset.cartMoved === "true",
        openDoor: picture.dataset.openDoor === "true",
        silhouette: picture.dataset.silhouette === "true",
        cabinet: picture.dataset.cabinet === "true",
        cabinetOpen: picture.dataset.cabinetOpen === "true",
        power: picture.dataset.power === "true",
        b3: picture.dataset.b3 === "true",
        classic: document.body.dataset.edition === "classic",
      });
    }
    const portraits = [
      ...(root.matches?.(
        ".frame-face img,.monitor-threat img,.intrusion-figure",
      )
        ? [root]
        : []),
      ...root.querySelectorAll(
        ".frame-face img,.monitor-threat img,.intrusion-figure",
      ),
    ];
    portraits.forEach(portrait);
  }
  if (typeof document !== "undefined") {
    new MutationObserver((rs) => {
      for (const r of rs) {
        if (r.type === "attributes") {
          if (
            r.target.matches(
              ".frame-face img,.monitor-threat img,.intrusion-figure",
            )
          )
            portrait(r.target);
        } else
          r.addedNodes.forEach((n) => {
            if (n.nodeType === 1) decorate(n);
          });
      }
    }).observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["src"],
    });
    decorate(document);
  }
  return { render, decorate };
})();
