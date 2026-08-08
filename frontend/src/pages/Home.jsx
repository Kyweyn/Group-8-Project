// Home.jsx - the first page the user sees.
// The search form here does not call the API itself, it just sends the user to
// the /hotels page with the values in the url and that page does the fetch.
import { useNavigate, Link } from "react-router-dom";
import SearchForm from "../components/SearchForm.jsx";
import AiHelper from "../components/AiHelper.jsx";

function Home() {
  const navigate = useNavigate();

  function handleSearch(values) {
    const query = new URLSearchParams(values).toString();
    navigate("/hotels?" + query);
  }

  return (
    <div>
      <div className="hero">
        <h1>Find a room for your next trip</h1>
        <p>
          Hotels in Kitchener, Waterloo and Cambridge. Search by city and dates,
          see the price before you book.
        </p>
      </div>

      <SearchForm onSearch={handleSearch} />

      <p className="small-text">
        Or just <Link to="/hotels">look at all the hotels</Link>.
      </p>

      <AiHelper />
    </div>
  );
}

export default Home;
