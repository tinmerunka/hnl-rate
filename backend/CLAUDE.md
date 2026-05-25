# HNL Rate - Backend

> Plan razvoja: `.claude/PLAN.md`

## Uputa za Claude

Nakon svake implementirane stavke:
1. Označi checkbox u `.claude/PLAN.md` kao završen (`- [x]`)
2. Ažuriraj tablicu implementiranih endpointa u ovom fajlu ako je dodan novi endpoint
3. Ako je dodan novi model, dodaj ga u tablicu modela

**Nakon svakog korisničkog prompta** (bez obzira radi li se o implementaciji ili pitanju):
4. Ažuriraj `.claude/PLAN.md` i ovaj fajl da odražavaju trenutno stanje projekta
5. Ažuriraj memory fajlove u `~/.claude/projects/.../memory/` ako je nešto bitno novo saznato o projektu ili korisniku

## O projektu

HNL Rate je mobilna aplikacija (+ admin web) za navijače koji mogu ocjenjivati HNL utakmice. Backend je Spring Boot REST API.

**Korisnici mogu ocjenjivati:**
- Utakmice (MatchRating)
- Igrače (PlayerRating) — s opcijama "best player" / "worst player"
- Suce (RefereeRating)
- Atmosferu na utakmici (AtmosphereRating)

## Tech Stack

- **Java 21** + **Spring Boot 4.0.3**
- **PostgreSQL** (Supabase — produkcijska baza u cloudu)
- **Spring Security** + **JWT** (JJWT 0.11.5, HS256, 24h expiry)
- **Spring Data JPA** (Hibernate, DDL auto: update)
- **Lombok**

## Pokretanje

```bash
# Pokreni aplikaciju (baza je Supabase, nema potrebe za lokalnim Dockerom)
./mvnw spring-boot:run
```

Sve varijable okoline su u `.env` fajlu (nije u gitu). Baza: Supabase (aws-eu-central-1).

## Struktura projekta

```
src/main/java/com/hnlrate/backend/
├── controller/      AuthController, ClubController, MatchController,
│                    PlayerController, RefereeController, UserController, AdminController
├── dto/             LoginDTO, RegisterDTO, AuthResponseDTO, RefreshTokenRequestDTO, ...
├── model/           13 entiteta (vidi dolje)
├── repository/      JPA repozitoriji za svaki model
├── security/        SecurityConfig, JwtService, JwtAuthFilter
└── service/         Servisni sloj za svaki model, SyncService
```

## Modeli

| Model              | Tablica              | Opis |
|--------------------|----------------------|------|
| User               | users                | Navijač s ulogom (USER/ADMIN), može biti blokiran |
| Club               | club                 | Klub (ime, grad, logoUrl, apiFootballId) |
| Match              | match                | Utakmica (domaćin, gost, sudac, kolo, datum, rezultat, gotova) |
| Player             | player               | Igrač (ime, prezime, pozicija, broj, klub, apiFootballId) |
| Referee            | referee              | Sudac (ime, prezime, apiFootballId) |
| MatchPlayer        | match_player         | Postava utakmice (igrač + utakmica, startni/klupa) |
| PlayerRating       | player_rating        | Ocjena igrača na utakmici (rating + comment + best/worst, 1 po korisniku/igraču/utakmici) |
| MatchRating        | match_rating         | Ocjena utakmice (rating + opcionalni comment) |
| RefereeRating      | referee_rating       | Ocjena suca na utakmici (rating + opcionalni comment) |
| AtmosphereRating   | atmosphere_rating    | Ocjena atmosfere na utakmici (rating + opcionalni comment) |
| MatchStatistics    | match_statistics     | Statistike utakmice (šutevi, korneri, kartoni, posjed lopte…) |
| MatchRatingVote    | match_rating_vote    | Up/down glasanje na komentarima match ocjena (1 glas po korisniku/ocjeni) |
| PasswordResetToken | password_reset_token | Token za reset lozinke (s rokom isteka) |
| RefreshToken       | refresh_token        | JWT refresh token (revokabilni, 7 dana) |

## Implementirani endpointi

