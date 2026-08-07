// BookingCard.jsx - one booking in the My Bookings list.
// The Cancel button does not call the API itself, it calls onCancel() and the
// page does the DELETE. That way this component only draws things.
import { Link } from "react-router-dom";

// the dates come back from MySQL as "2026-07-01T00:00:00.000Z", we only want
// the first 10 characters
function shortDate(value) {
  return String(value).slice(0, 10);
}

function BookingCard({ booking, onCancel }) {
  const isCancelled = booking.status === "cancelled";

  return (
    <div className="card">
      <div className="card-main">
        <h3>{booking.hotel_name}</h3>
        <p>{booking.room_type} room</p>
        <p className="grey">
          {shortDate(booking.check_in_date)} &rarr;{" "}
          {shortDate(booking.check_out_date)}
        </p>
        <span className={"status " + (isCancelled ? "cancelled" : "confirmed")}>
          {booking.status}
        </span>
      </div>

      <div className="card-side">
        <p className="price">
          <b>${Number(booking.total_price).toFixed(2)}</b>
        </p>

        {/* a cancelled booking cannot be edited or cancelled again */}
        {!isCancelled && (
          <>
            <Link
              className="button small"
              to={"/bookings/" + booking.booking_id + "/edit"}
            >
              Edit
            </Link>{" "}
            <button
              className="button small red"
              onClick={() => onCancel(booking.booking_id)}
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default BookingCard;
