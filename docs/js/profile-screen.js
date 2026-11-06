// Select profile screen. On arrival: the three profiles as buttons, with the
// active one highlighted. Tapping one selects it and shows its zones, with a
// Select workout button below. Returning to the screen shows the list again.

import { PROFILES, zoneRanges } from './profiles.js';
import { currentProfile, selectProfile } from './session.js';
import { goTo } from './router.js';

export function setUpProfileScreen() {
  const el = (id) => document.getElementById(id);
  const listView = el('profile-list');
  const detailView = el('profile-detail');
  const nameEl = el('profile-name');
  const zonesBody = el('profile-zones');
  const footer = el('profile-footer');

  const buttons = PROFILES.map((profile) => {
    const button = document.createElement('button');
    button.className = 'choice';
    button.textContent = profile.name;
    button.addEventListener('click', () => {
      selectProfile(profile);
      showDetail(profile);
    });
    listView.appendChild(button);
    return { profile, button };
  });

  el('select-workout-button').addEventListener('click', () => goTo('select-workout'));

  function showList() {
    const active = currentProfile();
    for (const { profile, button } of buttons) {
      button.classList.toggle('selected', profile === active);
    }
    listView.hidden = false;
    detailView.hidden = true;
    footer.hidden = true;
  }

  function showDetail(profile) {
    nameEl.textContent = profile.name;
    zonesBody.replaceChildren(
      ...zoneRanges(profile).map(({ zone, name, range }) => {
        const row = document.createElement('tr');
        for (const text of [zone + ' — ' + name, range]) {
          const cell = document.createElement('td');
          cell.textContent = text;
          row.appendChild(cell);
        }
        return row;
      }),
    );
    listView.hidden = true;
    detailView.hidden = false;
    footer.hidden = false;
  }

  // Every arrival on the screen starts from the list, including redirects here
  // from Select workout (which don't fire hashchange).
  window.addEventListener('screenchange', ({ detail: { name } }) => {
    if (name === 'profile') showList();
  });
  // Choosing Select profile in the menu while already on it doesn't change the
  // hash, so handle that click directly.
  document.querySelector('#menu a[href="#profile"]').addEventListener('click', showList);
  showList();
}
