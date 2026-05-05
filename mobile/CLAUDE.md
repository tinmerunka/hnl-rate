# HNL Rate - Mobile

> Plan razvoja: `.claude/PLAN.md`

## Uputa za Claude

Nakon svake implementirane stavke:
1. Označi checkbox u `.claude/PLAN.md` kao završen (`- [x]`)
2. Ažuriraj tablicu implementiranih ekrana/funkcionalnosti u ovom fajlu ako je dodana nova
3. Ako je dodan novi API poziv, dodaj ga u tablicu API poziva

**Nakon svakog korisničkog prompta** (bez obzira radi li se o implementaciji ili pitanju):
4. Ažuriraj `.claude/PLAN.md` i ovaj fajl da odražavaju trenutno stanje projekta
5. Ažuriraj memory fajlove u `~/.claude/projects/.../memory/` ako je nešto bitno novo saznato o projektu ili korisniku

## O projektu

HNL Rate je mobilna aplikacija za navijače koji mogu ocjenjivati HNL utakmice, igrače, suce i atmosferu.
Ovo je React Native (Expo) frontend koji komunicira s Spring Boot backendom.

## Tech Stack

- **React Native 0.81.5** + **Expo ~54**
- **Expo Router ~6** (file-based routing)
- **TypeScript**
- **expo-secure-store** — pohrana JWT tokena
- Native `fetch` za API pozive (bez axios)

## Pokretanje

```bash
npx expo start
# Zatim skenirati QR kod ili koristiti emulator
```

Backend radi na lokalnoj mreži (definirano u `constants/config.ts`). **IP se mijenja ovisno o mreži** — ako se pojavi greška "could not connect", provjeri trenutni Wi-Fi IP (`ipconfig`) i ažuriraj `constants/config.ts`.

## Struktura projekta

```
mobile/
├── app/                    # Expo Router file-based routes
│   ├── _layout.tsx         # Root layout — AuthProvider + Stack + RootNavigator (auth redirect)
│   ├── index.tsx           # Welcome / Splash ekran (Get started / I already have an account)
│   ├── login.tsx           # Login ekran ("Welcome back.")
│   ├── register.tsx        # Registracija ekran ("Join the stands.")
│   ├── club/
│   │   └── [id].tsx        # Detalji kluba + kompaktne kartice utakmica
│   ├── match/
│   │   └── [id].tsx        # Detalji utakmice — score hero, Buzz/First XI/Stats tabovi, card-stack rating modal
│   └── (tabs)/
│       ├── _layout.tsx     # Tab navigator (4 tabova: Matches, Clubs, Top Rated, Profile)
│       ├── index.tsx       # Matches tab — feed utakmica po kolima, round selector pill
│       ├── clubs.tsx       # Clubs tab — lista svih klubova, pretraga, toggle omiljenog
│       ├── top-rated.tsx   # Top Rated tab — placeholder (coming soon)
│       └── profile.tsx     # Profil korisnika, omiljeni klub, logout
├── context/
│   └── auth.tsx            # AuthContext — token, userProfile, loading, login, logout, refreshProfile
├── services/
│   ├── api.ts              # Sve API funkcije (typed), 401 interceptor s auto-refreshom
│   └── tokenStore.ts       # In-memory token store + forceLogout + notifyTokenRefreshed
└── constants/
    ├── config.ts           # API_BASE_URL
    └── theme.ts            # Design tokens — T objekt (bg, surface, red, text, win, loss, draw...)
```

## Auth tok

1. Login → backend vraća `accessToken` + `refreshToken` → oba se sprema u `SecureStore` i `tokenStore`
2. `AuthProvider` pri pokretanju učitava oba tokena iz `SecureStore` u `tokenStore` i dohvaća profil; postavlja `loading = false` kad završi
3. `RootNavigator` u `_layout.tsx` gleda `token` + `loading`:
   - `!token && inProtectedArea` → `router.replace('/')` (force logout redirect)
   - `token && onAuthScreen` → `router.replace('/(tabs)')` (skip welcome/login ako već prijavljen)
4. Svi autentificirani API pozivi koriste `Authorization: Bearer <accessToken>` header
5. Na **401 odgovor** → `authFetch` automatski poziva `POST /api/auth/refresh`, sprema nove tokene, ažurira `tokenStore` i React state (`notifyTokenRefreshed`), pa ponavlja originalni zahtjev
6. Ako refresh ne uspije → `tokenStore.forceLogout()` → briše tokene iz SecureStore i resetira React state
7. Logout — gumb u `profile.tsx` prvo navigira na `/`, zatim poziva `logout()` u pozadini (ne čeka mrežni poziv)

## Implementirani ekrani i funkcionalnosti

| Ekran / Funkcionalnost        | Putanja                    | Opis |
|-------------------------------|----------------------------|------|
| Welcome / Splash              | `/`                        | Chess-pattern logo, red glow, "Get started" + "I already have an account" |
| Login                         | `/login`                   | "Welcome back." — prijava korisnika, pohranjuje JWT |
| Registracija                  | `/register`                | "Join the stands." — kreiranje novog računa |
| Matches (tab 1)               | `/(tabs)`                  | Feed utakmica po kolu, round selector pill, live strip, kartice s rezultatima |
| Clubs (tab 2)                 | `/(tabs)/clubs`            | Lista svih klubova, pretraga po imenu, toggle omiljenog (srce) |
| Top Rated (tab 3)             | `/(tabs)/top-rated`        | Placeholder — coming soon |
| Profile (tab 4)               | `/(tabs)/profile`          | Profil korisnika, omiljeni klub, logout |
| Detalji kluba                 | `/club/[id]`               | Kompaktni hero, toggle omiljenog, filter Upcoming/Past, istaknuta sljedeća utakmica |
| Detalji utakmice (prošle)     | `/match/[id]`              | Score hero, "Rate this match" CTA, tabovi: Buzz / First XI / Stats |
| Detalji utakmice (nadolazeće) | `/match/[id]`              | Kolo, datum, sudac, stadion — bez ocjenjivanja |
| Ocjenjivanje utakmice         | `modal` unutar `/match/[id]` | Card-stack modal: ocjena 1–10, atmosfera/sudac ★, MOTM na terenu, review |

