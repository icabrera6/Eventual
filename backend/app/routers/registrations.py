# Router de inscripciones: inscribirse, cancelar y consultar inscripciones

from fastapi import APIRouter, Depends, status
from typing import List
from app.schemas.registration import RegistrationResponse
from app.schemas.user import UserResponse
from app.services.registration import (
    register_to_event,
    cancel_registration,
    get_event_registrations,
    get_user_registrations
)
from app.services.auth import get_current_user

router = APIRouter(prefix="/registrations", tags=["Registrations"])


@router.post("", response_model=RegistrationResponse, status_code=status.HTTP_201_CREATED)
async def register_user_to_event(
    event_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """Inscribir al usuario actual en un evento"""
    return register_to_event(event_id, current_user)


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_user_registration(
    event_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """Cancelar la inscripción del usuario actual a un evento"""
    cancel_registration(event_id, current_user)


@router.get("/my-registrations", response_model=List[RegistrationResponse])
async def get_my_registrations(current_user: UserResponse = Depends(get_current_user)):
    """Obtener todos los eventos en los que el usuario actual está inscrito"""
    return get_user_registrations(current_user.id)


@router.get("/event/{event_id}", response_model=List[RegistrationResponse])
async def get_registrations_for_event(event_id: str):
    """Obtener todas las inscripciones de un evento específico"""
    return get_event_registrations(event_id)
