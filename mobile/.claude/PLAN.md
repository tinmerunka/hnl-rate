# HNL Rate Mobile — Plan razvoja

## Faza 1: Temelj (Auth + Profil) ✅

- [x] Welcome / Splash ekran
- [x] Login ekran (JWT pohrana via SecureStore)
- [x] Registracija ekran
- [x] AuthContext (token, userProfile, login, logout, refreshProfile)
- [x] API servis (`services/api.ts`) s tipiziranim funkcijama
- [x] Clubs tab — lista klubova s pretragom po imenu, srce za toggle omiljenog
- [x] Profile tab — avatar, user info, omiljeni klub, logout
- [x] GET `/api/user/me` — dohvat profila
- [x] GET `/api/clubs` — lista svih klubova
- [x] GET `/api/clubs/{id}` — detalji kluba
- [x] POST `/api/clubs/{id}/favorite` — postavi omiljeni klub
- [x] DELETE `/api/clubs/favorite` — ukloni omiljeni klub
- [x] Club detail ekran (`/club/[id]`) s crest slikom i toggle gumbom

---

## Faza 2: Utakmice

- [ ] Lista utakmica — ekran koji prikazuje utakmice po kolima
- [ ] Detalji utakmice — rezultat, igrači, sudac
- [ ] GET `/api/matches` (kad backend implementira)
- [ ] GET `/api/matches/{id}` (kad backend implementira)

---

## Faza 3: Ocjenjivanje

- [ ] Ocjena utakmice (MatchRating) — forma s ocjenom 1–10
- [ ] Ocjena suca (RefereeRating)
- [ ] Ocjena atmosfere (AtmosphereRating)
- [ ] Ocjena igrača (PlayerRating) — best/worst player
- [ ] POST `/api/matches/{id}/rate`
- [ ] POST `/api/matches/{id}/rate-referee`
- [ ] POST `/api/matches/{id}/rate-atmosphere`
- [ ] POST `/api/matches/{id}/rate-players`

---

## Faza 4: Klubovi i igrači

- [x] Lista svih klubova s pretragom (`GET /api/clubs`)
- [ ] Igrači kluba na club detail ekranu
- [ ] Profil igrača s prosjekom ocjena
- [ ] GET `/api/players/{id}`

---

## Faza 5: Poboljšanja

- [ ] Refresh token logika (auto-renew, backend već podržava token rotation)
- [ ] Auto logout na 401 odgovoru (interceptor u `api.ts`)
- [ ] Loading skeleton ekrani
- [ ] Slike klubova (crest) via expo-image
- [ ] Bolje error poruke (lokalizacija na HR)
- [ ] Pull-to-refresh na listama

---

## Faza 6: Admin

- [ ] Admin ekrani (blokiranje korisnika, sinkronizacija podataka)
- [ ] POST `/api/admin/sync/clubs`
- [ ] POST `/api/admin/sync/players`
- [ ] POST `/api/admin/sync/matches`
