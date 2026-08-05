// Login.jsx - the login form. It calls POST /auth/login through the context.
import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Message from "../components/Message.jsx";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If the user was sent here by ProtectedRoute we remember which page they
  // wanted, so after the login we can put them back there instead of the home
  // page. If they just clicked "Login" we go to My Bookings.
  const goBackTo = location.state?.from || "/my-bookings";

  async function handleSubmit(event) {
    event.preventDefault(); // stop the browser from reloading the page
    setError("");
    setBusy(true);

    try {
      await auth.login(email, password);
      navigate(goBackTo, { replace: true });
    } catch (err) {
      setError(err.message);
    }

    setBusy(false);
  }

  return (
    <div className="form-box">
      <h1>Login</h1>

      <Message type="error" text={error} />

      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="button" type="submit" disabled={busy}>
          {busy ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="small-text">
        No account yet? <Link to="/register">Create one here</Link>
      </p>
    </div>
  );
}

export default Login;
