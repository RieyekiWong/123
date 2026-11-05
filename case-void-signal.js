/* Live counterpart of the approved preview. Presentation only: no save writes,
   input capture, puzzle transitions or new audio contexts. */
globalThis.StillwaterVoidSignal = {
  create({ getState, reduced, audio, random = Math.random }) {
    let timer = 0,
      raf = 0,
      active = false,
      prefs = "",
      generation = 0,
      overlay = null,
      stopHiss = null,
      bag = [];
    let manual = null;
    let image = null,
      loading = null;
    const eligible = () =>
      (manual ? manual.target.isConnected && location.hash === manual.hash :
      document.body.dataset.site === "void" &&
      getState().night.void.entered &&
      ["corridor", "fragments", "classify"].includes(
        getState().night.void.stage,
      )) &&
      !getState().preferences.skipScares &&
      !document.hidden &&
      !reduced() &&
      !document.querySelector("dialog[open]");
    const occupied = () =>
      !!document.querySelector(
        ".frame-face,.escape-scare,.portrait-popout,.promo-echo-active",
      ) || audio.snapshot().quiet;
    function finish() {
      cancelAnimationFrame(raf);
      raf = 0;
      overlay?.remove();
      overlay = null;
      stopHiss?.();
      stopHiss = null;
      if(manual){manual=null;active=false;}
    }
    function clear() {
      generation++;
      clearTimeout(timer);
      timer = 0;
      active = false;
      finish();
    }
    function preload() {
      if (loading) return loading;
      image = new Image();
      image.src = "assets/previews/v415-signal/apparition.png";
      loading = image.decode().then(
        () => true,
        () => false,
      );
      return loading;
    }
    function schedule(first = false) {
      if(manual||globalThis.StillwaterStoryV13?.active(getState()))return;
      clearTimeout(timer);
      timer = setTimeout(
        () => void play(),
        first ? 12000 + random() * 6000 : 18000 + random() * 10000,
      );
    }
    async function play() {
      timer = 0;
      if (!eligible()) {
        sync();
        return;
      }
      if (occupied()) {
        schedule();
        return;
      }
      if (!bag.length) bag = random() < 0.5 ? [true, false] : [false, true];
      const wanted = (manual ? true : bag.pop()) && !getState().preferences.skipScares,
        token = generation;
      const hasFace = wanted && (await preload());
      if (token !== generation || !active || !eligible()) return;
      if (occupied()) {
        schedule();
        return;
      }
      overlay = document.createElement("canvas");
      overlay.className = "void-signal-burst";
      overlay.dataset.face = String(hasFace);overlay.dataset.nullForm=manual?.form||(getState().story?.active&&!getState().story?.legacy?"trace":"assembled");
      overlay.setAttribute("aria-hidden", "true");
      const bounds=manual?.target.getBoundingClientRect(),visible=bounds&&Math.min(innerHeight,bounds.bottom)-Math.max(0,bounds.top),region=manual?(visible>80?{left:Math.max(0,bounds.left),top:Math.max(0,bounds.top),width:Math.min(innerWidth,bounds.right)-Math.max(0,bounds.left),height:visible}:{left:0,top:0,width:innerWidth,height:innerHeight}):null,width=region?.width||innerWidth,height=region?.height||innerHeight;
      if(region){Object.assign(overlay.style,{position:"fixed",inset:"auto",left:region.left+"px",top:region.top+"px",width:width+"px",height:height+"px"});overlay.dataset.nullEvent=manual.id;}
      const form=manual?.form||(getState().story?.active&&!getState().story?.legacy?"trace":"assembled");
      const scale = Math.min(384 / width, 384 / height);
      overlay.width = Math.max(1, Math.round(width * scale));
      overlay.height = Math.max(1, Math.round(height * scale));
      document.body.append(overlay);
      const c = overlay.getContext("2d"),
        w = overlay.width,
        h = overlay.height;
      const noise = c.createImageData(w, h),
        tile = document.createElement("canvas"),
        started = performance.now();
      tile.width = w;
      tile.height = h;
      const texture = tile.getContext("2d");
      stopHiss = audio.signalHiss();
      function draw(now) {
        if (token !== generation || !eligible()) {
          sync();
          return;
        }
        if (occupied()) { finish(); if (active) schedule(); return; }
        const p = (now - started) / 1000;
        if (p >= 0.88) {
          finish();
          if (active) schedule();
          return;
        }
        const envelope = Math.sin(Math.PI * Math.min(1, p / 0.88));
        let seed = 2107 + Math.floor(now / 42) * 1709;
        const rand = () => {
          seed = (seed * 1664525 + 1013904223) >>> 0;
          return seed / 4294967296;
        };
        c.clearRect(0, 0, w, h);
        c.imageSmoothingEnabled = false;
        c.fillStyle = `rgba(2,8,12,${0.28 * envelope})`;
        c.fillRect(0, 0, w, h);
        // Tear the current scene rather than a baked screenshot of the website.
        const scene = manual ? null : document.querySelector(".void-canvas");
        if (scene) {
          const r = scene.getBoundingClientRect(),
            x = (r.left * w) / innerWidth,
            y = (r.top * h) / innerHeight,
            rw = (r.width * w) / innerWidth,
            rh = (r.height * h) / innerHeight;
          for (let i = 0; i < 7; i++) {
            const sy = Math.floor(rand() * (scene.height - 12)),
              sh = 2 + Math.floor(rand() * 10);
            c.drawImage(
              scene,
              0,
              sy,
              scene.width,
              sh,
              x + (rand() - 0.5) * 18,
              y + (sy / scene.height) * rh,
              rw,
              (sh / scene.height) * rh,
            );
          }
        }
        if (hasFace && p >= 0.22 && p < 0.51) {
          c.save();if(form==="trace"){c.beginPath();c.rect(w*.4,h*.3,w*.17,h*.24);c.clip();}if(form==="half"){c.beginPath();c.rect(w*.48,0,w*.52,h);c.clip();}
          const fit = (form==="close"?1.35:1)*Math.min(
              (w * 1.6) / image.naturalWidth,
              (h * 0.94) / image.naturalHeight,
            ),
            fw = image.naturalWidth * fit,
            fh = image.naturalHeight * fit,
            fx = (w - fw) / 2,
            fy = (h - fh) / 2;
          c.globalAlpha =
            0.89 * Math.min(1, (p - 0.22) / 0.025, (0.51 - p) / 0.035);
          c.drawImage(image, fx, fy, fw, fh);
          c.globalAlpha = 1;
          for (let i = 0; i < 9; i++) {
            const sy = rand() * (image.naturalHeight - 40),
              sh = 12 + rand() * 35;
            c.drawImage(
              image,
              0,
              sy,
              image.naturalWidth,
              sh,
              fx + (rand() - 0.5) * w * 0.075,
              fy + sy * fit,
              fw,
              sh * fit,
            );
          }
          c.restore();
        }
        for (let i = 0; i < noise.data.length; i += 4) {
          const value = rand() * 135;
          noise.data[i] = value * 0.72;
          noise.data[i + 1] = value * 0.93;
          noise.data[i + 2] = value;
          noise.data[i + 3] = rand() * 140 * envelope;
        }
        // putImageData replaces pixels, so composite the noise through a small tile.
        texture.putImageData(noise, 0, 0);
        c.drawImage(tile, 0, 0);
        for (let i = 0; i < 26; i++) {
          const y = Math.floor(rand() * h);
          c.fillStyle = i % 4 === 0 ? "#76252e77" : "#365d6c77";
          c.fillRect((rand() - 0.2) * w, y, w, 1 + Math.floor(rand() * 2));
        }
        const roll = (p / 0.88) * (h + 100) - 50,
          wave = c.createLinearGradient(0, roll - 28, 0, roll + 28);
        for (const [at, color] of [
          [0, "#17405200"],
          [0.43, "#5a9cab15"],
          [0.49, "#bdcadb40"],
          [0.53, "#7c1c3538"],
          [1, "#0b253300"],
        ])
          wave.addColorStop(at, color);
        c.fillStyle = wave;
        c.fillRect(0, roll - 28, w, 56);
        c.fillStyle = "#000";
        c.globalAlpha = p > 0.73 ? ((p - 0.73) / 0.15) * 0.42 : 0.1;
        c.fillRect(0, 0, w, h);
        c.globalAlpha = 1;
        raf = requestAnimationFrame(draw);
      }
      raf = requestAnimationFrame(draw);
    }
    function sync() {
      const p = getState().preferences,
        key = [p.skipScares, p.reduceMotion, p.sound].join(":");
      if (prefs !== key) {
        clear();
        bag = [];
        prefs = key;
      }
      if (!eligible()) {
        clear();
        return;
      }
      if (!p.skipScares) void preload();
      if (!active) {
        active = true;
        schedule(true);
      }
    }
    const observer = new MutationObserver(() => sync());
    observer.observe(document.documentElement, {
      subtree: true,
      attributes: true,
      attributeFilter: ["open"],
    });
    const media = matchMedia("(prefers-reduced-motion:reduce)");
    media.addEventListener("change", sync);
    const resize = () => {
      clear();
      sync();
    };
    document.addEventListener("visibilitychange", sync);
    window.addEventListener("pagehide", clear);
    window.addEventListener("pageshow", sync);
    window.addEventListener("resize", resize);
    return {
      occupied,
      async burst({id,form="assembled",target}){
        clear();const token=generation;
        if(!target?.isConnected||getState().preferences.skipScares||reduced()||document.hidden||document.querySelector("dialog[open]"))return false;
        manual={id,form,target,hash:location.hash};active=true;
        if(!(await preload())||token!==generation||!target.isConnected){if(token===generation)clear();return false;}
        await play();return true;
      },
      sync,
      clear,
      destroy() {
        clear();
        observer.disconnect();
        media.removeEventListener("change", sync);
        document.removeEventListener("visibilitychange", sync);
        window.removeEventListener("pagehide", clear);
        window.removeEventListener("pageshow", sync);
        window.removeEventListener("resize", resize);
      },
    };
  },
};
