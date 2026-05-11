# Local Development Guide

## Quick start

### Backend

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

The `local` profile activates `application-local.yml`, which adds `classpath:db/seed` to
Flyway locations. On first run, Flyway applies **V9__seed_local_dev.sql** and populates the
database with all test data below.

> **Production note:** never include `db/seed` in production Flyway locations.
> The seed migration runs only when the `local` Spring profile is active.

### Frontend

```bash
cd frontend
npm run dev
```

Vite proxies API calls to `http://localhost:8080` via `VITE_API_BASE_URL` in `.env`.

---

## Test credentials

All accounts use the local database (`jdbc:postgresql://localhost:5432/soccer_dev`).

| Role   | Email                       | Password     | Redirects to  |
|--------|-----------------------------|--------------|---------------|
| Admin  | `admin@silverlake.test`     | `Admin1234!` | `/admin`      |
| Coach  | `coach@silverlake.test`     | `Coach1234!` | `/dashboard`  |
| Parent | `parent@silverlake.test`    | `Parent1234!`| `/parent`     |

### Registration codes (for testing self-service sign-up)

| Code                | Role   | Team              |
|---------------------|--------|-------------------|
| `SLSA-COACH-2025`   | Coach  | 2015 Boys Orange  |
| `SLSA-PARENT-2025`  | Parent | 2015 Boys Orange  |

---

## Seeded data

### Club
- **Silver Lake Soccer Academy** — Silver Lake, CA

### Season
- **2025-2026** (active)
  - Phase: Fall 2025 (Aug 1 – Dec 31, 2025)
  - Phase: Spring 2026 (Jan 1 – Jul 31, 2026)

### Competition
- **EDP** (LEAGUE)

### Team
- **2015 Boys Orange** — U10, Male, Competitive

### Players (all fictional)

| # | Name           | Position | Public profile |
|---|----------------|----------|----------------|
| 9 | Carlos Mendez  | ST       | ✓ (appears on leaderboard) |
| 8 | Diego Alvarez  | CM       | ✓ |
|11 | Ethan Brooks   | LW       | ✓ |
| 5 | Noah Kim       | CB       | ✗ (hidden from leaderboard) |
| 1 | Liam Chen      | GK       | ✗ |

### Relationships
- `parent@silverlake.test` is linked to **Carlos Mendez** only (other players are not visible to parent)
- `coach@silverlake.test` is assigned to **2015 Boys Orange**

### Matches
| # | Opponent       | Date       | H/A  | Score | Status    |
|---|----------------|------------|------|-------|-----------|
| 1 | FC Oakland     | ~3 wks ago | HOME | 3–1   | Finalized |
| 2 | Bay United FC  | ~2 wks out | AWAY | —     | Upcoming  |

### Stats (Match 1 — FC Oakland, finalized)

| Player        | Min | G | A | Shots | SoT | Saves | xG   | xA   |
|---------------|-----|---|---|-------|-----|-------|------|------|
| Carlos Mendez |  90 | 2 | 1 |   5   |  4  |   0   | 1.82 | 0.45 |
| Diego Alvarez |  90 | 1 | 0 |   3   |  2  |   0   | 0.75 | 0.12 |
| Ethan Brooks  |  90 | 0 | 2 |   1   |  0  |   0   | 0.08 | 0.72 |
| Noah Kim      |  70 | 0 | 0 |   1   |  0  |   0   | 0.04 | 0.00 |
| Liam Chen     |  90 | 0 | 0 |   0   |  0  |   3   | 0.00 | 0.00 |

### Evaluation (Match 1, Carlos Mendez, by coach)

| Attribute | Rating |
|-----------|--------|
| Overall   | 8 |
| Technical | 8 |
| Tactical  | 7 |
| Physical  | 8 |
| Mentality | 9 |
| Attacking | 9 |
| Defending | 5 |
| Decision Making | 7 |
| Work Rate | 9 |

- **Parent-visible notes:** shared with the parent dashboard
- **Coach-only notes:** present in DB but **never sent to parent** (stripped by `ParentEvaluationDto`)

### Development reports (Carlos Mendez)

| Title                                  | Approved | Visible to parent |
|----------------------------------------|----------|-------------------|
| Fall 2025 Mid-Season Assessment        | ✓        | ✓                 |
| Spring 2026 Pre-Season Assessment DRAFT| ✗        | ✗ (403 from server; UI also double-filters) |

---

## Verification checklist

### Public (no login)
- [ ] `GET /api/public/stats` returns Carlos, Diego, Ethan (public_profile_enabled=true)
- [ ] Noah and Liam do **not** appear (public_profile_enabled=false)
- [ ] `GET /api/public/players/{carlos_id}` returns profile without evaluations or reports
- [ ] `GET /api/public/teams/{team_id}/stats` returns team roster stats

### Admin (`admin@silverlake.test`)
- [ ] Redirected to `/admin` after login
- [ ] Can access all teams, players, matches

### Coach (`coach@silverlake.test`)
- [ ] Redirected to `/dashboard` after login
- [ ] Dashboard shows **2015 Boys Orange** and the two matches
- [ ] Team detail shows all 5 players on the roster
- [ ] Match detail for FC Oakland shows all 5 players with stats ✓ and evaluation ✓ for Carlos
- [ ] Stats entry page shows all 5 players with pre-filled stats
- [ ] Evaluation page for Carlos shows both `parentVisibleNotes` and `coachOnlyNotes`
- [ ] Can see the unapproved report for Carlos

### Parent (`parent@silverlake.test`)
- [ ] Redirected to `/parent` after login
- [ ] Only **Carlos Mendez** appears — not the other 4 players
- [ ] Stats tab shows Carlos's match stats
- [ ] Evaluations tab shows ratings and `parentVisibleNotes` — **no `coachOnlyNotes`**
- [ ] Reports tab shows only the **approved** Fall 2025 report
- [ ] Unapproved Spring 2026 draft is **not visible**
- [ ] No links to `/teams`, `/matches`, `/players`, `/admin` in the navbar
