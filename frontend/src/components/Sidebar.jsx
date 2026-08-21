import { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../config/api";

function Sidebar({
  onSelectChat,
  onNewChat,
  activePage,
  onNavigate,
}) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/conversations/`
      );

      setConversations(response.data);
    } catch (error) {
      console.error("Conversation API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();

    const handleConversationUpdate = () => {
      fetchConversations();
    };

    window.addEventListener(
      "conversationUpdated",
      handleConversationUpdate
    );

    return () => {
      window.removeEventListener(
        "conversationUpdated",
        handleConversationUpdate
      );
    };
  }, []);

  const handleNewChat = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/conversations/`,
        {
          title: "New Chat",
        }
      );

      const newConversation = response.data;

      setConversations((prev) => [
        newConversation,
        ...prev,
      ]);

      onNewChat(newConversation);

      // Open chat page automatically
      onNavigate("chat");

    } catch (error) {
      console.error("New Conversation Error:", error);
    }
  };

  const handleConversationClick = (conversation) => {
    onSelectChat(conversation);
    onNavigate("chat");
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="brand"><span className="brand__mark">✦</span><div><strong>Support AI</strong><small>Service workspace</small></div></div>

      {/* Main Navigation */}

      <button
        onClick={() => onNavigate("chat")}
        className={`nav-button ${activePage === "chat" ? "is-active" : ""}`}
      >
        <span>◌</span> Chat
      </button>

      <button
        onClick={() => onNavigate("analytics")}
        className={`nav-button ${activePage === "analytics" ? "is-active" : ""}`}
      >
        <span>◒</span> Analytics
      </button>

      <button
        onClick={() => onNavigate("complaints")}
        className={`nav-button ${activePage === "complaints" ? "is-active" : ""}`}
      >
        <span>▣</span> Complaints
      </button>

      <button
        onClick={() => onNavigate("agents")}
        className={`nav-button ${activePage === "agents" ? "is-active" : ""}`}
      >
        <span>♙</span> Agents
      </button>

      <div className="sidebar-divider" />

      {/* Chat History */}

      <div className="sidebar-section-heading"><h3>Chat history</h3><span>{conversations.length}</span></div>

      <button className="new-chat-button" onClick={handleNewChat}><span>＋</span> New chat</button>

      {loading && (
        <p className="sidebar-muted">
          Loading conversations...
        </p>
      )}

      {!loading && conversations.length === 0 && (
        <p className="sidebar-muted">
          No conversations yet.
        </p>
      )}

      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          onClick={() =>
            handleConversationClick(conversation)
          }
          className={`conversation-item ${activePage === "chat" ? "is-chat" : ""}`}
        >
          <div className="conversation-item__title">
            {conversation.title}
          </div>

          <div className="conversation-item__meta">
            Conversation #{conversation.id}
          </div>
        </div>
      ))}
    </aside>
  );
}

export default Sidebar;