from app.services.complaint_service import ComplaintService


class ComplaintAgent:

    def __init__(self):
        self.service = ComplaintService()

    def can_handle(self, message: str) -> bool:
        message = message.lower()

        complaint_keywords = [
            "complaint",
            "damaged",
            "broken",
            "defective",
            "refund",
            "replacement",
            "poor service",
            # Security and fraud
            "hacked",
            "hack",
            "unauthorized",
            "unauthorised",
            "fraud",
            "fraudulent",
            "account compromised",
            "account hacked",
            "stolen",
            "suspicious transaction",
            "unauthorized transaction",
            "unauthorized transactions",
        ]

        return any(keyword in message for keyword in complaint_keywords)

    def get_status(self, ticket_id: str):
        complaint = self.service.get_complaint(ticket_id)

        if not complaint:
            return None

        # Supports dictionary response or standard tuple/list response
        if isinstance(complaint, dict):
            return {
                "ticket_id": complaint.get("ticket_id"),
                "message": complaint.get("customer_message") or complaint.get("message"),
                "status": complaint.get("status"),
            }

        return {
            "ticket_id": complaint[0],
            "message": complaint[1],
            "status": complaint[2],
        }

    def handle(self, query: str):
        result = self.service.create_ticket(query)

        # Safely extract ticket_id if result is a dictionary or string
        ticket_id = (
            result.get("ticket_id") if isinstance(result, dict) else result
        )

        return {
            "agent": "Complaint Support",
            "ticket_id": ticket_id,
            "response": (
                "I understand your concern. A complaint ticket has been created successfully.\n\n"
                f"Ticket ID: {ticket_id}\n\n"
                "Our support team will review your issue and contact you shortly."
            ),
        }