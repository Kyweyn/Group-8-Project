// App.jsx - the main component.
// It only holds the router and the navigation bar. All the real work happens
// inside the page components in src/pages, so this file stays short.
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Home from "./pages/Home.jsx";
import Hotels from "./pages/Hotels.jsx";
import HotelDetails from "./pages/HotelDetails.jsx";
import BookRoom from "./pages/BookRoom.jsx";
import MyBookings from "./pages/MyBookings.jsx";
import EditBooking from "./pages/EditBooking.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import NotFound from "./pages/NotFound.jsx";

function App() {
  return (
    // BrowserRouter is what makes this a SPA - clicking a link only swaps the
    // component below, the browser never reloads the whole page.
    // AuthProvider is outside the router so the navbar and every page can ask
    // who is logged in.
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <div className="page">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/hotels" element={<Hotels />} />
            <Route path="/hotels/:id" element={<HotelDetails />} />
            {/* pages below need a login - ProtectedRoute sends you to /login */}
            <Route
              path="/book/:roomId"
              element={
                <ProtectedRoute>
                  <BookRoom />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-bookings"
              element={
                <ProtectedRoute>
                  <MyBookings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bookings/:id/edit"
              element={
                <ProtectedRoute>
                  <EditBooking />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
