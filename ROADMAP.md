# Roadmap

This document tracks the current state of let's.get.smarter and what's planned next.

---

## Shipped

### v1.0.0 — MVP ✅

Core knowledge sharing platform with authentication and rich text editing.

- ✅ Email/password and Google OAuth authentication
- ✅ Create, read, update, delete materials
- ✅ Rich text editor with syntax-highlighted code blocks
- ✅ Field categorisation and difficulty ratings
- ✅ User-generated tags
- ✅ Browse and filter materials by field and difficulty
- ✅ View count tracking
- ✅ Community dashboard with basic stats

### v1.0.1 — Stability & Editor ✅

- ✅ View count fix — increments once per visit not on tab switch
- ✅ Knowledge base restricted to authenticated users only
- ✅ Google OAuth button fixed for production
- ✅ trust proxy added for Railway reverse proxy
- ✅ 3-step editor — Metadata → Content → Review with draft auto-save

### v1.1.0 — Engagement Features ✅

- ✅ Reactions on materials — helpful, mindblown, needs work with toggle
- ✅ Read tracking — mark as read and mark as complete per user
- ✅ Learning streaks — current and longest streak from completion history
- ✅ Profile pages — own full profile and public limited view
- ✅ Contributor leaderboard on dashboard
- ✅ Trending materials on dashboard
- ✅ Personal notes on materials — private per-user with profile preview

---

## Upcoming

### v1.1.1 — UI Polish & Refinement

- [ ] Consistent spacing, typography and component styles
- [ ] Mobile responsiveness improvements
- [ ] Loading states and empty states polish
- [ ] Error handling and user feedback improvements

### v1.1.2 — Content Editor Improvements

- [ ] Improved toolbar with more formatting options
- [ ] Image upload support
- [ ] Better code block language selection
- [ ] Word count and reading time estimate

### v1.1.3 — Inline Highlights & Annotations

- [ ] Text selection → highlight with color
- [ ] Inline annotation attached to highlight
- [ ] Highlight persistence across edits
- [ ] Full annotations list on profile

### v1.2.0 — Discovery

Features that make it easier to find relevant content.

- [ ] Full text search across material titles and content
- [ ] Tag-based browsing — click a tag to see all materials with it
- [ ] Related materials on the material reader page
- [ ] "New since last visit" indicator on dashboard
- [ ] Weekly digest email — what was added this week

### v1.3.0 — AI Assistant

AI-powered learning features using the knowledge base as context.

- [ ] Chatbot with access to all materials (simple RAG)
- [ ] "Explain this to me like I'm from [field]" — contextualised explanations
- [ ] Quiz mode — AI generates questions from a material
- [ ] Summarise — quick summary of any material
- [ ] Development: Ollama (local, free) → Production: Anthropic API

### v2.0.0 — Platform

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
- Draft saving improvement — scope drafts to user ID to prevent cross-user 
  draft leakage on shared devices. Add timestamp and auto-expiry (7 days). 
  Consider server-side draft storage so drafts sync across devices.

---

## Won't do (for now)

- Real-time collaboration on materials — too complex for this scale
- Native mobile app — web is sufficient for the group
- Public access — this is a private group platform
