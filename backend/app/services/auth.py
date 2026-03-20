# Servicio de autenticación: verificación de tokens Cognito, provisión de usuarios y control de roles

from jose import jwt, jwk
from jose.utils import base64url_decode
import time
import json
from urllib.request import urlopen
from typing import Optional, Dict, Any
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.config import settings
from app.schemas.user import UserResponse, UserCreate
from app.database.dynamodb import db
from app.services.user import create_user

# Seguridad con token Bearer HTTP
security = HTTPBearer()

# Caché para JWKS
jwks_keys: Optional[Dict[str, Any]] = None


def get_jwks() -> Dict[str, Any]:
    """Obtener y cachear JWKS de AWS Cognito"""
    global jwks_keys
    if jwks_keys is None:
        url = f"https://cognito-idp.{settings.aws_region}.amazonaws.com/{settings.cognito_user_pool_id}/.well-known/jwks.json"
        try:
            with urlopen(url) as response:
                jwks_keys = json.loads(response.read())
        except Exception as e:
            print(f"Error al obtener JWKS: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error de configuración de autenticación"
            )
    return jwks_keys


def verify_cognito_token(token: str) -> Dict[str, Any]:
    """Verificar y decodificar un token JWT de Cognito"""
    try:
        # Obtener cabeceras para encontrar el ID de clave (kid)
        headers = jwt.get_unverified_headers(token)
        kid = headers.get("kid")
        if not kid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido"
            )

        # Obtener clave pública de JWKS
        keys = get_jwks().get("keys", [])
        key = next((k for k in keys if k["kid"] == kid), None)
        
        if not key:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Llave de firma no encontrada"
            )

        # Construir clave pública
        public_key = jwk.construct(key)
        
        # Verificar firma y expiración
        message, encoded_signature = str(token).rsplit(".", 1)
        decoded_signature = base64url_decode(encoded_signature.encode("utf-8"))
        
        if not public_key.verify(message.encode("utf8"), decoded_signature):
             raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Firma de token inválida"
            )
            
        claims = jwt.get_unverified_claims(token)
        
        # Verificar expiración
        if time.time() > claims["exp"]:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token expirado"
            )
                        
        return claims

    except Exception as e:
        print(f"Error al verificar token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No se pudo validar el token",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> UserResponse:
    """Obtener el usuario actual desde el token JWT de Cognito, provisionando en DynamoDB si no existe"""
    token = credentials.credentials
    claims = verify_cognito_token(token)
    
    email = claims.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Token no contiene email")
        
    # Verificar si el usuario existe en DynamoDB
    users = db.query_gsi(index_name="GSI1", pk_value=f"EMAIL#{email}")
    
    if users:
        user_item = users[0]
        # Limpiar prefijo 'Type' del ID si es necesario, generalmente almacenado como "PK": "USER#<uuid>"
        user_id = user_item.get("PK").split("#")[1]
        
        # Si el usuario no estaba confirmado, marcarlo como confirmado
        if user_item.get("Confirmed") == False:
            db.update_item(
                pk=f"USER#{user_id}",
                sk="METADATA",
                updates={"Confirmed": True}
            )
        
        return UserResponse(
            id=user_id,
            email=user_item.get("Email"),
            name=user_item.get("Name"),
            role=user_item.get("Role"),
            created_at=user_item.get("CreatedAt")
        )
    else:
        # Usuario no está en DynamoDB -> Provisionarlo
        # Extraer información de los claims
        name = claims.get("name", email.split("@")[0])
        role = claims.get("custom:role", "Asistente")
        
        print(f"Provisionando nuevo usuario desde Cognito: {email} ({role})")
        
        new_user = UserCreate(
            email=email,
            name=name,
            role=role,
            password=None # Gestionado por Cognito
        )
        
        created_user = create_user(new_user)
        return created_user


def require_organizer(current_user: UserResponse = Depends(get_current_user)) -> UserResponse:
    if current_user.role != "Organizador":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los organizadores pueden realizar esta acción"
        )
    return current_user


def require_admin(current_user: UserResponse = Depends(get_current_user)) -> UserResponse:
    if current_user.role != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los administradores pueden realizar esta acción"
        )
    return current_user
