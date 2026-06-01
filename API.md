# API Reference

Base URL: `http://localhost:3000/api`

All endpoints return JSON. Protected endpoints require a valid session cookie (`token`) set during login.

---

## Authentication

### POST /auth/register

Create a new account.

**Auth required:** No

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "strongpassword123"
}
```

**Success response `201`:**
```json
{
  "message": "User created!",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

**Error responses:**
- `400` — Email and password are required
- `400` — User already exists
- `400` — Password is too weak
- `429` — Too many accounts created. Try again later.

---

### POST /auth/login

Authenticate and receive a session cookie.

**Auth required:** No

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "strongpassword123"
}
```

**Success response `200`:**
```json
{ "message": "Logged in!" }
```

Sets `token` httpOnly cookie on the response.

**Error responses:**
- `400` — Email and password are required
- `401` — Invalid credentials
- `429` — Too many login attempts. Try again in 15 minutes.

---

### POST /auth/logout

Invalidate the current session.

**Auth required:** No (but uses the cookie if present)

**Success response `200`:**
```json
{ "message": "Logged out!" }
```

Clears the `token` cookie and adds it to the blocklist.

---

### GET /auth/me

Get the currently authenticated user.

**Auth required:** Yes

**Success response `200`:**
```json
{
  "message": "Hello!",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "iat": 1714500000,
    "exp": 1714503600
  }
}
```

**Error responses:**
- `401` — Not logged in
- `401` — Token has been invalidated. Please log in again.

---

### GET /auth/google

Redirect to Google OAuth consent screen.

**Auth required:** No

Redirects the browser to Google. No JSON response.

---

### GET /auth/google/callback

OAuth callback — handled by Passport. Redirects to `/auth/callback?token=...` on the frontend.

---

### POST /auth/login/callback

Exchange an OAuth token for a session cookie. Called by the React `AuthCallback` page.

**Auth required:** No

**Request body:**
```json
{ "token": "jwt-token-string" }
```

**Success response `200`:**
```json
{ "message": "Session established" }
```

Sets `token` httpOnly cookie on the response.

---

## Fields

### GET /fields

Get all knowledge fields.

**Auth required:** No

**Success response `200`:**
```json
[
  {
    "id": 1,
    "name": "Technology",
    "slug": "technology",
    "icon": "💻",
    "description": "Programming, networks, cybersecurity...",
    "created_at": "2026-04-24T00:00:00.000Z"
  }
]
```

---

## Materials

### GET /materials

Get all published materials with optional filters.

**Auth required:** No

**Query parameters:**

| Parameter | Type | Description |
|---|---|---|
| `field` | string | Filter by field slug (e.g. `technology`) |
| `difficulty` | string | Filter by difficulty (`beginner`, `intermediate`, `advanced`) |

**Success response `200`:**
```json
[
  {
    "id": 1,
    "title": "Introduction to React",
    "slug": "introduction-to-react",
    "difficulty": "beginner",
    "view_count": 42,
    "created_at": "2026-05-01T00:00:00.000Z",
    "author_email": "user@example.com",
    "field_name": "Technology",
    "field_slug": "technology",
    "field_icon": "💻"
  }
]
```

Note: List response does not include `content` or `tags` — use the single material endpoint for full data.

---

### GET /materials/:slug

Get a single material by slug. Increments `view_count`.

**Auth required:** No

**Success response `200`:**
```json
{
  "id": 1,
  "title": "Introduction to React",
  "slug": "introduction-to-react",
  "content": "<h1>Introduction</h1><p>React is...</p>",
  "author_id": 1,
  "field_id": 1,
  "difficulty": "beginner",
  "published": true,
  "view_count": 43,
  "created_at": "2026-05-01T00:00:00.000Z",
  "updated_at": "2026-05-01T00:00:00.000Z",
  "author_email": "user@example.com",
  "field_name": "Technology",
  "field_slug": "technology",
  "field_icon": "💻",
  "tags": [
    { "name": "react", "slug": "react" },
    { "name": "javascript", "slug": "javascript" }
  ]
}
```

**Error responses:**
- `404` — Material not found

---

### GET /materials/id/:id

Get a single material by ID. Used by the editor when loading an existing material for editing.

**Auth required:** No

**Success response `200`:** Same shape as `GET /materials/:slug` minus tags.

---

### POST /materials

Create a new material.

**Auth required:** Yes

**Request body:**
```json
{
  "title": "Introduction to React",
  "content": "<h1>Introduction</h1><p>React is...</p>",
  "field_id": 1,
  "difficulty": "beginner",
  "tags": ["react", "javascript"]
}
```

| Field | Required | Description |
|---|---|---|
| `title` | Yes | Material title — slug is auto-generated |
| `content` | No | HTML from TipTap editor |
| `field_id` | Yes | ID of the field category |
| `difficulty` | No | `beginner` (default), `intermediate`, or `advanced` |
| `tags` | No | Array of tag name strings |

**Success response `201`:** Full material object.

**Error responses:**
- `400` — Missing title or field ID
- `401` — Not logged in

---

### PUT /materials/:id

Update an existing material.

**Auth required:** Yes + must be the author

**Request body:** Same shape as POST (all fields optional).

**Success response `200`:** Updated material object.

**Error responses:**
- `401` — Not logged in
- `403` — Not authorised
- `404` — Not found

---

### DELETE /materials/:id

Delete a material. Also deletes related `material_tags` via CASCADE.

**Auth required:** Yes + must be the author

**Success response `200`:**
```json
{ "message": "Material deleted" }
```

**Error responses:**
- `401` — Not logged in
- `403` — Not authorised
- `404` — Not found

---

## Reactions

### GET /reactions/:materialId

Get reaction counts and current user's reaction for a material.

**Auth required:** Yes

**Success response `200`:**
```json
{
  "counts": [
    { "type": "helpful", "count": "5" },
    { "type": "mindblown", "count": "2" }
  ],
  "userReaction": "helpful"
}
```

`userReaction` is `null` if the user hasn't reacted.

---

### POST /reactions/:materialId

Toggle a reaction. Inserts, updates, or deletes depending on current state.

**Auth required:** Yes

**Request body:**
```json
{ "type": "helpful" }
```

Valid types: `helpful`, `mindblown`, `needs_work`

**Success response `200`:**
```json
{ "action": "added", "type": "helpful" }
```

`action` is one of `added`, `removed`, `updated`.

---

## Reads

### GET /reads/:materialId

Get current user's read status for a material.

**Auth required:** Yes

**Success response `200`:**
```json
{ "read": true, "completed": false }
```

---

### POST /reads/:materialId

Toggle read or completion state. Three state transitions:
- No record → mark as read (`completed: false`)
- Read but not completed → mark as complete (`completed: true`)
- Completed → toggle back to read (`completed: false`)

**Auth required:** Yes

**Success response `200`:**
```json
{ "action": "completed", "read": true, "completed": true }
```

`action` is one of `added`, `completed`, `uncompleted`.

---

## Stats

### GET /stats/leaderboard

Get top 10 contributors ranked by published material count.

**Auth required:** No

**Success response `200`:**
```json
[
  { "email": "user@example.com", "material_count": "12" }
]
```

---

### GET /stats/trending

Get top 5 most viewed published materials.

**Auth required:** No

**Success response `200`:**
```json
[
  {
    "id": 1,
    "title": "Introduction to React",
    "slug": "introduction-to-react",
    "view_count": 42,
    "author_email": "user@example.com",
    "field_name": "Technology",
    "field_slug": "technology",
    "field_icon": "💻"
  }
]
```

---

## Users

### GET /users/me

Get full profile for the logged-in user including stats, materials, reads and notes.

**Auth required:** Yes

**Success response `200`:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "created_at": "2026-05-01T00:00:00.000Z"
  },
  "stats": {
    "materials_authored": "5",
    "materials_read": "12",
    "materials_completed": "8",
    "reactions_received": "23",
    "fields_explored": "3",
    "current_streak": "3",
    "longest_streak": "7"
  },
  "materials": [...],
  "reads": [...],
  "notes": [...]
}
```

