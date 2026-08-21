from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.health import router as health_router
from app.api.chat import router as chat_router
from app.api.admin import router as admin_router
from app.api.history import router as history_router
from app.api.conversations import router as conversations_router
from app.api.agent import router as agent_router
from app.api.notifications import router as notifications_router
from app.api.auth import router as auth_router

from database.db import init_db

init_db()
from app.api.complaint import router as complaint_router


app = FastAPI(
    title="Multi-Agent AI Customer Support",
    version="1.0.0"
)


app.include_router(health_router)
app.include_router(chat_router)
app.include_router(complaint_router)
app.include_router(history_router)
app.include_router(admin_router)
app.include_router(conversations_router)
app.include_router(agent_router)
app.include_router(notifications_router)
app.include_router(auth_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.get("/")
async def root():
    return {
        "message": "Customer Support AI Backend Running"
    }