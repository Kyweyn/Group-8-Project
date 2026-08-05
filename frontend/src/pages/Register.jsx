// Register.jsx - create a new account (POST /auth/register).
// The backend hashes the password with bcrypt, we only send it once over the
// wire and never keep it in a state after the form is submitted.
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Message from "../components/Message.jsx";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const auth = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    // we check the two passwords here in the browser, the backend checks the
    // length again because a user could always skip our form and call the API
    if (password !== password2) {
      setError("The two passwords are not the same");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setBusy(true);
    try {
      await auth.register(name, email, password, phone);
      navigate("/my-bookings");
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  }

  return (
    <div className="form-box">
      <h1>Create an account</h1>

      <Message type="error" text={error} />

      <form onSubmit={handleSubmit}>
        <label>Full name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required />

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Phone (optional)</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} />

        <label>Password (at least 8 characters)</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label>Repeat password</label>
        <input
          type="password"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          required
        />

        <button className="button" type="submit" disabled={busy}>
          {busy ? "Creating..." : "Create account"}
        </button>
      </form>

      <p className="small-text">
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
}

export default Register;
