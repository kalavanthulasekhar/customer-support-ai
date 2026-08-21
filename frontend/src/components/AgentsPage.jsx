import { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../config/api";
const emptyForm = { name: "", email: "", team: "", status: "AVAILABLE" };

function AgentsPage() {
  const [agents, setAgents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const loadAgents = async () => {
    try {
      setError("");
      const response = await axios.get(`${API_BASE_URL}/agent/list`);
      setAgents(response.data);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Unable to load agents.");
    }
  };

  useEffect(() => { loadAgents(); }, []);

  const submit = async (event) => {
    event.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_BASE_URL}/agent/${editingId}`, form);
      } else {
        await axios.post(`${API_BASE_URL}/agent/create`, form);
      }
      setForm(emptyForm);
      setEditingId(null);
      await loadAgents();
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Unable to save agent.");
    }
  };

  const edit = (agent) => {
    setEditingId(agent.id);
    setForm({ name: agent.name, email: agent.email, team: agent.team, status: agent.status });
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this support agent?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/agent/${id}`);
      await loadAgents();
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Unable to delete agent.");
    }
  };

  return (
    <section className="agents-page">
      <header className="page-header">
        <div><p className="eyebrow">Operations</p><h1>Support agents</h1><p>Manage availability, teams, and workload routing.</p></div>
      </header>
      {error && <p className="error-message">{error}</p>}
      <div className="agents-layout">
        <form className="panel agent-form" onSubmit={submit}>
          <h2>{editingId ? "Edit agent" : "Add agent"}</h2>
          <label>Name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
          <label>Email<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
          <label>Team<input required value={form.team} placeholder="Billing Support" onChange={(event) => setForm({ ...form, team: event.target.value })} /></label>
          <label>Status<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}><option>AVAILABLE</option><option>BUSY</option><option>OFFLINE</option></select></label>
          <button type="submit">{editingId ? "Save changes" : "Create agent"}</button>
          {editingId && <button type="button" className="secondary-button" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel</button>}
        </form>
        <div className="panel">
          <h2>Team roster</h2>
          <div className="agent-list">
            {agents.map((agent) => (
              <article className="agent-row" key={agent.id}>
                <div><strong>{agent.name}</strong><span>{agent.email}</span><span>{agent.team}</span></div>
                <span className={`status status-${agent.status.toLowerCase()}`}>{agent.status}</span>
                <div className="agent-actions"><button onClick={() => edit(agent)}>Edit</button><button className="danger-button" onClick={() => remove(agent.id)}>Delete</button></div>
              </article>
            ))}
            {!agents.length && <p className="muted">No agents yet.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}

export default AgentsPage;
