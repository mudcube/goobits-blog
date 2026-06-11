# 🎨 miko-art
Personal website + invite-only social calendar built with **SvelteKit 5** and deployed to **Cloudflare Pages (D1)**.

## ✨ Key Features
- **📅 Social calendar** - Event feed, join/waitlist, +1, and “memories” recap cards
- **🛡️ Admin dashboard** - Manage programs, events, rules, members, and integrations
- **🔄 Google Calendar sync** - Asynchronous sync queue with retries and dead-letter handling
- **🔐 Auth** - OAuth (Google/Apple) for calendar access + credentials-based registration
- **🌗 Themes** - `default`, `dark`, and `magic`

## 🚀 Quick Start
```bash
# Requirements
node --version    # Node.js 22+
pnpm --version    # pnpm 10+

pnpm install

# Dev server (http://localhost:3610)
pnpm dev

# Dev server with the local Cloudflare runtime (D1 bindings)
pnpm dev:wrangler
```

## ⚙️ Configuration
```bash
# View the available env vars
ls -la config/env/.env.example config/env/.env.calendar.example

# Edit miko.art local dev secrets (encrypted at rest via dotenvx)
pnpm exec dotenvx decrypt -f config/env/.env
# edit config/env/.env
pnpm exec dotenvx encrypt -f config/env/.env

# Edit calendar-site local dev secrets
pnpm exec dotenvx decrypt -f config/env/.env.calendar
# edit config/env/.env.calendar
pnpm exec dotenvx encrypt -f config/env/.env.calendar
```

### Path Aliases
Defined in `svelte.config.js`:

| Alias | Path |
|---|---|
| `@components` | `./src/components` |
| `@config` | `./src/config` |
| `@lib` | `./src/lib` |
| `@media` | `./src/media` |
| `@packages` | `./packages` |
| `@routes` | `./src/routes` |
| `@src` | `./src` |
| `@static` | `./static` |

## 🧪 Testing & Code Quality
```bash
# Types + svelte-check + eslint + circular deps
pnpm check

# Repo checks + full e2e suite
pnpm test

# Direct full e2e suite
pnpm test:e2e

# High-signal subset (CI gate)
pnpm e2e:critical
```

## 🔧 Operations
```bash
# Process pending Google Calendar sync jobs
pnpm calendar:sync
```

## 🚢 Deployment
```bash
# Standard deploy (build + Pages deploy)
pnpm deploy:prod

# Full deploy (push secrets + build + deploy)
pnpm deploy:prod:full
```

## 📚 Documentation
- **`AGENTS.md`** - Repo architecture notes and command map
- **`ops/runbooks/calendar-sync.md`** - Calendar sync queue operations

## 🔗 Related Packages
- **`packages/calendar`** - Calendar domain logic (storage, services, transports, migrations)
- **`packages/auth`** - Auth library used by this repo (its own README + tests)

## 📝 License

Proprietary. Copyright (c) 2026 Goobits. All rights reserved. See [`LICENSE`](./LICENSE).
