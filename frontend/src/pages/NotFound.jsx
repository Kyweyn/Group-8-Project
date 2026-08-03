// NotFound.jsx - shown when the url does not match any of our routes.
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div>
      <h1>404</h1>
      <p>That page does not exist.</p>
      <Link to="/">Go back home</Link>
    </div>
  );
}

export default NotFound;
