from fastapi import APIRouter
from app.services.history_service import HistoryService

router = APIRouter(
    prefix="/history",
    tags=["History"]
)

history_service = HistoryService()


@router.get("/")
async def get_history():

    rows = history_service.get_history()

    return [
        {
            "id": row[0],
            "message": row[1],
            "response": row[2],
            "agent": row[3],
            "created_at": row[4]
        }
        for row in rows
    ]