from app.services.gemini_service import GeminiService


class BillingAgent:

    def __init__(self):
        self.llm = GeminiService()

    def handle(self, query: str):

        prompt = f"""
        You are a billing support specialist.

        User Query:
        {query}

        Give a professional customer support response.
        """

        answer = self.llm.generate(prompt)

        return {
            "agent": "billing",
            "response": answer
        }