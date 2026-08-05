// SearchForm.jsx - the city + dates + guests search box.
// We use it on the Home page and again on the Hotels page, that is why it is
// its own component. When it is submitted it calls onSearch() with the values
// and the page decides what to do with them.
import { useState } from "react";

function SearchForm({ initialValues, onSearch }) {
  const start = initialValues || {};
  const [city, setCity] = useState(start.city || "");
  const [checkin, setCheckin] = useState(start.checkin || "");
  const [checkout, setCheckout] = useState(start.checkout || "");
  const [guests, setGuests] = useState(start.guests || "1");

  function handleSubmit(event) {
    event.preventDefault();
    onSearch({ city: city, checkin: checkin, checkout: checkout, guests: guests });
  }

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <div className="search-field">
        <label>City</label>
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Kitchener"
        />
      </div>

      <div className="search-field">
        <label>Check in</label>
        <input
          type="date"
          value={checkin}
          onChange={(e) => setCheckin(e.target.value)}
        />
      </div>

      <div className="search-field">
        <label>Check out</label>
        <input
          type="date"
          value={checkout}
          onChange={(e) => setCheckout(e.target.value)}
        />
      </div>

      <div className="search-field small">
        <label>Guests</label>
        <select value={guests} onChange={(e) => setGuests(e.target.value)}>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
        </select>
      </div>

      <button className="button" type="submit">
        Search
      </button>
    </form>
  );
}

export default SearchForm;
