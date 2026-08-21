import { useEffect, useState } from "react";
import axios from "axios";
import ComplaintDetails from "./ComplaintDetails";
import API_BASE_URL from "../config/api";

function ComplaintPanel() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("PRIORITY");

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(`${API_BASE_URL}/complaint/list`);
      setComplaints(response.data);
    } catch (err) {
      console.error("Complaint fetch error:", err);
      setError(
        err.response?.data?.detail || "Failed to load complaints."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();

    const handleComplaintUpdate = () => {
      fetchComplaints();
    };

    window.addEventListener("complaintUpdated", handleComplaintUpdate);

    return () => {
      window.removeEventListener("complaintUpdated", handleComplaintUpdate);
    };
  }, []);

  // Update complaint status directly from row
  const updateStatus = async (ticketId, status) => {
    try {
      await axios.put(`${API_BASE_URL}/complaint/${ticketId}/status`, {
        status,
      });
      await fetchComplaints();
      window.dispatchEvent(new Event("complaintUpdated"));
    } catch (err) {
      console.error("Status update error:", err);
      alert(
        err.response?.data?.detail || "Failed to update complaint status."
      );
    }
  };

  // Update complaint priority directly from row
  const updatePriority = async (ticketId, priority) => {
    try {
      await axios.put(`${API_BASE_URL}/complaint/${ticketId}/priority`, {
        priority,
      });
      await fetchComplaints();
      window.dispatchEvent(new Event("complaintUpdated"));
    } catch (err) {
      console.error("Priority update error:", err);
      alert(
        err.response?.data?.detail || "Failed to update complaint priority."
      );
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      OPEN: { background: "#fee2e2", color: "#dc2626" },
      PENDING: { background: "#fef3c7", color: "#d97706" },
      RESOLVED: { background: "#dbeafe", color: "#2563eb" },
      CLOSED: { background: "#dcfce7", color: "#16a34a" },
    };
    return styles[status] || { background: "#e2e8f0", color: "#475569" };
  };

  const getPriorityStyle = (priority) => {
    const styles = {
      LOW: { background: "#dcfce7", color: "#16a34a" },
      MEDIUM: { background: "#fef3c7", color: "#ca8a04" },
      HIGH: { background: "#ffedd5", color: "#ea580c" },
      URGENT: { background: "#fee2e2", color: "#dc2626" },
    };
    return styles[priority] || { background: "#e2e8f0", color: "#475569" };
  };

  const priorityRank = {
    URGENT: 1,
    HIGH: 2,
    MEDIUM: 3,
    LOW: 4,
  };

  // Search + filters + sorting
  const filteredComplaints = complaints
    .filter((complaint) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        complaint.ticket_id?.toLowerCase().includes(search) ||
        complaint.customer_message?.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "ALL" || complaint.status === statusFilter;

      const matchesPriority =
        priorityFilter === "ALL" || complaint.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      if (sortOrder === "PRIORITY") {
        return (
          (priorityRank[a.priority] || 99) - (priorityRank[b.priority] || 99)
        );
      }

      if (sortOrder === "LATEST") {
        return (b.ticket_id || "").localeCompare(a.ticket_id || "");
      }

      if (sortOrder === "OLDEST") {
        return (a.ticket_id || "").localeCompare(b.ticket_id || "");
      }

      return 0;
    });

  if (loading) {
    return (
      <div style={{ padding: "30px", color: "#64748b" }}>
        Loading complaints...
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
      {/* HEADER */}
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
          <h1 style={{ margin: 0, color: "#1e293b" }}>
            Complaint Management
          </h1>
          <p style={{ color: "#64748b", marginTop: "8px" }}>
            Manage customer support tickets, status, and priority
          </p>
        </div>

        <button
          onClick={fetchComplaints}
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
          🔄 Refresh
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div
          style={{
            background: "#fee2e2",
            color: "#b91c1c",
            padding: "15px",
            borderRadius: "10px",
            marginBottom: "20px",
          }}
        >
          {error}
        </div>
      )}

      {/* FILTERS */}
      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "14px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
          marginBottom: "20px",
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          placeholder="🔍 Search ticket or issue..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            minWidth: "220px",
            padding: "11px 14px",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            fontSize: "14px",
          }}
        />

        {/* STATUS FILTER */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: "11px",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          <option value="ALL">All Status</option>
          <option value="OPEN">OPEN</option>
          <option value="PENDING">PENDING</option>
          <option value="RESOLVED">RESOLVED</option>
          <option value="CLOSED">CLOSED</option>
        </select>

        {/* PRIORITY FILTER */}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          style={{
            padding: "11px",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          <option value="ALL">All Priorities</option>
          <option value="URGENT">🔴 URGENT</option>
          <option value="HIGH">🟠 HIGH</option>
          <option value="MEDIUM">🟡 MEDIUM</option>
          <option value="LOW">🟢 LOW</option>
        </select>

        {/* SORT */}
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          style={{
            padding: "11px",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          <option value="PRIORITY">Priority First</option>
          <option value="LATEST">Latest First</option>
          <option value="OLDEST">Oldest First</option>
        </select>
      </div>

      {/* SUMMARY */}
      <div
        style={{
          marginBottom: "15px",
          color: "#64748b",
          fontSize: "14px",
        }}
      >
        Showing {filteredComplaints.length} of {complaints.length} complaints
      </div>

      {/* TABLE */}
      <div
        style={{
          background: "white",
          borderRadius: "14px",
          overflow: "hidden",
          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
        }}
      >
        {filteredComplaints.length === 0 ? (
          <div
            style={{
              padding: "50px",
              textAlign: "center",
              color: "#64748b",
            }}
          >
            <div style={{ fontSize: "40px", marginBottom: "10px" }}>🎫</div>
            No complaints found.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#f1f5f9",
                    textAlign: "left",
                  }}
                >
                  <th style={{ padding: "15px" }}>Ticket ID</th>
                  <th style={{ padding: "15px" }}>Customer Issue</th>
                  <th style={{ padding: "15px" }}>Priority</th>
                  <th style={{ padding: "15px" }}>Status</th>
                  <th style={{ padding: "15px" }}>Update Priority</th>
                  <th style={{ padding: "15px" }}>Update Status</th>
                  <th style={{ padding: "15px" }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredComplaints.map((complaint) => (
                  <tr
                    key={complaint.ticket_id}
                    style={{
                      borderTop: "1px solid #e2e8f0",
                    }}
                  >
                    {/* TICKET */}
                    <td
                      style={{
                        padding: "15px",
                        fontWeight: "600",
                        color: "#2563eb",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {complaint.ticket_id}
                    </td>

                    {/* MESSAGE */}
                    <td
                      style={{
                        padding: "15px",
                        color: "#334155",
                        minWidth: "250px",
                        maxWidth: "400px",
                      }}
                    >
                      {complaint.customer_message}
                    </td>

                    {/* PRIORITY BADGE */}
                    <td style={{ padding: "15px" }}>
                      <span
                        style={{
                          ...getPriorityStyle(complaint.priority),
                          padding: "6px 10px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "700",
                        }}
                      >
                        {complaint.priority === "URGENT"
                          ? "🔴 URGENT"
                          : complaint.priority === "HIGH"
                          ? "🟠 HIGH"
                          : complaint.priority === "MEDIUM"
                          ? "🟡 MEDIUM"
                          : "🟢 LOW"}
                      </span>
                    </td>

                    {/* STATUS BADGE */}
                    <td style={{ padding: "15px" }}>
                      <span
                        style={{
                          ...getStatusStyle(complaint.status),
                          padding: "6px 10px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "700",
                        }}
                      >
                        {complaint.status}
                      </span>
                    </td>

                    {/* UPDATE PRIORITY */}
                    <td style={{ padding: "15px" }}>
                      <select
                        value={complaint.priority || "MEDIUM"}
                        onChange={(e) =>
                          updatePriority(complaint.ticket_id, e.target.value)
                        }
                        style={{
                          padding: "8px",
                          border: "1px solid #cbd5e1",
                          borderRadius: "7px",
                          cursor: "pointer",
                        }}
                      >
                        <option value="LOW">🟢 LOW</option>
                        <option value="MEDIUM">🟡 MEDIUM</option>
                        <option value="HIGH">🟠 HIGH</option>
                        <option value="URGENT">🔴 URGENT</option>
                      </select>
                    </td>

                    {/* UPDATE STATUS */}
                    <td style={{ padding: "15px" }}>
                      <select
                        value={complaint.status}
                        onChange={(e) =>
                          updateStatus(complaint.ticket_id, e.target.value)
                        }
                        style={{
                          padding: "8px",
                          border: "1px solid #cbd5e1",
                          borderRadius: "7px",
                          cursor: "pointer",
                        }}
                      >
                        <option value="OPEN">OPEN</option>
                        <option value="PENDING">PENDING</option>
                        <option value="RESOLVED">RESOLVED</option>
                        <option value="CLOSED">CLOSED</option>
                      </select>
                    </td>

                    {/* ACTIONS / VIEW DETAILS BUTTON */}
                    <td style={{ padding: "15px" }}>
                      <button
                        onClick={() => setSelectedComplaint(complaint)}
                        style={{
                          padding: "8px 14px",
                          border: "1px solid #2563eb",
                          borderRadius: "6px",
                          background: "#eff6ff",
                          color: "#2563eb",
                          fontWeight: "600",
                          cursor: "pointer",
                          fontSize: "13px",
                        }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* COMPLAINT DETAILS MANAGEMENT PANEL */}
      <ComplaintDetails
        complaint={selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        onUpdated={fetchComplaints}
      />
    </div>
  );
}

export default ComplaintPanel;