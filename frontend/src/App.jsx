import { useEffect, useState } from "react";
import axios from "axios";

import AnalyticsDashboard from "./components/AnalyticsDashboard";
import ChatBox from "./components/ChatBox";
import InputBox from "./components/InputBox";
import Sidebar from "./components/Sidebar";
import ComplaintPanel from "./components/ComplaintPanel";
import AgentsPage from "./components/AgentsPage";

import { sendMessage } from "./services/api";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function App() {
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [activeConversation, setActiveConversation] = useState(null);

  // Controls which page is visible
  const [activePage, setActivePage] = useState("chat");
  const [availability, setAvailability] = useState(null);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/agent/availability`)
      .then((response) => setAvailability(response.data))
      .catch(() => setAvailability({ status: "OFFLINE", available: 0 }));
  }, []);

  // Create a new chat
  const handleNewChat = (conversation) => {
    setConversationId(conversation.id);
    setActiveConversation(conversation);
    setMessages([]);
    setActivePage("chat");
  };

  // Select an existing conversation
  const handleSelectChat = async (conversation) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/conversations/${conversation.id}`
      );

      setConversationId(conversation.id);
      setActiveConversation(conversation);

      const loadedMessages = response.data.messages.map((msg) => ({
        sender: msg.sender,
        text: msg.message,
        agent: msg.agent,
      }));

      setMessages(loadedMessages);
      setActivePage("chat");
    } catch (error) {
      console.error("Load Conversation Error:", error);
    }
  };

  // Generate a title from the first user message
  const generateChatTitle = (message) => {
    const text = message.toLowerCase();

    if (
      text.includes("refund") ||
      text.includes("money back") ||
      text.includes("refund status")
    ) {
      return "Refund Issue";
    }

    if (
      text.includes("crash") ||
      text.includes("error") ||
      text.includes("not working") ||
      text.includes("bug")
    ) {
      return "Technical Issue";
    }

    if (text.includes("return") || text.includes("return policy")) {
      return "Return Policy";
    }

    if (
      text.includes("damaged") ||
      text.includes("broken") ||
      text.includes("defective")
    ) {
      return "Damaged Product";
    }

    if (
      text.includes("payment") ||
      text.includes("charged") ||
      text.includes("invoice") ||
      text.includes("billing")
    ) {
      return "Billing Issue";
    }

    return message.length > 30 ? message.substring(0, 30) + "..." : message;
  };

  // Create a conversation automatically if one doesn't exist
  const createConversationAutomatically = async (message) => {
    const title = generateChatTitle(message);

    const response = await axios.post(`${API_BASE_URL}/conversations/`, {
      title,
    });

    const conversation = response.data;

    setConversationId(conversation.id);
    setActiveConversation(conversation);
    setActivePage("chat");

    window.dispatchEvent(new Event("conversationUpdated"));

    return conversation;
  };

  const handleStartChat = async () => {
    const conversation = await createConversationAutomatically("Live support request");
    handleNewChat(conversation);
  };

  // Send a chat message
  const handleSend = async (message) => {
    if (loading) return;

    setLoading(true);

    let currentConversationId = conversationId;

    try {
      // Auto-create conversation if none exists
      if (!currentConversationId) {
        const conversation = await createConversationAutomatically(message);
        currentConversationId = conversation.id;
      }

      // Show user message immediately
      setMessages((prev) => [
        ...prev,
        {
          sender: "user",
          text: message,
        },
      ]);

      const isFirstMessage = messages.length === 0;

      // Update title for existing conversation on first message
      if (isFirstMessage && conversationId) {
        const title = generateChatTitle(message);

        await axios.put(
          `${API_BASE_URL}/conversations/${currentConversationId}/title`,
          {
            title: title,
          }
        );

        setActiveConversation((prev) => ({
          ...prev,
          title: title,
        }));

        window.dispatchEvent(new Event("conversationUpdated"));
      }

      // Save user message
      await axios.post(
        `http://127.0.0.1:8000/conversations/${currentConversationId}/messages`,
        {
          sender: "user",
          message: message,
          agent: null,
        }
      );

      // Get AI response
      const result = await sendMessage(message);

      // Show AI response
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: result.response,
          agent: result.agent,
        },
      ]);

      // Save AI response
      await axios.post(
        `http://127.0.0.1:8000/conversations/${currentConversationId}/messages`,
        {
          sender: "bot",
          message: result.response,
          agent: result.agent,
        }
      );

      window.dispatchEvent(new Event("conversationUpdated"));
    } catch (error) {
      console.error("Conversation Message Error:", error);

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Sorry, something went wrong. Please try again.",
          agent: "System",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Render the correct page
  const renderPage = () => {
    // ANALYTICS PAGE
    if (activePage === "analytics") {
      return <AnalyticsDashboard />;
    }

    // COMPLAINTS PAGE
    if (activePage === "complaints") {
      return <ComplaintPanel />;
    }

    if (activePage === "agents") {
      return <AgentsPage />;
    }

    // CHAT PAGE (With Active Conversation)
    if (activeConversation) {
      return (
        <div className="chat-surface">
          {/* Chat Header */}
          <div className="chat-surface__header">
            {activeConversation.title}
          </div>

          {/* Chat Messages */}
          <ChatBox
            messages={messages}
            loading={loading}
            onSendSuggestion={handleSend}
          />

          {/* Chat Input */}
          <InputBox onSend={handleSend} />
        </div>
      );
    }

    // WELCOME SCREEN (When no active conversation selected)
    return (
      <div className="welcome-page">
        {/* Hero Section */}
        <div className="welcome-hero">
          <div className="welcome-hero__mark">✦</div>
          <p className="eyebrow eyebrow--light">Customer support, clarified</p>
          <h1>
            Welcome to Customer Support AI
          </h1>
          <p>
            Get intelligent support for billing issues, technical problems,
            complaints, and frequently asked questions — all powered by AI.
          </p>
        </div>

        {/* Features / Smart Analytics Card */}
        <div className="welcome-grid">
          <div className={`welcome-card availability-card availability-card--${(availability?.status || "offline").toLowerCase()}`}>
            <div className="availability-card__top"><span className="welcome-card__icon">●</span><span className="availability-badge">{availability?.status === "AVAILABLE" ? "Online now" : "Away"}</span></div>
            <h3>{availability?.status === "AVAILABLE" ? "A support agent is ready" : "Support is temporarily busy"}</h3>
            <p>{availability?.available ? `${availability.available} agent${availability.available === 1 ? "" : "s"} available to help.` : "You can still start a request and we will follow up."}</p>
            <button className="availability-card__button" onClick={handleStartChat}>Start a support chat <span aria-hidden="true">→</span></button>
          </div>
          <div className="welcome-card">
            <span className="welcome-card__icon">◒</span>
            <h3>
              📊 Smart Analytics
            </h3>
            <p>
              Monitor chats, complaints, agents, and support request patterns.
            </p>
          </div>
          <div className="welcome-card welcome-card--mint">
            <span className="welcome-card__icon">↗</span>
            <h3>One workspace, every answer</h3>
            <p>Keep conversations, tickets, and team handoffs in one place.</p>
          </div>
        </div>

        {/* Quick Start */}
        <div className="quick-start">
          <div className="section-heading"><span className="eyebrow">Start here</span><h2>Make support feel simple</h2></div>
          <div className="quick-start__steps">
            <div className="quick-step quick-step--blue">
              <strong>1.</strong> Create a New Chat
            </div>
            <div className="quick-step quick-step--green">
              <strong>2.</strong> Ask Your Question
            </div>
            <div className="quick-step quick-step--orange">
              <strong>3.</strong> Get AI Support
            </div>
            <div className="quick-step quick-step--violet">
              <strong>4.</strong> Track Your Requests
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="app-shell">
      {/* SIDEBAR */}
      <Sidebar
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        activePage={activePage}
        onNavigate={setActivePage}
      />

      {/* MAIN CONTENT */}
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;