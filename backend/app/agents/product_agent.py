from app.services.gemini_service import GeminiService


class ProductAgent:

    def __init__(self):
        self.llm = GeminiService()

    def handle(self, query: str):

        prompt = f"""
        You are a product support specialist.

        Responsibilities:
        - Explain product features
        - Compare plans and pricing
        - Recommend suitable products
        - Answer product-related questions

        User Query:
        {query}

        Provide a clear, professional, and helpful response.
        """

        answer = self.llm.generate(prompt)

        return {
            "agent": "product",
            "response": answer
        }