## Implementirani API pozivi

| Funkcija               | Metoda | URL                            | Opis |
|------------------------|--------|--------------------------------|------|
| `getUserProfile`       | GET    | `/api/user/me`                 | Profil prijavljenog korisnika |
| `getClubs`             | GET    | `/api/clubs`                   | Lista svih klubova |
| `getClub`              | GET    | `/api/clubs/{id}`              | Detalji kluba |
| `getClubMatches`       | GET    | `/api/clubs/{id}/matches`      | Utakmice kluba |
| `setFavoriteClub`      | POST   | `/api/clubs/{id}/favorite`     | Postavi omiljeni klub |
| `removeFavoriteClub`   | DELETE | `/api/clubs/favorite`          | Ukloni omiljeni klub |
| `getMatch`             | GET    | `/api/matches/{id}`            | Detalji utakmice (sa sucem) |
| `getMatchLineup`       | GET    | `/api/matches/{id}/lineup`     | Postava utakmice (vraća null ako nije dostupna — 204) |
| `getMatchRatings`      | GET    | `/api/matches/{id}/ratings`    | Community ocjene utakmice (vraća 204 ako nema) |
| `getMatchesByRound`    | GET    | `/api/matches?round={n}`       | Sve utakmice za određeno kolo — koristi Matches tab |
| `getPlayersByClub`     | GET    | `/api/players?clubId={id}`     | Igrači kluba |
| `rateMatch`            | POST   | `/api/matches/{id}/rate`       | Ocijeni utakmicu (1–10) |
| `rateReferee`          | POST   | `/api/matches/{id}/rate-referee` | Ocijeni suca (1–10, prikazuje se kao ★) |
| `rateAtmosphere`       | POST   | `/api/matches/{id}/rate-atmosphere` | Ocijeni atmosferu (1–10, prikazuje se kao ★) |
| `ratePlayers`          | POST   | `/api/matches/{id}/rate-players` | Ocijeni igrače (MOTM — bestPlayer flag) |
| `getUserRatings`       | GET    | `/api/user/ratings`            | Sve korisnikove ocjene |
| `revokeRefreshToken`   | POST   | `/api/auth/logout`             | Revokacija refresh tokena na backendu |

## Tipovi (TypeScript)

Definirani u `context/auth.tsx`: `Club`, `Match`, `Player`, `Referee`, `LineupPlayer`, `TeamLineup`, `MatchLineup`, `UserProfile`, `UserMatchRating`, `PlayerRatingInput`, `PlayerRatingResult`, `MatchRatings`

## Design System

Definirano u `constants/theme.ts` kao `T` objekt:

| Token          | Vrijednost                    | Upotreba |
|----------------|-------------------------------|----------|
| `T.bg`         | `#06070A`                     | Pozadina svih ekrana |
| `T.surface`    | `#101218`                     | Kartice, inputi |
| `T.surfaceHi`  | `#161922`                     | Elevated surface (bench header, itd.) |
| `T.hairline`   | `rgba(255,255,255,0.06)`      | Borderi kartica |
| `T.text`       | `#F5F6F8`                     | Primarni tekst |
| `T.textDim`    | `#9097A3`                     | Sekundarni tekst |
| `T.textFaint`  | `#5A6070`                     | Placeholderi, labele |
| `T.red`        | `#E11D2A`                     | Primarna akcijska boja |
| `T.redGlow`    | `rgba(225,29,42,0.35)`        | Shadow/glow efekti |
| `T.win`        | `#27C36F`                     | Pobjeda / visoka ocjena |
| `T.loss`       | `#E5484D`                     | Poraz / niska ocjena |
| `T.draw`       | `#F5A524`                     | Remi / srednja ocjena |

## TODO — Ekrani i funkcionalnosti koje nedostaju

- [ ] Top Rated ekran — lista najbolje ocijenjenih utakmica i igrača
- [ ] Komentari / "Takes" u Buzz tabu (backend nema endpoint)
- [ ] Profil igrača s prosjekom ocjena
- [ ] Loading skeleton ekrani
- [ ] Admin ekrani

## Napomene

- Sve poruke prema korisniku su na **engleskom** (za sada)
- Design tokens u `T` objektu (`constants/theme.ts`) — **ne koristiti hardkodirane boje**
- `getMatchesByRound` poziva `/api/matches?round={n}` — ako backend ne podržava ovaj endpoint, Matches tab će prikazati error state
- Backend vraća `accessToken` (ili `token` kao fallback) pri loginu
- Nema state managementa (Redux/Zustand) — React Context
- Nema axios — native `fetch`
- `router.replace('/')` iz tab screena navigira na root welcome ekran (ne unutar taba)
- Rating modal u match detailima je `Modal` komponenta (presentationStyle: `pageSheet`) — otvara se pritiskom na "Rate this match" CTA
