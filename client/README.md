# Contract Time Tracker: Web client

React front end for Contract Time Tracker: a punch clock for contract work that tracks hours, breaks and the cost of each project.

**Stack:** React 19 · TypeScript · Vite · Material UI · React Router · Socket.IO client

## Features

- Admin login (Auth.js session cookie, kept across page reloads)
- Punch clock: punch in/out, start/end breaks, live timer
- Dashboard: time worked and breaks today, project total, accrued cost, client details
- Projects table with hours and cost per project, plus totals
- Clients table, and creation of clients and projects
- Live refresh across open tabs when punches change

## Getting started

The API must be running on `http://localhost:5000` (see the server project).

```bash
npm install
npm run dev    # http://localhost:3000, /api and /socket.io are proxied to the API
```

Other scripts: `npm run build`, `npm run preview`, `npm run typecheck`.

## Project structure

```
src/
  main.tsx         Providers (MUI theme, router, auth)
  App.tsx          Routes
  api/             Typed functions that call the backend
  context/         Authentication context
  pages/           Login page and dashboard layout
  components/      Punch clock, tables, forms, navbar, ...
  hooks/           Reusable hooks (data loading, timer, sockets, localStorage)
  utils/           Time, money and punch calculations
  types/           Shared TypeScript types
  theme.ts         Brand colours and MUI theme
```
