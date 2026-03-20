# Router de eventos: CRUD de eventos (listar, crear, actualizar, eliminar)

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.schemas.event import EventCreate, EventUpdate, EventResponse
from app.schemas.user import UserResponse
from app.services.event import (
    create_event,
    get_event_by_id,
    get_all_events,
    update_event,
    delete_event,
    get_organizer_events
)
from app.services.auth import get_current_user, require_organizer

router = APIRouter(prefix="/events", tags=["Events"])


@router.get("", response_model=List[EventResponse])
async def list_events():
    """Obtener todos los eventos activos"""
    return get_all_events()


@router.get("/my-events", response_model=List[EventResponse])
async def list_my_events(current_user: UserResponse = Depends(require_organizer)):
    """Obtener eventos creados por el organizador actual"""
    return get_organizer_events(current_user.id)


@router.get("/{event_id}", response_model=EventResponse)
async def get_event(event_id: str):
    """Obtener detalles del evento por ID"""
    event = get_event_by_id(event_id)
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento no encontrado"
        )
    
    return event


@router.post("", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
async def create_new_event(
    event_data: EventCreate,
    current_user: UserResponse = Depends(require_organizer)
):
    """Crear un nuevo evento (solo organizador)"""
    return create_event(event_data, current_user)


@router.put("/{event_id}", response_model=EventResponse)
async def update_existing_event(
    event_id: str,
    event_data: EventUpdate,
    current_user: UserResponse = Depends(require_organizer)
):
    """Actualizar un evento (solo organizador)"""
    return update_event(event_id, event_data, current_user)


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_existing_event(
    event_id: str,
    current_user: UserResponse = Depends(require_organizer)
):
    """Eliminar un evento (solo organizador)"""
    delete_event(event_id, current_user)
