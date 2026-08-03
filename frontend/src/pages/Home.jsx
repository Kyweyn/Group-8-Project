// Home.jsx - the first page the user sees.
// The search box gets added here later, right now it is only the welcome text.
import { Link } from "react-router-dom";

function Home() {
  return (
    <div>
      <h1>Find a hotel</h1>
      <p>
        Search hotels in Kitchener, Waterloo and Cambridge and book a room
        online.
      </p>
      <Link to="/hotels" className="button">
        See all hotels
      </Link>
    </div>
  );
}

export default Home;
