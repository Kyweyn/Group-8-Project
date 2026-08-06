// HotelDetails.jsx - one hotel with its room types (GET /hotels/:id).
// The backend sends the hotel and the array of rooms together in one answer.
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiRequest } from "../api";
import RoomRow from "../components/RoomRow.jsx";
import ReviewList from "../components/ReviewList.jsx";
import Message from "../components/Message.jsx";

function HotelDetails() {
  const { id } = useParams(); // the :id part of /hotels/:id
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    apiRequest("/hotels/" + id)
      .then((data) => {
        setHotel(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <p className="loading">Loading hotel...</p>;
  }

  // if the id does not exist the API answers 404 and we end up here
  if (error) {
    return (
      <div>
        <Message type="error" text={error} />
        <Link to="/hotels">Back to the hotel list</Link>
      </div>
    );
  }

  return (
    <div>
      <Link to="/hotels" className="small-text">
        &larr; Back to the hotel list
      </Link>

      <h1>{hotel.name}</h1>
      <p className="stars">{"★".repeat(hotel.star_rating || 0)}</p>
      <p className="city">{hotel.address}</p>
      <p>{hotel.description}</p>

      <h2>Rooms</h2>
      {hotel.rooms.length === 0 && (
        <p className="grey">This hotel has no rooms in the system yet.</p>
      )}
      {hotel.rooms.map((room) => (
        <RoomRow key={room.room_id} room={room} />
      ))}

      <ReviewList hotelId={hotel.hotel_id} />
    </div>
  );
}

export default HotelDetails;
