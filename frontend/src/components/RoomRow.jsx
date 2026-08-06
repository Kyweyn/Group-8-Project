// RoomRow.jsx - one room type inside the hotel page.
// The "Book now" button goes to the booking form and takes the room id with it.
import { Link } from "react-router-dom";

function RoomRow({ room }) {
  return (
    <div className="card">
      <div className="card-main">
        <h3>{room.type}</h3>
        <p className="grey">
          Up to {room.max_guests} guests &middot; {room.quantity_available} rooms
          of this type
        </p>
      </div>

      <div className="card-side">
        <p className="price">
          <b>${Number(room.price_per_night).toFixed(2)}</b> / night
        </p>
        <Link className="button" to={"/book/" + room.room_id}>
          Book now
        </Link>
      </div>
    </div>
  );
}

export default RoomRow;
