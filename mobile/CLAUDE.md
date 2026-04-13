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
│   ├── index.tsx           # Welcome ekran (Login / Create Account gumbi)
│   ├── login.tsx           # Login ekran
│   ├── register.tsx        # Registracija ekran
│   ├── club/
│   │   └── [id].tsx        # Detalji kluba + kompaktne kartice utakmica
│   ├── match/
│   │   └── [id].tsx        # Detalji utakmice (rezultat, sudac, igrači)
│   └── (tabs)/
│       ├── _layout.tsx     # Tab navigator (Clubs + Profile)
│       ├── index.tsx       # Home ekran (lista klubova, pretraga, toggle omiljenog)
│       └── profile.tsx     # Profil korisnika, omiljeni klub, logout
├── context/
│   └── auth.tsx            # AuthContext — token, userProfile, loading, login, logout, refreshProfile
├── services/
│   ├── api.ts              # Sve API funkcije (typed), 401 interceptor s auto-refreshom
│   └── tokenStore.ts       # In-memory token store + forceLogout + notifyTokenRefreshed
└── constants/
    ├── config.ts           # API_BASE_URL
    └── theme.ts            # Boje i fontovi
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

| Ekran / Funkcionalnost        | Putanja                 | Opis |
|-------------------------------|-------------------------|------|
| Welcome / Splash              | `/`                     | Početni ekran s gumbima Login/Register |
| Login                         | `/login`                | Prijava korisnika, pohranjuje JWT |
| Registracija                  | `/register`             | Kreiranje novog računa |
| Clubs (tab 1)                 | `/(tabs)`               | Lista svih klubova, pretraga po imenu, toggle omiljenog (srce) |
| Profile (tab 2)               | `/(tabs)/profile`       | Profil korisnika, omiljeni klub, logout |
| Detalji kluba                 | `/club/[id]`            | Kompaktni hero, toggle omiljenog, filter Upcoming/Past, istaknuta sljedeća utakmica |
| Detalji utakmice (prošle)     | `/match/[id]`           | Rezultat, sudac, igrači doma i gosta (dva stupca) |
| Detalji utakmice (nadolazeće) | `/match/[id]`           | Kolo, datum, sudac, stadion — bez igrača |

## Implementirani API pozivi

| Funkcija               | Metoda | URL                        | Opis |
|------------------------|--------|----------------------------|------|
| `getUserProfile`       | GET    | `/api/user/me`             | Profil prijavljenog korisnika |
| `getClubs`             | GET    | `/api/clubs`               | Lista svih klubova |
| `getClub`              | GET    | `/api/clubs/{id}`          | Detalji kluba |
| `getClubMatches`       | GET    | `/api/clubs/{id}/matches`  | Utakmice kluba |
| `setFavoriteClub`      | POST   | `/api/clubs/{id}/favorite` | Postavi omiljeni klub |
| `removeFavoriteClub`   | DELETE | `/api/clubs/favorite`      | Ukloni omiljeni klub |
| `getMatch`             | GET    | `/api/matches/{id}`        | Detalji utakmice (sa sucem) |
| `getMatchLineup`       | GET    | `/api/matches/{id}/lineup` | Postava utakmice (vraća null ako nije dostupna — 204) |
| `getPlayersByClub`     | GET    | `/api/players?clubId={id}` | Igrači kluba |
| `revokeRefreshToken`   | POST   | `/api/auth/logout`         | Revokacija refresh tokena na backendu |

## Tipovi (TypeScript)

Definirani u `context/auth.tsx`: `Club`, `Match`, `Player`, `Referee`, `LineupPlayer`, `TeamLineup`, `MatchLineup`, `UserProfile`

## TODO — Ekrani i funkcionalnosti koje nedostaju

- [ ] Lista utakmica (po kolu, po klubu, završene/nadolazeće)
- [ ] Ocjenjivanje utakmice (MatchRating)
- [ ] Ocjenjivanje suca (RefereeRating)
- [ ] Ocjenjivanje atmosfere (AtmosphereRating)
- [ ] Ocjenjivanje igrača (PlayerRating)
- [ ] Profil igrača s prosjekom ocjena
- [ ] Loading skeleton ekrani
- [ ] Admin ekrani

## Napomene

- Sve poruke prema korisniku su na **engleskom** (za sada)
- Boje: pozadina `#000000`, primarna `#CC0000`, kartice `#111111`
- Backend vraća `accessToken` (ili `token` kao fallback) pri loginu
- Nema state managementa (Redux/Zustand) — React Context
- Nema axios — native `fetch`
- `router.replace('/')` iz tab screena navigira na root welcome ekran (ne unutar taba)
