# Servicio de usuarios: crear y consultar usuarios en DynamoDB

from typing import List, Optional
from datetime import datetime, timedelta
import uuid
import boto3
from app.database.dynamodb import db
from app.schemas.user import UserCreate, UserResponse
from app.config import settings
from fastapi import HTTPException, status
from boto3.dynamodb.conditions import Attr


def create_user(user_data: UserCreate) -> UserResponse:
    """Crear un nuevo usuario"""
    # Verificar si el usuario ya existe
    existing_users = db.query_gsi(index_name="GSI1", pk_value=f"EMAIL#{user_data.email}")
    
    if existing_users:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado"
        )
    
    # Validar rol
    if user_data.role not in ["Organizador", "Asistente"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El rol debe ser 'Organizador' o 'Asistente'"
        )
    
    # Generar ID de usuario
    user_id = str(uuid.uuid4())
    created_at = datetime.utcnow().isoformat() + 'Z'
    
    # Crear elemento de usuario
    user_item = {
        "PK": f"USER#{user_id}",
        "SK": "METADATA",
        "Type": "User",
        "Email": user_data.email,
        "PasswordHash": "COGNITO_MANAGED",
        "Name": user_data.name,
        "Role": user_data.role,
        "Confirmed": False,
        "CreatedAt": created_at,
        "GSI1PK": f"EMAIL#{user_data.email}",
        "GSI1SK": "USER"
    }
    
    # Guardar en base de datos
    db.put_item(user_item)
    
    return UserResponse(
        id=user_id,
        email=user_data.email,
        name=user_data.name,
        role=user_data.role,
        created_at=created_at
    )


def get_user_by_id(user_id: str) -> Optional[UserResponse]:
    """Obtener un usuario por ID"""
    user_item = db.get_item(pk=f"USER#{user_id}", sk="METADATA")
    
    if not user_item:
        return None
    
    return UserResponse(
        id=user_id,
        email=user_item.get("Email"),
        name=user_item.get("Name"),
        role=user_item.get("Role"),
        created_at=user_item.get("CreatedAt")
    )


def get_user_by_email(email: str) -> Optional[UserResponse]:
    """Obtener un usuario por email"""
    users = db.query_gsi(index_name="GSI1", pk_value=f"EMAIL#{email}")
    
    if not users:
        return None
    
    user = users[0]
    # Extraer user_id del PK (formato: "USER#uuid")
    user_id = user.get("PK").split("#")[1]
    
    return UserResponse(
        id=user_id,
        email=user.get("Email"),
        name=user.get("Name"),
        role=user.get("Role"),
        created_at=user.get("CreatedAt")
    )


def cleanup_unconfirmed_users() -> int:
    """Eliminar usuarios no confirmados con más de 1 hora de antigüedad"""
    # Calcular el límite de tiempo (1 hora atrás)
    cutoff = (datetime.utcnow() - timedelta(hours=1)).isoformat() + 'Z'
    
    # Buscar usuarios no confirmados
    filter_exp = (
        Attr('PK').begins_with('USER#') &
        Attr('SK').eq('METADATA') &
        Attr('Confirmed').eq(False) &
        Attr('CreatedAt').lt(cutoff)
    )
    items = db.scan_all(filter_expression=filter_exp)
    
    deleted_count = 0
    cognito_client = boto3.client('cognito-idp', region_name=settings.aws_region)
    
    for item in items:
        email = item.get("Email")
        user_id = item.get("PK").split("#")[1]
        
        try:
            # Borrar de Cognito
            if email:
                cognito_client.admin_delete_user(
                    UserPoolId=settings.cognito_user_pool_id,
                    Username=email
                )
            # Borrar de DynamoDB
            db.delete_item(pk=f"USER#{user_id}", sk="METADATA")
            deleted_count += 1
            print(f"Usuario no confirmado eliminado: {email}")
        except Exception as e:
            print(f"Error al eliminar usuario no confirmado {email}: {e}")
            continue
    
    return deleted_count
