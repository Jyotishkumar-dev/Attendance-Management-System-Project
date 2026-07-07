# SmartAttend — Core MVP

A working full-stack attendance platform: authentication, role-based access control (Student /
Faculty / HOD / Admin / Super Admin), attendance marking, per-student analytics, and admin CRUD
for departments/subjects/students/faculty.

This is a **scoped-down, fully functional core** of the much larger spec you provided (which also
included face/QR/GPS attendance, timetables, leave management, notifications, multi-tenant support,
etc). Building all of that well is a multi-month project — see **"What's not built yet"** below for
how to extend this foundation toward the full spec.

## Stack

- **Frontend:** React 19 + TypeScript + Vite, Tailwind CSS v4, React Router, TanStack Query, Axios, Recharts, lucide-react
- **Backend:** Node.js + Express 5 + TypeScript
- **ORM:** Drizzle ORM (see note below) targeting PostgreSQL
- **Auth:** JWT access + refresh tokens, bcrypt password hashing, role-based middleware

### Note on the ORM

The spec asked for Prisma. This sandbox's network allowlist doesn't include
`binaries.prisma.sh`, so Prisma's engine binaries can't be downloaded here — `npx prisma generate`
would fail. **Drizzle ORM** was used instead: it's pure TypeScript with no native binary download,
targets Postgres identically, and the schema (`backend/src/db/schema.ts`) maps 1:1 to the tables in
your spec. If you have full internet access in your own environment and want Prisma specifically,
the schema translates directly — ask and I can generate the `schema.prisma` equivalent.

## What's built and verified working

- Register (admin-only), login, refresh, logout, `/me` — JWT + bcrypt
- RBAC middleware (`authenticate` + `authorize(...roles)`)
- Departments, Subjects, Students, Faculty — CRUD (scoped by role)
- Attendance: bulk mark/update per subject+date, duplicate-safe (unique constraint), audit-logged
- Student: attendance % summary, subject-wise breakdown, recent activity
- Admin: institution-wide overview (totals, today's %, overall %)
- Frontend: login, role-aware sidebar + dashboards, faculty "mark attendance" grid, admin
  management tables for students/faculty/subjects/departments
- Seed script with a working login for every role

I ran the actual server, pushed the schema to a live Postgres instance, seeded it, and hit the API
end-to-end (login → mark attendance → student summary → admin analytics) before handing this over —
it isn't just generated code, it runs.

## What's not built yet (from your original spec)

Timetable module · Leave management · Notifications (in-app/email/push) · Reports export
(PDF/Excel/CSV) · Global search · Advanced analytics (heatmaps, rankings, department comparisons) ·
Face/QR/GPS attendance · Parent portal · Multi-college/campus · Google/Microsoft login · PWA/offline ·
WebSocket real-time · File storage (Cloudinary/S3) · Docker.

The architecture (folder structure, RBAC, audit logging, schema) is deliberately laid out so each of
these is an additive module, not a rewrite — happy to build any of them out next.

## Running locally

### 1. Database
You need a Postgres instance (local, or free tier on Supabase/Neon/Railway).

```bash
cd backend
cp .env.example .env
# edit .env: set DATABASE_URL, and change JWT_ACCESS_SECRET / JWT_REFRESH_SECRET to long random strings
```

### 2. Backend
```bash
cd backend
npm install
npm run db:push     # creates tables from the Drizzle schema
npm run seed         # sample users for every role, 2 subjects, 5 students, sample attendance
npm run dev           # http://localhost:4000
```

Sample logins (password: `password123`):
`superadmin@smartattend.dev`, `admin@smartattend.dev`, `hod@smartattend.dev`,
`faculty@smartattend.dev`, `student1@smartattend.dev` … `student5@smartattend.dev`

### 3. Frontend
```bash
cd frontend
npm install
npm run dev   # http://localhost:5173, proxies /api to localhost:4000
```

## Deployment (matches your original spec's targets)

- **Frontend → Vercel:** `vercel deploy` from `/frontend`, set no extra env vars needed (uses relative `/api` — you'll want to point it at your deployed backend URL instead, e.g. via `VITE_API_URL` + updating `src/lib/api.ts`'s `baseURL`).
- **Backend → Railway/Render:** deploy `/backend`, set `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_URL` (your Vercel URL) as env vars. Build command `npm run build`, start command `npm start`.
- **Database → Supabase/Neon:** create a Postgres project, copy the connection string into `DATABASE_URL`, run `npm run db:push` once against it.

## Project structure

```
backend/
  src/
    db/            # Drizzle schema, client, seed script
    middleware/     # auth (JWT + RBAC), error handler
    routes/         # auth, departments, subjects, students, faculty, attendance
    utils/          # JWT signing/verification
    app.ts, server.ts
frontend/
  src/
    components/     # AttendanceRing, StatusBadge, ProtectedRoute
    context/        # AuthContext
    layouts/        # AppShell (sidebar nav)
    pages/          # Login, dashboards per role, management pages
    lib/             # api client (with auto refresh), types
```
