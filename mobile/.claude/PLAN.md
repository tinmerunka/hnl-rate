# HNL Rate Mobile — Plan razvoja

## Faza 1: Temelj (Auth + Profil) ✅

- [x] Welcome / Splash ekran
- [x] Login ekran (JWT pohrana via SecureStore)
- [x] Registracija ekran
- [x] AuthContext — token, userProfile, loading, login, logout, refreshProfile, updateProfile
- [x] API servis (`services/api.ts`) s tipiziranim funkcijama
- [x] tokenStore — in-memory, forceLogout handler, notifyTokenRefreshed handler
- [x] Clubs tab — lista klubova s pretragom po imenu, srce za toggle omiljenog
- [x] Profile tab — avatar, user info, omiljeni klub, logout
- [x] GET `/api/user/me` — dohvat profila
- [x] GET `/api/clubs` — lista svih klubova
- [x] GET `/api/clubs/{id}` — detalji kluba
- [x] POST `/api/clubs/{id}/favorite` — postavi omiljeni klub
- [x] DELETE `/api/clubs/favorite` — ukloni omiljeni klub
- [x] Club detail ekran (`/club/[id]`) s crest slikom i toggle gumbom

---

## Faza 2: Utakmice ✅

- [x] Detalji utakmice — rezultat, igrači, sudac (`/match/[id]`)
- [x] GET `/api/matches/{id}` — detalji utakmice
- [x] GET `/api/matches/{id}/lineup` — postava utakmice (null ako 204)
- [x] GET `/api/clubs/{id}/matches` — utakmice kluba
- [x] Lista utakmica — Matches tab, grupiranje po kolima (Live/Upcoming/Results), round navigator
- [x] GET `/api/matches?round={n}` — utakmice po kolu (`getMatchesByRound`)

---

## Faza 3: Auth sigurnost ✅

- [x] Refresh token logika (token rotation — `doRefresh()` u `api.ts`)
- [x] Auto logout na 401 odgovoru (interceptor u `authFetch` + `getMatchLineup`)
- [x] Revokacija refresh tokena na backendu pri odjavi (`revokeRefreshToken`)
- [x] `notifyTokenRefreshed` — sinkronizira React state (`token`) nakon auto-refresha
- [x] `loading` state u AuthContext — sprječava prijevremeni redirect u `RootNavigator`
- [x] `RootNavigator` u `_layout.tsx` — auth-based routing:
  - `!token && inProtectedArea` → redirect na `/`
  - `token && onAuthScreen` → redirect na `/(tabs)`
- [x] Logout navigira odmah (ne čeka mrežni poziv) → nema bijelog ekrana

---

## Faza 4: Ocjenjivanje ✅

- [x] Ocjena utakmice (MatchRating) — 10 chip-ova u card-stack modalu (korak 1)
- [x] Ocjena atmosfere (AtmosphereRating) — zvjezdice u koraku 2
- [x] Ocjena suca (RefereeRating) — zvjezdice u koraku 2
- [x] Ocjena igrača (PlayerRating) — MOTM picker na pitch formaciji (korak 3)
- [x] Pregled ocjena (Summary) — 4 tile-a za pregled prije slanja (korak 4)
- [x] GET `/api/matches/{id}/ratings` — dohvat prosjeka ocjena (`getMatchRatings`)
- [x] GET `/api/user/ratings` — lista korisnikovih ocjena (`getUserRatings`)
- [x] POST `/api/matches/{id}/rate`
- [x] POST `/api/matches/{id}/rate-referee`
- [x] POST `/api/matches/{id}/rate-atmosphere`
- [x] POST `/api/matches/{id}/rate-players`

---

## Faza 5: Klubovi i igrači

- [x] Lista svih klubova s pretragom (`GET /api/clubs`)
- [ ] Igrači kluba na club detail ekranu
- [ ] Profil igrača s prosjekom ocjena
- [ ] GET `/api/players/{id}`

---

## Faza 6: Poboljšanja

- [x] UI redesign — novi design system (T tokeni), 4-tab navigacija, card-stack rating modal, matches feed
- [ ] Loading skeleton ekrani
- [ ] Bolje error poruke (lokalizacija na HR)

---

## Faza 7: Admin

- [ ] Admin ekrani (blokiranje korisnika, sinkronizacija podataka)
- [ ] POST `/api/admin/sync/clubs`
- [ ] POST `/api/admin/sync/players`
- [ ] POST `/api/admin/sync/matches`