| Metoda | URL                                        | Auth       | Opis |
|--------|--------------------------------------------|------------|------|
| POST   | /api/auth/register                         | Ne         | Registracija (email + lozinka) |
| POST   | /api/auth/login                            | Ne         | Login — JWT u body + refresh token u HttpOnly cookie |
| POST   | /api/auth/refresh                          | Ne         | Obnovi access token (čita iz cookie, fallback na body) |
| POST   | /api/auth/logout                           | Ne         | Revokacija refresh tokena, briše HttpOnly cookie |
| POST   | /api/auth/forgot-password                  | Ne         | Zahtjev za reset lozinke (šalje token) |
| POST   | /api/auth/reset-password                   | Ne         | Reset lozinke s tokenom |
| GET    | /api/user/me                               | Da         | Profil prijavljenog korisnika |
| GET    | /api/user/ratings                          | Da         | Sve moje ocjene grupirane po utakmici (My Ratings) |
| GET    | /api/clubs                                 | Da         | Dohvati sve klubove |
| GET    | /api/clubs/{id}                            | Da         | Detalji kluba |
| POST   | /api/clubs/{id}/favorite                   | Da         | Postavi klub kao omiljeni |
| DELETE | /api/clubs/favorite                        | Da         | Ukloni omiljeni klub |
| GET    | /api/clubs/{id}/matches                    | Da         | Sve utakmice kluba |
| GET    | /api/matches                               | Da         | Sve utakmice (?round=N, ?finished=true) |
| GET    | /api/matches/{id}                          | Da         | Detalji utakmice (s refereeom) |
| GET    | /api/matches/{id}/lineup                   | Da         | Postava utakmice (startnih 11 + klupa), lazy sync s api-football |
| GET    | /api/matches/{id}/statistics               | Da         | Statistike utakmice (šutevi, kartoni, posjed…), lazy sync |
| POST   | /api/matches/{id}/rate                     | Da         | Ocijeni utakmicu (upsert, rating + opcionalni comment) |
| POST   | /api/matches/{id}/rate-referee             | Da         | Ocijeni suca na utakmici (upsert) |
| POST   | /api/matches/{id}/rate-atmosphere          | Da         | Ocijeni atmosferu na utakmici (upsert) |
| POST   | /api/matches/{id}/rate-players             | Da         | Ocijeni igrače na utakmici (lista, upsert) |
| GET    | /api/matches/{id}/ratings                  | Ne/Da      | Prosjeci + best/worst glasovi + komentari s up/down votes |
| POST   | /api/matches/{id}/ratings/{ratingId}/vote  | Da         | Up/down glasanje na komentaru match ocjene |
| GET    | /api/players                               | Da         | Svi igrači (?clubId=N) |
| GET    | /api/players/{id}                          | Da         | Detalji igrača |
| GET    | /api/referees                              | Da         | Svi suci |
| GET    | /api/referees/{id}                         | Da         | Detalji suca |
| POST   | /api/admin/sync/clubs                      | Da (ADMIN) | Sinkronizacija klubova s api-football |
| POST   | /api/admin/sync/matches                    | Da (ADMIN) | Sinkronizacija utakmica + sudaca s api-football |
| POST   | /api/admin/sync/players                    | Da (ADMIN) | Sinkronizacija igrača s api-football (paginirano) |
| POST   | /api/admin/clubs                           | Da (ADMIN) | Kreiraj klub |
| PUT    | /api/admin/clubs/{id}                      | Da (ADMIN) | Ažuriraj klub |
| DELETE | /api/admin/clubs/{id}                      | Da (ADMIN) | Obriši klub |
| POST   | /api/admin/matches                         | Da (ADMIN) | Kreiraj utakmicu |
| PUT    | /api/admin/matches/{id}                    | Da (ADMIN) | Ažuriraj utakmicu (rezultat, sudac, finished…) |
| DELETE | /api/admin/matches/{id}                    | Da (ADMIN) | Obriši utakmicu |
| POST   | /api/admin/players                         | Da (ADMIN) | Kreiraj igrača |
| PUT    | /api/admin/players/{id}                    | Da (ADMIN) | Ažuriraj igrača |
| DELETE | /api/admin/players/{id}                    | Da (ADMIN) | Obriši igrača |
| POST   | /api/admin/referees                        | Da (ADMIN) | Kreiraj suca |
| PUT    | /api/admin/referees/{id}                   | Da (ADMIN) | Ažuriraj suca |
| DELETE | /api/admin/referees/{id}                   | Da (ADMIN) | Obriši suca |
| GET    | /api/admin/users                           | Da (ADMIN) | Lista svih korisnika |
| PUT    | /api/admin/users/{id}/block                | Da (ADMIN) | Blokiraj/odblokiraj korisnika |
| GET    | /api/admin/comments                        | Da (ADMIN) | Lista svih komentara match ocjena |
| DELETE | /api/admin/comments/{id}                   | Da (ADMIN) | Briši komentar (postavlja na null) |
| GET    | /api/admin/ratings                         | Da (ADMIN) | Lista svih match ocjena |
| DELETE | /api/admin/ratings/{id}                    | Da (ADMIN) | Obriši match ocjenu |
| GET    | /api/admin/referee-ratings                 | Da (ADMIN) | Lista svih ocjena sudaca |
| DELETE | /api/admin/referee-ratings/{id}            | Da (ADMIN) | Obriši ocjenu suca |
| GET    | /api/admin/atmosphere-ratings              | Da (ADMIN) | Lista svih ocjena atmosfere |
| DELETE | /api/admin/atmosphere-ratings/{id}         | Da (ADMIN) | Obriši ocjenu atmosfere |
| GET    | /api/admin/player-ratings                  | Da (ADMIN) | Lista svih ocjena igrača |
| DELETE | /api/admin/player-ratings/{id}             | Da (ADMIN) | Obriši ocjenu igrača |
| GET    | /api/admin/stats                           | Da (ADMIN) | Statistike: aktivne sesije, totalUsers, totalRatings |

