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
- [ ] Lista utakmica — ekran koji prikazuje utakmice po kolima

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

## Faza 4: Ocjenjivanje

- [ ] Ocjena utakmice (MatchRating) — forma s ocjenom 1–10
- [ ] Ocjena suca (RefereeRating)
- [ ] Ocjena atmosfere (AtmosphereRating)
- [ ] Ocjena igrača (PlayerRating) — best/worst player
- [ ] POST `/api/matches/{id}/rate`
- [ ] POST `/api/matches/{id}/rate-referee`
- [ ] POST `/api/matches/{id}/rate-atmosphere`
- [ ] POST `/api/matches/{id}/rate-players`

---

## Faza 5: Klubovi i igrači

- [x] Lista svih klubova s pretragom (`GET /api/clubs`)
- [ ] Igrači kluba na club detail ekranu
- [ ] Profil igrača s prosjekom ocjena
- [ ] GET `/api/players/{id}`

---

## Faza 6: Poboljšanja

- [ ] Loading skeleton ekrani
- [ ] Bolje error poruke (lokalizacija na HR)
- [ ] Lista utakmica kao zasebni tab

---

## Faza 7: Admin

- [ ] Admin ekrani (blokiranje korisnika, sinkronizacija podataka)
- [ ] POST `/api/admin/sync/clubs`
- [ ] POST `/api/admin/sync/players`
- [ ] POST `/api/admin/sync/matches`
