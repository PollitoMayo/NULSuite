# Changelog — NUL Admin (Desktop)

All notable changes to the desktop app will be documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [0.1.5] - 2026-06-05
### Changed
- Updated STATS to add ACC value

## [0.1.1] - 2026-06-04

### Added
- Version number displayed in sidebar footer above logout button
- Delete button on user cards

### Fixed
- App showed "Electron" as name — fixed with `productName` in `package.json` and `app.setName()`
- Windows release had broken icon — replaced with proper `.ico` file
- electron-builder was wiping electron-vite output by sharing `dist/` — output moved to `release/`

### Changed
- Server URL moved from login form field to `VITE_SERVER_URL` build-time env var
- Release version taken directly from `package.json` — bump manually to cut a new release
- Multi-platform releases: macOS (`.dmg`) and Windows (`.exe` NSIS installer)

## [0.1.0] - 2026-06-04

### Added
- Full admin UI with sidebar navigation: Usuarios, Personajes, Habilidades, Movimientos, Arquetipos
- Character management: create, edit, delete with enriched card view (ability, moveset, archetype stats, Pokémon types)
- Ability management with multi-trigger support (ABILITY_TRIGGERS sub-sheet)
- Move management with effect chips and roll display
- Archetype management with stat grid
- User management with auto-incremented `Id` column
- Character form: required (`*`) and optional field indicators
- Character form: `Public` toggle switch (TRUE/FALSE stored in sheet)
- Pokédex integration: searchable datalist auto-fills Pokémon types from sheet
- Searchable datalist inputs for Pokémon, Abilities, and Moves (display name, store id)
- Move category icons (Physical, Special, Status) from pokesprite CDN
- Super type emoji badges (🦸 Héroe, 🦹 Villano, 🕵️ Ciudadano, 🥷 Vigilante) with outlined style
- `🔒 Privado` badge on character cards when `Public = FALSE`
- App icon with macOS squircle rounded corners
- Auto-update via `electron-updater` + GitHub Releases: banner prompts download then restart
- Sentry error tracking in main process and renderer