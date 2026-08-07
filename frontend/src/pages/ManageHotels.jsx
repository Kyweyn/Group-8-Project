// ManageHotels.jsx - the admin page. This is where all four operations of the
// hotels resource are in the user interface:
//
//   READ    GET    /hotels        the table
//   CREATE  POST   /hotels        the "Add a new hotel" form
//   UPDATE  PUT    /hotels/:id    the Edit button opens the same form
//   DELETE  DELETE /hotels/:id    the Delete button
//
// The page is behind <ProtectedRoute adminOnly>, and the backend checks the
// admin role again with requireAdmin, so a normal user gets a 403 even if they
// somehow open this page.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api";
import { useAuth } from "../context/AuthContext.jsx";
import HotelForm from "../components/HotelForm.jsx";
import Message from "../components/Message.jsx";

function ManageHotels() {
  const auth = useAuth();

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [okMessage, setOkMessage] = useState("");

  // showForm is false (no form), "new" (add form) or a hotel object (edit form)
  const [showForm, setShowForm] = useState(false);

  function loadHotels() {
    setLoading(true);
    apiRequest("/hotels")
      .then((data) => {
        setHotels(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }

  useEffect(() => {
    loadHotels();
  }, []);

  // GET /hotels only sends the name, the city and the stars. The edit form also
  // needs the address and the description, so we load the full hotel first.
  async function handleEdit(hotel) {
    setError("");
    setOkMessage("");
    try {
      const full = await apiRequest("/hotels/" + hotel.hotel_id);
      setShowForm(full);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSave(values) {
    setError("");
    setOkMessage("");

    try {
      if (showForm === "new") {
        const created = await apiRequest("/hotels", {
          method: "POST",
          token: auth.token,
          body: values,
        });
        setOkMessage(created.name + " was added (id " + created.hotelId + ").");
      } else {
        await apiRequest("/hotels/" + showForm.hotel_id, {
          method: "PUT",
          token: auth.token,
          body: values,
        });
        setOkMessage(values.name + " was updated.");
      }
      setShowForm(false);
      loadHotels();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(hotel) {
    const sure = window.confirm("Delete " + hotel.name + "?");
    if (!sure) return;

    setError("");
    setOkMessage("");
    try {
      await apiRequest("/hotels/" + hotel.hotel_id, {
        method: "DELETE",
        token: auth.token,
      });
      setOkMessage(hotel.name + " was deleted.");
      loadHotels();
    } catch (err) {
      // the API answers 409 when the hotel still has rooms
      setError(err.message);
    }
  }

  return (
    <div>
      <h1>Manage hotels</h1>
      <p className="grey">You are logged in as an admin ({auth.user.email}).</p>

      <Message type="ok" text={okMessage} />
      <Message type="error" text={error} />

      {!showForm && (
        <button className="button" onClick={() => setShowForm("new")}>
          + Add a new hotel
        </button>
      )}

      {showForm && (
        // the key makes React build a fresh form when we switch from one hotel
        // to another, otherwise the old values stay in the inputs
        <HotelForm
          key={showForm === "new" ? "new" : showForm.hotel_id}
          hotel={showForm === "new" ? null : showForm}
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
        />
      )}

      {loading && <p className="loading">Loading hotels...</p>}

      {!loading && (
        <table className="table">
          <thead>
            <tr>
              <th>Id</th>
              <th>Name</th>
              <th>City</th>
              <th>Stars</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {hotels.map((hotel) => (
              <tr key={hotel.hotel_id}>
                <td>{hotel.hotel_id}</td>
                <td>{hotel.name}</td>
                <td>{hotel.city}</td>
                <td>{hotel.star_rating}</td>
                <td className="right">
                  <Link
                    className="button small"
                    to={"/manage/hotels/" + hotel.hotel_id + "/rooms"}
                  >
                    Rooms
                  </Link>{" "}
                  <button
                    className="button small"
                    onClick={() => handleEdit(hotel)}
                  >
                    Edit
                  </button>{" "}
                  <button
                    className="button small red"
                    onClick={() => handleDelete(hotel)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ManageHotels;
