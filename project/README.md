# Hotel Booking Backend API - Milestone 5

The REST API of our mini-capstone **Hotel Booking Website**. Built with
**TypeScript + Express + MySQL** (the `mysql2` library).

- Milestone 3 added the GET routes
- Milestone 4 added POST / PUT / DELETE
- **Milestone 5 adds the login system (bcrypt + JWT), route protection, rate
  limiting and the AI helper**

The React frontend that uses this API is in [`../frontend`](../frontend).

## Team (Milestone 5)

| Member | What they built in this milestone |
|---|---|
| **Shiv Alpeshbhai Patel** | bcrypt password hashing, `POST /auth/register`, `POST /auth/login`, `POST /ai/suggest` |
| **Daiju Saji** | `.env` / `config.ts`, CORS, `requireAuth` + `requireAdmin`, `GET /auth/me`, guards + ownership checks on every write route, rate limiting and validation |
| **Kyle Wayne Darjuan** | the whole React frontend that consumes this API (see `../frontend`) |

Milestone 4 endpoints: Daiju wrote the hotel writes, Kyle the room writes, Shiv
the user and review writes.

## Setup

### 1. Install dependencies

```
npm install
```

### 2. Make your `.env`

**Never commit this file.** It is in `.gitignore`, only `.env.example` is in git.

```
cp .env.example .env        # Mac / Linux
copy .env.example .env      # Windows
```

Then open `.env` and fill it in:

| Variable | What it is |
|---|---|
| `PORT` | port of the API, default `3001` |
| `FRONTEND_URL` | address of the React app, needed by CORS (`http://localhost:5173`) |
| `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASSWORD` / `DB_NAME` | your MySQL connection |
| `JWT_SECRET` | **required.** A long random string. The server refuses to start without it. |
| `JWT_EXPIRES_IN` | how long a login lasts, we use `2h` |
| `ANTHROPIC_API_KEY` | key from https://console.anthropic.com, used by the AI helper |
| `ANTHROPIC_MODEL` | which Claude model to use, default `claude-sonnet-5` |

Make a secret with:

```
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 3. Create the database

Make sure MySQL is running, then either run `database/schema.sql` in MySQL
Workbench, **or** run the helper script (it reads the same `.env`):

```
node setup-db.js
```

Both create the `hotel_booking` database, all 5 tables and sample rows.

### 4. Start the server

```
npm run dev
```

You should see `Server running at http://localhost:3001`.

## Demo accounts

`setup-db.js` inserts these. The passwords are stored as bcrypt hashes, the
plain values below are only so you can log in during the demo.

| Email | Password | Role |
|---|---|---|
| `admin@example.com` | `Admin123` | admin |
| `shiv@example.com` | `Password123` | user |
| `daiju@example.com` | `Password123` | user |

## Project structure

```
project/
  .env                  your secrets - NOT in git
  .env.example          the same keys with fake values
  package.json
  tsconfig.json
  nodemon.json
  setup-db.js           creates the DB + sample data
  database/
    schema.sql          the same thing as pure SQL
  src/
    index.ts            middleware + app.use() only, no SQL in here
    config.ts           reads everything out of .env
    db.ts               the shared mysql2 pool
    middleware/
      auth.ts           requireAuth / requireAdmin
      rateLimiters.ts   login / ai / general limits
    routes/             one file per resource
      authRoutes.ts  hotelRoutes.ts  roomRoutes.ts
      bookingRoutes.ts  userRoutes.ts  reviewRoutes.ts  aiRoutes.ts
```

## Endpoints

`(login)` = needs a valid token, `(admin)` = the token role must be `admin`,
`(owner)` = the row must be yours, or you must be admin.

### Auth

| Method | Route | What it does |
|---|---|---|
| POST | `/auth/register` | create an account, hash the password, return a token |
| POST | `/auth/login` | check the password with bcrypt, return a token |
| GET | `/auth/me` (login) | who am I - used on page refresh |

### Hotels

| Method | Route | What it does |
|---|---|---|
| GET | `/hotels` | all hotels with their starting price |
| GET | `/hotels/search?city=&checkin=&checkout=&guests=` | hotels with a free room for the dates |
| GET | `/hotels/:id` | one hotel together with its rooms |
| POST | `/hotels` (admin) | add a hotel |
| PUT | `/hotels/:id` (admin) | update a hotel |
| DELETE | `/hotels/:id` (admin) | delete a hotel, 409 if it still has rooms |

