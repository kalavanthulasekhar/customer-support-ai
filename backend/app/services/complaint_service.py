import uuid
from database.db import get_connection


class ComplaintService:

    # ==========================================
    # ACTIVITY HISTORY
    # ==========================================

    def add_activity(
        self,
        conn,
        ticket_id,
        action_type,
        old_value=None,
        new_value=None,
        description=None,
    ):
        """
        Save an activity record for a complaint.
        """

        conn.execute(
            """
            INSERT INTO complaint_activity (
                ticket_id,
                action_type,
                old_value,
                new_value,
                description
            )
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                ticket_id,
                action_type,
                old_value,
                new_value,
                description,
            ),
        )

    def get_activity_history(self, ticket_id: str):

        conn = get_connection()

        rows = conn.execute(
            """
            SELECT
                id,
                ticket_id,
                action_type,
                old_value,
                new_value,
                description,
                created_at
            FROM complaint_activity
            WHERE ticket_id = ?
            ORDER BY id DESC
            """,
            (ticket_id,),
        ).fetchall()

        conn.close()

        return [
            {
                "id": row["id"],
                "ticket_id": row["ticket_id"],
                "action_type": row["action_type"],
                "old_value": row["old_value"],
                "new_value": row["new_value"],
                "description": row["description"],
                "created_at": row["created_at"],
            }
            for row in rows
        ]

    # ==========================================
    # AI COMPLAINT ANALYSIS
    # ==========================================

    def analyze_complaint(self, customer_message: str):

        message = customer_message.lower()

        category = "OTHER"
        sentiment = "NEUTRAL"
        urgency = "LOW"
        priority = "LOW"

        recommended_action = (
            "Review the customer's request and provide appropriate support."
        )

        # SECURITY
        security_keywords = [
            "hacked",
            "hack",
            "fraud",
            "stolen",
            "unauthorized",
            "security",
            "suspicious activity",
            "account compromised",
            "account hacked",
        ]

        if any(keyword in message for keyword in security_keywords):

            category = "SECURITY"
            sentiment = "NEGATIVE"
            urgency = "HIGH"
            priority = "HIGH"

            recommended_action = (
                "Immediately investigate the security issue, "
                "secure the customer account, and review "
                "unauthorized activity."
            )

        # BILLING
        elif any(
            keyword in message
            for keyword in [
                "payment",
                "charged",
                "charge",
                "billing",
                "invoice",
                "refund",
                "transaction",
                "money",
                "double charged",
                "charged twice",
            ]
        ):

            category = "BILLING"
            sentiment = "NEGATIVE"

            if any(
                keyword in message
                for keyword in [
                    "charged twice",
                    "double charged",
                    "unauthorized charge",
                    "payment failed",
                    "money stolen",
                ]
            ):
                urgency = "HIGH"
                priority = "HIGH"

                recommended_action = (
                    "Investigate the payment issue immediately "
                    "and verify the customer's transaction."
                )

            else:
                urgency = "MEDIUM"
                priority = "MEDIUM"

                recommended_action = (
                    "Review the billing details and assist "
                    "the customer with the payment or refund issue."
                )

        # PRODUCT
        elif any(
            keyword in message
            for keyword in [
                "damaged",
                "broken",
                "defective",
                "wrong product",
                "missing item",
                "missing product",
                "not received",
                "delivery",
                "order",
            ]
        ):

            category = "PRODUCT"
            sentiment = "NEGATIVE"
            urgency = "MEDIUM"
            priority = "MEDIUM"

            recommended_action = (
                "Review the order details and arrange a replacement, "
                "return, or appropriate resolution."
            )

        # TECHNICAL
        elif any(
            keyword in message
            for keyword in [
                "not working",
                "error",
                "bug",
                "crash",
                "failed",
                "cannot login",
                "can't login",
                "login problem",
                "technical",
            ]
        ):

            category = "TECHNICAL"
            sentiment = "NEGATIVE"

            if any(
                keyword in message
                for keyword in [
                    "cannot login",
                    "can't login",
                    "crash",
                    "system down",
                    "completely broken",
                ]
            ):
                urgency = "HIGH"
                priority = "HIGH"

                recommended_action = (
                    "Investigate the technical issue immediately "
                    "and restore the affected service."
                )

            else:
                urgency = "MEDIUM"
                priority = "MEDIUM"

                recommended_action = (
                    "Investigate the technical problem and provide "
                    "troubleshooting steps or a resolution."
                )

        # POSITIVE / GENERAL
        elif any(
            keyword in message
            for keyword in [
                "thank",
                "great",
                "excellent",
                "good service",
                "happy",
            ]
        ):

            category = "GENERAL"
            sentiment = "POSITIVE"
            urgency = "LOW"
            priority = "LOW"

            recommended_action = "Thank the customer and respond appropriately."

        return {
            "category": category,
            "sentiment": sentiment,
            "urgency": urgency,
            "priority": priority,
            "recommended_action": recommended_action,
        }

    # ==========================================
    # CREATE COMPLAINT
    # ==========================================

    def create_complaint(self, customer_message: str):

        ticket_id = "CMP-" + uuid.uuid4().hex[:6].upper()

        analysis = self.analyze_complaint(customer_message)

        conn = get_connection()

        conn.execute(
            """
            INSERT INTO complaints (
                ticket_id,
                customer_message,
                status,
                priority,
                category,
                sentiment,
                urgency,
                recommended_action
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                ticket_id,
                customer_message,
                "OPEN",
                analysis["priority"],
                analysis["category"],
                analysis["sentiment"],
                analysis["urgency"],
                analysis["recommended_action"],
            ),
        )

        # Save complaint creation activity
        self.add_activity(
            conn=conn,
            ticket_id=ticket_id,
            action_type="CREATED",
            new_value="OPEN",
            description="Complaint was created.",
        )

        conn.commit()
        conn.close()

        return {"ticket_id": ticket_id, "status": "OPEN", **analysis}

    # Keep compatibility with ComplaintAgent
    def create_ticket(self, customer_message: str):
        return self.create_complaint(customer_message)

    # ==========================================
    # GET ONE COMPLAINT
    # ==========================================

    def get_complaint(self, ticket_id: str):

        conn = get_connection()

        row = conn.execute(
            """
            SELECT
                ticket_id,
                customer_message,
                status,
                priority,
                category,
                sentiment,
                urgency,
                recommended_action,
                admin_note,
                assigned_to,
                assigned_agent_id,
                sla_deadline,
                sla_status,
                created_at
            FROM complaints
            WHERE ticket_id = ?
            """,
            (ticket_id,),
        ).fetchone()

        conn.close()

        if not row:
            return None

        return {
            "ticket_id": row["ticket_id"],
            "customer_message": row["customer_message"],
            "message": row["customer_message"],
            "status": row["status"],
            "priority": row["priority"],
            "category": row["category"],
            "sentiment": row["sentiment"],
            "urgency": row["urgency"],
            "recommended_action": row["recommended_action"],
            "admin_note": (
                row["admin_note"] if row["admin_note"] is not None else ""
            ),
            "assigned_to": (
                row["assigned_to"] if row["assigned_to"] is not None else ""
            ),
            "assigned_agent_id": row["assigned_agent_id"],
            "sla_deadline": row["sla_deadline"],
            "sla_status": row["sla_status"] or "ON_TRACK",
            "created_at": row["created_at"],
        }

    # ==========================================
    # GET ALL COMPLAINTS
    # ==========================================

    def get_all_complaints(self):

        conn = get_connection()

        rows = conn.execute(
            """
            SELECT
                ticket_id,
                customer_message,
                status,
                priority,
                category,
                sentiment,
                urgency,
                recommended_action,
                admin_note,
                assigned_to,
                assigned_agent_id,
                sla_deadline,
                sla_status,
                created_at
            FROM complaints
            ORDER BY id DESC
            """
        ).fetchall()

        conn.close()

        return [
            {
                "ticket_id": row["ticket_id"],
                "customer_message": row["customer_message"],
                "message": row["customer_message"],
                "status": row["status"],
                "priority": row["priority"],
                "category": row["category"],
                "sentiment": row["sentiment"],
                "urgency": row["urgency"],
                "recommended_action": row["recommended_action"],
                "admin_note": (
                    row["admin_note"] if row["admin_note"] is not None else ""
                ),
                "assigned_to": (
                    row["assigned_to"] if row["assigned_to"] is not None else ""
                ),
                "assigned_agent_id": row["assigned_agent_id"],
                "sla_deadline": row["sla_deadline"],
                "sla_status": row["sla_status"] or "ON_TRACK",
                "created_at": row["created_at"],
            }
            for row in rows
        ]

    # ==========================================
    # UPDATE STATUS
    # ==========================================

    def update_status(self, ticket_id: str, status: str):

        allowed_statuses = {
            "OPEN",
            "PENDING",
            "RESOLVED",
            "CLOSED",
        }

        status = status.upper().strip()

        if status not in allowed_statuses:
            return None

        conn = get_connection()

        current = conn.execute(
            """
            SELECT status
            FROM complaints
            WHERE ticket_id = ?
            """,
            (ticket_id,),
        ).fetchone()

        if not current:
            conn.close()
            return None

        old_status = current["status"]

        # Don't create duplicate history
        if old_status == status:
            conn.close()
            return self.get_complaint(ticket_id)

        conn.execute(
            """
            UPDATE complaints
            SET status = ?
            WHERE ticket_id = ?
            """,
            (status, ticket_id),
        )

        self.add_activity(
            conn=conn,
            ticket_id=ticket_id,
            action_type="STATUS_CHANGED",
            old_value=old_status,
            new_value=status,
            description=f"Status changed from {old_status} to {status}.",
        )

        conn.commit()
        conn.close()

        return self.get_complaint(ticket_id)

    # ==========================================
    # UPDATE PRIORITY
    # ==========================================

    def update_priority(self, ticket_id: str, priority: str):

        allowed_priorities = {
            "LOW",
            "MEDIUM",
            "HIGH",
            "URGENT",
        }

        priority = priority.upper().strip()

        if priority not in allowed_priorities:
            return None

        conn = get_connection()

        current = conn.execute(
            """
            SELECT priority
            FROM complaints
            WHERE ticket_id = ?
            """,
            (ticket_id,),
        ).fetchone()

        if not current:
            conn.close()
            return None

        old_priority = current["priority"]

        if old_priority == priority:
            conn.close()
            return self.get_complaint(ticket_id)

        conn.execute(
            """
            UPDATE complaints
            SET priority = ?
            WHERE ticket_id = ?
            """,
            (priority, ticket_id),
        )

        self.add_activity(
            conn=conn,
            ticket_id=ticket_id,
            action_type="PRIORITY_CHANGED",
            old_value=old_priority,
            new_value=priority,
            description=f"Priority changed from {old_priority} to {priority}.",
        )

        conn.commit()
        conn.close()

        return self.get_complaint(ticket_id)

    # ==========================================
    # UPDATE CATEGORY
    # ==========================================

    def update_category(self, ticket_id: str, category: str):

        category = category.upper().strip()

        if not category:
            return None

        conn = get_connection()

        current = conn.execute(
            """
            SELECT category
            FROM complaints
            WHERE ticket_id = ?
            """,
            (ticket_id,),
        ).fetchone()

        if not current:
            conn.close()
            return None

        old_category = current["category"]

        if old_category == category:
            conn.close()
            return self.get_complaint(ticket_id)

        conn.execute(
            """
            UPDATE complaints
            SET category = ?
            WHERE ticket_id = ?
            """,
            (category, ticket_id),
        )

        self.add_activity(
            conn=conn,
            ticket_id=ticket_id,
            action_type="CATEGORY_CHANGED",
            old_value=old_category,
            new_value=category,
            description=f"Category changed from {old_category} to {category}.",
        )

        conn.commit()
        conn.close()

        return self.get_complaint(ticket_id)

    # ==========================================
    # UPDATE ADMIN NOTE
    # ==========================================

    def update_admin_note(self, ticket_id: str, admin_note: str):

        admin_note = admin_note.strip()

        conn = get_connection()

        current = conn.execute(
            """
            SELECT admin_note
            FROM complaints
            WHERE ticket_id = ?
            """,
            (ticket_id,),
        ).fetchone()

        if not current:
            conn.close()
            return None

        old_note = (
            current["admin_note"] if current["admin_note"] is not None else ""
        )

        conn.execute(
            """
            UPDATE complaints
            SET admin_note = ?
            WHERE ticket_id = ?
            """,
            (admin_note, ticket_id),
        )

        # Only save activity if the note actually changed
        if old_note != admin_note:

            if old_note and admin_note:
                description = "Admin note was updated."
                action_type = "NOTE_UPDATED"

            elif admin_note:
                description = "Admin note was added."
                action_type = "NOTE_ADDED"

            else:
                description = "Admin note was removed."
                action_type = "NOTE_REMOVED"

            self.add_activity(
                conn=conn,
                ticket_id=ticket_id,
                action_type=action_type,
                old_value=old_note or None,
                new_value=admin_note or None,
                description=description,
            )

        conn.commit()
        conn.close()

        return self.get_complaint(ticket_id)

    # ==========================================
    # ASSIGN COMPLAINT
    # ==========================================

    def update_assigned_to(self, ticket_id: str, assigned_to: str):

        assigned_to = assigned_to.strip()

        conn = get_connection()

        current = conn.execute(
            """
            SELECT assigned_to
            FROM complaints
            WHERE ticket_id = ?
            """,
            (ticket_id,),
        ).fetchone()

        if not current:
            conn.close()
            return None

        old_assigned_to = (
            current["assigned_to"] if current["assigned_to"] is not None else ""
        )

        # Don't create duplicate activity
        if old_assigned_to == assigned_to:
            conn.close()
            return self.get_complaint(ticket_id)

        conn.execute(
            """
            UPDATE complaints
            SET assigned_to = ?
            WHERE ticket_id = ?
            """,
            (
                assigned_to if assigned_to else None,
                ticket_id,
            ),
        )

        self.add_activity(
            conn=conn,
            ticket_id=ticket_id,
            action_type="ASSIGNMENT_CHANGED",
            old_value=(old_assigned_to if old_assigned_to else "Unassigned"),
            new_value=(assigned_to if assigned_to else "Unassigned"),
            description=(
                f"Complaint assignment changed from "
                f"{old_assigned_to or 'Unassigned'} to "
                f"{assigned_to or 'Unassigned'}."
            ),
        )

        conn.commit()
        conn.close()

        return self.get_complaint(ticket_id)