# Hotel Booking - Frontend (Milestone 5)

The React single page application that talks to our Express API in `../project`.

Built with **React 19 + Vite + react-router-dom**. No CSS framework, all the
styling is our own in `src/styles.css`.

## Setup

You need the backend running first (see `../project/README.md`).

1. Install the packages:

   ```
   npm install
   ```

2. Copy the environment file and check the address of the API:

   ```
   cp .env.example .env        # Mac / Linux
   copy .env.example .env      # Windows
   ```

   `.env` only has one line:

   ```
   VITE_API_URL=http://localhost:3001
   ```

   > Only variables that start with `VITE_` reach the React code, and everything
   > in this file ends up inside the built JavaScript. Never put a secret here -
   > our Claude API key lives in the **backend** `.env` for that reason.

3. Start it:

   ```
   npm run dev
   ```

   Open http://localhost:5173

## Demo accounts

These come from `node setup-db.js` in the backend folder:

| Email | Password | Role |
|---|---|---|
| `admin@example.com` | `Admin123` | admin - can manage hotels and rooms |
| `shiv@example.com` | `Password123` | normal user |
| `daiju@example.com` | `Password123` | normal user |

## Pages

| Route | Page | Login needed |
|---|---|---|
| `/` | Home: search + AI helper | no |
| `/hotels` | hotel list and search results | no |
| `/hotels/:id` | one hotel with its rooms and reviews | no |
| `/book/:roomId` | booking form (CREATE) | yes |
| `/my-bookings` | your bookings, cancel (DELETE) | yes |
| `/bookings/:id/edit` | change the dates (UPDATE) | yes |
| `/manage/hotels` | add / edit / delete hotels | yes, admin |
| `/manage/hotels/:hotelId/rooms` | add / edit / delete room types | yes, admin |
| `/login`, `/register` | account | no |

## Folder structure

```
src/
  main.jsx              starts React
  App.jsx               the router and the layout, nothing else
  styles.css            all our css
  api.js                fetch helper (base url + Bearer token + errors)
  context/
    AuthContext.jsx     the logged in user, login / register / logout
  components/           small pieces that only draw
    Navbar.jsx  Footer.jsx  ProtectedRoute.jsx  Message.jsx
    SearchForm.jsx  HotelCard.jsx  RoomRow.jsx  ReviewList.jsx
    BookingCard.jsx  HotelForm.jsx  AiHelper.jsx
  pages/                one file per screen, these do the fetching
    Home.jsx  Hotels.jsx  HotelDetails.jsx  BookRoom.jsx
    MyBookings.jsx  EditBooking.jsx
    ManageHotels.jsx  ManageRooms.jsx
    Login.jsx  Register.jsx  NotFound.jsx
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | dev server on port 5173 with hot reload |
| `npm run build` | production build into `dist/` |
| `npm run preview` | serve the built `dist/` folder |

## Notes

- It is a real SPA: every link is a `<Link>`, so the browser never reloads the
  page while you navigate.
- The token is kept in `sessionStorage` (deleted when the tab closes) and not in
  `localStorage`. The trade-off is explained in our Milestone 5 Word document.
- `ProtectedRoute` only hides pages in the browser. The real check is
  `requireAuth` / `requireAdmin` in the backend.
