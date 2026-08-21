import { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../config/api";

function HistoryPanel() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/history`)
      .then((res) => setHistory(res.data))
      .catch(console.error);
  }, []);

  return (
    <div
      style={{
        width: "300px",
        borderLeft: "1px solid #ddd",
        padding: "15px",
        overflowY: "auto",
      }}
    >
      <h3>Chat History</h3>

      {history.length === 0 ? (
        <p>No chats yet</p>
      ) : (
        history.map((item, index) => (
          <div
            key={index}
            style={{
              padding: "10px",
              marginBottom: "10px",
              border: "1px solid #eee",
              borderRadius: "8px",
            }}
          >
            <strong>{item.intent}</strong>

            <p
              style={{
                fontSize: "14px",
                marginTop: "5px",
              }}
            >
              {item.message}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

export default HistoryPanel;