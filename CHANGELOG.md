# Changelog

All notable changes to NUL-Bot will be documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

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
