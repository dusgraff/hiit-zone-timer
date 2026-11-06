// App entry point: wires up the menu, screens and the heart rate connection.
// See specs/app-architecture.md.

import { heartRate, STATE } from './bluetooth.js';
import { startRouter, goTo } from './router.js';
import { setUpMenu } from './menu.js';
import { setUpMonitor } from './monitor.js';
import { setUpProfileScreen } from './profile-screen.js';
import { VERSION } from './version.js';

document.getElementById('app-version').textContent = ' - ' + VERSION;

setUpMenu();
setUpMonitor();
setUpProfileScreen();

// App-wide connection handling: a banner on every screen while reconnecting,
// and back to Monitor when a connection is lost for good.
const banner = document.getElementById('reconnecting-banner');
heartRate.addEventListener('statechange', ({ detail: { state, reason } }) => {
  banner.hidden = state !== STATE.RECONNECTING;
  if (state === STATE.DISCONNECTED && reason === 'lost') goTo('monitor');
});

startRouter();
