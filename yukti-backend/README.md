# YUKTI Backend (FastAPI)

## Phase 3 mein kya add hua

- `app/core/security.py` — password hashing (bcrypt) + JWT create/decode
- `app/schemas/auth.py` — Login/Token schemas
- `app/api/deps.py` — `get_current_user`, `require_roles(...)` dependency
- `app/api/routes/auth.py` — `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `app/api/routes/users.py` — admin-only user verification routes (role-based access demo)
- `scripts/create_admin.py` — bootstrap the first admin account from the terminal

Citizen/Admin accounts are usable immediately after registering (`is_verified=True` by
default). University/Industry accounts self-register but stay `is_verified=False`
until an admin approves them via `PATCH /api/users/{id}/verify` — matches the
rule already written into `app/models/user.py`.

## Local setup

1. **PostgreSQL + PostGIS** — easiest is a free Supabase project (PostGIS extension
   is one click to enable in Supabase's dashboard, under Database → Extensions).
   Alternatively run Postgres+PostGIS locally via Docker:
   ```bash
   docker run -d --name yukti-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgis/postgis:16-3.4
   ```

2. **Python env**
   ```bash
   cd yukti-backend
   python -m venv venv
   source venv/bin/activate        # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` — set `DATABASE_URL` to your Supabase/local connection string, and
   set `SECRET_KEY` to a long random string (e.g. `python -c "import secrets; print(secrets.token_hex(32))"`).

4. **Enable PostGIS** on the database once (Supabase: Database → Extensions → postgis;
   local Docker image above already has it):
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```

5. **Run the server**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   - Health check: http://localhost:8000/
   - Interactive API docs (Swagger): http://localhost:8000/docs — click "Authorize"
     after logging in to test protected routes with your token.

6. **Create the first admin**
   ```bash
   python -m scripts.create_admin
   ```

## Quick test flow (via `/docs` or `curl`)

```bash
# Register a citizen
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Citizen","email":"citizen@example.com","password":"Passw0rd!","role":"citizen"}'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"citizen@example.com","password":"Passw0rd!"}'
# -> copy the access_token from the response

# Call a protected route
curl http://localhost:8000/api/auth/me -H "Authorization: Bearer <access_token>"
```

## Connecting the React frontend

The frontend's `AuthContext.jsx` currently fakes login with `localStorage` and a
`'mock-jwt-token'` string, and `login.jsx` never calls the API. That's the next
integration step (see "What's next" below) — point `services/api.js` at
`http://localhost:8000/api`, call the real `/api/auth/login`, and store the real
`access_token` instead of the mock string.

## Phase 5 mein kya add hua (university/industry collaboration + pipeline)

- `app/api/routes/universities.py` — `POST/GET /api/universities/me`, plus
  `POST /api/universities/me/capabilities` and `.../faculty` to build up a profile
- `app/api/routes/industries.py` — same pattern for industry accounts
- `app/api/routes/claims.py` — the actual matching pipeline:
  - `POST /api/claims` (**admin**) — proposes "this problem suits this
    university/industry" (this is a manual stand-in for Phase 6's AI matching —
    same request/response shape, so swapping it later is a small change)
  - `GET /api/claims/mine` (**university/industry**) — claims proposed to you
  - `GET /api/claims` (**admin**) — all claims, filter by `problem_id`/`status`
  - `PATCH /api/claims/{id}/respond` (**the claimed org**) — accept or reject.
    Accept → problem moves to `in_progress` and a `Project` row is auto-created.
    Reject → problem goes back to `verified` so admin can propose someone else.
- `app/api/routes/projects.py` — tracks execution after a claim is accepted:
  `GET /api/projects/mine`, `GET /api/projects` (admin), `GET/PATCH /api/projects/{id}`
  for updating `milestones`/`status` as work progresses.

### Typical flow to test end-to-end

1. Citizen registers → submits a problem (`POST /api/problems`)
2. Admin verifies it (`PATCH /api/problems/{id}/status` → `verified`)
3. A university registers, gets admin-verified, creates its profile (`POST /api/universities/me`)
4. Admin proposes a match (`POST /api/claims`, `claimant_type: university`, `university_id: ...`)
5. University checks `GET /api/claims/mine`, then `PATCH /api/claims/{id}/respond` → `accepted`
6. Problem is now `in_progress`; a `Project` exists — check `GET /api/projects/mine`

## Phase 6 mein kya add hua (AI/ML matching + duplicate detection)

`app/ai/` — three independent pieces, split by job (per the tech-stack doc: don't
use one model for everything):

- **`embeddings.py`** — Sentence Transformers (`all-MiniLM-L6-v2`), lazy-loaded
  on first use so the server still starts instantly. Every submitted problem
  gets a 384-dim embedding stored in `problems.embedding` (plain JSON column —
  no pgvector needed at this scale).
