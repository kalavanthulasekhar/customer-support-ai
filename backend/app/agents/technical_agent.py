from app.services.gemini_service import GeminiService


class TechnicalAgent:

    def __init__(self):
        self.llm = GeminiService()

    def handle(self, query: str):

        prompt = f"""
        You are a technical support engineer.

        User Query:
        {query}

        Provide troubleshooting assistance.
        """

        answer = self.llm.generate(prompt)

        return {
            "agent": "technical",
            "response": answer
        }