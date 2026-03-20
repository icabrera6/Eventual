# Router de estadísticas: datos de asistencia y aforo de un evento

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from app.services.event import get_event_by_id
from app.services.registration import get_event_registrations

router = APIRouter(prefix="/statistics", tags=["Statistics"])


class EventStatistics(BaseModel):
    """Respuesta de estadísticas del evento"""
    event_id: str
    event_name: str
    total_registrations: int
    checked_in_count: int
    not_checked_in_count: int
    max_capacity: int
    available_spots: int
    attendance_rate: float  # Porcentaje de usuarios con check-in
    
    class Config:
        json_schema_extra = {
            "example": {
                "event_id": "660e8400-e29b-41d4-a716-446655440000",
                "event_name": "Conferencia Tech 2026",
                "total_registrations": 45,
                "checked_in_count": 32,
                "not_checked_in_count": 13,
                "max_capacity": 100,
                "available_spots": 55,
                "attendance_rate": 71.11
            }
        }


@router.get("/{event_id}", response_model=EventStatistics)
async def get_event_statistics(event_id: str):
    """Obtener estadísticas de un evento específico"""
    # Obtener detalles del evento
    event = get_event_by_id(event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento no encontrado"
        )
    
    # Obtener inscripciones
    registrations = get_event_registrations(event_id)
    
    # Calcular estadísticas
    total_registrations = len(registrations)
    checked_in_count = sum(1 for reg in registrations if reg.checked_in)
    not_checked_in_count = total_registrations - checked_in_count
    
    # Calcular tasa de asistencia
    attendance_rate = (checked_in_count / total_registrations * 100) if total_registrations > 0 else 0.0
    
    return EventStatistics(
        event_id=event_id,
        event_name=event.name,
        total_registrations=total_registrations,
        checked_in_count=checked_in_count,
        not_checked_in_count=not_checked_in_count,
        max_capacity=event.max_capacity,
        available_spots=event.available_spots,
        attendance_rate=round(attendance_rate, 2)
    )