- **`duplicates.py`** — brute-force cosine similarity against other problems in
  the same domain. `POST /api/problems` now returns `possible_duplicates` in
  the response (id, title, similarity) so the frontend can warn the citizen
  before they finish submitting.
- **`matching.py`** — scores each university/industry against a problem using
  three signals: the existing `UniversityCapability.score` (deterministic),
  semantic similarity between the problem and faculty specializations
  (Sentence Transformers), and TF-IDF keyword overlap (scikit-learn). Combined
  into one `match_score` (0-100) with a `match_breakdown`, `matched_skills`,
  and plain-English `why_matched` reasons.
- **`gemini.py`** — natural-language only (a 2-3 sentence summary of a problem
  for a partner deciding whether to take it on). Never makes decisions or
  touches the database — that stays deterministic Python, per the stack doc's
  own rule.

New/changed endpoints:

- `GET /api/matching/suggestions/{problem_id}` (**admin**) — ranks every
  university/industry against a problem so admin knows who to propose a claim
  to, before calling the existing `POST /api/claims`.
- `POST /api/claims` now **auto-computes** `match_score`/`match_breakdown`/
  `matched_skills`/`why_matched` for whichever org is chosen — admin no longer
  fills those in manually.
- `GET /api/problems/{id}/summary` (**admin/university/industry**) — Gemini
  summary. Returns `503` if `GEMINI_API_KEY` isn't set in `.env` yet — that's
  expected until you get a key from https://aistudio.google.com/apikey.

**New Python packages**: `sentence-transformers`, `scikit-learn`, `numpy` — run
`pip install -r requirements.txt` again after pulling this. First request that
touches embeddings will take a bit longer as the model downloads once and
caches locally.

## Phase 7 mein kya add hua (maps + dashboards)

- `GET /api/geo/problems` — GeoJSON `FeatureCollection` of all problems that have
  a location. Filter with `?domain=` / `?status_filter=`. Feed the response
  straight into a Leaflet `L.geoJSON(...)` layer on the frontend — no
  transformation needed. Problems submitted without coordinates are silently
  skipped (not an error).
- `GET /api/dashboard/summary` — one call for the whole dashboard landing page:
  totals + breakdowns by status/domain/priority (problems), by status (claims,
  projects), and org counts. Shape each `by_*` list straight into an ECharts
  pie or bar chart (`label`/`count` pairs).
- `GET /api/dashboard/trends?days=30` — problems submitted per day for the last
  N days (days 7–365), zero-filled for days with no submissions — feed
  straight into an ECharts line chart.

Both are open to any authenticated role — nothing in them is sensitive, and a
citizen dashboard showing overall progress is part of the point of the platform.

**New Python package**: `shapely` (geoalchemy2 needs it to convert PostGIS
points into plain lon/lat) — `pip install -r requirements.txt` again.

## Phase 8 mein kya add hua (notifications)

Two parts, deliberately separate so one never depends on the other working:

- **In-app notifications** (`app/models/notification.py`, always works) —
  every notable event writes a `Notification` row. Frontend polls
  `GET /api/notifications/mine` (or `?unread_only=true`) for a bell-icon list,
  and marks one read with `PATCH /api/notifications/{id}/read`.
- **Push via FCM** (`app/core/fcm.py`, best-effort) — if `FCM_PROJECT_ID` and
  `FCM_SERVICE_ACCOUNT_FILE` are set, the same event also tries to push to
  every device token the user registered via
  `POST /api/notifications/register-device`. If FCM isn't configured yet, or
  a push fails, it's logged and silently skipped — it never breaks the API
  call that triggered it (e.g. admin verifying a problem always succeeds,
  whether or not the citizen's phone gets a push).

Wired into three events so far: problem verified → notifies the citizen;
claim proposed → notifies the university/industry; claim accepted → notifies
the citizen. Add more calls to `notify_user(db, user_id, title, body, data)`
(from `app.services.notifications`) wherever else the team wants one.

**Getting FCM credentials** (needed only for actual push, not for the in-app
list): Firebase Console → your project → Project Settings → Service accounts
→ "Generate new private key". Save the downloaded JSON somewhere in the repo
(it's already in `.gitignore` — never commit it), and set
`FCM_SERVICE_ACCOUNT_FILE` to its path plus `FCM_PROJECT_ID` in `.env`. The
old "server key" / legacy FCM API is retired — this uses the current HTTP v1
API, which is why a full service account is needed instead of a single key
string.

**New Python package**: `google-auth` — `pip install -r requirements.txt` again.

## What's next (not in this phase)

- **Alembic migrations** — replace `Base.metadata.create_all` once the schema is
  stable enough that you need versioned migrations instead of drop/recreate.
- **Wire the frontend** to real endpoints instead of the current mock/localStorage auth.
- **Deployment (Phase 9)** — Vercel (frontend) + Render (FastAPI) + Sentry, per
  the tech-stack doc.
