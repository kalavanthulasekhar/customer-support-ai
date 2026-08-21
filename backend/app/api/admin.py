from fastapi import APIRouter

from database.db import get_connection
from app.services.complaint_service import ComplaintService


router = APIRouter(
    prefix="/admin",
    tags=["Admin Analytics"]
)

complaint_service = ComplaintService()


@router.get("/stats")
async def get_admin_stats():

    complaints = complaint_service.get_all_complaints()

    conn = get_connection()

    # Total conversations
    total_chats = conn.execute(
        """
        SELECT COUNT(*)
        FROM conversations
        """
    ).fetchone()[0]

    # Agent distribution from bot messages
    agent_rows = conn.execute(
        """
        SELECT agent, COUNT(*) as count
        FROM messages
        WHERE agent IS NOT NULL
        GROUP BY agent
        """
    ).fetchall()

    priority_rows = conn.execute(
        "SELECT priority, COUNT(*) AS count FROM complaints GROUP BY priority"
    ).fetchall()
    category_rows = conn.execute(
        "SELECT category, COUNT(*) AS count FROM complaints GROUP BY category"
    ).fetchall()
    sla_rows = conn.execute(
        "SELECT sla_status, COUNT(*) AS count FROM complaints GROUP BY sla_status"
    ).fetchall()

    conn.close()

    # Complaint statistics
    stats = {
        "total_complaints": len(complaints),
        "open": 0,
        "pending": 0,
        "resolved": 0,
        "closed": 0,

        # Chat analytics
        "total_chats": total_chats,

        # Agent analytics
        "billing": 0,
        "technical": 0,
        "complaint": 0,
        "faq": 0,
        "other": 0,

        # Detailed agent counts
        "agents": {}
        ,"by_priority": {row[0]: row[1] for row in priority_rows}
        ,"by_category": {row[0]: row[1] for row in category_rows}
        ,"sla": {row[0]: row[1] for row in sla_rows}
    }

    # Count complaint statuses
    for complaint in complaints:

        status = (complaint.get("status") or "OPEN").upper()

        if status == "OPEN":
            stats["open"] += 1

        elif status == "PENDING":
            stats["pending"] += 1

        elif status == "RESOLVED":
            stats["resolved"] += 1

        elif status == "CLOSED":
            stats["closed"] += 1

    # Count agents
    for row in agent_rows:

        agent_name = row[0] or "Other"
        count = row[1]

        stats["agents"][agent_name] = count

        agent_lower = agent_name.lower()

        if "billing" in agent_lower:
            stats["billing"] += count

        elif "technical" in agent_lower:
            stats["technical"] += count

        elif "complaint" in agent_lower:
            stats["complaint"] += count

        elif "faq" in agent_lower:
            stats["faq"] += count

        else:
            stats["other"] += count

    return stats