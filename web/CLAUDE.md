# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start        # Dev server on http://localhost:3000
npm run build    # Production build
npm test         # Jest in watch mode
```

No lint command is configured. No TypeScript — plain JavaScript/JSX throughout.

## Architecture

**Stack:** React 19, Create React App, React Router v7, Tailwind CSS 3

**Backend:** Spring Boot API running on `http://localhost:8080` (hardcoded — no `.env` in use yet)

### Routing (`src/App.jsx`)

BrowserRouter with two routes:
- `/` → `LandingPage`
- `/login` → `Login`

No protected routes or auth guards implemented yet. All navigation uses `useNavigate()`.

### State Management

No global state. All state is local component state via `useState`. Auth state is persisted to `localStorage` (`token`, `username`, `role` keys).

### API Communication

Native `fetch` used directly inside components — no HTTP abstraction layer, no axios. API base URL is hardcoded as `http://localhost:8080`.

Auth flow: POST credentials → receive `{ token, username, role }` → store all three in `localStorage` → navigate to home.

### Styling

Tailwind CSS with custom HNL brand colors defined in `tailwind.config.js`:
- `hnl-red: #e63946`, `hnl-red-dark: #c1121f`
- `hnl-dark: #0f1117`, `hnl-bg: #1c1f2e`, `hnl-card: #252838`

Use these custom classes for all new UI to maintain brand consistency.

### Known Gaps

- No protected routes (token is stored but never checked on route access)
- No auth context/provider — components read `localStorage` directly
- No token refresh integration (backend has refresh tokens, frontend doesn't use them)
- No `.env` for API base URL