## Security

- **Javni**: `/api/auth/**`
- **Admin**: `/api/admin/**`
- **Ostalo**: zahtijeva JWT (`Authorization: Bearer <token>`)
- CORS dopušten s `http://localhost:3000`, `Set-Cookie` header eksponiran
- CSRF onemogućen, sesije stateless
- JWT secret: u `.env` kao `JWT_SECRET` env varijabla ✓
- Blokirani korisnici ne mogu se prijaviti (provjerava se u JwtAuthFilter)
- Refresh token: HttpOnly cookie (`Path=/api/auth`, `MaxAge=7d`, `SameSite=Strict`) za web; body za mobile (backward compat)

## Vanjski API — api-football.com

**Base URL:** `https://v3.football.api-sports.io/`
**Auth:** header `x-apisports-key: <API_KEY>`

### Ključni endpointi

```
GET /leagues?country=Croatia&current=true   → dohvati ID za Prvu HNL
GET /teams?league={id}&season=2025          → klubovi
GET /players?league={id}&season=2025        → igrači
GET /fixtures?league={id}&season=2025       → utakmice
GET /fixtures/lineups?fixture={id}          → postave (tu su i suci)
GET /standings?league={id}&season=2025      → ljestvica
```

**Prva HNL liga ID:** treba provjeriti pozivom `/leagues?country=Croatia` (vjerojatno ~694)

**Free plan:** 100 zahtjeva/dan, 10/min — dovoljno za povlačenje podataka

### Strategija sinkronizacije
1. Jednom sezonski povuci klubove i igrače → spremi u bazu
2. Tjedni/dnevni job za utakmice (novo kolo, rezultati)
3. Koristiti Spring `@Scheduled` ili Quartz za automatsku sinkronizaciju

## Stanje prema specifikaciji (cijeli projekt)

### Backend — implementirano ✓
- [x] Sve CRUD operacije nad entitetima
- [x] Ocjenjivanje utakmica, igrača, sudaca i atmosfere (s opcionalnim komentarom)
- [x] Best/worst player glasanje
- [x] Up/down glasanje na komentarima match ocjena
- [x] Blokiranje/deblokiranje korisnika
- [x] Admin moderacija — brisanje match/sudac/atmosfera ocjena i komentara
- [x] `@Scheduled` dnevni job za automatski sync (PR #33)
- [x] Match statistike (PR #34)
- [x] Forgot/reset password

### Web admin panel — implementirano ✓
- [x] Login/logout administratora
- [x] Dashboard sa 5 statistika: broj klubova, utakmica (završene/zakazane), igrača, sudaca, aktivnih sesija
- [x] Upravljanje korisnicima: lista, pretraga, blokiranje/deblokiranje
- [x] Moderacija match ocjena (pregled i brisanje)
- [x] Moderacija sudačkih ocjena (pregled i brisanje)
- [x] Moderacija ocjena atmosfere (pregled i brisanje)
- [x] Moderacija komentara (pregled i brisanje)
- [x] Puni CRUD za klubove, utakmice, igrače, suce
- [x] Sync s api-football.com

### Mobilna aplikacija — implementirano ✓
- [x] Registracija i login (email/lozinka)
- [x] Pregled utakmica po kolima (All / My Club / Rated filteri)
- [x] Detalji utakmice — postava (First XI), statistike, buzz (komentari + glasanje)
- [x] 5-korački rating modal: utakmica → atmosfera → igrači (best/worst) → sudac → pregled
- [x] Pregled prosječnih ocjena zajednice
- [x] Omiljeni klub + personalizirani feed
- [x] Pregled kluba i njegovih utakmica
- [x] Profil korisnika s logout

### Nedostaje prema specifikaciji (cijeli projekt)

| # | Što | Gdje nedostaje | Težina | Status |
|---|-----|----------------|--------|--------|
| 1 | **Google OAuth** | Mobile + Backend | Srednja | Preskočeno (school projekt, kompleksno za tim) |
| 2 | **Push notifikacije** | Backend (FCM slanje) + Mobile (primanje) | Velika | TODO |

## Napomene

- Error poruke su na hrvatskom
- Sve tajne (JWT, DB, API key) su u `.env` fajlu koji Spring Boot čita automatski — NE commitati!
- `application.properties` koristi `${VAR_NAME}` syntax za env varijable
- DDL auto: `update` — OK za razvoj, za produkciju koristiti Flyway/Liquibase
- Spring `@RequestBody(required = false)` zahtijeva validan JSON body čak i kad je prazan — slati `{}`
