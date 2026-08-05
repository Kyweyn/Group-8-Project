// App.jsx - the main component.
// It only holds the router and the navigation bar. All the real work happens
// inside the page components in src/pages, so this file stays short.
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Hotels from "./pages/Hotels.jsx";
import HotelDetails from "./pages/HotelDetails.jsx";
import MyBookings from "./pages/MyBookings.jsx";
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
            <Route path="/my-bookings" element={<MyBookings />} />
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
