// Navbar.jsx - the bar on top of every page.
// We use <Link> instead of <a> because <a> would reload the whole page and
// then it would not be a single page application anymore.
//
// The right side changes depending on the login: a visitor sees Login/Register,
// a logged in user sees their name and a Logout button.
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function Navbar() {
  const auth = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    auth.logout();
    navigate("/");
  }

  return (
    <div className="navbar">
      <Link to="/" className="logo">
        Hotel Booking
      </Link>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/hotels">Hotels</Link>

        {auth.isLoggedIn ? (
          <>
            <Link to="/my-bookings">My Bookings</Link>
            <span className="nav-user">Hi {auth.user.name}</span>
            <button className="link-button" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </div>
  );
}

export default Navbar;
