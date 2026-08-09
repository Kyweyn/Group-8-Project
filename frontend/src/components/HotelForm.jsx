// HotelForm.jsx - the same form is used for adding a new hotel and for editing
// an existing one, we only give it different props.
//
//   hotel     - null when we add, the hotel object when we edit
//   onSave    - the manage page does the POST or the PUT
//   onCancel  - closes the form
import { useState } from "react";

function HotelForm({ hotel, onSave, onCancel }) {
  const editing = hotel != null;

  const [name, setName] = useState(hotel ? hotel.name : "");
  const [city, setCity] = useState(hotel ? hotel.city : "");
  const [address, setAddress] = useState(hotel ? hotel.address : "");
  const [starRating, setStarRating] = useState(hotel ? String(hotel.star_rating) : "3");
  const [description, setDescription] = useState(hotel ? hotel.description || "" : "");

  function handleSubmit(event) {
    event.preventDefault();
    onSave({
      name: name,
      city: city,
      address: address,
      starRating: Number(starRating),
      description: description,
    });
  }

  return (
    <div className="form-box wide">
      <h2>{editing ? "Edit hotel" : "Add a new hotel"}</h2>

      <form onSubmit={handleSubmit}>
        <label>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required />

        <label>City</label>
        <input value={city} onChange={(e) => setCity(e.target.value)} required />

        <label>Address</label>
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />

        <label>Stars (1 to 5)</label>
        <select value={starRating} onChange={(e) => setStarRating(e.target.value)}>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>

        <label>Description</label>
        <textarea
          rows="3"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button className="button" type="submit">
          {editing ? "Save changes" : "Add hotel"}
        </button>{" "}
        <button className="button secondary" type="button" onClick={onCancel}>
          Cancel
        </button>
      </form>
    </div>
  );
}

export default HotelForm;
