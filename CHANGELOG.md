# Changelog

All notable changes to let's.get.smarter are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioning follows [Semantic Versioning](https://semver.org/).

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

---

## [1.0.1] — 2026-05-08

### Fixed
- View count now increments once per visit, not on every tab switch
- Knowledge base restricted to authenticated users only
- Google OAuth button now uses relative URL — works in production

### Changed
- Material creation and editing now uses a 3-step flow:
  Metadata → Content → Review before publishing
- Draft auto-saves to localStorage so work is never lost mid-flow
