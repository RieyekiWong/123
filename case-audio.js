/* Soft synthesized room noise. No external media, voice or peaks. */
globalThis.StillwaterCaseAudio = {
  create({ getState, getRoute }) {
    let context = null,
      nodes = [],
      timer = null,
      generation = 0;
    function stop() {
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
      if (context?.state === "running") void context.suspend();
    }
    async function sync() {
      stop();
      const token = generation,
        s = getState(),
        p = s.preferences;
      if (
        document.hidden ||
        !p.sound ||
        !s.night.started ||
        s.lastEnding === "released"
      )
        return;
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
        const allowed =
          getRoute() === "terminal" &&
          p.breathing &&
          !p.skipScares &&
          !p.reduceMotion &&
          !matchMedia("(prefers-reduced-motion:reduce)").matches;
        if (!allowed) return;
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
            Math.min(0.035, p.volume * 0.08),
            now + duration * 0.4,
          );
          envelope.gain.exponentialRampToValueAtTime(0.0001, now + duration);
          source.connect(filter).connect(envelope).connect(context.destination);
          source.start();
          source.stop(now + duration + 0.1);
          nodes.push(source, filter, envelope);
          source.onended = () => {
            source.disconnect();
            filter.disconnect();
            envelope.disconnect();
            nodes = nodes.filter(
              (n) => ![source, filter, envelope].includes(n),
            );
          };
          timer = setTimeout(breath, (duration + 2 + Math.random() * 4) * 1000);
        }
        timer = setTimeout(breath, 1800);
      } catch {
        stop();
      }
    }
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
    });
    window.addEventListener("pagehide", stop);
    return { sync, stop };
  },
};
