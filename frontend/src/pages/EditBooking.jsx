// EditBooking.jsx - the UPDATE form (PUT /bookings/:id).
//
// The user can change the two dates. The backend recalculates the total price,
// we do not send a price from the browser - a user could change it in the
// developer tools and get a cheaper room.
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { apiRequest } from "../api";
import { useAuth } from "../context/AuthContext.jsx";
import Message from "../components/Message.jsx";

function EditBooking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const auth = useAuth();

  const [booking, setBooking] = useState(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    apiRequest("/bookings/" + id, { token: auth.token })
      .then((data) => {
        setBooking(data);
        // fill the date inputs with the dates the booking already has
        setCheckIn(String(data.check_in_date).slice(0, 10));
        setCheckOut(String(data.check_out_date).slice(0, 10));
        setLoading(false);
      })
      .catch((err) => {
        // 403 if the booking belongs to somebody else, 404 if the id is wrong
        setError(err.message);
        setLoading(false);
      });
  }, [id, auth.token]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);

    try {
      const updated = await apiRequest("/bookings/" + id, {
        method: "PUT",
        token: auth.token,
        body: { checkInDate: checkIn, checkOutDate: checkOut },
      });
      navigate("/my-bookings", {
        state: {
          message:
            "Booking #" +
            id +
            " was updated. New total: $" +
            Number(updated.totalPrice).toFixed(2),
        },
      });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  async function handleCancelBooking() {
    const sure = window.confirm("Cancel this booking? This cannot be undone.");
    if (!sure) return;

    try {
      await apiRequest("/bookings/" + id, {
        method: "DELETE",
        token: auth.token,
      });
      navigate("/my-bookings", {
        state: { message: "Booking #" + id + " was cancelled." },
      });
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return <p className="loading">Loading booking...</p>;
  }

  if (!booking) {
    return (
      <div>
        <Message type="error" text={error} />
        <Link to="/my-bookings">Back to my bookings</Link>
      </div>
    );
  }

  return (
    <div className="form-box">
      <h1>Edit booking #{booking.booking_id}</h1>
      <p className="grey">
        Current total: ${Number(booking.total_price).toFixed(2)} &middot; status:{" "}
        {booking.status}
      </p>

      <Message type="error" text={error} />

      <form onSubmit={handleSubmit}>
        <label>New check in</label>
        <input
          type="date"
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          required
        />

        <label>New check out</label>
        <input
          type="date"
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
          required
        />

        <button className="button" type="submit" disabled={busy}>
          {busy ? "Saving..." : "Update booking"}
        </button>
      </form>

      <hr />

      <button className="button red" onClick={handleCancelBooking}>
        Cancel this booking
      </button>

      <p className="small-text">
        <Link to="/my-bookings">Back to my bookings</Link>
      </p>
    </div>
  );
}

export default EditBooking;
