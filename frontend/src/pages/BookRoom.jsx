// BookRoom.jsx - the CREATE form (POST /bookings).
//
// The user gets here from the "Book now" button on the hotel page, so we know
// the room id from the url. We load the room to show the price, then we let the
// user pick the dates and we show the total before they confirm.
//
// We do NOT send the user id. The backend takes it out of the token, otherwise
// somebody could book a room in another person's name.
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { apiRequest } from "../api";
import { useAuth } from "../context/AuthContext.jsx";
import Message from "../components/Message.jsx";

// how many nights are between the two dates (0 if the dates are not filled in
// or the wrong way around)
function countNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const oneDay = 1000 * 60 * 60 * 24;
  const nights = (new Date(checkOut) - new Date(checkIn)) / oneDay;
  return nights > 0 ? nights : 0;
}

function BookRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const auth = useAuth();

  const [room, setRoom] = useState(null);
  const [hotel, setHotel] = useState(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    apiRequest("/rooms/" + roomId)
      .then((roomData) => {
        setRoom(roomData);
        // now that we know the hotel id we can also show the hotel name
        return apiRequest("/hotels/" + roomData.hotel_id);
      })
      .then((hotelData) => {
        setHotel(hotelData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [roomId]);

  const nights = countNights(checkIn, checkOut);
  const total = room ? nights * Number(room.price_per_night) : 0;

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (nights <= 0) {
      setError("The check out date has to be after the check in date");
      return;
    }

    setBusy(true);
    try {
      const booking = await apiRequest("/bookings", {
        method: "POST",
        token: auth.token,
        body: {
          roomId: Number(roomId),
          checkInDate: checkIn,
          checkOutDate: checkOut,
        },
      });
      // send the user to their bookings and tell that page what happened
      navigate("/my-bookings", {
        state: { message: "Booking #" + booking.bookingId + " is confirmed!" },
      });
    } catch (err) {
      // for example 409 "Room not available for these dates"
      setError(err.message);
      setBusy(false);
    }
  }

  if (loading) {
    return <p className="loading">Loading room...</p>;
  }

  if (!room) {
    return (
      <div>
        <Message type="error" text={error} />
        <Link to="/hotels">Back to the hotel list</Link>
      </div>
    );
  }

  return (
    <div>
      <h1>Confirm your booking</h1>

      <div className="two-columns">
        <div className="form-box">
          <Message type="error" text={error} />

          <form onSubmit={handleSubmit}>
            <label>Check in</label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              required
            />

            <label>Check out</label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              required
            />

            <button className="button" type="submit" disabled={busy}>
              {busy ? "Booking..." : "Confirm booking"}
            </button>
          </form>
        </div>

        {/* the little summary on the right so the price is clear before the
            user presses the button */}
        <div className="summary">
          <h3>Summary</h3>
          <p>
            <b>{hotel ? hotel.name : "Hotel"}</b>
          </p>
          <p>{room.type} room</p>
          <p className="grey">Booked as {auth.user.name}</p>
          <hr />
          <p>${Number(room.price_per_night).toFixed(2)} per night</p>
          <p>{nights} night(s)</p>
          <p className="total">Total: ${total.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}

export default BookRoom;
