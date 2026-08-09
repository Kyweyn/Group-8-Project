// ManageRooms.jsx - admin page for the rooms of one hotel.
//
//   READ    GET    /hotels/:id   (the hotel comes back with its rooms)
//   CREATE  POST   /rooms
//   UPDATE  PUT    /rooms/:id
//   DELETE  DELETE /rooms/:id
//
// The add form and the edit are in this file because a room only has four
// fields, a separate component would be more code than it saves.
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiRequest } from "../api";
import { useAuth } from "../context/AuthContext.jsx";
import Message from "../components/Message.jsx";

const emptyRoom = {
  type: "Single",
  pricePerNight: "",
  maxGuests: "1",
  quantityAvailable: "1",
};

function ManageRooms() {
  const { hotelId } = useParams();
  const auth = useAuth();

  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [okMessage, setOkMessage] = useState("");

  // the form at the top. editingId is null when we are adding a new room.
  const [form, setForm] = useState(emptyRoom);
  const [editingId, setEditingId] = useState(null);

  function loadHotel() {
    setLoading(true);
    apiRequest("/hotels/" + hotelId)
      .then((data) => {
        setHotel(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }

  useEffect(() => {
    loadHotel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelId]);

  // one handler for all four inputs, it uses the name attribute of the input
  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function startEdit(room) {
    setEditingId(room.room_id);
    setForm({
      type: room.type,
      pricePerNight: String(room.price_per_night),
      maxGuests: String(room.max_guests),
      quantityAvailable: String(room.quantity_available),
    });
  }

  function stopEdit() {
    setEditingId(null);
    setForm(emptyRoom);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setOkMessage("");

    // the inputs give us strings, the API wants numbers
    const body = {
      hotelId: Number(hotelId),
      type: form.type,
      pricePerNight: Number(form.pricePerNight),
      maxGuests: Number(form.maxGuests),
      quantityAvailable: Number(form.quantityAvailable),
    };

    try {
      if (editingId) {
        await apiRequest("/rooms/" + editingId, {
          method: "PUT",
          token: auth.token,
          body: body,
        });
        setOkMessage("Room " + editingId + " was updated.");
      } else {
        const created = await apiRequest("/rooms", {
          method: "POST",
          token: auth.token,
          body: body,
        });
        setOkMessage("Room " + created.roomId + " was added.");
      }
      stopEdit();
      loadHotel();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(room) {
    const sure = window.confirm("Delete the " + room.type + " room?");
    if (!sure) return;

    setError("");
    setOkMessage("");
    try {
      await apiRequest("/rooms/" + room.room_id, {
        method: "DELETE",
        token: auth.token,
      });
      setOkMessage("The room was deleted.");
      loadHotel();
    } catch (err) {
      // 409 when there are still bookings for this room
      setError(err.message);
    }
  }

  if (loading) {
    return <p className="loading">Loading rooms...</p>;
  }

  if (!hotel) {
    return (
      <div>
        <Message type="error" text={error} />
        <Link to="/manage/hotels">Back to the hotel list</Link>
      </div>
    );
  }

  return (
    <div>
      <Link to="/manage/hotels" className="small-text">
        &larr; Back to manage hotels
      </Link>

      <h1>Rooms of {hotel.name}</h1>

      <Message type="ok" text={okMessage} />
      <Message type="error" text={error} />

      <div className="form-box wide">
        <h2>{editingId ? "Edit room " + editingId : "Add a room type"}</h2>

        <form onSubmit={handleSubmit}>
          <label>Type</label>
          <select name="type" value={form.type} onChange={handleChange}>
            <option>Single</option>
            <option>Double</option>
            <option>Suite</option>
            <option>Family</option>
          </select>

          <label>Price per night ($)</label>
          <input
            name="pricePerNight"
            type="number"
            min="1"
            step="0.01"
            value={form.pricePerNight}
            onChange={handleChange}
            required
          />

          <label>Max guests</label>
          <input
            name="maxGuests"
            type="number"
            min="1"
            value={form.maxGuests}
            onChange={handleChange}
            required
          />

          <label>How many rooms of this type</label>
          <input
            name="quantityAvailable"
            type="number"
            min="1"
            value={form.quantityAvailable}
            onChange={handleChange}
            required
          />

          <button className="button" type="submit">
            {editingId ? "Save changes" : "Add room"}
          </button>{" "}
          {editingId && (
            <button className="button secondary" type="button" onClick={stopEdit}>
              Cancel
            </button>
          )}
        </form>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Id</th>
            <th>Type</th>
            <th>Price</th>
            <th>Guests</th>
            <th>Qty</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {hotel.rooms.map((room) => (
            <tr key={room.room_id}>
              <td>{room.room_id}</td>
              <td>{room.type}</td>
              <td>${Number(room.price_per_night).toFixed(2)}</td>
              <td>{room.max_guests}</td>
              <td>{room.quantity_available}</td>
              <td className="right">
                <button className="button small" onClick={() => startEdit(room)}>
                  Edit
                </button>{" "}
                <button
                  className="button small red"
                  onClick={() => handleDelete(room)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {hotel.rooms.length === 0 && (
        <p className="grey">This hotel has no room types yet.</p>
      )}
    </div>
  );
}

export default ManageRooms;
