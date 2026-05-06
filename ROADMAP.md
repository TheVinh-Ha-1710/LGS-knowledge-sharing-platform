# Roadmap

This document tracks the current state of let's.get.smarter and what's planned next.

---

## Current — v1.0.0 (MVP)

Core knowledge sharing platform with authentication and rich text editing.

- ✅ Email/password and Google OAuth authentication
- ✅ Create, read, update, delete materials
- ✅ Rich text editor with syntax-highlighted code blocks
- ✅ Field categorisation and difficulty ratings
- ✅ User-generated tags
- ✅ Browse and filter materials by field and difficulty
- ✅ View count tracking
- ✅ Community dashboard with basic stats

---

## Next — v1.1.0 (Engagement)

Features that encourage active participation and return visits.

- [ ] Reactions on materials (helpful, mind blown, needs work)
- [ ] Read tracking — mark materials as completed
- [ ] Learning streaks — consecutive days with activity
- [ ] Personal profile page — your contributions and reading history
- [ ] Contributor leaderboard on dashboard
- [ ] Trending materials — most viewed in last 7 days
- [ ] Personal notes/annotations on materials (private)

---

## Next — v1.2.0 (Discovery)

Features that make it easier to find relevant content.

- [ ] Full text search across material titles and content
- [ ] Tag-based browsing — click a tag to see all materials with it
- [ ] Related materials on the material reader page
- [ ] "New since last visit" indicator on dashboard
- [ ] Weekly digest email — what was added this week

---

## Next — v1.3.0 (AI assistant)

AI-powered learning features using the knowledge base as context.

- [ ] Chatbot with access to all materials (simple RAG)
- [ ] "Explain this to me like I'm from [field]" — contextualised explanations
- [ ] Quiz mode — AI generates questions from a material
- [ ] Summarise — quick summary of any material
- [ ] Development: Ollama (local, free) → Production: Anthropic API

---

## Future — v2.0.0 (Platform)

Larger features for when the platform has more users and content.

- [ ] File attachments on materials (PDFs, images)
- [ ] Collections — curate a reading list
- [ ] Cross-field challenge — read outside your discipline
- [ ] Contributor badges and milestones
- [ ] Admin panel — manage users, fields, and featured content
- [ ] Deployment — HTTPS, managed PostgreSQL, CI/CD
- [ ] Mobile-optimised layout
- [ ] Optional: sidebar navigation (Option C design)

---

## Ideas backlog

Not prioritised yet — things worth considering.

- Difficulty voting — community can suggest a different difficulty rating
- "Prerequisites" links between materials
- Verified by field — cross-discipline endorsement system
- Dark/light mode toggle
- Export material as PDF
- Embed code snippets with live preview (for IT materials)
- Public/private toggle per material

---

## Won't do (for now)

- Real-time collaboration on materials — too complex for this scale
- Native mobile app — web is sufficient for the group
- Public access — this is a private group platform
