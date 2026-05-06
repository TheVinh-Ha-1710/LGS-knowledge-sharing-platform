# Architecture

This document explains the structure of let's.get.smarter and the reasoning behind key decisions.

---

## Overview

The application follows a classic three-tier architecture:

```
Browser (React)
    ↕ HTTP (fetch with cookies)
Express API (Node.js)
    ↕ SQL (pg pool)
PostgreSQL Database
```

The frontend and backend run as separate processes on different ports during development. In production they would sit behind a reverse proxy like Nginx.

---

## Backend layers

The backend is deliberately split into three layers, each with a single responsibility:

```
routes/          ← HTTP layer: receives requests, validates input, sends responses
auth.js          ← Business logic layer: hashing, JWT signing, database queries
db.js            ← Data layer: connection pool, schema initialisation
```

This separation means the HTTP layer doesn't care how passwords are hashed, and the business logic layer doesn't care what HTTP status code to return. Each layer can be changed independently.

**Why not put everything in `server.js`?**
The original prototype had all logic in `server.js`. As the app grew it became unmanageable. Route files under `routes/` keep each feature self-contained. `auth.js` in the root contains pure functions that can be tested without spinning up an HTTP server.

---

## Authentication system

Authentication uses JWTs stored in httpOnly cookies — not localStorage. This protects tokens from JavaScript-based XSS attacks.

### Email/password flow

```
POST /api/login
  → validate input
  → bcrypt.compare(password, stored_hash)
  → jwt.sign({ id, email }, JWT_SECRET, { expiresIn: '1h' })
  → res.cookie('token', token, { httpOnly: true })
```

### Google OAuth flow

```
GET /api/auth/google
  → redirect to Google consent screen

GET /api/auth/google/callback
  → Passport exchanges code for profile
  → find or create user by google_id
  → jwt.sign(...)
  → redirect to /auth/callback?token=...

POST /api/login/callback (React)
  → verify token
  → res.cookie(...)
  → navigate to /dashboard
```

The OAuth callback uses a URL token handoff rather than setting the cookie directly on the redirect. This is necessary because cookies set on cross-origin redirects are not reliably sent by the browser.

### Token blocklist

JWTs are stateless — once issued they cannot be invalidated until they expire. To support real logout, invalidated tokens are stored in a `blocklist` table. Every request to a protected route checks this table before trusting the token.

Expired blocklist entries are cleaned up hourly via `setInterval` in `db.js`.

### Why not sessions?

Sessions require server-side state storage (Redis or a database table). JWTs are stateless — the server doesn't need to store anything to verify them. For a small app with low traffic, JWTs are simpler and scale better. The blocklist adds a small amount of state back, but only for the window between logout and natural token expiry (max 1 hour).

---

## Database schema

```
users
  ├── id, email, password (nullable for OAuth users)
  ├── google_id (nullable for email/password users)
  └── last_login

fields
  └── id, name, slug, icon, description

materials
  ├── id, title, slug, content (TipTap HTML)
  ├── author_id → users
  ├── field_id → fields
  ├── difficulty, published, view_count
  └── created_at, updated_at

tags
  └── id, name, slug

material_tags (join table)
  ├── material_id → materials
  └── tag_id → tags

reads
  ├── user_id → users
  ├── material_id → materials
  └── read_at, completed

reactions
  ├── user_id → users
  ├── material_id → materials
  └── type (helpful | mindblown | needs_work)

blocklist
  ├── token (PRIMARY KEY)
  └── expires_at

login_attempts
  ├── user_id → users
  ├── success, ip_address
  └── attempted_at

user_profiles
  ├── user_id → users
  └── display_name, created_at
```

### Schema management

All schema changes go through migration files in `migrations/`. The `node-pg-migrate` library tracks which migrations have been applied in a `pgmigrations` table.

**Why not `CREATE TABLE IF NOT EXISTS` in code?**
`IF NOT EXISTS` only handles table creation. It cannot add columns, change constraints, or rename things once a table exists. Migrations handle the full lifecycle of schema evolution — every change is versioned, reversible, and tracked in git alongside the code that depends on it.

---

## Frontend architecture

The React frontend uses a context + React Query pattern:

```
AuthContext          ← global auth state (user, login, logout, checkAuth)
React Query          ← server state (materials, fields) with caching
Component state      ← local UI state (form inputs, selected filters)
```

**Why React Query instead of plain fetch + useState?**
React Query handles loading states, error states, caching, and background refetching automatically. Without it, every component that fetches data needs its own `isLoading`, `error`, and `data` state plus a `useEffect` to trigger the fetch. React Query reduces this to a single `useQuery` call and provides cache invalidation so pages update automatically after mutations.

### Protected routes

`ProtectedRoute` wraps any route that requires authentication. It checks the `user` from `AuthContext` — if null, redirects to `/login`. A `loading` state prevents the redirect from firing before `checkAuth()` has completed.

### Rich text editor

TipTap is used for the material editor. Content is stored as HTML in the `content` column of the `materials` table. On the read side, `DOMPurify.sanitize()` cleans the HTML before rendering via `dangerouslySetInnerHTML` to prevent XSS.

---

## Security measures

| Threat | Mitigation |
|---|---|
| Password theft via DB breach | bcrypt hashing with 10 salt rounds |
| Token theft via XSS | httpOnly cookies — JS cannot read the token |
| Token theft via network | Secure cookie flag in production (HTTPS only) |
| Brute force login | Rate limiting — 10 attempts per 15 minutes per IP |
| Weak passwords | zxcvbn strength check — score must be ≥ 3 |
| Session persistence after logout | Token blocklist in database |
| CSRF via cross-origin requests | CORS restricted to known frontend origin |
| Unauthorised material edits | Ownership check — `author_id` must match `req.user.id` |
| Malicious HTML content | DOMPurify sanitisation before rendering |

---

## Key decisions log

**Why PostgreSQL over MongoDB?**
Materials have clear relational structure — users author materials, materials belong to fields, materials have many tags, users read materials. These relationships are better expressed as foreign keys with JOIN queries than as nested documents. PostgreSQL also provides stronger consistency guarantees which matter for auth data.

**Why a monorepo (frontend + backend in one folder)?**
The app is a solo MVP targeting a small group. Separate repositories add overhead — two deployment pipelines, two sets of environment variables, more context switching. The frontend and backend are tightly coupled at this stage. Splitting is straightforward if the project outgrows a single repo.

**Why TipTap over a markdown editor?**
The group includes non-technical members (nursing, law). A WYSIWYG editor with a toolbar is more accessible than asking everyone to learn Markdown syntax. TipTap provides the same output as Markdown (HTML) with a familiar word-processor interface.

**Why store content as HTML instead of TipTap's JSON format?**
HTML is portable — it can be rendered anywhere without TipTap. TipTap's JSON format is editor-specific and would lock rendering to TipTap. If the editor is ever replaced or content is displayed outside the app, HTML requires no conversion.
