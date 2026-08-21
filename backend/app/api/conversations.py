from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.conversation_service import ConversationService


router = APIRouter(
    prefix="/conversations",
    tags=["Conversations"]
)

service = ConversationService()


class CreateConversationRequest(BaseModel):
    title: str = "New Chat"


class AddMessageRequest(BaseModel):
    sender: str
    message: str
    agent: str | None = None
    
class UpdateTitleRequest(BaseModel):
    title: str


# Create a new conversation
@router.post("/")
async def create_conversation(
    request: CreateConversationRequest
):
    conversation_id = service.create_conversation(
        request.title
    )

    return {
        "id": conversation_id,
        "title": request.title
    }


# Get all conversations
@router.get("/")
async def get_conversations():

    return service.get_conversations()


# Get one conversation with all messages
@router.get("/{conversation_id}")
async def get_conversation(
    conversation_id: int
):

    conversation = service.get_conversation(
        conversation_id
    )

    if not conversation:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found"
        )

    return conversation


# Add message to conversation
@router.post("/{conversation_id}/messages")
async def add_message(
    conversation_id: int,
    request: AddMessageRequest
):

    conversation = service.get_conversation(
        conversation_id
    )

    if not conversation:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found"
        )

    service.add_message(
        conversation_id=conversation_id,
        sender=request.sender,
        message=request.message,
        agent=request.agent
    )

    return {
        "message": "Message added successfully"
    }
    
@router.put("/{conversation_id}/title")
async def update_conversation_title(
    conversation_id: int,
    request: UpdateTitleRequest
):

    conversation = service.get_conversation(
        conversation_id
    )

    if not conversation:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found"
        )

    service.update_title(
        conversation_id,
        request.title
    )

    return {
        "id": conversation_id,
        "title": request.title
    }    
