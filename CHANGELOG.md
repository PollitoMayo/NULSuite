# Changelog

All notable changes to NUL-Bot will be documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

### Added
- `GET /api/pokedex` — returns Pokédex entries (name, form, type1, type2)
- Deletion guards: `DELETE /moves/:id`, `/abilities/:id`, `/archetypes/:id` return `409` with character names if item is in use
- Sentry error tracking across server (`@sentry/node`) and bot (`@sentry/node`)
- `SERVER_URL` env var for bot → server API calls
- Version logged to console on startup (`[Server] vX.Y.Z running at ...`)
- Google Sheets API errors now logged to console instead of silently returning empty rows
- `Dockerfile` for server and bot (pnpm workspace-aware, Node 22 Alpine)
- `docker-compose.yml` for Portainer/TrueNAS SCALE deployment with GHCR images
- `.dockerignore` at repo root
- GitHub Actions `deploy.yml`: builds and pushes Docker images to GHCR on push to `main`, triggers Portainer webhook for automatic redeploy

### Fixed
- Root `build` script passed `--parallel` as argument to `tsc`, causing `TS5023` errors

### Changed
- Node.js upgraded from 20 to 22 in Dockerfiles and CI
- pnpm pinned to v9 in Dockerfiles and CI
- Docker images use `pnpm install` without `--frozen-lockfile`

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
