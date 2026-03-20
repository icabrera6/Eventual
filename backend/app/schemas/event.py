# Esquemas Pydantic de evento: creación, actualización y respuesta

from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from app.schemas.tag import TagResponse


class EventCreate(BaseModel):
    """Esquema para crear un evento"""
    name: str
    description: str
    date: str  # ISO 8601 format
    location: str
    autonomous_community: str
    city: str
    max_capacity: int
    image_url: Optional[str] = None
    tags: List[str] = []
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "Conferencia Tech 2026",
                "description": "Evento sobre las últimas tendencias en tecnología",
                "date": "2026-02-15T10:00:00Z",
                "location": "Aula Magna",
                "autonomous_community": "Madrid",
                "city": "Madrid",
                "max_capacity": 100,
                "image_url": "https://example.com/image.jpg",
                "tags": ["uuid-tag-1", "uuid-tag-2"]
            }
        }
    )


class EventUpdate(BaseModel):
    """Esquema para actualizar un evento"""
    name: Optional[str] = None
    description: Optional[str] = None
    date: Optional[str] = None
    location: Optional[str] = None
    autonomous_community: Optional[str] = None
    city: Optional[str] = None
    max_capacity: Optional[int] = None
    image_url: Optional[str] = None
    tags: Optional[List[str]] = None
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "Conferencia Tech 2026 - Actualizado",
                "max_capacity": 150,
                "tags": ["uuid-tag-1"]
            }
        }
    )


class EventResponse(BaseModel):
    """Esquema para respuesta de evento"""
    id: str
    name: str
    description: str
    date: str
    location: str
    autonomous_community: Optional[str] = None
    city: Optional[str] = None
    max_capacity: int
    current_registrations: int
    available_spots: int
    image_url: Optional[str] = None
    organizer_id: str
    organizer_name: str
    created_at: str
    tags: List[str] = []
    tag_details: List[TagResponse] = []
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "id": "660e8400-e29b-41d4-a716-446655440000",
                "name": "Conferencia Tech 2026",
                "description": "Evento sobre tecnología",
                "date": "2026-02-15T10:00:00Z",
                "location": "Aula Magna",
                "autonomous_community": "Madrid",
                "city": "Madrid",
                "max_capacity": 100,
                "current_registrations": 45,
                "available_spots": 55,
                "image_url": "https://example.com/image.jpg",
                "organizer_id": "550e8400-e29b-41d4-a716-446655440000",
                "organizer_name": "María García",
                "created_at": "2026-01-26T15:00:00Z",
                "tags": ["uuid-tag-1"],
                "tag_details": [
                    {
                        "id": "uuid-tag-1",
                        "name": "Tecnología",
                        "color": "#0044ff",
                        "created_at": "2026-02-25T10:00:00Z"
                    }
                ]
            }
        }
    )
