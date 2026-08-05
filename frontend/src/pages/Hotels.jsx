// Hotels.jsx - the hotel list page (READ).
//
// Two different API calls end up on this page:
//   no city in the url  -> GET /hotels                (show everything)
//   a city in the url   -> GET /hotels/search?city=.. (only free hotels)
//
// We keep the search in the url (?city=Kitchener&checkin=...) instead of in a
// state, so the back button works and you can send the link to a friend.
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { apiRequest } from "../api";
import HotelCard from "../components/HotelCard.jsx";
import SearchForm from "../components/SearchForm.jsx";
import Message from "../components/Message.jsx";

function Hotels() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const city = searchParams.get("city") || "";
  const checkin = searchParams.get("checkin") || "";
  const checkout = searchParams.get("checkout") || "";
  const guests = searchParams.get("guests") || "1";

  // useEffect runs after the page is drawn and every time one of the values in
  // the array at the bottom changes
  useEffect(() => {
    setLoading(true);
    setError("");

    // build the path we have to call
    let path = "/hotels";
    if (city) {
      path =
        "/hotels/search?city=" +
        encodeURIComponent(city) +
        "&checkin=" +
        checkin +
        "&checkout=" +
        checkout +
        "&guests=" +
        guests;
    }

    apiRequest(path)
      .then((data) => {
        setHotels(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [city, checkin, checkout, guests]);

  function handleSearch(values) {
    if (!values.city) {
      // empty city = show all hotels again
      setSearchParams({});
      return;
    }
    setSearchParams(values);
  }

  return (
    <div>
      <h1>{city ? "Hotels in " + city : "All hotels"}</h1>

      <SearchForm
        initialValues={{ city, checkin, checkout, guests }}
        onSearch={handleSearch}
      />

      <Message type="error" text={error} />

      {loading && <p className="loading">Loading hotels...</p>}

      {!loading && !error && hotels.length === 0 && (
        <p>No hotels found. Try another city or other dates.</p>
      )}

      {hotels.map((hotel) => (
        <HotelCard key={hotel.hotel_id} hotel={hotel} />
      ))}
    </div>
  );
}

export default Hotels;
