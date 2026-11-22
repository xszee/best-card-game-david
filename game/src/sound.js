// Ember Duel — tiny sounds, all synthesized with WebAudio: no audio
// files, no network. A soft click for playing, a low thud for damage,
// a bright arpeggio for victory.
let context = null;

function audio() {
  if (!context) {
    try {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      context = new Ctor();
    } catch {
      context = null;
    }
  }
  if (context && context.state === 'suspended') context.resume().catch(() => {});
  return context;
}

function tone(freq, at, dur, type, gain) {
  const ctx = audio();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  amp.gain.setValueAtTime(gain, ctx.currentTime + at);
  amp.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + at + dur);
  osc.connect(amp);
  amp.connect(ctx.destination);
  osc.start(ctx.currentTime + at);
  osc.stop(ctx.currentTime + at + dur);
}

export function playSound(kind) {
  if (kind === 'play') {
    tone(520, 0, 0.09, 'triangle', 0.08);
    tone(780, 0.05, 0.12, 'triangle', 0.06);
  } else if (kind === 'hit') {
    tone(160, 0, 0.14, 'sine', 0.12);
    tone(90, 0.02, 0.18, 'sine', 0.1);
  } else if (kind === 'win') {
    tone(523, 0, 0.16, 'triangle', 0.09);
    tone(659, 0.12, 0.16, 'triangle', 0.09);
    tone(784, 0.24, 0.3, 'triangle', 0.1);
  } else if (kind === 'lose') {
    tone(392, 0, 0.2, 'sine', 0.08);
    tone(311, 0.16, 0.2, 'sine', 0.08);
    tone(233, 0.32, 0.4, 'sine', 0.08);
  }
}
