/* Soft synthesized room noise. No external media, voice or peaks. */
globalThis.StillwaterCaseAudio = {
  create({ getState, getRoute }) {
    let context = null,
      nodes = [],
      timer = null,
      generation = 0,
      configuration = "",
      breathNodes = [],
      quietUntil = 0,
      closeUntil = 0,
      breatheNow = null;
    function stop() {
      configuration = "";
      generation++;
      clearTimeout(timer);
      timer = null;
      for (const n of nodes) {
        try {
          n.stop?.();
          n.disconnect();
        } catch {}
      }
      nodes = [];
      breathNodes = [];
      breatheNow = null;
      if (context?.state === "running") void context.suspend();
    }
    async function sync() {
      const s = getState(),
        p = s.preferences;
      if (
        document.hidden ||
        !p.sound ||
        !s.night.started ||
        (s.lastEnding === "released" && getRoute() !== "void") ||
        !["cameras", "service-passage", "terminal", "void"].includes(getRoute())
      ) {
        stop();
        return;
      }
      const deep =
        (getRoute() !== "void" || s.night.void.stage !== "corridor") && s.night.door &&
        (!s.night.passageRequired || s.night.passage.cabinetOpen);
      const next = String(p.volume) + ":" + deep + ":" + (getRoute()==="void"?"unlisted":"hotel");
      if (configuration === next) return;
      stop();
      configuration = next;
      const token = generation;
      try {
        context ||= new (window.AudioContext || window.webkitAudioContext)();
        await context.resume();
        if (token !== generation) {
          return;
        }
        const hum = context.createOscillator(),
          gain = context.createGain();
        hum.frequency.value = 54;
        gain.gain.value = Math.min(0.012, p.volume * 0.025);
        hum.connect(gain).connect(context.destination);
        hum.start();
        nodes.push(hum, gain);
        // Sound is the only audio opt-in. Breath enters deeper in the passage.
        if (!deep) return;
        const buffer = context.createBuffer(
            1,
            context.sampleRate * 4,
            context.sampleRate,
          ),
          samples = buffer.getChannelData(0);
        for (let i = 0; i < samples.length; i++)
          samples[i] = (Math.random() * 2 - 1) * 0.55;
        function breath() {
          if (token !== generation) return;
          if (Date.now() < quietUntil) {
            timer = setTimeout(breath, Math.max(200, quietUntil - Date.now()));
            return;
          }
          const source = context.createBufferSource(),
            filter = context.createBiquadFilter(),
            envelope = context.createGain(),
            now = context.currentTime,
            duration = 2 + Math.random();
          source.buffer = buffer;
          filter.type = "lowpass";
          filter.frequency.value = 540;
          envelope.gain.setValueAtTime(0, now);
          envelope.gain.linearRampToValueAtTime(
            Math.min(0.045, p.volume * (Date.now() < closeUntil ? 0.12 : 0.06)),
            now + duration * 0.4,
          );
          envelope.gain.exponentialRampToValueAtTime(0.0001, now + duration);
          source.connect(filter).connect(envelope).connect(context.destination);
          source.start();
          source.stop(now + duration + 0.1);
          nodes.push(source, filter, envelope);
          breathNodes.push(source, filter, envelope);
          source.onended = () => {
            source.disconnect();
            filter.disconnect();
            envelope.disconnect();
            breathNodes = breathNodes.filter(
              (n) => ![source, filter, envelope].includes(n),
            );
            nodes = nodes.filter(
              (n) => ![source, filter, envelope].includes(n),
            );
          };
          timer = setTimeout(breath, (duration + 2 + Math.random() * 4) * 1000);
        }
        breatheNow = () => {
          clearTimeout(timer);
          breath();
        };
        timer = setTimeout(breath, 1800);
      } catch {
        stop();
      }
    }
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
      else void sync();
    });
    window.addEventListener("pagehide", stop);
    function afterScare() {
      quietUntil = Date.now() + 8000;
      closeUntil = 0;
      for (const n of breathNodes) {
        try {
          n.stop?.();
          n.disconnect();
        } catch {}
      }
      nodes = nodes.filter((n) => !breathNodes.includes(n));
      breathNodes = [];
    }
    function approach() {
      quietUntil = 0;
      closeUntil = Date.now() + 2500;
      breatheNow?.();
    }
    return { sync, stop, afterScare, approach };
  },
};
