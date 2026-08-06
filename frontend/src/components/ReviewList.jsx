// ReviewList.jsx - the reviews of one hotel (GET /reviews?hotelId=..).
// It fetches its own data because the hotel page already has enough to do.
import { useEffect, useState } from "react";
import { apiRequest } from "../api";
import Message from "./Message.jsx";

function ReviewList({ hotelId }) {
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest("/reviews?hotelId=" + hotelId)
      .then((data) => {
        setReviews(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [hotelId]);

  if (loading) {
    return <p className="loading">Loading reviews...</p>;
  }

  return (
    <div>
      <h2>Reviews</h2>

      <Message type="error" text={error} />

      {reviews.length === 0 && !error && (
        <p className="grey">No reviews for this hotel yet.</p>
      )}

      {reviews.map((review) => (
        <div className="review" key={review.review_id}>
          <p className="stars">{"★".repeat(review.rating)}</p>
          <p>{review.comment}</p>
          <p className="grey">
            {review.user_name} &middot; {String(review.date).slice(0, 10)}
          </p>
        </div>
      ))}
    </div>
  );
}

export default ReviewList;
