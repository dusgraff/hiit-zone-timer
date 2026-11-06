// Sound and vibration cues (specs/workouts.md#sounds-and-vibration).
// Tones are generated with the Web Audio API; there are no sound files.
// Chrome only allows audio after a tap on the page, so the audio context is
// created (or resumed) inside the first button tap's click handler.

let ctx = null;

function audio() {
  if (!ctx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    ctx = new AudioContextClass();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function vibrate(pattern) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}

// One tone with a short attack and release, so it doesn't click.
// Returns the oscillator so callers can modulate it.
function tone(ac, freq, start, duration, { type = 'square', gain = 0.12, release = 0.03 } = {}) {
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  amp.gain.setValueAtTime(0, start);
  amp.gain.linearRampToValueAtTime(gain, start + 0.005);
  amp.gain.setValueAtTime(gain, Math.max(start + 0.005, start + duration - release));
  amp.gain.linearRampToValueAtTime(0, start + duration);
  osc.connect(amp).connect(ac.destination);
  osc.start(start);
  osc.stop(start + duration + 0.01);
  return osc;
}

// A short, subtle click on every button tap (and menu item) anywhere in the app.
export function setUpClickSound() {
  document.addEventListener(
    'click',
    (event) => {
      if (event.target.closest('button, .menu a')) playClick();
    },
    true,
  );
}

export function playClick() {
  const ac = audio();
  if (!ac) return;
  tone(ac, 1800, ac.currentTime, 0.015, { type: 'triangle', gain: 0.06, release: 0.01 });
}

// Phase timer ran out: two quick rising beeps, two short pulses.
export function playPhaseChange() {
  vibrate([120, 80, 120]);
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime;
  tone(ac, 660, t, 0.1);
  tone(ac, 990, t + 0.14, 0.12);
}

// Below-target alarm: a short, low "wrong" buzz, one long vibration.
export function playAlarm() {
  vibrate(400);
  const ac = audio();
  if (!ac) return;
  tone(ac, 140, ac.currentTime, 0.45, { type: 'sawtooth', gain: 0.18, release: 0.05 });
}

// Workout complete: an original chiptune-style "level clear" fanfare. Four quick
// notes up a C major chord, a short pause, then a held major chord with a slight
// wobble, fading out. Vibration: three quick pulses, then a longer buzz with the chord.
export function playComplete() {
  vibrate([70, 60, 70, 60, 70, 170, 700]);
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime;
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => tone(ac, freq, t + i * 0.1, 0.09));

  const chordStart = t + 0.5;
  const chordLength = 0.8;
  const lfo = ac.createOscillator(); // the wobble
  lfo.frequency.value = 6;
  lfo.start(chordStart);
  lfo.stop(chordStart + chordLength + 0.05);
  for (const freq of [1046.5, 1318.5, 1568]) {
    const osc = ac.createOscillator();
    const amp = ac.createGain();
    const depth = ac.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    depth.gain.value = freq * 0.006;
    lfo.connect(depth).connect(osc.frequency);
    amp.gain.setValueAtTime(0, chordStart);
    amp.gain.linearRampToValueAtTime(0.07, chordStart + 0.01);
    amp.gain.exponentialRampToValueAtTime(0.001, chordStart + chordLength);
    osc.connect(amp).connect(ac.destination);
    osc.start(chordStart);
    osc.stop(chordStart + chordLength + 0.05);
  }
}
