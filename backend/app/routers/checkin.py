# Router de check-in: confirmar asistencia de un usuario a un evento

from fastapi import APIRouter, Depends
from app.schemas.registration import RegistrationResponse
from app.schemas.user import UserResponse
from app.services.registration import check_in_user
from app.services.auth import require_organizer

router = APIRouter(prefix="/checkin", tags=["Check-in"])


@router.post("/{event_id}/{user_id}", response_model=RegistrationResponse)
async def check_in_attendee(
    event_id: str,
    user_id: str,
    current_user: UserResponse = Depends(require_organizer)
):
    """Registrar asistencia de un usuario a un evento (solo organizador)"""
    return check_in_user(event_id, user_id, current_user)
