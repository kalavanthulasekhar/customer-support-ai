from app.services.gemini_service import GeminiService

class IntentDetector:

    def __init__(self):
        self.llm = GeminiService()

    def detect(self, query: str):

        prompt = f"""
        Classify this query into exactly one:

        billing
        technical
        product
        complaint
        faq

        Query:
        {query}

        Return only category.
        """

        result = self.llm.generate(prompt).strip().lower()

        valid = [
            "billing",
            "technical",
            "product",
            "complaint",
            "faq"
        ]

        if result not in valid:
            return "faq"

        return result