from app.agents.complaint_agent import ComplaintAgent
from app.agents.billing_agent import BillingAgent
from app.agents.technical_agent import TechnicalAgent
from app.agents.faq_agent import FAQAgent
from app.agents.product_agent import ProductAgent


class AgentRouter:

    def __init__(self):
        self.complaint_agent = ComplaintAgent()
        self.billing_agent = BillingAgent()
        self.technical_agent = TechnicalAgent()
        self.faq_agent = FAQAgent()
        self.product_agent = ProductAgent()

    def route(self, query: str, intent: str = None):

        message = query.lower()

        # ==========================================
        # HIGH PRIORITY: SECURITY / FRAUD COMPLAINTS
        # ==========================================

        security_keywords = [
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
            "suspicious transactions",
            "unauthorized transaction",
            "unauthorized transactions",
        ]

        if any(keyword in message for keyword in security_keywords):
            return self.complaint_agent.handle(query)

        # ==========================================
        # NORMAL COMPLAINTS
        # ==========================================

        if self.complaint_agent.can_handle(query):
            return self.complaint_agent.handle(query)

        # ==========================================
        # INTENT-BASED ROUTING
        # ==========================================

        if intent == "billing":
            return self.billing_agent.handle(query)

        if intent == "technical":
            return self.technical_agent.handle(query)

        if intent == "faq":
            return self.faq_agent.handle(query)

        if intent == "product":
            return self.product_agent.handle(query)

        # ==========================================
        # FALLBACK
        # ==========================================

        return {
            "response": (
                "I'm sorry, I couldn't determine the "
                "correct support category for your request."
            ),
            "agent": "other"
        }