---

### GET /users/:username

Get public profile for any user. Username is the email prefix (e.g. `vinh` from `vinh@example.com`).

**Auth required:** No

**Success response `200`:**
```json
{
  "user": {
    "username": "vinh",
    "created_at": "2026-05-01T00:00:00.000Z"
  },
  "stats": {
    "materials_authored": "5",
    "reactions_received": "23"
  },
  "materials": [...]
}
```

**Error responses:**
- `404` — User not found

---

## Notes

### GET /notes/:materialId

Get current user's private note for a material.

**Auth required:** Yes

**Success response `200`:**
```json
{
  "note": {
    "id": 1,
    "content": "This was really helpful for understanding...",
    "created_at": "2026-05-06T10:00:00.000Z",
    "updated_at": "2026-05-06T10:00:00.000Z"
  }
}
```

Returns `{ "note": null }` if no note exists yet.

---

### POST /notes/:materialId

Create or update a note. Uses upsert — safe to call repeatedly.

**Auth required:** Yes

**Request body:**
```json
{ "content": "My private notes about this material..." }
```

**Success response `200`:**
```json
{
  "note": {
    "id": 1,
    "content": "My private notes about this material...",
    "created_at": "2026-05-06T10:00:00.000Z",
    "updated_at": "2026-05-06T11:30:00.000Z"
  }
}
```

**Error responses:**
- `400` — Note content cannot be empty

---

### DELETE /notes/:materialId

Delete a note permanently.

**Auth required:** Yes

**Success response `200`:**
```json
{ "message": "Note deleted" }
```

---

## Upload

### POST /upload

Upload an image to Cloudinary for use in material content.

**Auth required:** Yes

**Request:** `multipart/form-data` with a single field named `image`. Maximum file size: 5MB. Only image MIME types are accepted.

Images are stored in the `lgs-materials` Cloudinary folder and are automatically optimised — resized to a maximum width of 1200px, quality auto-compressed, and served as WebP where the browser supports it.

**Success response `200`:**
```json
{ "url": "https://res.cloudinary.com/..." }
```

**Error responses:**
- `400` — No file provided
- `400` — Only image files are allowed
- `401` — Not logged in
- `500` — Cloudinary upload error
