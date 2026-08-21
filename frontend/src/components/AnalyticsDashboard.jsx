import { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";

const API_BASE_URL = "http://127.0.0.1:8000";

function AnalyticsDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_BASE_URL}/admin/stats`
      );

      console.log("Analytics Stats:", response.data);

      setStats(response.data);
    } catch (error) {
      console.error("Analytics error:", error);

      setError(
        "Unable to load analytics. Please check the backend server."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const handleComplaintUpdate = () => {
      fetchData();
    };

    window.addEventListener(
      "complaintUpdated",
      handleComplaintUpdate
    );

    return () => {
      window.removeEventListener(
        "complaintUpdated",
        handleComplaintUpdate
      );
    };
  }, []);

  if (loading) {
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
          color: "#64748b",
        }}
      >
        Loading analytics...
      </div>
    );
  }

  if (!stats) {
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
          color: "#ef4444",
        }}
      >
        Unable to load analytics.
      </div>
    );
  }

  // Support request / agent distribution
  const intentData = [
    {
      name: "Billing",
      value: stats.billing || 0,
    },
    {
      name: "Technical",
      value: stats.technical || 0,
    },
    {
      name: "Complaint",
      value: stats.complaint || 0,
    },
    {
      name: "FAQ",
      value: stats.faq || 0,
    },
    {
      name: "Other",
      value: stats.other || 0,
    },
  ];

  // Complaint status distribution
  const complaintStatusData = [
    {
      name: "Open",
      value: stats.open || 0,
    },
    {
      name: "Pending",
      value: stats.pending || 0,
    },
    {
      name: "Resolved",
      value: stats.resolved || 0,
    },
    {
      name: "Closed",
      value: stats.closed || 0,
    },
  ];

  // Dynamic agent performance data
  const agentPerformanceData = Object.entries(
    stats.agents || {}
  ).map(([agent, value]) => ({
    name:
      agent.charAt(0).toUpperCase() +
      agent.slice(1),
    value,
  }));

  const statusColors = [
    "#ef4444",
    "#f59e0b",
    "#3b82f6",
    "#22c55e",
  ];

  const cardStyle = {
    background: "white",
    borderRadius: "14px",
    padding: "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  };

  const kpiCards = [
    {
      title: "Total Chats",
      value: stats.total_chats || 0,
      icon: "💬",
      color: "#6366f1",
    },
    {
      title: "Total Complaints",
      value: stats.total_complaints || 0,
      icon: "🎫",
      color: "#8b5cf6",
    },
    {
      title: "Open Tickets",
      value: stats.open || 0,
      icon: "🔴",
      color: "#ef4444",
    },
    {
      title: "Pending Tickets",
      value: stats.pending || 0,
      icon: "🟡",
      color: "#f59e0b",
    },
    {
      title: "Resolved Tickets",
      value: stats.resolved || 0,
      icon: "🔵",
      color: "#3b82f6",
    },
    {
      title: "Closed Tickets",
      value: stats.closed || 0,
      icon: "🟢",
      color: "#22c55e",
    },
  ];

  return (
    <div
      style={{
        padding: "25px",
        background: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "15px",
          marginBottom: "25px",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              color: "#1e293b",
            }}
          >
            📊 Analytics Dashboard
          </h1>

          <p
            style={{
              color: "#64748b",
              marginTop: "8px",
            }}
          >
            Customer Support AI performance overview
          </p>
        </div>

        <button
          onClick={fetchData}
          style={{
            padding: "10px 18px",
            border: "none",
            borderRadius: "8px",
            background: "#2563eb",
            color: "white",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          🔄 Refresh Analytics
        </button>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            background: "#fee2e2",
            color: "#b91c1c",
            padding: "14px",
            borderRadius: "10px",
            marginBottom: "20px",
          }}
        >
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "18px",
          marginBottom: "25px",
        }}
      >
        {kpiCards.map((card) => (
          <div
            key={card.title}
            style={{
              ...cardStyle,
              borderLeft: `5px solid ${card.color}`,
            }}
          >
            <div
              style={{
                fontSize: "28px",
                marginBottom: "10px",
              }}
            >
              {card.icon}
            </div>

            <div
              style={{
                fontSize: "14px",
                color: "#64748b",
              }}
            >
              {card.title}
            </div>

            <div
              style={{
                fontSize: "30px",
                fontWeight: "700",
                color: "#1e293b",
                marginTop: "8px",
              }}
            >
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(400px, 1fr))",
          gap: "25px",
        }}
      >
        {/* Support Request Distribution */}
        <div style={cardStyle}>
          <h3
            style={{
              marginTop: 0,
              color: "#1e293b",
            }}
          >
            🤖 Support Request Distribution
          </h3>

          <ResponsiveContainer
            width="100%"
            height={320}
          >
            <BarChart data={intentData}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="name" />

              <YAxis allowDecimals={false} />

              <Tooltip />

              <Legend />

              <Bar
                dataKey="value"
                name="Requests"
                fill="#2563eb"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Complaint Status Distribution */}
        <div style={cardStyle}>
          <h3
            style={{
              marginTop: 0,
              color: "#1e293b",
            }}
          >
            🎫 Complaint Status Distribution
          </h3>

          {stats.total_complaints > 0 ? (
            <ResponsiveContainer
              width="100%"
              height={320}
            >
              <PieChart>
                <Pie
                  data={complaintStatusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={105}
                  label
                >
                  {complaintStatusData.map(
                    (entry, index) => (
                      <Cell
                        key={`status-${index}`}
                        fill={statusColors[index]}
                      />
                    )
                  )}
                </Pie>

                <Tooltip />

                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div
              style={{
                height: "320px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#64748b",
              }}
            >
              No complaints available yet.
            </div>
          )}
        </div>

        {/* Agent Performance */}
        <div
          style={{
            ...cardStyle,
            gridColumn:
              agentPerformanceData.length > 0
                ? "auto"
                : "auto",
          }}
        >
          <h3
            style={{
              marginTop: 0,
              color: "#1e293b",
            }}
          >
            ⚡ Agent Performance
          </h3>

          {agentPerformanceData.length > 0 ? (
            <ResponsiveContainer
              width="100%"
              height={320}
            >
              <BarChart data={agentPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="name" />

                <YAxis allowDecimals={false} />

                <Tooltip />

                <Legend />

                <Bar
                  dataKey="value"
                  name="Handled Requests"
                  fill="#8b5cf6"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div
              style={{
                height: "320px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#64748b",
              }}
            >
              No agent activity recorded yet.
            </div>
          )}
        </div>

        {/* Agent Summary */}
        <div style={cardStyle}>
          <h3
            style={{
              marginTop: 0,
              color: "#1e293b",
            }}
          >
            📋 Agent Summary
          </h3>

          {agentPerformanceData.length > 0 ? (
            agentPerformanceData.map((agent) => (
              <div
                key={agent.name}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "14px 0",
                  borderBottom:
                    "1px solid #e2e8f0",
                }}
              >
                <span
                  style={{
                    fontWeight: "600",
                    color: "#334155",
                  }}
                >
                  {agent.name} Agent
                </span>

                <span
                  style={{
                    background: "#eff6ff",
                    color: "#2563eb",
                    padding: "5px 12px",
                    borderRadius: "20px",
                    fontWeight: "700",
                  }}
                >
                  {agent.value} requests
                </span>
              </div>
            ))
          ) : (
            <p style={{ color: "#64748b" }}>
              No agent data available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;