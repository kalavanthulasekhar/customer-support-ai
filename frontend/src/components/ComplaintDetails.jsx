import { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../config/api";

function ComplaintDetails({
  complaint,
  onClose,
  onUpdated,
}) {
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [category, setCategory] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  const [activity, setActivity] = useState([]);
  const [activityLoading, setActivityLoading] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ==========================================
  // LOAD ACTIVITY HISTORY
  // ==========================================

  const fetchActivity = async (ticketId) => {
    if (!ticketId) return;

    try {
      setActivityLoading(true);

      const response = await axios.get(
        `${API_BASE_URL}/complaint/${ticketId}/activity`
      );

      setActivity(response.data || []);

    } catch (error) {
      console.error(
        "Activity fetch error:",
        error
      );

      setActivity([]);
    } finally {
      setActivityLoading(false);
    }
  };

  // ==========================================
  // LOAD COMPLAINT DATA
  // ==========================================

  useEffect(() => {
    if (complaint) {
      setStatus(complaint.status || "OPEN");
      setPriority(complaint.priority || "MEDIUM");
      setCategory(complaint.category || "OTHER");
      setAdminNote(complaint.admin_note || "");
      setAssignedTo(complaint.assigned_to || "");

      fetchActivity(complaint.ticket_id);
      setMessage("");
    }
  }, [complaint]);

  if (!complaint) {
    return null;
  }

  // ==========================================
  // SAVE CHANGES
  // ==========================================

  const handleSave = async () => {
    try {
      setLoading(true);
      setMessage("");

      const ticketId = complaint.ticket_id;

      // Update status
      await axios.put(
        `${API_BASE_URL}/complaint/${ticketId}/status`,
        {
          status,
        }
      );

      // Update priority
      await axios.put(
        `${API_BASE_URL}/complaint/${ticketId}/priority`,
        {
          priority,
        }
      );

      // Update category
      await axios.put(
        `${API_BASE_URL}/complaint/${ticketId}/category`,
        {
          category,
        }
      );

      // Update admin note
      await axios.put(
        `${API_BASE_URL}/complaint/${ticketId}/note`,
        {
          admin_note: adminNote,
        }
      );

      // Update assignment
      await axios.put(
        `${API_BASE_URL}/complaint/${ticketId}/assign`,
        {
          assigned_to: assignedTo,
        }
      );

      // Refresh activity timeline
      await fetchActivity(ticketId);

      setMessage(
        "Complaint updated successfully."
      );

      window.dispatchEvent(
        new Event("complaintUpdated")
      );

      if (onUpdated) {
        onUpdated();
      }

    } catch (error) {
      console.error(
        "Complaint update error:",
        error
      );

      setMessage(
        error.response?.data?.detail ||
        "Failed to update complaint."
      );

    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // ACTIVITY ICON
  // ==========================================

  const getActivityIcon = (actionType) => {
    const icons = {
      CREATED: "🎫",
      STATUS_CHANGED: "🔄",
      PRIORITY_CHANGED: "⚡",
      CATEGORY_CHANGED: "🏷️",
      NOTE_ADDED: "📝",
      NOTE_UPDATED: "✏️",
      NOTE_REMOVED: "🗑️",
      ASSIGNMENT_CHANGED: "👤",
    };

    return icons[actionType] || "📌";
  };

  // ==========================================
  // ACTIVITY COLOR
  // ==========================================

  const getActivityStyle = (actionType) => {
    const styles = {
      CREATED: {
        background: "#dbeafe",
        color: "#2563eb",
      },

      STATUS_CHANGED: {
        background: "#dcfce7",
        color: "#16a34a",
      },

      PRIORITY_CHANGED: {
        background: "#ffedd5",
        color: "#ea580c",
      },

      CATEGORY_CHANGED: {
        background: "#f3e8ff",
        color: "#9333ea",
      },

      NOTE_ADDED: {
        background: "#fef3c7",
        color: "#ca8a04",
      },

      NOTE_UPDATED: {
        background: "#fef3c7",
        color: "#ca8a04",
      },

      NOTE_REMOVED: {
        background: "#fee2e2",
        color: "#dc2626",
      },

      ASSIGNMENT_CHANGED: {
        background: "#e0f2fe",
        color: "#0284c7",
      },
    };

    return (
      styles[actionType] || {
        background: "#f1f5f9",
        color: "#475569",
      }
    );
  };

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) return "Unknown time";

    try {
      return new Date(date).toLocaleString();
    } catch {
      return date;
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.45)",
        display: "flex",
        justifyContent: "flex-end",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          width: "620px",
          maxWidth: "100%",
          height: "100vh",
          background: "white",
          overflowY: "auto",
          padding: "25px",
          boxSizing: "border-box",
          boxShadow:
            "-8px 0 25px rgba(0,0,0,0.15)",
        }}
      >

        {/* HEADER */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "25px",
            position: "sticky",
            top: "-25px",
            background: "white",
            paddingTop: "25px",
            zIndex: 5,
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                color: "#1e293b",
              }}
            >
              Complaint Details
            </h2>

            <p
              style={{
                margin: "6px 0 0",
                color: "#64748b",
              }}
            >
              {complaint.ticket_id}
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "#f1f5f9",
              width: "38px",
              height: "38px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "20px",
            }}
          >
            ×
          </button>
        </div>

        {/* CUSTOMER MESSAGE */}

        <SectionTitle title="Customer Complaint" />

        <div
          style={{
            background: "#f8fafc",
            padding: "18px",
            borderRadius: "12px",
            marginBottom: "20px",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#475569",
              lineHeight: "1.6",
              whiteSpace: "pre-wrap",
            }}
          >
            {complaint.customer_message ||
              complaint.message}
          </p>
        </div>

        {/* COMPLAINT INFORMATION */}

        <SectionTitle title="AI Analysis" />

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(2, minmax(0, 1fr))",
            gap: "15px",
            marginBottom: "25px",
          }}
        >
          <InfoCard
            label="Sentiment"
            value={
              complaint.sentiment || "NEUTRAL"
            }
          />

          <InfoCard
            label="Urgency"
            value={
              complaint.urgency || "MEDIUM"
            }
          />

          <InfoCard
            label="Category"
            value={
              complaint.category || "OTHER"
            }
          />

          <InfoCard
            label="Created At"
            value={
              complaint.created_at
                ? formatDate(complaint.created_at)
                : "Not available"
            }
          />
        </div>

        {/* RECOMMENDED ACTION */}

        <div
          style={{
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            padding: "15px",
            borderRadius: "10px",
            marginBottom: "25px",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              fontWeight: "700",
              color: "#1d4ed8",
              marginBottom: "6px",
            }}
          >
            💡 Recommended Action
          </div>

          <div
            style={{
              color: "#334155",
              lineHeight: "1.5",
            }}
          >
            {complaint.recommended_action ||
              "Review complaint and take appropriate action."}
          </div>
        </div>

        {/* MANAGEMENT */}

        <SectionTitle title="Complaint Management" />

        {/* STATUS */}

        <FieldLabel label="Complaint Status" />

        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value)
          }
          style={selectStyle}
        >
          <option value="OPEN">OPEN</option>
          <option value="PENDING">PENDING</option>
          <option value="RESOLVED">RESOLVED</option>
          <option value="CLOSED">CLOSED</option>
        </select>

        {/* PRIORITY */}

        <FieldLabel label="Priority" />

        <select
          value={priority}
          onChange={(e) =>
            setPriority(e.target.value)
          }
          style={selectStyle}
        >
          <option value="LOW">🟢 LOW</option>
          <option value="MEDIUM">
            🟡 MEDIUM
          </option>
          <option value="HIGH">🟠 HIGH</option>
          <option value="URGENT">
            🔴 URGENT
          </option>
        </select>

        {/* CATEGORY */}

        <FieldLabel label="Category" />

        <input
          value={category}
          onChange={(e) =>
            setCategory(
              e.target.value.toUpperCase()
            )
          }
          placeholder="Enter category"
          style={inputStyle}
        />

        {/* ASSIGNED TO */}

        <FieldLabel label="Assigned To" />

        <select
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          style={selectStyle}
        >
          <option value="">Unassigned</option>

          <option value="Billing Support">
            💳 Billing Support
          </option>

          <option value="Technical Support">
            🛠️ Technical Support
          </option>

          <option value="Security Support">
            🔐 Security Support
          </option>

          <option value="Product Support">
            📦 Product Support
          </option>

          <option value="Customer Support">
            🎧 Customer Support
          </option>
        </select>

        {/* ADMIN NOTE */}

        <FieldLabel label="Admin Note" />

        <textarea
          value={adminNote}
          onChange={(e) =>
            setAdminNote(e.target.value)
          }
          placeholder="Add internal notes about this complaint..."
          rows={5}
          style={{
            ...inputStyle,
            resize: "vertical",
            fontFamily: "inherit",
          }}
        />

        {/* MESSAGE */}

        {message && (
          <div
            style={{
              marginTop: "18px",
              padding: "12px",
              borderRadius: "8px",
              background:
                message ===
                "Complaint updated successfully."
                  ? "#dcfce7"
                  : "#fee2e2",
              color:
                message ===
                "Complaint updated successfully."
                  ? "#166534"
                  : "#b91c1c",
            }}
          >
            {message}
          </div>
        )}

        {/* ACTION BUTTONS */}

        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "25px",
            marginBottom: "30px",
          }}
        >
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "12px",
              border: "1px solid #cbd5e1",
              background: "white",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={loading}
            style={{
              flex: 1,
              padding: "12px",
              border: "none",
              background: loading
                ? "#94a3b8"
                : "#2563eb",
              color: "white",
              borderRadius: "8px",
              cursor: loading
                ? "not-allowed"
                : "pointer",
              fontWeight: "600",
            }}
          >
            {loading
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>

        {/* ====================================== */}
        {/* ACTIVITY TIMELINE */}
        {/* ====================================== */}

        <div
          style={{
            borderTop: "1px solid #e2e8f0",
            paddingTop: "25px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              marginBottom: "18px",
            }}
          >
            <div>
              <SectionTitle title="Activity Timeline" />

              <p
                style={{
                  margin: "5px 0 0",
                  fontSize: "13px",
                  color: "#64748b",
                }}
              >
                History of changes made to this complaint
              </p>
            </div>

            <button
              onClick={() =>
                fetchActivity(
                  complaint.ticket_id
                )
              }
              style={{
                border: "1px solid #cbd5e1",
                background: "white",
                padding: "8px 12px",
                borderRadius: "7px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              🔄 Refresh
            </button>
          </div>

          {/* LOADING */}

          {activityLoading && (
            <div
              style={{
                padding: "20px",
                textAlign: "center",
                color: "#64748b",
              }}
            >
              Loading activity...
            </div>
          )}

          {/* EMPTY STATE */}

          {!activityLoading &&
            activity.length === 0 && (
              <div
                style={{
                  background: "#f8fafc",
                  padding: "25px",
                  borderRadius: "10px",
                  textAlign: "center",
                  color: "#64748b",
                }}
              >
                <div
                  style={{
                    fontSize: "32px",
                    marginBottom: "8px",
                  }}
                >
                  🕒
                </div>

                No activity history yet.
              </div>
            )}

          {/* TIMELINE */}

          {!activityLoading &&
            activity.map((item, index) => {
              const style =
                getActivityStyle(
                  item.action_type
                );

              return (
                <div
                  key={item.id || index}
                  style={{
                    display: "flex",
                    gap: "14px",
                    position: "relative",
                    paddingBottom:
                      index === activity.length - 1
                        ? "0"
                        : "22px",
                  }}
                >
                  {/* TIMELINE LINE */}

                  {index !==
                    activity.length - 1 && (
                    <div
                      style={{
                        position: "absolute",
                        left: "18px",
                        top: "38px",
                        bottom: "0",
                        width: "2px",
                        background: "#e2e8f0",
                      }}
                    />
                  )}

                  {/* ICON */}

                  <div
                    style={{
                      minWidth: "38px",
                      width: "38px",
                      height: "38px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background:
                        style.background,
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    {getActivityIcon(
                      item.action_type
                    )}
                  </div>

                  {/* CONTENT */}

                  <div
                    style={{
                      flex: 1,
                      paddingBottom: "5px",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: "700",
                        color: "#1e293b",
                        marginBottom: "4px",
                      }}
                    >
                      {item.description ||
                        item.action_type}
                    </div>

                    {/* OLD → NEW */}

                    {(item.old_value ||
                      item.new_value) && (
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#475569",
                          marginBottom: "5px",
                        }}
                      >
                        {item.old_value && (
                          <>
                            <span
                              style={{
                                textDecoration:
                                  "line-through",
                              }}
                            >
                              {item.old_value}
                            </span>

                            {" → "}
                          </>
                        )}

                        <span
                          style={{
                            fontWeight: "600",
                            color: style.color,
                          }}
                        >
                          {item.new_value}
                        </span>
                      </div>
                    )}

                    {/* TIME */}

                    <div
                      style={{
                        fontSize: "12px",
                        color: "#94a3b8",
                      }}
                    >
                      🕒{" "}
                      {formatDate(
                        item.created_at
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

      </div>
    </div>
  );
}


// ==========================================
// SECTION TITLE
// ==========================================

function SectionTitle({ title }) {
  return (
    <h3
      style={{
        margin: "0 0 12px",
        color: "#1e293b",
        fontSize: "17px",
      }}
    >
      {title}
    </h3>
  );
}


// ==========================================
// INFO CARD
// ==========================================

function InfoCard({ label, value }) {
  return (
    <div
      style={{
        background: "#f8fafc",
        padding: "12px",
        borderRadius: "10px",
      }}
    >
      <div
        style={{
          fontSize: "12px",
          color: "#64748b",
          marginBottom: "5px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontWeight: "600",
          color: "#1e293b",
          wordBreak: "break-word",
          fontSize: "14px",
        }}
      >
        {value}
      </div>
    </div>
  );
}


// ==========================================
// FIELD LABEL
// ==========================================

function FieldLabel({ label }) {
  return (
    <label
      style={{
        display: "block",
        marginTop: "18px",
        marginBottom: "7px",
        color: "#334155",
        fontWeight: "600",
      }}
    >
      {label}
    </label>
  );
}


// ==========================================
// COMMON INPUT STYLE
// ==========================================

const inputStyle = {
  width: "100%",
  padding: "11px",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  boxSizing: "border-box",
  fontSize: "14px",
};


const selectStyle = {
  ...inputStyle,
  background: "white",
  cursor: "pointer",
};


export default ComplaintDetails;