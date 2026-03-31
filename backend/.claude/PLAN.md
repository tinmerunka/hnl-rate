# HNL Rate Backend — Plan razvoja

## Kontekst

Backend ima solidne temelje (modeli, auth, JWT), ali nedostaju svi "core" endpointi i integracija s api-football.com.
Cilj ovog plana je definirati redoslijed i arhitekturalne odluke PRIJE implementacije.

---

## Problemi u trenutnom kodu (treba popraviti prije novih featurea)

### 1. Nema globalnog error handlera
**Problem:** Servisni sloj baca `RuntimeException` → Spring vraća HTTP 500 umjesto 400/404.
**Fix:** Dodati `@RestControllerAdvice` klasu koja lovi iznimke i vraća smislene HTTP odgovore.

### 2. JWT secret je hardcoded
**Problem:** `JwtService.java` ima secret direktno u kodu → sigurnosni rizik, ne smije ići u git.
**Fix:** Premjestiti u `application.properties` → `@Value("${jwt.secret}")`

### 3. Direktno vraćanje entiteta iz controllera
**Problem:** `ClubController` vraća `List<Club>` direktno → izlaže interne kolone, JPA lazy-load problemi.
**Fix:** Uvesti response DTO-e za sve endpointe koji vraćaju podatke.

### 4. `@Data` na JPA entitetima s relacijama
**Problem:** Lombok `@Data` generira `equals/hashCode/toString` koji prolaze kroz relacije → može uzrokovati `StackOverflowError` ili N+1 upite.
**Fix:** Zamijeniti `@Data` s `@Getter @Setter` na svim entitetima koji imaju `@ManyToOne`.

### 5. Nema `apiFootballId` na Club, Player, Referee
**Problem:** Bez vanjskog ID-a ne možemo znati treba li upsert ili insert pri sinkronizaciji.
**Fix:** Dodati `Integer apiFootballId` kolonu na Club, Player, Referee.

---

## Novi model — MatchPlayer (Lineup)

Bez ovog modela korisnik može ocijeniti igrača koji nije nastupao u utakmici.

```
MatchPlayer { id, match, player }
```

api-football.com `/fixtures/lineups` vraća postave → punjenje automatski pri syncu.
Korisnik može ocijeniti **samo igrače iz MatchPlayer tablice** za tu utakmicu.

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

### Faza 0 — Popravci temelja
*Radi se bez API ključa*

- [x] `@Data` → `@Getter @Setter` na svim JPA entitetima
- [x] Globalni error handler (`exception/GlobalExceptionHandler.java`)
- [x] JWT secret u `application.properties`
- [x] `apiFootballId` polje na Club, Player, Referee
- [x] Novi model `MatchPlayer` (`model/MatchPlayer.java`)

### Faza 1 — Vanjski API + Sinkronizacija
*Treba API ključ*

- [x] `client/ApiFootballClient.java` — HTTP pozivi prema api-football.com
- [x] `dto/external/` — DTO-i za parsiranje API odgovora (ApiResponse, TeamDto, VenueDto, TeamResponseItem)
- [x] `service/SyncService.java` — logika upsertanja klubova
- [x] `controller/AdminController.java` — `POST /api/admin/sync/clubs` (samo ADMIN)
- [ ] Sync za igrače, utakmice, postave u SyncService
- [ ] `@EnableScheduling` + dnevni `@Scheduled` job za automatski sync

### Faza 2 — Core read endpointi

- [ ] `GET /api/matches` — sve utakmice
- [ ] `GET /api/matches/{id}` — detalji + prosječne ocjene
- [ ] `GET /api/matches/round/{round}` — po kolu
- [ ] `GET /api/matches/finished` — završene utakmice
- [ ] `GET /api/players/{id}` — profil igrača
- [ ] `GET /api/clubs/{id}/players` — igrači kluba
- [ ] `GET /api/referees/{id}` — profil suca

### Faza 3 — Rating endpointi
*Ocjenjivanje moguće samo za `match.finished = true`*

- [ ] `POST /api/matches/{id}/ratings` — ocijeni utakmicu
- [ ] `GET  /api/matches/{id}/ratings` — ocjene + prosjek
- [ ] `POST /api/matches/{id}/referee-ratings` — ocijeni suca
- [ ] `GET  /api/matches/{id}/referee-ratings`
- [ ] `POST /api/matches/{id}/atmosphere-ratings` — ocijeni atmosferu
- [ ] `GET  /api/matches/{id}/atmosphere-ratings`
- [ ] `POST /api/matches/{matchId}/player-ratings/{playerId}` — ocijeni igrača
- [ ] `GET  /api/matches/{matchId}/player-ratings` — sve ocjene igrača

### Faza 4 — Admin endpointi

- [ ] `GET /api/admin/users` — svi korisnici
- [ ] `PUT /api/admin/users/{id}/block` — blokiraj/odblokiraj korisnika
- [ ] `GET /api/admin/ratings` — sve ocjene (moderacija)

---

## Potvrđene odluke

| Pitanje | Odluka |
|---------|--------|
| Lineup model | ✅ Dodati `MatchPlayer` — ocjena samo za nastupavše igrače |
| API ključ | Plaćeni plan (free ne pokriva tekuću sezonu) |
| Sinkronizacija | ✅ Ručni admin endpoint + `@Scheduled` dnevni job |
| Rating pravilo | ✅ Samo za završene utakmice (`finished = true`) |