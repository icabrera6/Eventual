# Servicio de eventos: crear, consultar, actualizar y eliminar eventos

from typing import List, Optional
from datetime import datetime
import uuid
from app.database.dynamodb import db
from app.schemas.event import EventCreate, EventUpdate, EventResponse
from app.schemas.tag import TagResponse
from app.schemas.user import UserResponse
from app.services.user import get_user_by_id
from app.services.tag import get_all_tags
from fastapi import HTTPException, status
from boto3.dynamodb.conditions import Attr


def create_event(event_data: EventCreate, organizer: UserResponse) -> EventResponse:
    """Crear un nuevo evento"""
    try:
        print(f"\n=== Creando evento ===")
        print(f"Organizador: {organizer.id} ({organizer.name})")
        print(f"Datos del evento: {event_data.dict()}")
        
        # Generar ID del evento
        event_id = str(uuid.uuid4())
        created_at = datetime.utcnow().isoformat() + 'Z'
        
        # Crear elemento de evento
        event_item = {
            "PK": f"EVENT#{event_id}",
            "SK": "METADATA",
            "Type": "Event",
            "Name": event_data.name,
            "Description": event_data.description,
            "Date": event_data.date,
            "Location": event_data.location,
            "Country": "España",
            "AutonomousCommunity": event_data.autonomous_community,
            "City": event_data.city,
            "MaxCapacity": event_data.max_capacity,
            "ImageUrl": event_data.image_url,
            "OrganizerId": organizer.id,
            "OrganizerName": organizer.name,
            "CreatedAt": created_at,
            "Tags": event_data.tags,
            "CurrentRegistrations": 0,
            "GSI2PK": "ACTIVE_EVENTS",
            "GSI2SK": event_data.date
        }
        
        print(f"Guardando en DynamoDB...")
        # Guardar en base de datos
        db.put_item(event_item)
        print(f"=== Evento creado: {event_id} ===\n")
        
        return EventResponse(
            id=event_id,
            name=event_data.name,
            description=event_data.description,
            date=event_data.date,
            location=event_data.location,
            autonomous_community=event_data.autonomous_community,
            city=event_data.city,
            max_capacity=event_data.max_capacity,
            current_registrations=0,
            available_spots=event_data.max_capacity,
            image_url=event_data.image_url,
            organizer_id=organizer.id,
            organizer_name=organizer.name,
            created_at=created_at,
            tags=event_data.tags,
            tag_details=[]  # For immediate return, we can return empty or populate it
        )
    except Exception as e:
        print(f"\n!!! ERROR al crear evento: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise


def get_event_by_id(event_id: str) -> Optional[EventResponse]:
    """Obtener un evento por ID con conteo de inscripciones"""
    event_item = db.get_item(pk=f"EVENT#{event_id}", sk="METADATA")
    
    if not event_item:
        return None
    
    # Obtener contador de inscripciones (fuente de verdad atómica)
    current_registrations = event_item.get("CurrentRegistrations", 0)
    
    # Fallback: si el atributo no existe (eventos antiguos), contar manualmente
    if "CurrentRegistrations" not in event_item:
        registrations = db.query_by_pk(pk=f"EVENT#{event_id}", sk_begins_with="REGISTRATION#")
        current_registrations = len(registrations)
    
    # Obtener etiquetas
    event_tags = event_item.get("Tags", [])
    tag_details = []
    if event_tags:
        all_tags = {tag.id: tag for tag in get_all_tags()}
        tag_details = [all_tags[tag_id] for tag_id in event_tags if tag_id in all_tags]
    
    return EventResponse(
        id=event_id,
        name=event_item.get("Name"),
        description=event_item.get("Description"),
        date=event_item.get("Date"),
        location=event_item.get("Location"),
        autonomous_community=event_item.get("AutonomousCommunity"),
        city=event_item.get("City"),
        max_capacity=event_item.get("MaxCapacity"),
        current_registrations=current_registrations,
        available_spots=event_item.get("MaxCapacity") - current_registrations,
        image_url=event_item.get("ImageUrl"),
        organizer_id=event_item.get("OrganizerId"),
        organizer_name=event_item.get("OrganizerName"),
        created_at=event_item.get("CreatedAt"),
        tags=event_tags,
        tag_details=tag_details
    )


def get_all_events() -> List[EventResponse]:
    """Obtener todos los eventos activos"""
    # Consultar eventos activos usando GSI2
    events = db.query_gsi(index_name="GSI2", pk_value="ACTIVE_EVENTS")
    
    # Cargar todas las etiquetas una vez para mapeo eficiente
    all_tags = {tag.id: tag for tag in get_all_tags()}
    
    result = []
    for event in events:
        # Extraer event_id del PK
        event_id = event.get("PK").split("#")[1]
        
        # Contar inscripciones
        registrations = db.query_by_pk(pk=f"EVENT#{event_id}", sk_begins_with="REGISTRATION#")
        current_registrations = len(registrations)
        
        # Obtener detalles de etiquetas
        event_tags = event.get("Tags", [])
        tag_details = [all_tags[tag_id] for tag_id in event_tags if tag_id in all_tags]
        
        result.append(EventResponse(
            id=event_id,
            name=event.get("Name"),
            description=event.get("Description"),
            date=event.get("Date"),
            location=event.get("Location"),
            autonomous_community=event.get("AutonomousCommunity"),
            city=event.get("City"),
            max_capacity=event.get("MaxCapacity"),
            current_registrations=current_registrations,
            available_spots=event.get("MaxCapacity") - current_registrations,
            image_url=event.get("ImageUrl"),
            organizer_id=event.get("OrganizerId"),
            organizer_name=event.get("OrganizerName"),
            created_at=event.get("CreatedAt"),
            tags=event_tags,
            tag_details=tag_details
        ))
    
    # Ordenar por fecha
    result.sort(key=lambda e: e.date)
    return result


def update_event(event_id: str, event_data: EventUpdate, current_user: UserResponse) -> EventResponse:
    """Actualizar un evento (solo por el organizador)"""
    event_item = db.get_item(pk=f"EVENT#{event_id}", sk="METADATA")
    
    if not event_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento no encontrado"
        )
    
    # Verificar si el usuario es el organizador
    if event_item.get("OrganizerId") != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo el organizador del evento puede actualizarlo"
        )
    
    # Preparar actualizaciones
    updates = {}
    if event_data.name is not None:
        updates["Name"] = event_data.name
    if event_data.description is not None:
        updates["Description"] = event_data.description
    if event_data.date is not None:
        updates["Date"] = event_data.date
        updates["GSI2SK"] = event_data.date
    if event_data.location is not None:
        updates["Location"] = event_data.location
    if event_data.autonomous_community is not None:
        updates["AutonomousCommunity"] = event_data.autonomous_community
    if event_data.city is not None:
        updates["City"] = event_data.city
    if event_data.max_capacity is not None:
        updates["MaxCapacity"] = event_data.max_capacity
    if event_data.image_url is not None:
        updates["ImageUrl"] = event_data.image_url
    if event_data.tags is not None:
        updates["Tags"] = event_data.tags
    
    # Actualizar en base de datos
    if updates:
        db.update_item(pk=f"EVENT#{event_id}", sk="METADATA", updates=updates)
    
    # Devolver evento actualizado
    return get_event_by_id(event_id)


