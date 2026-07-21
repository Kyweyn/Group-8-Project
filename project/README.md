# Hotel Booking Backend API - Milestone 4

Milestone 4 of our mini-capstone **Hotel Booking Website**. It extends the Milestone 3 REST API so it
now supports the full set of HTTP methods: the GET routes from Milestone 3 plus **POST, PUT and
DELETE** to create, update and delete records. Built with **TypeScript + Express + MySQL** (the
`mysql2` library).

## Team (who wrote which Milestone 4 endpoints)

Each member added at least 3 write endpoints and can explain the SQL, the route handler and how it
was tested.

- **Daiju Saji** - Hotels: `POST /hotels`, `PUT /hotels/:id`, `DELETE /hotels/:id`
- **Kyle Wayne Darjuan** - Rooms: `POST /rooms`, `PUT /rooms/:id`, `DELETE /rooms/:id`
- **Shiv Alpeshbhai Patel** - Users and Reviews: `PUT /users/:id`, `DELETE /users/:id`, `DELETE /reviews/:id`

(The booking write routes `POST /bookings`, `PUT /bookings/:id`, `DELETE /bookings/:id` were already
built in Milestone 3.)

## Project structure

```
hotel-booking-backend/
  package.json
  tsconfig.json
  nodemon.json
  setup-db.js            one-time script to create the DB + sample data
  database/
    schema.sql           CREATE DATABASE / CREATE TABLE statements
  src/
    index.ts             entry point - middleware + app.use() only
    db.ts                shared MySQL connection (imported by every route)
    routes/              one file per table
      hotelRoutes.ts
      roomRoutes.ts
      bookingRoutes.ts
      userRoutes.ts
      reviewRoutes.ts
```

## Setup

1. **Install dependencies**
   ```
   npm install
   ```

2. **Create the database.** Make sure MySQL is running, then run `database/schema.sql` in MySQL
   Workbench, **or** run:
   ```
   node setup-db.js
   ```

   > If your MySQL password is not `Edgeis10`, change it in **`src/db.ts`** and **`setup-db.js`**.

3. **Start the server**
   ```
   npm run dev
   ```
   You should see `Server running at http://localhost:3001`.

## All endpoints

GET routes (from Milestone 3):

| Method | Route | What it does |
|--------|-------|--------------|
| GET    | `/hotels` | all hotels with their starting price |
| GET    | `/hotels/search?city=&checkin=&checkout=&guests=` | hotels with a free room for the dates |
| GET    | `/hotels/:id` | one hotel together with its rooms |
| GET    | `/rooms` | all room types |
| GET    | `/rooms/:id` | one room type |
| GET    | `/bookings` | all bookings |
| GET    | `/bookings/:id` | one booking |
| GET    | `/users` | all users |
| GET    | `/users/:userId/bookings` | all bookings of one user |
| GET    | `/reviews` | all reviews |

Write routes (POST / PUT / DELETE):

| Method | Route | What it does | Author |
|--------|-------|--------------|--------|
| POST   | `/hotels` | create a hotel (201) | Daiju |
| PUT    | `/hotels/:id` | update a hotel, 404 if missing | Daiju |
| DELETE | `/hotels/:id` | delete a hotel, 404 if missing | Daiju |
| POST   | `/rooms` | create a room (201) | Kyle |
| PUT    | `/rooms/:id` | update a room, 404 if missing | Kyle |
| DELETE | `/rooms/:id` | delete a room, 404 if missing | Kyle |
| PUT    | `/users/:id` | update a user, 404 if missing | Shiv |
| DELETE | `/users/:id` | delete a user, 404 if missing | Shiv |
| DELETE | `/reviews/:id` | delete a review, 404 if missing | Shiv |
| POST   | `/bookings` | create a booking (from Milestone 3) | - |
| PUT    | `/bookings/:id` | update booking dates (from Milestone 3) | - |
| DELETE | `/bookings/:id` | cancel a booking (from Milestone 3) | - |
| POST   | `/users` | create a user (from Milestone 3) | - |
| POST   | `/reviews` | create a review (from Milestone 3) | - |

## Status codes we return

| Code | When |
|------|------|
| 200 OK | a GET, PUT or DELETE worked |
| 201 Created | a POST created a new record |
| 400 Bad Request | a required field is missing or invalid |
| 404 Not Found | no record with that id |
| 409 Conflict | the record can't be deleted because another table points to it, or a unique field (email) is taken |
| 500 Server Error | something unexpected went wrong |

## Code quality notes

- **Parameterized SQL only.** Every query uses `?` placeholders with a values array (for example
  `db.query("INSERT INTO hotels (...) VALUES (?, ?, ?)", [name, city, address])`). User input is
  never concatenated into a SQL string, so SQL injection is not possible.
- **One file per table.** Each resource has its own route file in `src/routes/`, kept from the clean
  structure we set up in Milestone 3.
- **Missing ids are handled.** PUT and DELETE check whether the row exists and return `404` if not,
  instead of silently doing nothing.

## Testing

See **`DEMO_TESTS.md`** for copy-paste PowerShell and curl commands that create a record, verify it,
update it, verify it, then delete it and confirm it is gone - the exact flow used in the live demo.
