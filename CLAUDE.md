# let's.get.smarter

## Project overview
Private knowledge sharing platform for a group of friends.
Full-stack monorepo — Express backend + React frontend.

## Stack
- Backend: Node.js + Express, PostgreSQL, node-pg-migrate
- Frontend: React + Vite, TanStack Query, TipTap rich text editor
- Auth: JWT (httpOnly cookies), Google OAuth (Passport.js)
- Deployment: Railway (auto-deploy from GitHub main branch)
- Live URL: https://lgs-knowledge-sharing-platform-production.up.railway.app

## File structure
- server.js — Express entry point
- routes/ — one file per feature (auth, materials, fields, reactions, reads, stats, users, notes, upload)
- migrations/ — node-pg-migrate files
- client/src/ — React frontend
  - pages/ — one file per page
  - components/ — shared components
  - context/ — AuthContext, EditorContext, ToastContext
  - hooks/ — useTheme
  - api.js — all fetch functions

## Database
PostgreSQL. Tables: users, user_profiles, fields, materials, tags, 
material_tags, reads, reactions, notes, blocklist, login_attempts, streaks

## Key conventions
- All API routes prefixed /api
- requireAuth middleware for protected routes
- Migrations required for all schema changes — never ALTER TABLE manually
- Feature branches → merge to main → Railway auto-deploys
- Semantic versioning: feat/vX.X.X-description

## Current version
v1.1.3 — tables in editor

## Commands
- node server.js — start backend (port 3000)
- cd client && npm run dev — start frontend (port 5173)
- npm run migrate:up — run pending migrations
- npm run migrate:create -- name — create new migration