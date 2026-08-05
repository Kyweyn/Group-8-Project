// HotelCard.jsx - one hotel in the list.
// It only knows how to draw a hotel, it does not fetch anything itself. The
// page gives it the hotel object as a prop.
import { Link } from "react-router-dom";

function HotelCard({ hotel }) {
  // star_rating is a number 1-5, we turn it into stars like ★★★★
  const stars = "★".repeat(hotel.star_rating || 0);

  return (
    <div className="card">
      <div className="card-main">
        <h3>{hotel.name}</h3>
        <p className="city">{hotel.city}</p>
        <p className="stars">
          {stars} <span className="grey">({hotel.star_rating || "-"} star)</span>
        </p>
      </div>

      <div className="card-side">
        {/* the search route does not return a price, so we only show it when
            the API actually sent one */}
        {hotel.starting_price != null && (
          <p className="price">
            from <b>${Number(hotel.starting_price).toFixed(2)}</b> / night
          </p>
        )}
        <Link className="button" to={"/hotels/" + hotel.hotel_id}>
          View rooms
        </Link>
      </div>
    </div>
  );
}

export default HotelCard;
