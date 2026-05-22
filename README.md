# let's.get.smarter

A private knowledge sharing platform for a group of friends from different academic backgrounds. Share, discover, and explore knowledge across fields — technology, health, law, business, science, and more — with a built-in rich text editor and AI-powered assistant.

---

## Current version
v1.1.0 — [Release notes](https://github.com/TheVinh-Ha-1710/LGS-knowledge-sharing-platform/releases/tag/v1.1.0)

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TanStack Query, TipTap |
| Backend | Node.js, Express |
| Database | PostgreSQL |
| Auth | JWT (httpOnly cookies), Google OAuth (Passport.js) |
| Schema | node-pg-migrate |

---

## Prerequisites

- Node.js v18+
- PostgreSQL server running locally or remotely
- A Google Cloud project with OAuth 2.0 credentials (for Google login)

---

## Environment variables

Create a `.env` file in the project root with the following:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/your_database_name
JWT_SECRET=a-long-random-secret-string
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NODE_ENV=development
```

> Never commit `.env` to version control. It is listed in `.gitignore`.

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/lets-get-smarter.git
cd lets-get-smarter
```

### 2. Install backend dependencies

```bash
npm install
```

### 3. Install frontend dependencies

```bash
cd client
npm install
cd ..
```

### 4. Set up the database

Create a PostgreSQL database, then run migrations:

```bash
npm run migrate:up
```

### 5. Seed the fields

Connect to your database and run:

```sql
INSERT INTO fields (name, slug, icon, description) VALUES
  ('Technology', 'technology', '💻', 'Programming, networks, cybersecurity, AI and everything digital'),
  ('Health & Medicine', 'health-medicine', '🏥', 'Nursing, anatomy, pharmacology and healthcare practice'),
  ('Law & Policy', 'law-policy', '⚖️', 'Civil law, criminal law, contracts and public policy'),
  ('Business', 'business', '📊', 'Finance, marketing, management and entrepreneurship'),
  ('Science', 'science', '🔬', 'Biology, chemistry, physics and research methods'),
  ('General', 'general', '🌐', 'Life skills, philosophy, cross-discipline and everything else');
```

---

## Running locally

You need two terminals running simultaneously.

**Terminal 1 — backend (port 3000):**

```bash
node server.js
```

**Terminal 2 — frontend (port 5173):**

```bash
cd client
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Google OAuth setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project → APIs & Services → Credentials → Create OAuth 2.0 Client ID
3. Set **Authorized redirect URI** to: `http://localhost:3000/api/auth/google/callback`
4. Copy the Client ID and Secret into your `.env` file

---

## Project structure

```
lets-get-smarter/
├── server.js              # Express app entry point
├── auth.js                # Password hashing, JWT, registration logic
├── passport.js            # Google OAuth strategy
├── db.js                  # PostgreSQL connection pool
├── middleware/
│   └── requireAuth.js     # JWT verification middleware
├── routes/
│   ├── auth.js            # Auth endpoints
│   ├── materials.js       # Materials CRUD endpoints
│   ├── fields.js          # Fields endpoint
│   ├── reactions.js       # Reactions endpoints
│   ├── reads.js           # Read tracking endpoints
│   ├── stats.js           # Leaderboard and trending endpoints
│   ├── users.js           # User profile endpoints
│   └── notes.js           # Personal notes endpoints
├── migrations/            # Database migration files
├── seed.js                # Fields seed script
├── .env                   # Environment variables (not committed)
└── client/                # React frontend (Vite)
    └── src/
        ├── api.js         # Centralised fetch functions
        ├── utils.jsx      # Shared components and helpers
        ├── context/
        │   ├── AuthContext.jsx
        │   └── EditorContext.jsx
        ├── components/
        │   ├── Navbar.jsx
        │   ├── ProtectedRoute.jsx
        │   ├── EditorToolbar.jsx
        │   ├── StepIndicator.jsx
        │   ├── Reactions.jsx
        │   ├── ReadStatus.jsx
        │   └── Notes.jsx
        └── pages/
            ├── LoginPage.jsx
            ├── RegisterPage.jsx
            ├── DashboardPage.jsx
            ├── ExplorePage.jsx
            ├── MaterialPage.jsx
            ├── ProfilePage.jsx
            ├── AuthCallback.jsx
            └── editor/
                ├── MetadataStep.jsx
                ├── ContentStep.jsx
                └── ReviewStep.jsx
```

---

## Scripts

| Command | Description |
|---|---|
| `node server.js` | Start the backend server |
| `npm run migrate:up` | Apply pending migrations |
| `npm run migrate:down` | Roll back the last migration |
| `npm run migrate:create -- name` | Create a new migration file |
| `cd client && npm run dev` | Start the frontend dev server |
| `cd client && npm run build` | Build the frontend for production |