### Rooms

| Method | Route | What it does |
|---|---|---|
| GET | `/rooms` | all room types |
| GET | `/rooms/:id` | one room type |
| POST | `/rooms` (admin) | add a room type to a hotel |
| PUT | `/rooms/:id` (admin) | update a room type |
| DELETE | `/rooms/:id` (admin) | delete a room type, 409 if it still has bookings |

### Bookings

| Method | Route | What it does |
|---|---|---|
| GET | `/bookings` (admin) | every booking |
| GET | `/bookings/:id` (owner) | one booking |
| POST | `/bookings` (login) | create a booking, checks availability in a transaction |
| PUT | `/bookings/:id` (owner) | change the dates and recalculate the price |
| DELETE | `/bookings/:id` (owner) | cancel a booking (sets status to `cancelled`) |

### Users

| Method | Route | What it does |
|---|---|---|
| GET | `/users` (admin) | all users, never the password |
| POST | `/users` | create a user (the password is hashed) |
| GET | `/users/:userId/bookings` (owner) | the bookings of one user |
| PUT | `/users/:id` (owner) | update name / email / phone |
| DELETE | `/users/:id` (owner) | delete an account |

### Reviews

| Method | Route | What it does |
|---|---|---|
| GET | `/reviews` or `/reviews?hotelId=1` | reviews with the user and hotel name |
| POST | `/reviews` (login) | add a review, saved under your own user id |
| DELETE | `/reviews/:id` (owner) | delete your review |

### AI

| Method | Route | What it does |
|---|---|---|
| POST | `/ai/suggest` (login) | `{ question }` → `{ answer }` from Claude, only about hotels that are really in our database |

## Security

| What | How |
|---|---|
| Passwords | `bcrypt.hash(password, 10)`. The plain password is never stored and never logged. Login uses `bcrypt.compare`. |
| Login token | JWT signed with `JWT_SECRET`, expires after 2 hours, carries `userId`, `email` and `role`. |
| Protected routes | `requireAuth` checks the `Authorization: Bearer` header, `requireAdmin` checks the role. |
| Ownership | Bookings, reviews and accounts also compare the row owner with `req.user.userId` → 403 if it is not yours. |
| Identity | `POST /bookings` and `POST /reviews` take the user id from the **token**, not from the body. |
| SQL injection | Every value is a `?` parameter, nothing is glued into a query string. |
| Brute force | `express-rate-limit`: 10 login tries per 15 min per IP, 15 AI questions per hour. |
| Input | Trimmed, forced to strings, emails lower-cased and validated, password 8-72 chars, body limited to 20kb. |
| Ids in the URL | `router.param("id", checkId)` - anything that is not digits gets a 400, so MySQL cannot cast `"1 OR 1=1"` to `1`. |
| Secrets | `.env` is gitignored, only `.env.example` with fake values is committed. |

## Testing without the frontend

GET routes work straight in the browser, e.g. http://localhost:3001/hotels

For the protected routes you need a token first:

```bash
# 1. log in and copy the token out of the answer
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin123"}'

# 2. use it on a protected route
TOKEN=paste_the_token_here

curl -X POST http://localhost:3001/hotels \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"New Hotel","city":"Guelph","address":"1 Main St","starRating":4}'

curl -X PUT http://localhost:3001/hotels/4 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Renamed Hotel","city":"Guelph","address":"1 Main St","starRating":5}'

curl -X DELETE http://localhost:3001/hotels/4 -H "Authorization: Bearer $TOKEN"
```

On **Windows PowerShell**:

```powershell
$body = '{"email":"admin@example.com","password":"Admin123"}'
$login = Invoke-RestMethod -Method POST -Uri http://localhost:3001/auth/login -ContentType "application/json" -Body $body
$headers = @{ Authorization = "Bearer $($login.token)" }

Invoke-RestMethod -Method POST -Uri http://localhost:3001/hotels -Headers $headers -ContentType "application/json" -Body '{"name":"New Hotel","city":"Guelph","address":"1 Main St","starRating":4}'
```

Without a token a protected route answers `401`, and with a normal user token
an admin route answers `403`.

## How double booking is prevented

`POST /bookings` runs inside a database transaction. It locks the room row with
`SELECT ... FOR UPDATE`, counts how many confirmed bookings already overlap the
requested dates, and only inserts if a room of that type is still free. If not
it returns `409 Room not available for these dates`. This was the main problem
we set out to solve in Milestone 2.
