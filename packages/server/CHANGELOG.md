# Changelog — NUL Server

All notable changes to the server will be documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

## [0.1.0] - 2026-06-04

### Added
- Fastify server with JWT authentication (`/api/auth/login`)
- Google Sheets integration as data layer via service account
- `GET /api/sheets/:sheetName` — fetch all rows from any sheet
- `POST /api/sheets/rows` — append a row
- `PUT /api/sheets/rows` — update a row by index
- `DELETE /api/sheets/:sheetName/rows` — delete a row by index
- `GET /api/pokedex` — returns Pokédex entries (name, form, type1, type2)
- Deletion guards: `DELETE /moves/:id`, `/abilities/:id`, `/archetypes/:id` return `409` with character names if item is in use
- `GET /health` — health check endpoint
- Sentry error tracking (`@sentry/node`)
- `SERVER_URL` env var support for Docker networking
- Version logged to console on startup
- Google Sheets API errors logged to console instead of swallowed silently
- Dockerfile (pnpm workspace-aware, Node 22 Alpine)
