// MyBookings.jsx - the list of the bookings of the logged in user (READ) and
// the cancel button (DELETE /bookings/:id).
//
// This page is behind ProtectedRoute, so auth.user is always there.
import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { apiRequest } from "../api";
import { useAuth } from "../context/AuthContext.jsx";
import BookingCard from "../components/BookingCard.jsx";
import Message from "../components/Message.jsx";

function MyBookings() {
  const auth = useAuth();
  const location = useLocation();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // the booking page and the edit page send a message here after they finished
  const [okMessage, setOkMessage] = useState(location.state?.message || "");

  // we call this after a cancel too, so the list is up to date again
  function loadBookings() {
    setLoading(true);
    apiRequest("/users/" + auth.user.userId + "/bookings", { token: auth.token })
      .then((data) => {
        setBookings(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }

  useEffect(() => {
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.user.userId]);

  async function handleCancel(bookingId) {
    // window.confirm is enough for us here, a nice modal would be extra work
    const sure = window.confirm("Cancel this booking? This cannot be undone.");
    if (!sure) return;

    setError("");
    setOkMessage("");
    try {
      await apiRequest("/bookings/" + bookingId, {
        method: "DELETE",
        token: auth.token,
      });
      setOkMessage("Booking #" + bookingId + " was cancelled.");
      loadBookings();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h1>My Bookings</h1>

      <Message type="ok" text={okMessage} />
      <Message type="error" text={error} />

      {loading && <p className="loading">Loading your bookings...</p>}

      {!loading && bookings.length === 0 && !error && (
        <p>
          No trips yet. <Link to="/hotels">Find a hotel</Link> to make your first
          booking.
        </p>
      )}

      {bookings.map((booking) => (
        <BookingCard
          key={booking.booking_id}
          booking={booking}
          onCancel={handleCancel}
        />
      ))}
    </div>
  );
}

export default MyBookings;
