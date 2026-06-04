# Changelog

All notable changes to NUL-Bot will be documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

## [0.2.0] - 2026-06-04

### Added
#### Desktop (Electron admin app)
- Full admin UI with sidebar navigation: Usuarios, Personajes, Habilidades, Movimientos, Arquetipos
- Character management: create, edit, delete with enriched card view (ability, moveset, archetype stats, Pokémon types)
- Ability management with multi-trigger support (ABILITY_TRIGGERS sub-sheet)
- Move management with effect chips and roll display
- Archetype management with stat grid
- User management with auto-incremented `Id` column
- Character form: required (`*`) and optional field indicators
- Character form: `Public` toggle switch (TRUE/FALSE stored in sheet)
- Character form: server URL field on login screen — no longer baked in at build time
- Pokédex integration: searchable datalist auto-fills Pokémon types from sheet
- Searchable datalist inputs for Pokémon, Abilities, and Moves (display name, store id)
- Move category icons (Physical, Special, Status) from pokesprite CDN
- Super type emoji badges (🦸 Héroe, 🦹 Villano, 🕵️ Ciudadano, 🥷 Vigilante) with outlined style
- `🔒 Privado` badge on character cards when `Public = FALSE`
- App icon with macOS squircle rounded corners; set via `app.dock.setIcon()` at runtime
- Auto-update via `electron-updater` + GitHub Releases: banner prompts download then restart
- Sentry error tracking in main process (`@sentry/electron/main`) and renderer (`@sentry/electron/renderer`)

#### Server (Fastify)
- `GET /api/pokedex` — returns Pokédex entries (name, form, type1, type2)
- Deletion guards: `DELETE /moves/:id`, `/abilities/:id`, `/archetypes/:id` return `409` with character names if item is in use
- Sentry error tracking (`@sentry/node`)

#### Bot (Discord.js)
- `SERVER_URL` env var for future bot → server API calls
- Sentry error tracking (`@sentry/node`)

#### Shared
- `CURE` effect category with `CureEffect` enum (ALL_STATUS, CURE_POISON, CURE_FREEZE, CURE_BURN, CURE_SLEEP, ALL_CONDITIONS, CURE_INFATUATED, CURE_CONFUSED, CURE_CURSED, CURE_ALL)
- `MECHANIC` effect category with `COPY_LAST_MOVE` value
- `AbilityTriggerData` interface; `formatTrigger()` accepts a single trigger
- `MOVE_CATEGORY_ICON` map pointing to pokesprite CDN

#### Infrastructure
- `Dockerfile` for server and bot (pnpm workspace-aware, Node 20 Alpine)
- `docker-compose.yml` for Portainer/TrueNAS SCALE deployment with GHCR images
- `.dockerignore` at repo root
- GitHub Actions `deploy.yml`: builds and pushes Docker images to GHCR, triggers Portainer webhook, builds and publishes Electron release to GitHub Releases on every push to `main`
- Patch version auto-incremented in CI using `github.run_number`

### Fixed
- Root `build` script passed `--parallel` as an argument to `tsc`, causing `TS5023` errors — moved flag to pnpm level
- Abilities `handleDelete` silently swallowed errors — now shows `alert` on failure

### Changed
- Sidebar: removed top header bar and duplicate logout button; "NUL Admin" brand moved to sidebar
- USERS sheet: added `Id` column (position 1); desktop auto-increments on creation
- CHARACTERS sheet: added `Id` (position 1) and `Public` (position 2) columns
- Ability triggers migrated from flat columns on ABILITIES sheet to dedicated ABILITY_TRIGGERS sub-sheet, enabling multiple triggers per ability

## [0.1.0] - 2026-06-03

### Added
- Initial project setup with TypeScript and discord.js v14
- Auto-loading command and event handlers
- `/ping` slash command with latency info
- `ready` event logging bot tag and active servers
- `interactionCreate` event with auto-defer (2s) and hard timeout (10s)
- DEV/PROD environment split via `--env-file` flag
- Guild-scoped command registration in dev (instant), global in prod
- Multi-stage Dockerfile and `docker-compose.yml` for TrueNAS SCALE deployment
