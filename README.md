# CRICREX

A frontend-only cricket ground booking and matchday management experience built with React, TypeScript and Tailwind CSS. CRICREX includes a public marketing site, ground discovery and booking flow, and six role-based workspaces for administrators, ground owners, scorers, umpires, players and captains.

> This is a UI demonstration. There is no backend, database, real authentication, email service or payment gateway. Accounts and bookings are simulated and stored in your browser's `localStorage`.

## Tech stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS 3.4
- React Router 7
- Lucide React icons
- Recharts data visualisations

## Getting started

### Prerequisites

- Node.js 20 or newer (Node 24 recommended)
- npm 10 or newer

### Install and run

```bash
npm install
npm run dev
```

Open the URL printed by Vite, usually **http://localhost:5173**.

### Production build

```bash
npm run build
npm run preview
```

`npm run build` runs the TypeScript project build first, then creates an optimised bundle in `dist/`. Use `npm run preview` to serve that build locally.

### Lint

```bash
npm run lint
```

## Demo accounts

Use the role buttons on the login page, or the one-click demo sign-in panel, to fill credentials automatically.

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@cricrex.demo` | `Admin@123` |
| Ground Owner | `owner@cricrex.demo` | `Demo@123` |
| Scorer | `scorer@cricrex.demo` | `Demo@123` |
| Umpire | `umpire@cricrex.demo` | `Demo@123` |
| Player | `player@cricrex.demo` | `Demo@123` |
| Captain | `captain@cricrex.demo` | `Demo@123` |

Admin accounts cannot be created through the public registration form. New demo accounts can be registered for every other role.

## What is included

### Public experience

- Landing page with hero search, featured grounds, testimonials and calls to action
- Explore Grounds with city, type, price, rating and availability filters
- Ground details with galleries, amenities, reviews, date and slot selection, and a complete booking flow
- My Bookings with upcoming/past filters, cancellation and demo payment states
- About page, contact form, newsletter signup and legal notices
- Login, registration, forgot-password and reset-password flows

### Role dashboards

| Role | Workspace |
| --- | --- |
| Admin | Platform metrics, users, grounds, bookings and activity |
| Ground Owner | Ground performance, bookings, earnings, listing profile, pricing and availability |
| Scorer | Assignments, live ball-by-ball scoring console, scorecards and history |
| Umpire | Assignments, availability schedule, match history and reports |
| Player | Form, fixtures, season statistics and match history |
| Captain | Squad, fixtures and line-ups, results and team performance |

Each role also has shared Profile, Settings and Notifications pages under its own route prefix.

### Route overview

| Path | Page |
| --- | --- |
| `/` | Home |
| `/grounds` | Explore grounds |
| `/grounds/:groundId` | Ground details and booking |
| `/bookings` | My bookings |
| `/about` | About CRICREX |
| `/login`, `/register` | Authentication |
| `/forgot-password`, `/reset-password` | Password recovery |
| `/admin` | Admin workspace |
| `/owner` | Ground owner workspace |
| `/scorer` | Scorer workspace |
| `/umpire` | Umpire workspace |
| `/player` | Player workspace |
| `/captain` | Captain workspace |

Dashboard sub-routes follow the sidebar links under each role prefix, for example `/owner/earnings`, `/scorer/live` and `/captain/performance`.

## Project structure

```text
src/
  components/       Reusable UI, layout, auth and dashboard components
  config/           Role metadata and dashboard navigation
  context/          Auth, booking and notification state (AppContext)
  data/             Mock grounds, users, bookings, teams and matches
  lib/              Formatting, date, storage and helper utilities
  pages/            Public pages, dashboards and account pages
  types/            Shared TypeScript interfaces
public/
  images/           Cricket ground photography
```

## Notes

- Authentication and role guards are client-side only. Do not treat this project as a secure production application.
- Seeded data resets when browser storage is cleared. The Settings page includes a demo-data reset action.
- Actions such as exporting reports, uploading images, sharing results and processing payouts intentionally show a simulated toast instead of creating files or sending requests.
- All currency values are in Indian rupees and all content is fictional demo data.
