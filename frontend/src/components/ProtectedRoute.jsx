// ProtectedRoute.jsx - the route guard (written by Shiv).
//
// We wrap a page with it in App.jsx like this:
//     <Route path="/my-bookings" element={
//        <ProtectedRoute><MyBookings /></ProtectedRoute>
//     } />
//
// If you are not logged in the page is never rendered, you get sent to /login
// instead. We also remember which page you wanted so the login can send you
// back there afterwards.
//
// This only hides the page in the browser. It is NOT the real security - a user
// could still call the API with curl. The real check is the requireAuth
// middleware in the backend. This is just so the app does not show empty pages
// and error messages to somebody who is not logged in.
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function ProtectedRoute({ children, adminOnly }) {
  const auth = useAuth();
  const location = useLocation();

  // On a page refresh we still have to ask the API if the saved token is good.
  // Without this the user would be kicked out to /login for a split second
  // every time they press F5.
  if (auth.checkingToken) {
    return <p className="loading">Checking your login...</p>;
  }

  if (!auth.isLoggedIn) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // some pages (the manage pages) are only for the admin account
  if (adminOnly && !auth.isAdmin) {
    return (
      <div className="message error">
        This page is only for admin accounts. You are logged in as a normal user.
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;
