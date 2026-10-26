<p align="center">
  <img src="client/public/icon.svg" width="120" alt="Arth logo" />
</p>

# ARTH

Android Remote Termux Host — a NestJS + Fastify server that turns a spare Android phone running Termux into a small personal server (file storage, a SQLite document store and a live system dashboard) with a React web UI, for people who want a private LAN "cloud" without renting one.

[![CI](https://github.com/eunhhu/arth/actions/workflows/ci.yml/badge.svg)](https://github.com/eunhhu/arth/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
![NestJS 10](https://img.shields.io/badge/NestJS-10-ea2845)
![Fastify 4](https://img.shields.io/badge/Fastify-4-black)

**Status:** Maintained — working hobby project; features are complete for LAN use, but auth is a single shared PIN and the included guards are not wired up by default.

## Features

- **Cloud storage** — browse, read/write, move, copy, rename, delete, upload (up to 10 GB per file) and download files under `dir/cloud`, with change events pushed over WebSocket.
- **Document DB** — a small `better-sqlite3`-backed document store: one database file per DB, one table per collection, one JSON document per row, with a `docs/search` endpoint.
- **System dashboard** — OS, CPU, memory, battery and storage information, pushed to clients over Socket.IO.
- **Web client** — a React 19 UI bundled with esbuild and served from the same process.
- **PIN gate** — a single PIN passed at startup (`-n`) that clients must present via `GET /pin?q=...`.

## How it works

`src/main.ts` parses `--port` / `--pin` with yargs, reads `dir/.config` through `src/lib/util.ts` to resolve the `root`, `cloud`, `db` and `home` folders (creating any that are missing), then boots a Nest application on the Fastify adapter with `@fastify/multipart` registered for uploads and CORS open to any origin (it is designed for a LAN).

Each feature is a Nest module with a REST controller, a service and a Socket.IO gateway:

- `src/cloud/` — `/api/cloud/*` file operations and the `cloud` namespace
- `src/database/` — `/api/db/*` and the `db` namespace, backed by SQLite files under `dir/db`
- `src/system/` — `/api/sys/*` and the `sys` namespace
- `src/app.*` — `/pin` check, the `app` namespace and the static client (`client/public`)

`src/guards/host.guard.ts` and `origin-filter.guard.ts` are available as building blocks but are not registered on any route out of the box.

## Tech stack

- Runtime/Language: Node.js 20 (CI), TypeScript 5
- Framework: NestJS 10 on Fastify 4, Socket.IO via `@nestjs/platform-socket.io`
- Client: React 19, styled-components, framer-motion, lucide-react; bundled by esbuild
- Storage: local filesystem under `dir/`, `better-sqlite3`
- Infra/Tooling: Yarn, Jest (+ supertest e2e), ESLint + Prettier, GitHub Actions

## Getting started

### Requirements

- Node.js 20 and Yarn
- On the phone: [Termux](https://termux.dev/) with `pkg install nodejs-lts git yarn`

### Install

```bash
git clone https://github.com/eunhhu/arth.git
cd arth
yarn install
yarn build          # nest build + esbuild client bundle
```

### Run

```bash
yarn start                   # server on :3000, default PIN 0000
node dist/main -p 8080 -n 1234   # custom port / PIN
yarn dev                     # development: nest --watch + esbuild --watch
```

From another device on the same network open `http://<phone-ip>:3000` and enter the PIN. The server prints a warning when it is not running on Android, since some system metrics only work there.

| Flag         | Default | Description                        |
| ------------ | ------- | ---------------------------------- |
| `-p, --port` | `3000`  | HTTP port to listen on             |
| `-n, --pin`  | `0000`  | Shared PIN the client must supply  |

### Test

```bash
yarn lint
yarn test            # unit tests (src/**/*.spec.ts)
yarn test:e2e        # e2e tests under test/
yarn test:cov
```

## HTTP API

| Prefix       | Endpoints                                                                                                              |
| ------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `/pin`       | `GET /pin?q=<pin>` → `success` / `fail`                                                                                |
| `/api/cloud` | `list`, `stat`, `find`, `findContent`, `read`, `readMany`, `write`, `writeMany`, `createDir`, `createFile`, `delete`, `deleteMany`, `move`, `moveMany`, `copy`, `copyMany`, `rename`, `renameMany`, `download`, `upload` |
| `/api/db`    | `dbs`, `cols`, `docs`, `doc`, `docs/search`                                                                           |
| `/api/sys`   | `os`, `cpu`, `memory`, `battery`, `storage`                                                                           |

Socket.IO namespaces: `app`, `cloud`, `db`, `sys` (see the `*.gateway.ts` files).

## Project structure

```text
src/                 NestJS server
  app.*.ts           PIN check, app gateway, static client serving
  cloud/             file storage controller / service / gateway
  database/          SQLite document store
  system/            OS / CPU / memory / battery / storage
  guards/            optional host + origin guards
  lib/util.ts        dir/.config loader and ANSI colour helper
client/              React UI (src/ → esbuild → public/index.js)
test/                e2e tests (supertest + Fastify)
dir/.config          runtime path configuration
.github/workflows/   CI (lint, unit, e2e, build)
```

## Configuration

No environment variables are read apart from `npm_package_version` (used for the startup banner). Runtime paths come from `dir/.config`, a `key=value` file whose values are resolved relative to `dir/`:

| Key                                        | Purpose                                 |
| ------------------------------------------ | --------------------------------------- |
| `root`                                     | base folder (default `/` → `dir/`)      |
| `cloud`                                    | file storage root                       |
| `db`                                       | SQLite database files                   |
| `home`, `document`, `music`, `video`, `picture` | user folders created on first run  |

## Security notes

- CORS is `*` and the PIN is the only auth layer. Keep the server on a trusted LAN, or put it behind a reverse proxy with TLS and real authentication before exposing it.
- Register `HostGuard` / `OriginFilterGuard` on the routes you want to restrict.

## History

The initial version was written by hand in December 2024 as the author's first NestJS project. The 2026 cleanup (tests, CI, documentation, bug fixes) was done through AI-assisted pull requests; bot authorship is preserved in the commit history.

## License

[MIT](./LICENSE)
