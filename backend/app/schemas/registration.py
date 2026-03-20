# Esquemas Pydantic de inscripción: creación, respuesta y check-in

from pydantic import BaseModel, ConfigDict
from typing import Optional


class RegistrationCreate(BaseModel):
    """Esquema para crear una inscripción"""
    event_id: str
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "event_id": "660e8400-e29b-41d4-a716-446655440000"
            }
        }
    )


class RegistrationResponse(BaseModel):
    """Esquema para respuesta de inscripción"""
    id: str
    event_id: str
    event_name: str
    user_id: str
    user_name: str
    user_email: str
    checked_in: bool
    registration_date: str
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "id": "REG#660e8400#550e8400",
                "event_id": "660e8400-e29b-41d4-a716-446655440000",
                "event_name": "Conferencia Tech 2026",
                "user_id": "550e8400-e29b-41d4-a716-446655440000",
                "user_name": "Juan Pérez",
                "user_email": "juan@example.com",
                "checked_in": False,
                "registration_date": "2026-01-26T15:00:00Z"
            }
        }
    )


class CheckInRequest(BaseModel):
    """Esquema para solicitud de check-in"""
    registration_id: str
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "registration_id": "REG#660e8400#550e8400"
            }
        }
    )
