# Router de administración: listar y eliminar usuarios y eventos (solo admin)

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.schemas.user import UserResponse
from app.schemas.event import EventResponse
from app.services.auth import require_admin
from app.database.dynamodb import db
from app.config import settings
from boto3.dynamodb.conditions import Attr
import boto3

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/users", response_model=List[UserResponse])
async def list_all_users(current_user: UserResponse = Depends(require_admin)):
    """Obtener todos los usuarios (Solo Admin)"""
    # Escanear elementos donde PK comienza con USER# y SK es METADATA
    # Nota: Escanear es caro, pero aceptable para panel Admin con < 1000 usuarios
    filter_exp = Attr('PK').begins_with('USER#') & Attr('SK').eq('METADATA')
    items = db.scan_all(filter_expression=filter_exp)
    
    users = []
    for item in items:
        try:
            users.append(UserResponse(
                id=item.get("PK").split("#")[1],
                email=item.get("Email"),
                name=item.get("Name"),
                role=item.get("Role"),
                created_at=item.get("CreatedAt")
            ))
        except Exception as e:
            print(f"Omitiendo elemento de usuario inválido: {item} - Error: {e}")
            continue
            
    return users


@router.get("/events", response_model=List[EventResponse])
async def list_all_events(current_user: UserResponse = Depends(require_admin)):
    """Obtener todos los eventos (Solo Admin)"""
    # Escanear elementos donde PK comienza con EVENT# y SK es METADATA
    filter_exp = Attr('PK').begins_with('EVENT#') & Attr('SK').eq('METADATA')
    items = db.scan_all(filter_expression=filter_exp)
    
    events = []
    for item in items:
        try:
            # Reconstruir objeto de evento similar al servicio get_all_events
            events.append(EventResponse(
                id=item.get("PK").split("#")[1],
                name=item.get("Name"),
                description=item.get("Description"),
                date=item.get("Date"),
                location=item.get("Location"),
                organizer_id=item.get("OrganizerId"),
                organizer_name=item.get("OrganizerName"),
                max_capacity=int(item.get("MaxCapacity", 0)),
                available_spots=int(item.get("AvailableSpots", 0)),
                current_registrations=int(item.get("CurrentRegistrations", 0)),
                image_url=item.get("ImageUrl"),
                status=item.get("Status", "active"),
                created_at=item.get("CreatedAt")
            ))
        except Exception as e:
            print(f"Omitiendo elemento de evento inválido: {item} - Error: {e}")
            continue
            
    return events


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_admin(
    user_id: str,
    current_user: UserResponse = Depends(require_admin)
):
    """Eliminar un usuario (Solo Admin)"""
    # Verificar si el usuario existe
    user = db.get_item(pk=f"USER#{user_id}", sk="METADATA")
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    # Obtener el email del usuario para buscarlo en Cognito
    email = user.get("Email")
    
    # Eliminar de Cognito User Pool
    if email:
        try:
            cognito_client = boto3.client('cognito-idp', region_name=settings.aws_region)
            cognito_client.admin_delete_user(
                UserPoolId=settings.cognito_user_pool_id,
                Username=email
            )
        except Exception as e:
            print(f"Error al eliminar usuario de Cognito: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al eliminar el usuario de Cognito"
            )
    
    # Eliminar de DynamoDB
    db.delete_item(pk=f"USER#{user_id}", sk="METADATA")


@router.delete("/events/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event_admin(
    event_id: str,
    current_user: UserResponse = Depends(require_admin)
):
    """Eliminar un evento (Solo Admin)"""
    # Verificar si el evento existe
    event = db.get_item(pk=f"EVENT#{event_id}", sk="METADATA")
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento no encontrado"
        )
    
    # Eliminar metadatos del evento
    db.delete_item(pk=f"EVENT#{event_id}", sk="METADATA")


@router.post("/cleanup")
async def cleanup_unconfirmed(
    current_user: UserResponse = Depends(require_admin)
):
    """Eliminar usuarios no confirmados con más de 1 hora de antigüedad (Solo Admin)"""
    from app.services.user import cleanup_unconfirmed_users
    deleted = cleanup_unconfirmed_users()
    return {"deleted_count": deleted, "message": f"Se eliminaron {deleted} usuarios no confirmados"}
