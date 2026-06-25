# Hotel Booking Backend API

Milestone 3 backend for our mini-capstone **Hotel Booking Website**. It is a REST API built with
**TypeScript + Express + MySQL** (the `mysql2` library). No frontend, this milestone is only the API.

## Team

- **Kyle Wayne Darjuan** - database design + project setup
- **Shiv Alpeshbhai Patel** - hotel, room and booking routes
- **Daiju Saji** - user and review routes + documentation

## Project structure

```
hotel-booking-backend/
├── package.json
├── tsconfig.json
├── nodemon.json
├── setup-db.js              one-time script to create the DB + sample data
├── database/
│   └── schema.sql           CREATE DATABASE / CREATE TABLE statements
└── src/
    ├── index.ts             entry point - middleware + app.use() only
    ├── db.ts                shared MySQL connection (imported by every route)
    └── routes/              one file per table
        ├── hotelRoutes.ts
        ├── roomRoutes.ts
        ├── bookingRoutes.ts
        ├── userRoutes.ts
        └── reviewRoutes.ts
```

## Setup

1. **Install dependencies**
   ```
   npm install
   ```

2. **Create the database.** Make sure MySQL is running, then either run `database/schema.sql` in
   MySQL Workbench, **or** run the helper script:
   ```
   node setup-db.js
   ```
   Both create the `hotel_booking` database, all 5 tables, and some sample rows.

   > If your MySQL password is not `Edgeis10`, change it in **`src/db.ts`** and **`setup-db.js`**.

3. **Start the server**
   ```
   npm run dev
   ```
   You should see `Server running at http://localhost:3001`.

## Endpoints

| Method | Route | What it does |
|--------|-------|--------------|
| GET    | `/hotels` | all hotels with their starting price |
| GET    | `/hotels/search?city=&checkin=&checkout=&guests=` | hotels with a free room for the dates |
| GET    | `/hotels/:id` | one hotel together with its rooms |
| GET    | `/rooms` | all room types |
| GET    | `/rooms/:id` | one room type |
| GET    | `/bookings` | all bookings |
| GET    | `/bookings/:id` | one booking |
| POST   | `/bookings` | create a booking (checks availability in a transaction) |
| PUT    | `/bookings/:id` | change the dates and recalculate the price |
| DELETE | `/bookings/:id` | cancel a booking (sets status to `cancelled`) |
| GET    | `/users` | all users |
| POST   | `/users` | create a user |
| GET    | `/users/:userId/bookings` | all bookings of one user (with hotel + room names) |
| GET    | `/reviews` | all reviews (with user + hotel names) |
| POST   | `/reviews` | add a review |

> Note: Milestone 2 listed the search as `/search`. We implemented it as `/hotels/search` so that
> every route file maps to exactly one table and `index.ts` stays clean.

## Testing without a frontend

Open the URLs in your browser to test GET routes, e.g. `http://localhost:3001/hotels`.

For POST / PUT / DELETE use the terminal. On **Windows PowerShell**:

```powershell
# Create a booking (returns 201 with the total price)
Invoke-WebRequest -Method POST -Uri http://localhost:3001/bookings -ContentType "application/json" -Body '{"userId":1,"roomId":1,"checkInDate":"2026-07-10","checkOutDate":"2026-07-13"}'

# Add a user
Invoke-WebRequest -Method POST -Uri http://localhost:3001/users -ContentType "application/json" -Body '{"name":"Alex","email":"alex@example.com","password":"secret"}'

# Cancel a booking
Invoke-WebRequest -Method DELETE -Uri http://localhost:3001/bookings/1
```

On **Mac / Linux** use `curl`:

```bash
curl -X POST http://localhost:3001/bookings -H "Content-Type: application/json" -d '{"userId":1,"roomId":1,"checkInDate":"2026-07-10","checkOutDate":"2026-07-13"}'
```

## How double booking is prevented

`POST /bookings` runs inside a database transaction. It locks the room row, counts how many
confirmed bookings already overlap the requested dates, and only inserts the new booking if a room
of that type is still free. If not, it returns `409 Room not available for these dates`. This is the
main problem we set out to solve in Milestone 2.
