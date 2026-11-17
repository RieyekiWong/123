/* Stable old-computer sounds. Keep the original click; typing has a softer,
   lower keycap sound. Both are created only during real user interactions. */
export function createDesktopClick({ enabled }) {
  let context;
  function audioContext() {
    if (!enabled() || document.hidden) return null;
    const Audio = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!Audio) return null;
    context ||= new Audio();
    if (context.state === 'suspended') void context.resume().catch(() => {});
    return context;
  }
  function play() {
    try {
      const context = audioContext();
      if (!context) return;
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
  function type() {
    try {
      const context = audioContext();
      if (!context) return;
      const length = Math.round(context.sampleRate * .032);
      const buffer = context.createBuffer(1, length, context.sampleRate);
      const samples = buffer.getChannelData(0);
      for (let i = 0; i < length; i++) {
        const time = i / context.sampleRate;
        const body = Math.sin(2 * Math.PI * 360 * time) * .7;
        samples[i] = (body + (Math.random() * 2 - 1) * .3) * Math.exp(-i / (length * .18));
      }
      const source = context.createBufferSource(), gain = context.createGain(), filter = context.createBiquadFilter();
      source.buffer = buffer; filter.type = 'lowpass'; filter.frequency.value = 1800;
      gain.gain.setValueAtTime(.045, context.currentTime);
      source.connect(filter); filter.connect(gain); gain.connect(context.destination);
      source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); };
      source.start();
    } catch { /* A missing or blocked audio device never interrupts typing. */ }
  }
  function keydown(event) {
    if (!event.isTrusted || event.ctrlKey || event.metaKey || event.altKey) return;
    const field = event.target.closest?.('textarea, input:not([type]), input[type=text], input[type=search]');
    if (!field || field.disabled || field.readOnly) return;
    const character = event.key?.length === 1 || ['Backspace', 'Delete'].includes(event.key);
    const composingKey = (event.isComposing || event.keyCode === 229 || event.key === 'Dead') &&
      /^(Key[A-Z]|Digit[0-9]|Numpad[0-9]|Space|Minus|Equal|BracketLeft|BracketRight|Backslash|Semicolon|Quote|Backquote|Comma|Period|Slash)$/.test(event.code);
    if (character || composingKey || event.key === 'Enter' && field.tagName === 'TEXTAREA' && !event.isComposing) type();
  }
  return { play, type, keydown };
}
