// AiHelper.jsx - the AI component of Milestone 5.
//
// The user types what kind of trip they want, we send it to our own backend
// (POST /ai/suggest) and the backend asks Claude. The answer is shown right
// here in the box, the user never leaves the page.
//
// You have to be logged in because the route uses requireAuth, so for a visitor
// we show a small "log in first" note instead of the input.
import { useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api";
import { useAuth } from "../context/AuthContext.jsx";
import Message from "./Message.jsx";

// a few ready made questions, it saves typing during the demo
const examples = [
  "Somewhere quiet for 2 people under $150 a night",
  "A nice hotel close to the universities",
  "The best rated place for a family of 4",
];

function AiHelper() {
  const auth = useAuth();

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function ask(text) {
    setError("");
    setAnswer("");
    setBusy(true);

    try {
      const data = await apiRequest("/ai/suggest", {
        method: "POST",
        token: auth.token,
        body: { question: text },
      });
      setAnswer(data.answer);
    } catch (err) {
      // for example 503 when there is no API key in the backend .env
      setError(err.message);
    }

    setBusy(false);
  }

  function handleSubmit(event) {
    event.preventDefault();
    ask(question);
  }

  return (
    <div className="ai-box">
      <h2>Not sure where to stay?</h2>
      <p className="grey">
        Ask our AI helper. It only suggests hotels that are really in our
        database.
      </p>

      {!auth.isLoggedIn ? (
        <p className="small-text">
          <Link to="/login">Log in</Link> to use the AI helper.
        </p>
      ) : (
        <>
          <form onSubmit={handleSubmit}>
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="I need a cheap room for 2 people in Waterloo..."
              maxLength={300}
            />
            <button className="button" type="submit" disabled={busy || !question}>
              {busy ? "Thinking..." : "Ask"}
            </button>
          </form>

          <div className="examples">
            {examples.map((example) => (
              <button
                key={example}
                className="example-chip"
                type="button"
                onClick={() => {
                  setQuestion(example);
                  ask(example);
                }}
              >
                {example}
              </button>
            ))}
          </div>

          <Message type="error" text={error} />

          {busy && <p className="loading">Asking Claude...</p>}

          {answer && (
            <div className="ai-answer">
              {/* Claude answers with normal text and line breaks, so we split it
                  into paragraphs instead of dumping it in one block */}
              {answer.split("\n").map((line, index) =>
                line.trim() === "" ? null : <p key={index}>{line}</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AiHelper;
