# SkillForge — AI Placement Readiness Platform

SkillForge is a comprehensive, AI-powered placement readiness platform for college students. It tracks skills, projects, DSA problems, aptitude tests, certifications, and mock interviews — then uses Google Gemini AI to provide personalized career coaching, placement predictions, resume analysis, and learning roadmaps.

## Tech Stack

- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **Prisma ORM** with SQLite
- **Google Gemini AI** / OpenRouter
- **JWT Authentication** with bcrypt
- **Recharts** for analytics
- **Lucide React** for icons

## Features

- **Landing Page** — Premium marketing page with features, testimonials, stats, FAQ
- **Authentication** — JWT-based auth with login, register, OTP verification, password reset
- **Student Dashboard** — Placement readiness score, radar charts, AI suggestions, leaderboard rank
- **AI Career Mentor** — Chat assistant, interview question generator, weekly study plan, weak area analysis
- **DSA Tracker** — Log problems by platform/topic/difficulty with charts
- **Aptitude Tracker** — Track test scores with improvement graphs
- **Project Manager** — Add projects with quality scoring
- **Certifications** — Upload and track certificate approvals
- **Resume Analyzer** — ATS score, grammar, formatting, keyword analysis
- **Mock Interviews** — Record scores and feedback
- **Leaderboard** — Compete with other students
- **Achievements & Badges** — Gamification with XP, coins, streaks
- **Admin Panel** — Manage students, approve certifications, send notifications, analytics
- **Settings & Notifications** — Full preference management

## Quick Start

### Prerequisites

- Node.js 20+
- npm or pnpm

### Installation

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL` — SQLite file path (default: `file:./dev.db`)
- `JWT_SECRET` — Strong random string
- `GOOGLE_API_KEY` or `OPENROUTER_API_KEY` — For AI features

### Database Setup

```bash
# Push schema and seed demo data
npm run db:setup
```

Demo accounts:
- Student: `student@demo.com` / `demo123`
- Admin: `admin@demo.com` / `demo123`

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

## Deployment

### Vercel

1. Push to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Add build command: `prisma generate && next build`
5. Deploy

> **Note:** For production, switch from SQLite to PostgreSQL (e.g., Vercel Postgres, Supabase, or Railway) and update `DATABASE_URL`.

### Docker (Optional)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Project Structure

```
src/
  app/              — Next.js App Router pages
    api/            — REST API routes
    (pages)/        — UI pages
  components/       — Reusable UI components
  lib/              — Utilities, auth, AI provider, Prisma client
  types/            — TypeScript types
prisma/
  schema.prisma     — Database schema
  seed.ts           — Demo data
public/             — Static assets
```

## AI Integration

SkillForge uses Google Gemini AI via the `@google/generative-ai` SDK. It supports both direct Gemini API keys and OpenRouter keys for flexibility.

AI features:
- **Chat Assistant** — Real-time career advice
- **Placement Prediction** — AI-calculated readiness score
- **Resume Analysis** — ATS, grammar, keyword optimization
- **Interview Questions** — Personalized technical/HR questions
- **Study Plans** — Weekly personalized learning schedules
- **Weak Area Analysis** — Targeted improvement suggestions

## Security

- JWT authentication with HTTP-only cookies
- bcrypt password hashing (12 rounds)
- Zod input validation on all API routes
- Role-based access control (STUDENT / ADMIN / SUPER_ADMIN)
- OTP verification for email and password reset
- Secure cookie settings (httpOnly, sameSite, secure in production)

## License

MIT