def delete_event(event_id: str, current_user: UserResponse) -> None:
    """Eliminar un evento (solo por el organizador)"""
    event_item = db.get_item(pk=f"EVENT#{event_id}", sk="METADATA")
    
    if not event_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento no encontrado"
        )
    
    # Verificar si el usuario es el organizador
    if event_item.get("OrganizerId") != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo el organizador del evento puede eliminarlo"
        )
    
    # Eliminar todas las inscripciones de este evento
    registrations = db.query_by_pk(pk=f"EVENT#{event_id}", sk_begins_with="REGISTRATION#")
    for registration in registrations:
        db.delete_item(pk=f"EVENT#{event_id}", sk=registration.get("SK"))
    
    # Eliminar metadatos del evento
    db.delete_item(pk=f"EVENT#{event_id}", sk="METADATA")


def get_organizer_events(organizer_id: str) -> List[EventResponse]:
    """Obtener todos los eventos creados por un organizador específico"""
    print(f"Obteniendo eventos del organizador: {organizer_id}")
    all_events = get_all_events()
    print(f"Total de eventos en la base de datos: {len(all_events)}")
    organizer_events = [event for event in all_events if event.organizer_id == organizer_id]
    print(f"Eventos de este organizador: {len(organizer_events)}")
    return organizer_events
