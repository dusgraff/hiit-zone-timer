// Hamburger menu in the title bar. Menu items are plain hash links; the router
// handles the screen change. This module only opens and closes the menu.

export function setUpMenu() {
  const button = document.getElementById('menu-button');
  const menu = document.getElementById('menu');

  function setOpen(open) {
    menu.hidden = !open;
    button.setAttribute('aria-expanded', String(open));
  }

  button.addEventListener('click', (event) => {
    event.stopPropagation();
    setOpen(menu.hidden);
  });

  // Close after choosing an item, tapping outside, or any screen change.
  menu.addEventListener('click', () => setOpen(false));
  document.addEventListener('click', (event) => {
    if (!menu.hidden && !menu.contains(event.target)) setOpen(false);
  });
  window.addEventListener('hashchange', () => setOpen(false));
}
