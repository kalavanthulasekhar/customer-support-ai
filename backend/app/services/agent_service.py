from datetime import datetime, timedelta, timezone

from database.db import get_connection


TEAM_BY_CATEGORY = {
    "BILLING": "Billing Support",
    "SECURITY": "Security Support",
    "PRODUCT": "Product Support",
    "TECHNICAL": "Technical Support",
}

SLA_HOURS = {
    "URGENT": 1,
    "HIGH": 4,
    "MEDIUM": 24,
    "LOW": 72,
}


class AgentService:
    def get_availability(self):
        conn = get_connection()
        try:
            rows = conn.execute(
                "SELECT status, COUNT(*) AS count FROM agents GROUP BY status"
            ).fetchall()
            counts = {row["status"]: row["count"] for row in rows}
            available = counts.get("AVAILABLE", 0)
            return {
                "available": available,
                "busy": counts.get("BUSY", 0),
                "offline": counts.get("OFFLINE", 0),
                "status": "AVAILABLE" if available else "BUSY" if counts.get("BUSY", 0) else "OFFLINE",
            }
        finally:
            conn.close()

    def create_agent(self, name, email, team, status="AVAILABLE"):
        status = status.upper().strip()
        if status not in {"AVAILABLE", "BUSY", "OFFLINE"}:
            raise ValueError("Invalid agent status")

        conn = get_connection()
        try:
            cursor = conn.execute(
                """
                INSERT INTO agents (name, email, team, status)
                VALUES (?, ?, ?, ?)
                """,
                (name.strip(), email.strip().lower(), team.strip(), status),
            )
            conn.commit()
            return self.get_agent(cursor.lastrowid)
        finally:
            conn.close()

    def get_all_agents(self):
        conn = get_connection()
        try:
            rows = conn.execute(
                """
                SELECT id, name, email, team, status, created_at
                FROM agents ORDER BY name COLLATE NOCASE
                """
            ).fetchall()
            return [dict(row) for row in rows]
        finally:
            conn.close()

    def get_agent(self, agent_id):
        conn = get_connection()
        try:
            row = conn.execute(
                "SELECT id, name, email, team, status, created_at FROM agents WHERE id = ?",
                (agent_id,),
            ).fetchone()
            return dict(row) if row else None
        finally:
            conn.close()

    def update_agent(self, agent_id, values):
        allowed = {"name", "email", "team", "status"}
        updates = {key: value for key, value in values.items() if key in allowed and value is not None}
        if "status" in updates:
            updates["status"] = updates["status"].upper().strip()
            if updates["status"] not in {"AVAILABLE", "BUSY", "OFFLINE"}:
                raise ValueError("Invalid agent status")
        if "email" in updates:
            updates["email"] = updates["email"].strip().lower()
        if not updates:
            return self.get_agent(agent_id)

        conn = get_connection()
        try:
            assignments = ", ".join(f"{key} = ?" for key in updates)
            cursor = conn.execute(
                f"UPDATE agents SET {assignments} WHERE id = ?",
                (*updates.values(), agent_id),
            )
            if not cursor.rowcount:
                return None
            conn.commit()
            return self.get_agent(agent_id)
        finally:
            conn.close()

    def delete_agent(self, agent_id):
        conn = get_connection()
        try:
            cursor = conn.execute("DELETE FROM agents WHERE id = ?", (agent_id,))
            conn.commit()
            return bool(cursor.rowcount)
        finally:
            conn.close()

    def get_agent_workload(self, agent_id=None):
        conn = get_connection()
        try:
            query = """
                SELECT a.id, a.name, a.team, a.status,
                       COUNT(c.ticket_id) AS open_complaints
                FROM agents a
                LEFT JOIN complaints c
                  ON c.assigned_agent_id = a.id
                 AND c.status IN ('OPEN', 'PENDING')
            """
            params = []
            if agent_id is not None:
                query += " WHERE a.id = ?"
                params.append(agent_id)
            query += " GROUP BY a.id ORDER BY open_complaints ASC, a.name COLLATE NOCASE"
            rows = conn.execute(query, params).fetchall()
            return [dict(row) for row in rows]
        finally:
            conn.close()

    def auto_assign(self, ticket_id):
        conn = get_connection()
        try:
            complaint = conn.execute(
                "SELECT category, priority, assigned_agent_id FROM complaints WHERE ticket_id = ?",
                (ticket_id,),
            ).fetchone()
            if not complaint:
                return None

            team = TEAM_BY_CATEGORY.get(complaint["category"], "General Support")
            agent = conn.execute(
                """
                SELECT a.id, a.name, a.team, COUNT(c.ticket_id) AS workload
                FROM agents a
                LEFT JOIN complaints c
                  ON c.assigned_agent_id = a.id
                 AND c.status IN ('OPEN', 'PENDING')
                WHERE a.team = ? AND a.status = 'AVAILABLE'
                GROUP BY a.id
                ORDER BY workload ASC, a.id ASC
                LIMIT 1
                """,
                (team,),
            ).fetchone()
            if not agent:
                return None

            deadline = datetime.now(timezone.utc) + timedelta(
                hours=SLA_HOURS.get(complaint["priority"], 24)
            )
            conn.execute(
                """
                UPDATE complaints
                SET assigned_agent_id = ?, assigned_to = ?, sla_deadline = ?, sla_status = 'ON_TRACK'
                WHERE ticket_id = ?
                """,
                (agent["id"], agent["name"], deadline.isoformat(), ticket_id),
            )
            conn.execute(
                """
                INSERT INTO complaint_activity
                    (ticket_id, action_type, old_value, new_value, description)
                VALUES (?, 'AUTO_ASSIGNED', 'Unassigned', ?, ?)
                """,
                (ticket_id, agent["name"], f"AI assigned complaint to {agent['name']} ({team})."),
            )
            conn.execute(
                """
                INSERT INTO notifications (user_type, user_id, title, message)
                VALUES ('AGENT', ?, 'New complaint assigned', ?)
                """,
                (agent["id"], f"Complaint {ticket_id} was assigned to you."),
            )
            conn.commit()
            return {"ticket_id": ticket_id, "agent": dict(agent), "sla_deadline": deadline.isoformat()}
        finally:
            conn.close()
