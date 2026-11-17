/* A quiet mechanical click, synthesized only after a real interaction. */
export function createDesktopClick({ enabled }) {
  let context;
  function play() {
    if (!enabled() || document.hidden) return;
    const Audio = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!Audio) return;
    try {
      context ||= new Audio();
      if (context.state === 'suspended') void context.resume().catch(() => {});
      const length = Math.round(context.sampleRate * .024);
      const buffer = context.createBuffer(1, length, context.sampleRate);
      const samples = buffer.getChannelData(0);
      for (let i = 0; i < length; i++) samples[i] = (Math.random() * 2 - 1) * Math.exp(-i / (length * .13));
      const source = context.createBufferSource(), gain = context.createGain(), filter = context.createBiquadFilter();
      source.buffer = buffer; filter.type = 'highpass'; filter.frequency.value = 1300;
      gain.gain.setValueAtTime(.055, context.currentTime);
      source.connect(filter); filter.connect(gain); gain.connect(context.destination);
      source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); };
      source.start();
    } catch { /* Audio support must never block an investigation action. */ }
  }
  return { play };
}
