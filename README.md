<p align="center">
  <img src="client/public/icon.svg" width="120" alt="Arth logo" />
</p>

<h1 align="center">ARTH</h1>

<p align="center">
  <em>Android Remote Termux Host — a NestJS server that turns a phone into a personal cloud.</em>
</p>

<p align="center">
  <a href="https://github.com/eunhhu/arth/actions/workflows/ci.yml">
    <img src="https://github.com/eunhhu/arth/actions/workflows/ci.yml/badge.svg" alt="CI" />
  </a>
  <a href="./LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" />
  </a>
  <img src="https://img.shields.io/badge/NestJS-10-ea2845" alt="NestJS 10" />
  <img src="https://img.shields.io/badge/Fastify-4-black" alt="Fastify 4" />
</p>

---

ARTH runs on an old Android phone under Termux and gives you a private server with a web UI — file storage, a lightweight database, and real-time system metrics — without paying for any cloud.

## What it does

- **Cloud storage** — browse / upload / download files on the phone, with WebSocket-pushed change events.
- **Document DB** — a small SQLite-backed document store (think "one collection per table, one JSON doc per row").
- **System dashboard** — live CPU, memory, battery, and storage (pushed to clients over Socket.IO).
- **Web client** — a React UI served from the same process on port 3000.
- **PIN-gated** — a single shared PIN, passed on startup, gates client access.

## Architecture

```
        Phone (Android + Termux)
┌──────────────────────────────────────────┐
│  arth (NestJS + Fastify, port 3000)      │
│  ┌─────────────┐  ┌──────────────────┐   │
│  │ REST API    │  │ Socket.IO        │   │
│  │ /api/cloud  │  │ /app  /cloud     │   │
│  │ /api/db     │  │ /db   /sys       │   │
│  │ /api/sys    │  │                  │   │
│  └──────┬──────┘  └────────┬─────────┘   │
│         │                  │             │
│  ┌──────▼────┐  ┌──────────▼────────┐    │
│  │ FS under  │  │ better-sqlite3    │    │
│  │ dir/      │  │ databases in dir/ │    │
│  └───────────┘  └───────────────────┘    │
└──────────────────────────────────────────┘
             ▲
             │ WiFi / LAN
       React web client
```

`dir/.config` describes where the cloud/db/home folders live relative to the working directory. The server creates any that are missing on first run.

## Quick start

### On Termux (Android)

```bash
# 1. In Termux (Android)
pkg install nodejs-lts git yarn
git clone https://github.com/eunhhu/arth.git
cd arth

# 2. Install + build
yarn install
yarn build

# 3. Run
yarn start            # server on :3000, default PIN 0000
# or pick a custom PIN / port
node dist/main -p 8080 -n 1234
```

Then, from another device on the same network, open `http://<phone-ip>:3000`, enter the PIN, and you're in.

### On a workstation (dev)

```bash
yarn install
yarn dev              # server (watch) + client (esbuild watch)
```

## CLI flags

| Flag         | Default | Description                         |
| ------------ | ------- | ----------------------------------- |
| `-p, --port` | `3000`  | HTTP port to listen on.             |
| `-n, --pin`  | `0000`  | Shared PIN the client must supply.  |

## HTTP API (high level)

| Namespace  | Path prefix  | Highlights                                                   |
| ---------- | ------------ | ------------------------------------------------------------ |
| App        | `/pin`       | `GET /pin?q=...` → `success` / `fail`.                       |
| Cloud      | `/api/cloud` | `list`, `stat`, `read`, `write`, `createDir`, `upload`, etc. |
| Database   | `/api/db`    | `dbs`, `cols`, `docs`, `doc`, `db`, `col`.                   |
| System     | `/api/sys`   | `os`, `cpu`, `memory`, `battery`, `storage`.                 |

See `src/*/` for full route lists and the Socket.IO gateways (`app.gateway.ts`, `cloud/cloud.gateway.ts`, etc.) for realtime events.

## Dev scripts

| Script               | What it runs                                                    |
| -------------------- | --------------------------------------------------------------- |
| `yarn dev`           | `nest start --watch` + `esbuild --watch` in parallel.           |
| `yarn start`         | `nest start` (no watch).                                        |
| `yarn start:prod`    | `node dist/main` — use after `yarn build`.                      |
| `yarn build`         | Server build (`nest build`) + client bundle (`esbuild`).        |
| `yarn lint`          | ESLint with autofix across `src/`, `apps/`, `libs/`, `test/`.   |
| `yarn test`          | Jest unit tests (all `*.spec.ts` under `src/`).                 |
| `yarn test:e2e`      | Jest end-to-end tests under `test/`.                            |
| `yarn test:cov`      | Jest + coverage report.                                         |
| `yarn format`        | Prettier over `src/` + `test/`.                                 |

## Repository layout

```
arth/
├── src/                NestJS server
│   ├── app.*.ts         root controller / service / gateway
│   ├── cloud/           files, uploads, downloads
│   ├── database/        better-sqlite3 document store
│   ├── system/          CPU / memory / battery / storage
│   ├── guards/          host + origin filters
│   └── lib/util.ts      config loader + ANSI colors
├── client/              React UI (esbuild-bundled into client/public/index.js)
├── test/                e2e tests (supertest + Fastify)
├── dir/.config          runtime config (paths under dir/)
└── .github/workflows/   CI
```

## Security notes

- `host.guard.ts` / `origin-filter.guard.ts` are included as building blocks — register them on the routes you want to lock down before exposing the server to the public internet. Out of the box, the server allows `cors: *`, because it's designed for a LAN.
- The PIN is a minimal auth layer. For anything sensitive, put arth behind a reverse proxy with TLS + real auth.

## Contributing

PRs welcome. Please run `yarn lint && yarn test` before submitting. The codebase is small enough to read end-to-end in one sitting, so feel free to file issues with ideas.

## License

ARTH is [MIT-licensed](./LICENSE).
