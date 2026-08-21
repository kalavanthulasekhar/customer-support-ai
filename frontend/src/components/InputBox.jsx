import { useState } from "react";

function InputBox({ onSend }) {
  const [message, setMessage] = useState("");

  const handleSend = (event) => {
    event.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    onSend(trimmedMessage);
    setMessage("");
  };

  return (
    <form className="message-composer" onSubmit={handleSend}>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Describe your issue..."
        aria-label="Message support"
      />
      <button type="submit" aria-label="Send message">
        <span aria-hidden="true">↑</span>
        Send
      </button>
    </form>
  );
}

export default InputBox;