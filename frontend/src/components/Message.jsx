// Message.jsx - a small box we use on every page to show what the API said.
// The assignment says we are not allowed to fail silently, so every page keeps
// an error / success message in a state and renders it with this component.
function Message({ type, text }) {
  if (!text) {
    return null;
  }

  // type is "error" or "ok"
  return <div className={"message " + type}>{text}</div>;
}

export default Message;
