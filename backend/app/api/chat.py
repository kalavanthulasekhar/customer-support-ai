from fastapi import APIRouter
from pydantic import BaseModel

from app.agents.intent_detector import IntentDetector
from app.agents.router import AgentRouter
from app.memory.chat_memory import ChatMemory
from app.services.history_service import HistoryService

memory = ChatMemory()
history_service = HistoryService()

router = APIRouter(
    prefix="/chat",
    tags=["Chat"]
)

detector = IntentDetector()
agent_router = AgentRouter()


class ChatRequest(BaseModel):
    message: str


@router.post("/")
async def chat(request: ChatRequest):

    # Detect intent
    intent = detector.detect(request.message)

    # Store user message in memory
    memory.add("user", request.message)

    # Route to correct agent
    result = agent_router.route(
        intent=intent,
        query=request.message
    )

    # Store assistant response in memory
    memory.add("assistant", result["response"])

    # Store conversation permanently in SQLite
    history_service.save_chat(
        message=request.message,
        response=result["response"],
        agent=result["agent"]
    )

    return {
        "intent": intent,
        "agent": result["agent"],
        "response": result["response"]
    }