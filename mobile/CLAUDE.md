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

Sav UI je na **hrvatskom jeziku** (inline hardkodirani stringovi, bez i18n biblioteke).

```
mobile/
├── app/                              # Expo Router routes — tanke datoteke koje samo kompoziraju
│   ├── _layout.tsx                   # AuthProvider + Stack + RootNavigator
│   ├── index.tsx                     # Welcome / Splash
│   ├── login.tsx                     # ~120 redaka, koristi <AuthHeader> + <FormField>
│   ├── register.tsx                  # ~135 redaka, koristi <AuthHeader> + <FormField>
│   ├── club/[id].tsx                 # ~120 redaka — kompozicija ClubHero + MatchFilterTabs + cards
│   ├── match/[id].tsx                # ~50 redaka — route + Past/Upcoming layout
│   └── (tabs)/
│       ├── _layout.tsx               # Tab navigator (Utakmice, Klubovi, Najbolje, Profil)
│       ├── index.tsx                 # ~180 redaka — kompozicija matches-feed komponenti
│       ├── clubs.tsx                 # Clubs tab
│       ├── top-rated.tsx             # Placeholder
│       └── profile.tsx               # Profil korisnika
│
├── features/                         # Feature-scoped (ne dijeli se između feature-a)
│   ├── match/
│   │   ├── PastLayout.tsx            # Layout za odigrane utakmice (score hero + tabovi)
│   │   ├── UpcomingLayout.tsx        # Layout za nadolazeće utakmice (vs + info card)
│   │   ├── tabs/                     # TabBar, BuzzTab, FirstXITab, StatsTab
│   │   ├── buzz/CommentCard.tsx
│   │   ├── lineup/                   # PitchView, PlayerDot, BenchSection
│   │   ├── stats/                    # StatRow, StatsContent
│   │   ├── rating/                   # RateModal + 5 steps + RatingSlider, StarRow, SummaryTile
│   │   ├── hooks/                    # useMatchData, useMatchExtras, useRateModal
│   │   ├── utils/lineup.ts           # POS_SHORT, posToRow, computeFormation, computePositions
│   │   └── styles/rateModal.styles.ts
│   ├── club/
│   │   ├── ClubHero.tsx              # Logo + ime + favorite toggle
│   │   ├── MatchFilterTabs.tsx       # Nadolazeće / Prošle pill
│   │   ├── FeaturedMatchCard.tsx     # Hero za sljedeću utakmicu
│   │   ├── ClubMatchRow.tsx          # Kompaktni red s rezultatom + P/N/I badge
│   │   ├── EmptyState.tsx
│   │   ├── hooks/                    # useClubData, useFavoriteToggle
│   │   └── styles/club.styles.ts
│   ├── matches-feed/                 # Sve za (tabs)/index.tsx
│   │   ├── MyClubFeed.tsx, RatedFeed.tsx, RatedMatchCard.tsx
│   │   ├── SegmentedControl.tsx, RoundPill.tsx, SectionHeader.tsx
│   │   ├── hooks/                    # useRoundMatches, useUserRatings
│   │   └── styles.ts
│   └── auth/
│       ├── AuthHeader.tsx            # Logo + back + heading za login/register
│       └── styles.ts
│
├── components/                       # Komponente dijeljene između ≥2 feature-a
│   ├── ClubLogo.tsx                  # Korišten u match (Past + Upcoming layout)
│   ├── ClubAvatar.tsx                # Korišten u matches-feed + (planski) profile
│   ├── MatchCard.tsx                 # Korišten u matches-feed (live + finished + upcoming)
│   ├── FormField.tsx                 # Label + TextInput + optional badge — login + register
│   └── LogoMark.tsx                  # Chess-pattern logo — welcome + login + register
│
├── hooks/
│   └── useClubLogoSource.ts          # Fallback crest → logoUrl
│
├── utils/
│   ├── date.ts                       # dateStr, dateShort, dateLong, dateWeekday, timeShort (hr-HR)
│   ├── score.ts                      # scoreColorFor
│   └── initials.ts                   # clubInitials, userInitial
│
├── context/auth.tsx                  # AuthContext + svi TS tipovi
├── services/
│   ├── api.ts                        # Sve API pozive + 401 interceptor + token refresh
│   └── tokenStore.ts
└── constants/
    ├── config.ts                     # API_BASE_URL
    └── theme.ts                      # T design tokens
```

**Path alias:** `@/*` razrješuje iz `mobile/`. Uvijek koristi `@/features/...`, `@/components/...`, `@/utils/...` umjesto relativnih putanja.

**Pravilo veličine:** route datoteke ostaju tanke (samo data fetch + kompozicija). Pojedinačne komponente uglavnom ispod ~200 redaka.

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
| Welcome / Splash              | `/`                        | Chess-pattern logo, red glow, "Započni" + "Već imam račun" |
| Login                         | `/login`                   | "Dobrodošli natrag." — prijava korisnika, pohranjuje JWT |
| Registracija                  | `/register`                | "Pridruži se tribinama." — kreiranje novog računa |
| Matches (tab 1)               | `/(tabs)`                  | Feed utakmica po kolu, round selector pill, live strip, kartice s rezultatima |
| Clubs (tab 2)                 | `/(tabs)/clubs`            | Lista svih klubova, pretraga po imenu, toggle omiljenog (srce) |
| Top Rated (tab 3)             | `/(tabs)/top-rated`        | Placeholder — "Uskoro" |
| Profile (tab 4)               | `/(tabs)/profile`          | Profil korisnika, omiljeni klub, odjava |
| Detalji kluba                 | `/club/[id]`               | Kompaktni hero, toggle omiljenog, filter Nadolazeće/Prošle, istaknuta sljedeća utakmica |
| Detalji utakmice (prošle)     | `/match/[id]`              | Score hero, "Ocijeni utakmicu" CTA, tabovi: Komentari / Postava / Statistika |
| Detalji utakmice (nadolazeće) | `/match/[id]`              | Kolo, datum, sudac, stadion — bez ocjenjivanja |
| Ocjenjivanje utakmice         | `modal` unutar `/match/[id]` | Card-stack modal: ocjena 1–10, atmosfera/sudac ★, MVP na terenu, review |

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
| `getMatchStatistics`   | GET    | `/api/matches/{id}/statistics` | Statistike utakmice (shots, cards, possession…); 204 za nedovršene utakmice; cachira se u DB |
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

- Sav UI je na **hrvatskom** — koristi inline hardkodirane stringove, bez i18n biblioteke. Datumi koriste `hr-HR` locale (preko utility funkcija u `utils/date.ts`).
- Design tokens u `T` objektu (`constants/theme.ts`) — **ne koristiti hardkodirane boje**
- `getMatchesByRound` poziva `/api/matches?round={n}` — ako backend ne podržava ovaj endpoint, Matches tab će prikazati error state
- Backend vraća `accessToken` (ili `token` kao fallback) pri loginu
- Nema state managementa (Redux/Zustand) — React Context
- Nema axios — native `fetch`
- `router.replace('/')` iz tab screena navigira na root welcome ekran (ne unutar taba)
- Rating modal u match detailima je `Modal` komponenta (presentationStyle: `pageSheet`) — otvara se pritiskom na "Ocijeni utakmicu" CTA
- Velike datoteke su rastavljene u `features/<area>/` i `components/`. Route datoteke u `app/` su tanke i samo kompoziraju.
