# Contract Time Tracker: API

REST API for Contract Time Tracker, a time-tracking app for contract work: punch in and out on a project, take breaks, and see the hours and cost per project.

**Stack:** Node.js · Express 5 · TypeScript · MongoDB (TypeORM) · Auth.js · Socket.IO · express-validator

## Getting started

```bash
npm install
cp .env.example .env   # then set AUTH_SECRET (see .env.example) and your MongoDB settings
npm run dev            # rebuilds and restarts on every change
```

The API listens on `http://localhost:5000`. Other scripts: `npm run build`, `npm start`, `npm run typecheck`.

## API

All routes except `/api/health` and `/api/auth/*` require a session cookie (log in through Auth.js first).

| Method | Route | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET, POST | `/api/auth/*` | Auth.js (CSRF, credentials sign-in, sign-out, session) |
| GET | `/api/users/me` | The logged-in user |
| GET / POST | `/api/users` | List / create users (clients or admins) |
| GET / PATCH / DELETE | `/api/users/:id` | Read / update / delete a user |
| GET / POST | `/api/projects` | List / create projects |
| PATCH / DELETE | `/api/projects/:id` | Update / delete a project (deleting also removes its punches) |
| GET | `/api/punches?projectId=` | List punches, optionally for one project |
| POST | `/api/punches/clock` | Punch in/out (`type: "in"`) or start/end a break (`type: "break"`) |
| POST | `/api/punches` | Add a completed punch manually |
| PATCH / DELETE | `/api/punches/:id` | Edit / delete a punch |

Successful responses look like `{ "data": ..., "message"?: "..." }`. Errors use the HTTP status code with `{ "message": "...", "field"?: "..." }`.

## Project structure

```
src/
  server.ts        Starts the database, HTTP server and Socket.IO
  app.ts           Express app: middleware, routes, error handling
  config/          Environment variables and Auth.js configuration
  db/              TypeORM data source
  entities/        Database models (User, Project, Punch, Timesheet)
  routes/          One router per resource
  validators/      express-validator rules per route
  controllers/     HTTP layer: read the request, call a service, send the response
  services/        Business logic and database access
  middlewares/     Auth guard, validation result handler, error handler
  types/           Shared TypeScript types
  utils/           Small helpers (HTTP errors, time/week calculations, ...)
  socket.ts        Real-time "punches changed" notifications
```

## Roadmap

- Per-user data ownership (multi-account support)
- Invoices and billed amounts
- Automated tests (Jest)
- Mobile app
