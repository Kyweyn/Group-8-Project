# Hotel Booking - Full Stack Web Application (Group 8)

Mini-capstone for Web Development / Full-Stack Programming.

A hotel booking website for the Waterloo region. A guest can search hotels by
city and dates, look at the room types and the reviews, make an account, book a
room, change the dates of a booking and cancel it. An admin account can add,
edit and delete hotels and room types from inside the app. There is also a
small AI helper that recommends hotels from our own database.

**Team:** Kyle Wayne Darjuan, Shiv Alpeshbhai Patel, Daiju Saji

## What is in this repository

| Folder / file | What it is |
|---|---|
| [`project/`](project) | the **backend**: Express + TypeScript + MySQL REST API |
| [`frontend/`](frontend) | the **frontend**: React 19 + Vite single page application |
| `api/api_routes.txt` | the Milestone 2 route plan |
| `wireframe_specs.txt` + the `*.png` files | the Figma wireframes from Milestone 2 |
| `hotel_booking.drawio(.png)` | the database diagram |
| `Milestone_2_Report.docx`, `Milestone_2_Slides.pptx` | earlier milestone documents |

## Milestones

| Milestone | What was added |
|---|---|
| 1 & 2 | idea, database design, wireframes, route plan |
| 3 | Express + MySQL setup and all the GET routes |
| 4 | POST / PUT / DELETE for hotels, rooms, users, bookings and reviews |
| **5** | **React SPA, login with JWT, bcrypt password hashing, protected routes, rate limiting and the AI helper** |

## Technology

**Backend:** Node.js, TypeScript, Express 4, MySQL 8 (`mysql2`), `bcryptjs`,
`jsonwebtoken`, `cors`, `dotenv`, `express-rate-limit`

**Frontend:** React 19, Vite, `react-router-dom`, plain CSS (no framework)

**AI:** the Claude API, called from the backend so the key stays secret

## How to run it locally

You need **Node.js 18+** and a running **MySQL 8** server.

### 1. Backend

```bash
cd project
npm install
cp .env.example .env      # then open .env and put in your MySQL password + a JWT secret
node setup-db.js          # creates the database, the tables and sample data
npm run dev               # http://localhost:3001
```

### 2. Frontend (in a second terminal)

```bash
cd frontend
npm install
cp .env.example .env      # VITE_API_URL=http://localhost:3001
npm run dev               # http://localhost:5173
```

Open http://localhost:5173 in the browser.

> **Environment variables:** never commit a `.env` file. Both folders have a
> `.env.example` with fake values that is committed instead, and `.env` is
> listed in `.gitignore`. The full list of variables and what they mean is in
> [`project/README.md`](project/README.md).

### Demo accounts

| Email | Password | Role |
|---|---|---|
| `admin@example.com` | `Admin123` | admin - can manage hotels and rooms |
| `shiv@example.com` | `Password123` | normal user |
| `daiju@example.com` | `Password123` | normal user |

## API endpoints

The full table with request bodies and responses is in
[`project/README.md`](project/README.md). Short version:

```
POST   /auth/register            POST   /auth/login          GET  /auth/me
GET    /hotels                   GET    /hotels/search       GET  /hotels/:id
POST   /hotels        (admin)    PUT    /hotels/:id (admin)  DELETE /hotels/:id (admin)
GET    /rooms                    GET    /rooms/:id
POST   /rooms         (admin)    PUT    /rooms/:id  (admin)  DELETE /rooms/:id  (admin)
GET    /bookings      (admin)    GET    /bookings/:id (own)
POST   /bookings      (login)    PUT    /bookings/:id (own)  DELETE /bookings/:id (own)
GET    /users         (admin)    POST   /users
GET    /users/:id/bookings (own) PUT    /users/:id (own)     DELETE /users/:id (own)
GET    /reviews                  POST   /reviews (login)     DELETE /reviews/:id (own)
POST   /ai/suggest    (login)
```

## Security summary

- Passwords are hashed with **bcrypt** (10 salt rounds) and never stored or
  logged in plain text
- Login returns a **JWT** that expires after 2 hours; it is sent as
  `Authorization: Bearer <token>` and verified on every protected route
- The frontend `ProtectedRoute` redirects a visitor to `/login`, but the real
  check is the `requireAuth` / `requireAdmin` middleware in the backend
- Bookings, reviews and accounts also check that the row actually belongs to you
- Every SQL value is a `?` parameter - no string concatenation with user input
- The login is rate limited to 10 attempts per 15 minutes per IP

## Who did what

Short version, the full reflection is in the Milestone 5 Word document we hand
in on Dropbox.

| Member | Milestone 5 |
|---|---|
| **Kyle Wayne Darjuan** | React + Vite setup, `api.js`, `AuthContext`, Login / Register, booking form, My Bookings + Edit Booking, the AI helper component, layout and documentation |
| **Shiv Alpeshbhai Patel** | bcrypt hashing, `/auth/register` + `/auth/login` with JWT, `ProtectedRoute`, hotel details page, the `/ai/suggest` backend route |
| **Daiju Saji** | `.env` + config, CORS, `requireAuth` / `requireAdmin`, guards and ownership checks on every write route, hotel list page, both admin management pages, rate limiting and validation |
