from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.auth_service import AuthService


router = APIRouter(prefix="/auth", tags=["Authentication"])
service = AuthService()


class Credentials(BaseModel):
    email: str = Field(min_length=5, max_length=254)
    password: str = Field(min_length=8, max_length=128)


@router.post("/register", status_code=201)
async def register(request: Credentials):
    try:
        return service.register(request.email, request.password)
    except Exception as error:
        if "UNIQUE constraint failed" in str(error):
            raise HTTPException(status_code=409, detail="Email is already registered") from error
        raise


@router.post("/login")
async def login(request: Credentials):
    result = service.login(request.email, request.password)
    if not result:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return result
