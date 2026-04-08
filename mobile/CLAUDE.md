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
│   ├── _layout.tsx         # Root layout (AuthProvider, Stack navigator)
│   ├── index.tsx           # Welcome / splash ekran
│   ├── login.tsx           # Login ekran
│   ├── register.tsx        # Registracija ekran
│   ├── club/
│   │   └── [id].tsx        # Detalji kluba + postavi/ukloni omiljeni
│   └── (tabs)/
│       ├── _layout.tsx     # Tab navigator
│       ├── index.tsx       # Home ekran (profil, omiljeni klub, pretraga kluba po ID-u)
│       └── explore.tsx     # Explore ekran (placeholder)
├── context/
│   └── auth.tsx            # AuthContext — JWT pohrana, UserProfile state
├── services/
│   └── api.ts              # Sve API funkcije (typed)
└── constants/
    ├── config.ts           # API_BASE_URL
    └── theme.ts            # Boje i fontovi
```

## Auth tok

1. Login → backend vraća `accessToken` → sprema se u `SecureStore`
2. `AuthProvider` pri pokretanju učitava token iz `SecureStore` i dohvaća profil
3. Svi autentificirani API pozivi koriste `Authorization: Bearer <token>` header
4. Logout briše token iz `SecureStore` i resetira state

## Implementirani ekrani i funkcionalnosti

| Ekran / Funkcionalnost        | Putanja                 | Opis |
|-------------------------------|-------------------------|------|
| Welcome / Splash              | `/`                     | Početni ekran s gumbima Login/Register |
| Login                         | `/login`                | Prijava korisnika, pohranjuje JWT |
| Registracija                  | `/register`             | Kreiranje novog računa |
| Clubs (tab 1)                 | `/(tabs)`               | Lista svih klubova, pretraga po imenu, toggle omiljenog (srce) |
| Profile (tab 2)               | `/(tabs)/profile`       | Profil korisnika, omiljeni klub, logout |
| Detalji kluba                 | `/club/[id]`            | Crest, podaci kluba, postavi/ukloni omiljeni |

## Implementirani API pozivi

| Funkcija            | Metoda | URL                        | Opis |
|---------------------|--------|----------------------------|------|
| `getUserProfile`    | GET    | `/api/user/me`             | Profil prijavljenog korisnika |
| `getClubs`          | GET    | `/api/clubs`               | Lista svih klubova |
| `getClub`           | GET    | `/api/clubs/{id}`          | Detalji kluba |
| `setFavoriteClub`   | POST   | `/api/clubs/{id}/favorite` | Postavi omiljeni klub |
| `removeFavoriteClub`| DELETE | `/api/clubs/favorite`      | Ukloni omiljeni klub |

## Tipovi (TypeScript)

```typescript
// context/auth.tsx
interface Club {
  id, name, shortName?, tla?, crest?,
  address?, website?, founded?, venue?
}

interface UserProfile {
  id, username, email, favoriteClub: Club | null
}
```

## TODO — Ekrani i funkcionalnosti koje nedostaju

- [ ] Lista utakmica (po kolu, po klubu, završene/nadolazeće)
- [ ] Detalji utakmice
- [ ] Ocjenjivanje utakmice (MatchRating)
- [ ] Ocjenjivanje suca (RefereeRating)
- [ ] Ocjenjivanje atmosfere (AtmosphereRating)
- [ ] Ocjenjivanje igrača (PlayerRating)
- [ ] Profil igrača s prosjekom ocjena
- [ ] Lista klubova (kad backend doda endpoint)
- [ ] Admin ekrani
- [ ] Refresh token logika (backend već podržava token rotation)
- [ ] Bolje error handling (npr. 401 → auto logout)

## Napomene

- Sve poruke prema korisniku su na **engleskom** (za sada)
- Boje: pozadina `#000000`, primarna `#CC0000`, kartice `#111111`
- JWT secret field: backend vraća `accessToken` (ili `token` kao fallback)
- Nema state managementa (Redux/Zustand) — koristi se React Context
- Nema axios — native `fetch`
