@../.tldr.rules.md

# App folder rules

- **Bump the version.** Any change to the app's files in this folder that will be pushed increments the two digits after the dot in [js/version.js](js/version.js) (`1.00` → `1.01`). The major number before the dot changes only when the user says so. Bump once per batch of changes, not per file. See [specs/app-architecture.md](../specs/app-architecture.md#screens-and-menu).
