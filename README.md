# HNL Rate

Community-driven rating platform for the Croatian SuperSport HNL football league. Fans rate matches, players, referees, and stadium atmosphere — and see how their takes compare with the rest of the community.

This repository is a monorepo with three apps:

| App | Stack | Purpose |
|-----|-------|---------|
| [`backend/`](backend/) | Java 21, Spring Boot 4, PostgreSQL (Supabase), JWT | REST API + admin sync with api-football.com |
| [`mobile/`](mobile/) | React Native 0.81, Expo 54, Expo Router, TypeScript | Fan-facing mobile app (iOS + Android) |
| [`web/`](web/) | React 19, React Router 7, Tailwind CSS | Admin web client |

## Features

- Browse the season by round, with live, upcoming, and finished match cards
- Per-match detail screen with score hero, lineup pitch view, and full match statistics
- Five-step card-stack rating flow: overall (1–10), atmosphere ★, referee ★, MOTM / worst player, optional comment
- Community averages and a "Community Takes" feed with upvotes/downvotes
- Follow a favourite club and get a dedicated feed for their fixtures
- Personal ratings history
- Admin sync endpoints pull clubs, matches, referees, players, and lineups from api-football.com

## Getting started

Each app has its own README/CLAUDE.md with deeper details. The quick versions:

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

Requires Java 21. Database credentials live in `backend/.env` (not committed) — point it at your own Postgres or a Supabase project. Default port: `8080`.

### Mobile

```bash
cd mobile
npm install
npx expo start
```

Then scan the QR code with Expo Go or run an emulator. The mobile app talks to the backend on your local network, so edit `mobile/constants/config.ts` with your machine's LAN IP if the device can't connect.

### Web

```bash
cd web
npm install
npm start
```

Runs the admin client at `http://localhost:3000`.

## Architecture

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   mobile/    │      │    web/      │      │  api-football│
│ (Expo)       │      │  (React)     │      │   .com       │
└──────┬───────┘      └──────┬───────┘      └──────┬───────┘
       │                     │                     │
       │  REST + JWT         │  REST + JWT         │  scheduled sync
       │                     │                     │  (admin only)
       └──────────┬──────────┴─────────────────────┘
                  │
            ┌─────▼──────┐
            │  backend/  │
            │ (Spring)   │
            └─────┬──────┘
                  │
            ┌─────▼──────┐
            │ PostgreSQL │
            │ (Supabase) │
            └────────────┘
```

The backend is the single source of truth. It owns auth (JWT access + refresh tokens), persists ratings, caches match statistics, and runs scheduled jobs that pull fresh fixtures and lineups from api-football.com.

## Project structure

```
hnl-rate/
├── backend/        Spring Boot REST API
│   └── src/main/java/com/hnlrate/backend/
│       ├── controller/   AuthController, ClubController, MatchController, …
│       ├── model/        9 entities (User, Club, Match, Player, Referee, +ratings)
│       ├── repository/   JPA repos
│       ├── security/     JWT filter, SecurityConfig
│       └── service/      Business logic + SyncService
├── mobile/         React Native (Expo Router) — see mobile/CLAUDE.md for the
│                   features/ layout, design tokens, and screen inventory
└── web/            React 19 admin client
```

## API surface

A subset of the most-used endpoints (full list lives in [`backend/CLAUDE.md`](backend/CLAUDE.md)):

| Method | URL | Description |
|--------|-----|-------------|
| `POST` | `/api/auth/login` | Returns access + refresh JWT |
| `POST` | `/api/auth/refresh` | Rotates the access token |
| `GET` | `/api/matches?round={n}` | Matches for a given round |
| `GET` | `/api/matches/{id}` | Match detail (with referee) |
| `GET` | `/api/matches/{id}/lineup` | Starting XI + bench (204 if unavailable) |
| `GET` | `/api/matches/{id}/statistics` | Shots, cards, possession, passes |
| `GET` | `/api/matches/{id}/ratings` | Community averages + comments |
| `POST` | `/api/matches/{id}/rate` | Rate a match (1–10, optional comment) |
| `POST` | `/api/matches/{id}/rate-players` | Mark MOTM / worst player |
| `GET` | `/api/clubs` | All clubs |
| `POST` | `/api/clubs/{id}/favorite` | Set favourite club |
| `GET` | `/api/user/me` | Current user profile |
| `GET` | `/api/user/ratings` | All of my ratings |

## Localization

The mobile UI ships fully in Croatian (`hr-HR` locale, including date formatting). There is no i18n library — strings are inline. The backend speaks English/JSON regardless of UI language.

## License

Not yet specified — treat as all rights reserved by the authors until a license is added.
