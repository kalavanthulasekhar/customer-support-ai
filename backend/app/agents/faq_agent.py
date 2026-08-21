from app.services.gemini_service import GeminiService

class FAQAgent:

    def __init__(self):
        self.llm = GeminiService()

    def handle(self, query: str):

        prompt = f"""
        You are a customer support FAQ assistant.

        Customer Question:
        {query}

        Give a clear and professional answer.
        """

        answer = self.llm.generate(prompt)

        return {
            "agent": "faq",
            "response": answer
        }