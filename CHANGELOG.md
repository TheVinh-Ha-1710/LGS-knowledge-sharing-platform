# Changelog

All notable changes to let's.get.smarter are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioning follows [Semantic Versioning](https://semver.org/).

---

## [1.1.3] — 2026-06-01

### Added
- Table support in the rich text editor

---

## [1.1.2] — 2026-05-28

### Added
- Image upload in the editor via Cloudinary — 5MB limit, auto-optimised to WebP, max 1200px width
- Code block language selection in the editor toolbar
- Word count display in the editor

---

## [1.1.1] — 2026-05-25

### Added
- Dark/light mode toggle with system preference detection and localStorage persistence
- Toast notification system (success, error, info) with auto-dismiss
- ErrorBoundary component — catches render errors and shows a reload prompt

### Changed
- Full visual redesign — new CSS variable system, updated typography, spacing, and component styles
- Mobile responsiveness improvements across all pages

---

## [1.1.0] — 2026-05-22

### Added
- Reactions — helpful, mindblown, needs work with toggle behaviour
- Read tracking — mark as read and mark as complete per user per material
- Learning streaks — current and longest streak calculated from completion history
- Profile pages — own full profile and public limited view per user
- Personal notes — private per-user notes on materials with profile preview
- Leaderboard — top 10 contributors by material count on dashboard
- Trending materials — top 5 by view count on dashboard
- Clickable author names linking to user profiles

### Changed
- Dashboard updated with leaderboard, trending and streak stat card
- Navbar shows streak indicator when user has an active streak

---

## [1.0.1] — 2026-05-08

### Fixed
- View count now increments once per visit, not on every tab switch
- Knowledge base restricted to authenticated users only
- Google OAuth button now uses relative URL — works in production
- trust proxy added for Railway reverse proxy

### Changed
- Material creation and editing now uses a 3-step flow:
  Metadata → Content → Review before publishing
- Draft auto-saves to localStorage so work is never lost mid-flow

---

## [1.0.0] — 2026-05-06

First stable release. MVP delivered and ready for use by the core group.

### Added

**Authentication**
- Email and password registration with bcrypt hashing
- JWT-based sessions stored in httpOnly cookies
- Google OAuth login via Passport.js
- Token blocklist for real server-side logout
- Password strength enforcement via zxcvbn (score ≥ 3 required)
- Rate limiting on login (10/15min), register (5/hour), and OAuth routes
- Login attempt tracking in database (success and failure)
- `last_login` timestamp updated on every login

**Knowledge base**
- Create, read, update, and delete materials
- Rich text editor powered by TipTap with full toolbar
- Syntax-highlighted code blocks via lowlight
- Support for headings, lists, blockquotes, inline code, and horizontal rules
- Automatic slug generation from material titles
- Field categorisation across 6 predefined fields
- User-generated tags with find-or-create logic
- Difficulty ratings: beginner, intermediate, advanced
- View count tracking per material

**Browse and discover**
- Explore page with filterable material grid
- Filter by field and difficulty simultaneously
- Color-coded field accent bars on material cards
- Color-coded difficulty badges

**Dashboard**
- Welcome screen with username greeting
- Community stats: total materials, contributors, fields covered
- Recently added materials feed (latest 6)

**UI**
- Dark tech theme with cyan accent color
- Responsive card grid layout
- Sticky frosted glass navbar
- Filter chips with active state
- Rich text content rendered safely via DOMPurify

**Database**
- PostgreSQL with connection pooling via `pg`
- Full schema migration system via `node-pg-migrate`
- Tables: users, fields, materials, tags, material_tags, reads, reactions, blocklist, login_attempts, user_profiles

**Infrastructure**
- Environment variable management via dotenv
- CORS configured for cross-origin React frontend
- Vite proxy for clean API calls in development

