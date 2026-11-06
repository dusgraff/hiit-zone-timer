// Hash-based screen switching. Each screen is a <section data-screen="name">,
// shown when the URL hash is #name. Changing the hash never reloads the page.

export const DEFAULT_SCREEN = 'monitor';

const screens = new Map(
  [...document.querySelectorAll('[data-screen]')].map((el) => [el.dataset.screen, el]),
);
const menuLinks = [...document.querySelectorAll('#menu a')];

export function currentScreen() {
  const name = location.hash.slice(1);
  return screens.has(name) ? name : DEFAULT_SCREEN;
}

export function goTo(name) {
  if (location.hash.slice(1) === name) {
    render();
  } else {
    location.hash = name; // triggers hashchange -> render
  }
}

function render() {
  const name = currentScreen();
  if (location.hash.slice(1) !== name) {
    history.replaceState(null, '', '#' + name); // fix unknown hashes without a history entry
  }
  for (const [screenName, el] of screens) {
    el.hidden = screenName !== name;
  }
  for (const link of menuLinks) {
    link.classList.toggle('active', link.getAttribute('href') === '#' + name);
  }
  window.scrollTo(0, 0);
}

export function startRouter() {
  window.addEventListener('hashchange', render);
  // The app always opens on Monitor, whatever hash it was loaded with.
  history.replaceState(null, '', '#' + DEFAULT_SCREEN);
  render();
}
