# Router de autenticación: endpoint /auth/me para obtener el usuario actual

from fastapi import APIRouter, Depends
from app.schemas.user import UserResponse
from app.services.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: UserResponse = Depends(get_current_user)):
    """Obtener el usuario autenticado actual"""
    return current_user
