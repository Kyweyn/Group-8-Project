// Navbar.jsx - the bar on top of every page.
// We use <Link> instead of <a> because <a> would reload the whole page and
// then it would not be a single page application anymore.
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <div className="navbar">
      <Link to="/" className="logo">
        Hotel Booking
      </Link>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/hotels">Hotels</Link>
        <Link to="/my-bookings">My Bookings</Link>
        <Link to="/login">Login</Link>
      </div>
    </div>
  );
}

export default Navbar;
