# Esquemas Pydantic de usuario: registro, login, respuesta y token JWT

from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    """Esquema para registro de usuario"""
    email: EmailStr
    password: Optional[str] = None
    name: str
    role: str = "Asistente"  # Rol por defecto: Asistente u Organizador
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "email": "usuario@example.com",
                "password": "password123",
                "name": "Juan Pérez",
                "role": "Asistente"
            }
        }
    )


class UserLogin(BaseModel):
    """Esquema para inicio de sesión"""
    email: EmailStr
    password: str
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "email": "usuario@example.com",
                "password": "password123"
            }
        }
    )


class UserResponse(BaseModel):
    """Esquema para respuesta de usuario (sin datos sensibles)"""
    id: str
    email: str
    name: str
    role: str
    created_at: str
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "email": "usuario@example.com",
                "name": "Juan Pérez",
                "role": "Asistente",
                "created_at": "2026-01-26T15:00:00Z"
            }
        }
    )


class Token(BaseModel):
    """Esquema para respuesta de token JWT"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "user": {
                    "id": "550e8400-e29b-41d4-a716-446655440000",
                    "email": "usuario@example.com",
                    "name": "Juan Pérez",
                    "role": "Asistente",
                    "created_at": "2026-01-26T15:00:00Z"
                }
            }
        }
    )


class TokenData(BaseModel):
    """Esquema para datos de token JWT decodificado"""
    user_id: Optional[str] = None
