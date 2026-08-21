function MessageBubble({ sender, text, agent }) {

  const isUser = sender === "user";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginBottom: "12px"
      }}
    >
      <div
        style={{
          maxWidth: "70%",
          padding: "12px",
          borderRadius: "12px",
          background: isUser ? "#2563eb" : "#f1f5f9",
          color: isUser ? "white" : "black"
        }}
      >
        {!isUser && (
          <div
            style={{
              fontSize: "12px",
              color: "#64748b",
              marginBottom: "5px"
            }}
          >
            {agent}
          </div>
        )}

        {text}
      </div>
    </div>
  );
}

export default MessageBubble;