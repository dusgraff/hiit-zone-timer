// Select workout and Running workout screens (specs/workouts.md).
// Select workout opens only when connected with a profile; the running workout
// screen only while a workout is running or just finished. Leaving the running
// workout for any other screen ends it. The wake lock is held while it runs.

import { heartRate, STATE } from './bluetooth.js';
import { goTo, setGuard } from './router.js';
import { currentProfile } from './session.js';
import { WORKOUTS, PHASE } from './workouts.js';
import { WorkoutRun, STATUS } from './workout-engine.js';
import { zoneFor, zoneLabel } from './profiles.js';
import { playPhaseChange, playAlarm, playComplete } from './sounds.js';

const TICK_MS = 100;
const READING_STALE_MS = 3000; // no reading for this long counts as no heart rate

let run = null; // the WorkoutRun, while running or showing its end screen
let timer = null;
let wakeLock = null;
let lastReading = null; // { bpm, contact, t }
const recentReadings = []; // { bpm, t } for the last ~10 s, to seed a new run's climbing history
const RECENT_MS = 10000;

function formatTime(ms) {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  return Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0');
}

// Current bpm, or null when there's no usable reading.
function currentBpm(now) {
  if (heartRate.state !== STATE.CONNECTED || !lastReading) return null;
  if (now - lastReading.t > READING_STALE_MS || lastReading.contact === false) return null;
  return lastReading.bpm;
}

async function requestWakeLock() {
  if (!run || run.done || !('wakeLock' in navigator)) return;
  try {
    wakeLock = await navigator.wakeLock.request('screen');
  } catch (_) {
    // Best effort: the workout runs without it.
  }
}

function releaseWakeLock() {
  if (wakeLock) wakeLock.release().catch(() => {});
  wakeLock = null;
}

export function setUpWorkoutScreens() {
  const el = (id) => document.getElementById(id);
  const list = el('workout-list');
  const segments = el('progress-segments');
  const dot = el('progress-dot');
  const runningView = el('workout-running');
  const completeView = el('workout-complete');
  const nameEl = el('workout-name');
  const phaseEl = el('workout-phase');
  const timerEl = el('workout-timer');
  const bpmEl = el('workout-bpm');
  const zoneEl = el('workout-zone');
  const targetEl = el('workout-target');
  const stateEl = el('workout-state');
  const totalEl = el('workout-total');
  const doneButton = el('workout-done-button');

  // Select workout: needs a connection, then a profile.
  setGuard('select-workout', () => {
    if (heartRate.state !== STATE.CONNECTED) return 'monitor';
    if (!currentProfile()) return 'profile';
    return null;
  });
  // Running workout: only with a workout running (or just finished).
  setGuard('workout', () => (run ? null : 'select-workout'));

  for (const workout of WORKOUTS) {
    const button = document.createElement('button');
    button.className = 'choice';
    button.textContent = workout.name;
    button.addEventListener('click', () => start(workout));
    list.appendChild(button);
  }
  doneButton.addEventListener('click', () => goTo('select-workout'));

  heartRate.addEventListener('reading', ({ detail: { bpm, contact } }) => {
    const t = performance.now();
    lastReading = { bpm, contact, t };
    if (contact === false) return;
    recentReadings.push({ bpm, t });
    while (recentReadings[0].t < t - RECENT_MS) recentReadings.shift();
    if (run) run.addReading(bpm, t);
  });

  // Leaving the running workout screen ends the workout.
  window.addEventListener('screenchange', ({ detail: { name } }) => {
    if (name !== 'workout' && run) stop();
  });

  document.addEventListener('visibilitychange', () => {
    // Android drops the wake lock when the page is hidden; take it again on return.
    if (document.visibilityState === 'visible' && run && !run.done) requestWakeLock();
  });

  function start(workout) {
    const profile = currentProfile();
    if (heartRate.state !== STATE.CONNECTED || !profile) {
      goTo('select-workout'); // its guard sends the user where they need to go
      return;
    }
    stop();
    const now = performance.now();
    run = new WorkoutRun(workout, profile, now);
    // Seed the climbing history with readings from just before the start.
    for (const r of recentReadings) run.addReading(r.bpm, r.t);
    buildProgressBar();
    nameEl.textContent = workout.name;
    runningView.hidden = false;
    completeView.hidden = true;
    doneButton.hidden = true;
    requestWakeLock();
    timer = setInterval(tick, TICK_MS);
    render(now);
    goTo('workout');
  }

  function stop() {
    clearInterval(timer);
    timer = null;
    run = null;
    releaseWakeLock();
  }

  function tick() {
    const now = performance.now();
    for (const event of run.tick(now, currentBpm(now))) {
      if (event === 'phase') playPhaseChange();
      else if (event === 'alarm') playAlarm();
      else if (event === 'complete') finish(now);
    }
    if (run) render(now);
  }

  function finish(now) {
    clearInterval(timer);
    timer = null;
    releaseWakeLock();
    playComplete();
    totalEl.textContent = formatTime(run.elapsedMs(now));
    runningView.hidden = true;
    completeView.hidden = false;
    doneButton.hidden = false;
  }

  function buildProgressBar() {
    segments.replaceChildren(
      ...run.phases.map((phase) => {
        const segment = document.createElement('div');
        segment.className = 'segment ' + phase.kind;
        segment.style.flexGrow = phase.duration;
        return segment;
      }),
    );
  }

  function render(now) {
    dot.style.left = run.progress * 100 + '%';
    if (run.done) return;

    const phase = run.phase;
    const bpm = run.lastBpm;
    const profile = currentProfile();
    phaseEl.textContent = phase.label;
    phaseEl.className = 'phase ' + phase.kind;
    timerEl.textContent = formatTime(run.remainingMs);
    bpmEl.textContent = bpm === null ? '--' : bpm;
    zoneEl.textContent = bpm === null || !profile ? '' : zoneLabel(zoneFor(profile, bpm));
    targetEl.textContent =
      (phase.kind === PHASE.COOLDOWN ? 'Target (shown only): Zone ' : 'Target: Zone ') +
      phase.zone + ' · ' + phase.targetBpm + '+ bpm';

    const status = run.status;
    stateEl.textContent =
      status === STATUS.WAITING ? 'Waiting for Zone ' + phase.zone
      : status === STATUS.PAUSED ? 'Paused — below target'
      : status === STATUS.NO_HR ? 'Paused — no heart rate'
      : status === STATUS.BELOW ? 'Below target heart rate'
      : '';
    stateEl.className = 'workout-state' + (status === STATUS.COUNTING ? '' : ' ' + status);
    timerEl.classList.toggle('stopped', status !== STATUS.COUNTING && status !== STATUS.BELOW);
  }
}
