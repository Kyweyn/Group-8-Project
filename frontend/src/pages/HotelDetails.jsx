// HotelDetails.jsx - one hotel with its rooms (GET /hotels/:id).
// useParams gives us the :id part of the url.
import { useParams } from "react-router-dom";

function HotelDetails() {
  const { id } = useParams();

  return (
    <div>
      <h1>Hotel {id}</h1>
      <p>The hotel info and the room list go here.</p>
    </div>
  );
}

export default HotelDetails;
