from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.agent_service import AgentService


router = APIRouter(prefix="/agent", tags=["Agents"])
service = AgentService()


class AgentCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: str = Field(min_length=5, max_length=254)
    team: str = Field(min_length=1, max_length=120)
    status: str = "AVAILABLE"


class AgentUpdateRequest(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    email: str | None = Field(default=None, min_length=5, max_length=254)
    team: str | None = Field(default=None, min_length=1, max_length=120)
    status: str | None = None


@router.post("/create", status_code=201)
async def create_agent(request: AgentCreateRequest):
    try:
        return service.create_agent(**request.model_dump())
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except Exception as error:
        if "UNIQUE constraint failed" in str(error):
            raise HTTPException(status_code=409, detail="Agent email already exists") from error
        raise


@router.get("/list")
async def list_agents():
    return service.get_all_agents()


@router.get("/availability")
async def get_agent_availability():
    return service.get_availability()


@router.get("/{agent_id}")
async def get_agent(agent_id: int):
    agent = service.get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent


@router.put("/{agent_id}")
async def update_agent(agent_id: int, request: AgentUpdateRequest):
    try:
        agent = service.update_agent(agent_id, request.model_dump(exclude_unset=True))
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent


@router.delete("/{agent_id}")
async def delete_agent(agent_id: int):
    if not service.delete_agent(agent_id):
        raise HTTPException(status_code=404, detail="Agent not found")
    return {"deleted": True}


@router.get("/{agent_id}/workload")
async def get_agent_workload(agent_id: int):
    workload = service.get_agent_workload(agent_id)
    if not workload:
        raise HTTPException(status_code=404, detail="Agent not found")
    return workload[0]


@router.post("/auto-assign/{ticket_id}")
async def auto_assign(ticket_id: str):
    result = service.auto_assign(ticket_id)
    if not result:
        raise HTTPException(status_code=409, detail="No available agent for this complaint")
    return result
