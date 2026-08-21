import { useEffect, useRef } from "react";

function ChatBox({
  messages = [],
  loading = false,
  onSendSuggestion,
}) {
  const messagesEndRef = useRef(null);

  // Auto-scroll whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  const getAgentDetails = (agent) => {
    const agentName = (agent || "").toLowerCase();

    if (agentName.includes("billing")) {
      return {
        icon: "💳",
        name: "Billing Support",
        color: "#7c3aed",
      };
    }

    if (agentName.includes("technical")) {
      return {
        icon: "🔧",
        name: "Technical Support",
        color: "#2563eb",
      };
    }

    if (agentName.includes("complaint")) {
      return {
        icon: "🎫",
        name: "Complaint Support",
        color: "#dc2626",
      };
    }

    if (agentName.includes("faq")) {
      return {
        icon: "📚",
        name: "FAQ Assistant",
        color: "#059669",
      };
    }

    return {
      icon: "🤖",
      name: "AI Support",
      color: "#4f46e5",
    };
  };

  const formatTime = (timestamp) => {
    if (!timestamp) {
      return new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const highlightTicketId = (text) => {
    if (typeof text !== "string") {
      return text;
    }

    const parts = text.split(/(CMP-[A-Z0-9]+)/gi);

    return parts.map((part, index) => {
      if (/^CMP-[A-Z0-9]+$/i.test(part)) {
        return (
          <span
            key={index}
            style={{
              display: "inline-block",
              margin: "2px 3px",
              padding: "3px 8px",
              borderRadius: "6px",
              background: "#eff6ff",
              color: "#2563eb",
              fontWeight: "700",
              fontSize: "13px",
              border: "1px solid #bfdbfe",
            }}
          >
            🎫 {part}
          </span>
        );
      }

      return part;
    });
  };

  const suggestions = [
    {
      icon: "💳",
      text: "I have a billing issue",
    },
    {
      icon: "🔧",
      text: "My application is not working",
    },
    {
      icon: "🎫",
      text: "I want to file a complaint",
    },
    {
      icon: "📦",
      text: "I received a damaged product",
    },
  ];

  return (
    <div
      style={{
        height: "500px",
        overflowY: "auto",
        padding: "20px",
        background: "#f8fafc",
        borderRadius: "12px",
        boxSizing: "border-box",
      }}
    >
      {/* Empty Chat */}
      {messages.length === 0 && !loading && (
        <div
          style={{
            minHeight: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#64748b",
          }}
        >
          <div
            style={{
              width: "70px",
              height: "70px",
              borderRadius: "50%",
              background: "#e0e7ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "34px",
              marginBottom: "15px",
            }}
          >
            🤖
          </div>

          <h2
            style={{
              margin: "0 0 8px",
              color: "#1e293b",
            }}
          >
            How can I help you?
          </h2>

          <p
            style={{
              margin: "0 0 25px",
              textAlign: "center",
              maxWidth: "450px",
            }}
          >
            Ask about billing, technical problems, complaints,
            products, or other support questions.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "10px",
              width: "100%",
              maxWidth: "600px",
            }}
          >
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.text}
                onClick={() => onSendSuggestion?.(suggestion.text)}
                disabled={loading}
                style={{
                  padding: "14px",
                  background: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  color: "#334155",
                  fontSize: "14px",
                  cursor: loading ? "not-allowed" : "pointer",
                  textAlign: "left",
                  transition: "0.2s",
                  opacity: loading ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.background = "#eff6ff";
                    e.currentTarget.style.borderColor = "#2563eb";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "white";
                  e.currentTarget.style.borderColor = "#e2e8f0";
                }}
              >
                <span
                  style={{
                    fontSize: "20px",
                    marginRight: "8px",
                  }}
                >
                  {suggestion.icon}
                </span>

                {suggestion.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      {messages.map((msg, index) => {
        const isUser = msg.sender === "user";
        const agent = getAgentDetails(msg.agent);

        return (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent: isUser
                ? "flex-end"
                : "flex-start",
              marginBottom: "18px",
              gap: "10px",
            }}
          >
            {/* AI Avatar */}
            {!isUser && (
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  minWidth: "36px",
                  borderRadius: "50%",
                  background: "#e0e7ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                }}
              >
                {agent.icon}
              </div>
            )}

            <div
              style={{
                maxWidth: "75%",
              }}
            >
              {/* Sender */}
              <div
                style={{
                  display: "flex",
                  justifyContent: isUser
                    ? "flex-end"
                    : "flex-start",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12px",
                  color: "#64748b",
                  marginBottom: "5px",
                }}
              >
                {isUser ? "You" : agent.name}

                <span
                  style={{
                    fontSize: "11px",
                    color: "#94a3b8",
                  }}
                >
                  • {formatTime(msg.created_at)}
                </span>
              </div>

              {/* Message Bubble */}
              <div
                style={{
                  padding: "13px 17px",
                  borderRadius: isUser
                    ? "16px 16px 4px 16px"
                    : "16px 16px 16px 4px",
                  background: isUser
                    ? "#2563eb"
                    : "white",
                  color: isUser
                    ? "white"
                    : "#1e293b",
                  border: isUser
                    ? "none"
                    : "1px solid #e2e8f0",
                  boxShadow:
                    "0 3px 10px rgba(0,0,0,0.06)",
                  lineHeight: "1.6",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {isUser
                  ? msg.text
                  : highlightTicketId(msg.text)}
              </div>

              {/* Agent Badge */}
              {!isUser && msg.agent && (
                <div
                  style={{
                    marginTop: "6px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "4px 8px",
                    borderRadius: "20px",
                    background: "#f1f5f9",
                    color: agent.color,
                    fontSize: "11px",
                    fontWeight: "600",
                  }}
                >
                  {agent.icon} Handled by {agent.name}
                </div>
              )}
            </div>

            {/* User Avatar */}
            {isUser && (
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  minWidth: "36px",
                  borderRadius: "50%",
                  background: "#2563eb",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "17px",
                }}
              >
                👤
              </div>
            )}
          </div>
        );
      })}

      {/* Typing Indicator */}
      {loading && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginTop: "10px",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "#e0e7ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            🤖
          </div>

          <div
            style={{
              padding: "12px 16px",
              borderRadius: "16px 16px 16px 4px",
              background: "white",
              border: "1px solid #e2e8f0",
              color: "#64748b",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <span>AI Support is thinking</span>

            <span
              style={{
                fontWeight: "bold",
                letterSpacing: "3px",
              }}
            >
              ...
            </span>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}

export default ChatBox;