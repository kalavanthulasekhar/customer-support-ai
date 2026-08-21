import { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../config/api";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";


function AdminDashboard() {
  const [stats, setStats] = useState({
    total_complaints: 0,
    open: 0,
    pending: 0,
    resolved: 0,
    closed: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_BASE_URL}/admin/stats`
      );

      console.log("ADMIN STATS:", response.data);

      setStats(response.data);
    } catch (error) {
      console.error("Admin stats error:", error);
      setError("Failed to load analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Refresh dashboard when complaint status changes
    const handleComplaintUpdate = () => {
      fetchStats();
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

  const chartData = [
    { name: "Open", value: stats.open },
    { name: "Pending", value: stats.pending },
    { name: "Resolved", value: stats.resolved },
    { name: "Closed", value: stats.closed },
  ];

  const COLORS = [
    "#ef4444",
    "#f59e0b",
    "#3b82f6",
    "#22c55e",
  ];

  const cards = [
    {
      title: "Total Complaints",
      value: stats.total_complaints,
      icon: "📊",
      color: "#6366f1",
    },
    {
      title: "Open Tickets",
      value: stats.open,
      icon: "🔴",
      color: "#ef4444",
    },
    {
      title: "Pending Tickets",
      value: stats.pending,
      icon: "🟡",
      color: "#f59e0b",
    },
    {
      title: "Resolved Tickets",
      value: stats.resolved,
      icon: "🔵",
      color: "#3b82f6",
    },
    {
      title: "Closed Tickets",
      value: stats.closed,
      icon: "🟢",
      color: "#22c55e",
    },
  ];

  if (loading) {
    return (
      <div style={{ padding: "30px" }}>
        Loading analytics...
      </div>
    );
  }

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
          marginBottom: "25px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "15px",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              color: "#1e293b",
            }}
          >
            Admin Analytics Dashboard
          </h1>

          <p
            style={{
              color: "#64748b",
              marginTop: "8px",
            }}
          >
            Monitor customer support complaints and ticket status
          </p>
        </div>

        <button
          onClick={fetchStats}
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
          Refresh Analytics
        </button>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            padding: "15px",
            marginBottom: "20px",
            background: "#fee2e2",
            color: "#b91c1c",
            borderRadius: "8px",
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
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        {cards.map((card) => (
          <div
            key={card.title}
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "14px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
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
                color: "#64748b",
                fontSize: "14px",
              }}
            >
              {card.title}
            </div>

            <div
              style={{
                fontSize: "32px",
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

      {/* Chart Section */}
      <div
        style={{
          background: "white",
          padding: "25px",
          borderRadius: "14px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          maxWidth: "700px",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            color: "#1e293b",
          }}
        >
          Complaint Status Distribution
        </h2>

        <div style={{ width: "100%", height: "350px" }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={110}
                dataKey="value"
                label
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index]}
                  />
                ))}
              </Pie>

              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;