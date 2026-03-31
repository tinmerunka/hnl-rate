# HNL Rate - Backend

> Plan razvoja: `.claude/PLAN.md`

## Uputa za Claude

Nakon svake implementirane stavke:
1. Označi checkbox u `.claude/PLAN.md` kao završen (`- [x]`)
2. Ažuriraj tablicu implementiranih endpointa u ovom fajlu ako je dodan novi endpoint
3. Ako je dodan novi model, dodaj ga u tablicu modela

## O projektu

HNL Rate je mobilna aplikacija za navijače koji mogu ocjenjivati HNL utakmice. Backend je Spring Boot REST API.

**Korisnici mogu ocjenjivati:**
- Utakmice (MatchRating)
- Igrače (PlayerRating) — s opcijama "best player" / "worst player"
- Suce (RefereeRating)
- Atmosferu na utakmici (AtmosphereRating)

## Tech Stack

- **Java 21** + **Spring Boot 4.0.3**
- **PostgreSQL 15** (Docker)
- **Spring Security** + **JWT** (JJWT 0.11.5, HS256, 24h expiry)
- **Spring Data JPA** (Hibernate, DDL auto: update)
- **Lombok**

## Pokretanje

```bash
# Pokreni bazu
docker-compose up -d

# Pokreni aplikaciju
./mvnw spring-boot:run
```

Baza: `localhost:5432/hnlrate`, user: `postgres`, pass: `postgres`

## Struktura projekta

```
src/main/java/com/hnlrate/backend/
├── controller/      AuthController, ClubController
├── dto/             LoginDTO, RegisterDTO, AuthResponseDTO
├── model/           9 entiteta (vidi dolje)
├── repository/      JPA repozitoriji za svaki model
├── security/        SecurityConfig, JwtService, JwtAuthFilter
└── service/         Servisni sloj za svaki model
```

## Modeli

| Model           | Tablica           | Opis |
|-----------------|-------------------|------|
| User            | users             | Navijač s ulogom (USER/ADMIN), može biti blokiran |
| Club            | club              | Klub (ime, grad, logoUrl) |
| Match           | match             | Utakmica (domaćin, gost, sudac, kolo, datum, rezultat, gotova) |
| Player          | player            | Igrač (ime, prezime, pozicija, broj, klub) |
| Referee         | referee           | Sudac (ime, prezime) |
| PlayerRating    | player_rating     | Ocjena igrača na utakmici (1 ocjena po korisniku/igraču/utakmici) |
| MatchRating     | match_rating      | Ocjena utakmice |
| RefereeRating   | referee_rating    | Ocjena suca na utakmici |
| AtmosphereRating| atmosphere_rating | Ocjena atmosfere na utakmici |

## Implementirani endpointi

| Metoda | URL                       | Auth       | Opis |
|--------|---------------------------|------------|------|
| POST   | /api/auth/register        | Ne         | Registracija |
| POST   | /api/auth/login           | Ne         | Login, vraća JWT |
| GET    | /api/clubs                | Da         | Dohvati sve klubove |
| POST   | /api/admin/sync/clubs     | Da (ADMIN) | Sinkronizacija klubova s api-football.com |

## Security

- **Javni**: `/api/auth/**`
- **Admin**: `/api/admin/**`
- **Ostalo**: zahtijeva JWT (`Authorization: Bearer <token>`)
- CORS dopušten s `http://localhost:3000`
- CSRF onemogućen, sesije stateless
- JWT secret: hardcoded hex string (treba prebaciti u env varijablu!)
- Blokirani korisnici ne mogu se prijaviti (provjerava se u JwtAuthFilter)

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

## TODO — Endpointi koji nedostaju

- [ ] `/api/matches` — lista utakmica (po kolu, po klubu, završene/nadolazeće)
- [ ] `/api/matches/{id}` — detalji utakmice
- [ ] `/api/matches/{id}/rate` — ocijeni utakmicu (MatchRating)
- [ ] `/api/matches/{id}/rate-referee` — ocijeni suca (RefereeRating)
- [ ] `/api/matches/{id}/rate-atmosphere` — ocijeni atmosferu (AtmosphereRating)
- [ ] `/api/matches/{id}/rate-players` — ocijeni igrača (PlayerRating)
- [ ] `/api/clubs` — detalji kluba, igrači kluba
- [ ] `/api/players/{id}` — profil igrača, prosjek ocjena
- [ ] `/api/admin/**` — admin upravljanje (blokiranje usera)
- [x] `/api/admin/sync/clubs` — sinkronizacija klubova s api-football ✓
- [ ] `/api/admin/sync/players` — sinkronizacija igrača
- [ ] `/api/admin/sync/matches` — sinkronizacija utakmica i postava

## Napomene

- Error poruke su na hrvatskom
- JWT secret je u `application.properties` (izvučen iz koda)
- `application.properties` je u `.gitignore`, koristi `application.properties.example` kao template
- DDL auto: `update` — OK za razvoj, za produkciju koristiti Flyway/Liquibase
