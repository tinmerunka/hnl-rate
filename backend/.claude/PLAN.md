# HNL Rate Backend — Plan razvoja

## Kontekst

Backend ima solidne temelje (modeli, auth, JWT, CRUD admin endpointi, lineup sync). Sljedeći korak je implementacija rating endpointa koje mobilna aplikacija treba za ocjenjivanje.

---

## Problemi u trenutnom kodu (treba popraviti prije novih featurea)

### 1. Nema globalnog error handlera
**Problem:** Servisni sloj baca `RuntimeException` → Spring vraća HTTP 500 umjesto 400/404.
**Fix:** Dodati `@RestControllerAdvice` klasu koja lovi iznimke i vraća smislene HTTP odgovore.

### 2. Direktno vraćanje entiteta iz controllera
**Problem:** Neki controlleri vraćaju JPA entitete direktno → izlaže interne kolone, JPA lazy-load problemi.
**Fix:** Uvesti response DTO-e za sve endpointe koji vraćaju podatke.

### 3. `@Data` na JPA entitetima s relacijama
**Problem:** Lombok `@Data` generira `equals/hashCode/toString` koji prolaze kroz relacije → može uzrokovati `StackOverflowError` ili N+1 upite.
**Fix:** Zamijeniti `@Data` s `@Getter @Setter` na svim entitetima koji imaju `@ManyToOne`.

---

## Vanjski API — api-football.com

- **Auth:** header `x-apisports-key: {API_KEY}`
- **Base URL:** `https://v3.football.api-sports.io/`
- **Plan:** plaćeni (free ne pokriva tekuću sezonu)

**Redoslijed poziva za inicijalni seed:**
1. `/leagues?country=Croatia` → dohvati ID za Prvu HNL (jednom)
2. `/teams?league={id}&season=2025` → klubovi
3. `/players?league={id}&season=2025` → igrači
4. `/fixtures?league={id}&season=2025` → utakmice
5. `/fixtures/lineups?fixture={id}` → postave (po završenoj utakmici)

---

## Faze implementacije

### Faza 0 — Popravci temelja ✅

- [x] `@Data` → `@Getter @Setter` na svim JPA entitetima
- [x] Globalni error handler (`exception/GlobalExceptionHandler.java`)
- [x] JWT secret u `application.properties`
- [x] `apiFootballId` polje na Club, Player, Referee
- [x] Novi model `MatchPlayer` (`model/MatchPlayer.java`)

### Faza 1 — Vanjski API + Sinkronizacija ✅ (djelomično)

- [x] `client/ApiFootballClient.java` — HTTP pozivi prema api-football.com
- [x] `dto/external/` — DTO-i za parsiranje API odgovora
- [x] `service/SyncService.java` — logika upsertanja klubova, utakmica, igrača
- [x] `POST /api/admin/sync/clubs`
- [x] `POST /api/admin/sync/matches`
- [x] `POST /api/admin/sync/players`
- [x] `GET /api/matches/{id}/lineup` — lazy sync postave pri prvom dohvatu
- [x] `@EnableScheduling` + dnevni `@Scheduled` job za automatski sync (PR #33)

### Faza 2 — Core read endpointi ✅

- [x] `GET /api/clubs` — lista svih klubova
- [x] `GET /api/clubs/{id}` — detalji kluba
- [x] `POST /api/clubs/{id}/favorite` — postavi omiljeni klub
- [x] `DELETE /api/clubs/favorite` — ukloni omiljeni klub
- [x] `GET /api/user/me` — profil prijavljenog korisnika
- [x] `GET /api/clubs/{id}/matches` — utakmice kluba
- [x] `GET /api/matches` — sve utakmice (?round=N, ?finished=true)
- [x] `GET /api/matches/{id}` — detalji utakmice
- [x] `GET /api/players` — svi igrači (?clubId=N)
- [x] `GET /api/players/{id}` — detalji igrača
- [x] `GET /api/referees` — svi suci
- [x] `GET /api/referees/{id}` — detalji suca

### Faza 2b — Auth sigurnost ✅

- [x] Refresh token kao HttpOnly cookie (web) uz backward compat s body (mobile)
- [x] `POST /api/auth/refresh` — čita cookie, fallback na body
- [x] `POST /api/auth/logout` — uvijek briše cookie (try-finally)
- [x] `Set-Cookie` header eksponiran u CORS konfiguraciji

### Faza 3 — Admin CRUD endpointi ✅

- [x] `POST/PUT/DELETE /api/admin/clubs`
- [x] `POST/PUT/DELETE /api/admin/matches`
- [x] `POST/PUT/DELETE /api/admin/players`
- [x] `POST/PUT/DELETE /api/admin/referees`

### Faza 4 — Rating endpointi ✅

*Ocjenjivanje moguće samo za `match.finished = true`*

- [x] `POST /api/matches/{id}/rate` — ocijeni utakmicu (MatchRating), upsert
- [x] `POST /api/matches/{id}/rate-referee` — ocijeni suca (RefereeRating), upsert
- [x] `POST /api/matches/{id}/rate-atmosphere` — ocijeni atmosferu (AtmosphereRating), upsert
- [x] `POST /api/matches/{id}/rate-players` — ocijeni igrače (lista PlayerRatingRequestDTO), upsert
- [x] `GET  /api/matches/{id}/ratings` — prosjeci svih ocjena + glasovi za best/worst igrača

### Faza 5 — Admin upravljanje korisnicima

- [x] `GET  /api/admin/users` — svi korisnici
- [x] `PUT  /api/admin/users/{id}/block` — blokiraj/odblokiraj korisnika
- [x] `GET  /api/admin/ratings` + moderacija svih tipova ocjena (match, sudac, atmosfera, igrač, komentari)

---

## Potvrđene odluke

| Pitanje | Odluka |
|---------|--------|
| Lineup model | ✅ `MatchPlayer` — ocjena samo za nastupavše igrače |
| API ključ | Plaćeni plan (free ne pokriva tekuću sezonu) |
| Sinkronizacija | ✅ Ručni admin endpoint + `@Scheduled` dnevni job (job još nije implementiran) |
| Rating pravilo | ✅ Samo za završene utakmice (`finished = true`) |
| Refresh token pohrana | ✅ HttpOnly cookie za web, body za mobile (backward compat) |
