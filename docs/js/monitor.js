// Monitor screen: connect, connection status, live heart rate, current zone
// and active profile, disconnect, and the Select profile button that starts
// the guided flow once connected.

import { heartRate, STATE } from './bluetooth.js';
import { goTo } from './router.js';
import { session, currentProfile } from './session.js';
import { zoneFor, zoneLabel } from './profiles.js';

export function setUpMonitor() {
  const el = (id) => document.getElementById(id);
  const connectButton = el('connect-button');
  const disconnectButton = el('disconnect-button');
  const selectProfileButton = el('select-profile-button');
  const disconnectedView = el('monitor-disconnected');
  const connectedView = el('monitor-connected');
  const statusEl = el('monitor-status');
  const deviceEl = el('monitor-device');
  const bpmEl = el('monitor-bpm');
  const detailEl = el('monitor-detail');
  const errorEl = el('monitor-error');
  const zoneEl = el('monitor-zone');
  const profileEl = el('monitor-profile');

  let battery = null;
  let lastBpm = null;

  // Zone line only once a profile is selected and a reading has arrived.
  function showZoneAndProfile() {
    const profile = currentProfile();
    profileEl.textContent = profile ? 'Profile: ' + profile.name : 'No profile selected';
    zoneEl.hidden = !profile || lastBpm === null;
    if (!zoneEl.hidden) zoneEl.textContent = zoneLabel(zoneFor(profile, lastBpm));
  }
  session.addEventListener('profilechange', showZoneAndProfile);

  if (!heartRate.supported) {
    connectButton.disabled = true;
    errorEl.textContent = window.isSecureContext
      ? 'Web Bluetooth is not available in this browser. Use Chrome on Android.'
      : 'Web Bluetooth needs HTTPS. Open this page over https:// (or localhost).';
  }

  connectButton.addEventListener('click', async () => {
    errorEl.textContent = '';
    try {
      await heartRate.connect();
    } catch (err) {
      if (err.name === 'NotFoundError') {
        statusEl.textContent = 'No device selected.';
      } else {
        errorEl.textContent = err.name + ': ' + err.message;
      }
    }
  });

  disconnectButton.addEventListener('click', () => heartRate.disconnect());
  selectProfileButton.addEventListener('click', () => goTo('profile'));

  function showDevice() {
    deviceEl.textContent =
      'Connected to ' + heartRate.deviceName + (battery === null ? '' : ' · Battery ' + battery + '%');
  }

  heartRate.addEventListener('statechange', ({ detail: { state, reason } }) => {
    const connected = state === STATE.CONNECTED;
    connectedView.hidden = !(connected || state === STATE.RECONNECTING);
    disconnectedView.hidden = !connectedView.hidden;
    disconnectButton.hidden = !connected;
    selectProfileButton.hidden = !connected;
    connectButton.disabled = !heartRate.supported || state === STATE.CONNECTING;

    switch (state) {
      case STATE.CONNECTING:
        statusEl.textContent = 'Connecting to ' + heartRate.deviceName + '…';
        break;
      case STATE.CONNECTED:
        showDevice();
        break;
      case STATE.RECONNECTING:
        deviceEl.textContent = 'Reconnecting to ' + heartRate.deviceName + '…';
        break;
      case STATE.DISCONNECTED:
        battery = null;
        lastBpm = null;
        showZoneAndProfile();
        bpmEl.textContent = '--';
        detailEl.textContent = '';
        statusEl.textContent =
          reason === 'lost' ? 'Connection lost. Connect again to continue.'
          : reason === 'failed' ? 'Could not connect.'
          : 'Not connected.';
        break;
    }
  });

  heartRate.addEventListener('reading', ({ detail: { bpm, contact, rr } }) => {
    bpmEl.textContent = bpm;
    lastBpm = bpm;
    showZoneAndProfile();
    const parts = [];
    if (contact !== null) parts.push('Skin contact: ' + (contact ? 'yes' : 'no'));
    if (rr.length) parts.push('RR: ' + rr.join(', ') + ' ms');
    detailEl.textContent = parts.join(' · ');
  });

  heartRate.addEventListener('battery', ({ detail: { level } }) => {
    battery = level;
    if (heartRate.state === STATE.CONNECTED) showDevice();
  });
}
