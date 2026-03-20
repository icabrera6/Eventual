# Servicio de inscripciones: inscripción, cancelación, listado y check-in

from typing import List
from datetime import datetime
from app.database.dynamodb import db
from app.schemas.registration import RegistrationResponse
from app.schemas.user import UserResponse
from app.services.event import get_event_by_id
from app.services.user import get_user_by_id
from fastapi import HTTPException, status
from botocore.exceptions import ClientError


def register_to_event(event_id: str, user: UserResponse) -> RegistrationResponse:
    """Inscribir un usuario a un evento (Atómico con Transacción)"""
    # 1. Verificar si el evento existe
    event = get_event_by_id(event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evento no encontrado")
    
    # 2. Verificar aforo inicial (evita transacciones innecesarias)
    if event.available_spots <= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El evento está lleno")

    registration_date = datetime.utcnow().isoformat() + 'Z'
    
    # Preparamos los componentes de la transacción
    registration_item = {
        "PK": f"EVENT#{event_id}",
        "SK": f"REGISTRATION#{user.id}",
        "Type": "Registration",
        "UserId": user.id,
        "UserName": user.name,
        "UserEmail": user.email,
        "EventId": event_id,
        "EventName": event.name,
        "CheckedIn": False,
        "RegistrationDate": registration_date
    }

    # Definimos la transacción
    transact_items = [
        {
            "Update": {
                "TableName": db.table.name,
                "Key": {"PK": {"S": f"EVENT#{event_id}"}, "SK": {"S": "METADATA"}},
                "UpdateExpression": "SET CurrentRegistrations = if_not_exists(CurrentRegistrations, :zero) + :one",
                "ConditionExpression": "if_not_exists(CurrentRegistrations, :zero) < :max",
                "ExpressionAttributeValues": {
                    ":one": {"N": "1"},
                    ":zero": {"N": "0"},
                    ":max": {"N": str(event.max_capacity)}
                }
            }
        },
        {
            "Put": {
                "TableName": db.table.name,
                "Item": {
                    "PK": {"S": registration_item["PK"]},
                    "SK": {"S": registration_item["SK"]},
                    "Type": {"S": registration_item["Type"]},
                    "UserId": {"S": registration_item["UserId"]},
                    "UserName": {"S": registration_item["UserName"]},
                    "UserEmail": {"S": registration_item["UserEmail"]},
                    "EventId": {"S": registration_item["EventId"]},
                    "EventName": {"S": registration_item["EventName"]},
                    "CheckedIn": {"BOOL": False},
                    "RegistrationDate": {"S": registration_date}
                },
                "ConditionExpression": "attribute_not_exists(PK)"
            }
        }
    ]

    try:
        db.execute_transaction(transact_items)
    except ClientError as e:
        error_code = e.response.get("Error", {}).get("Code")
        if error_code == "TransactionCanceledException":
            reasons = e.response.get("CancellationReasons", [])
            # Si el primero falla es por el aforo (Update)
            if reasons[0].get("Code") == "ConditionalCheckFailed":
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El evento se ha llenado")
            # Si el segundo falla es porque ya existe (Put)
            if reasons[1].get("Code") == "ConditionalCheckFailed":
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ya estás registrado en este evento")
        
        print(f"Error en transacción: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error al procesar la inscripción")

    return RegistrationResponse(
        id=f"REG#{event_id}#{user.id}",
        event_id=event_id,
        event_name=event.name,
        user_id=user.id,
        user_name=user.name,
        user_email=user.email,
        checked_in=False,
        registration_date=registration_date
    )


def cancel_registration(event_id: str, user: UserResponse) -> None:
    """Cancelar la inscripción de un usuario a un evento (Atómico con Transacción)"""
    # Definimos la transacción para decrementar contador y borrar registro
    transact_items = [
        {
            "Update": {
                "TableName": db.table.name,
                "Key": {"PK": {"S": f"EVENT#{event_id}"}, "SK": {"S": "METADATA"}},
                "UpdateExpression": "SET CurrentRegistrations = CurrentRegistrations - :one",
                "ConditionExpression": "CurrentRegistrations > :zero",
                "ExpressionAttributeValues": {
                    ":one": {"N": "1"},
                    ":zero": {"N": "0"}
                }
            }
        },
        {
            "Delete": {
                "TableName": db.table.name,
                "Key": {"PK": {"S": f"EVENT#{event_id}"}, "SK": {"S": f"REGISTRATION#{user.id}"}},
                "ConditionExpression": "attribute_exists(PK)"
            }
        }
    ]

    try:
        db.execute_transaction(transact_items)
    except ClientError as e:
        error_code = e.response.get("Error", {}).get("Code")
        if error_code == "TransactionCanceledException":
            reasons = e.response.get("CancellationReasons", [])
            # Si el segundo falla es porque no existe el registro (Delete)
            if reasons[1].get("Code") == "ConditionalCheckFailed":
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registro no encontrado")
        
        # Otros errores (o el primero si el contador es raro)
        print(f"Error en cancelación: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error al cancelar la inscripción")


def get_event_registrations(event_id: str) -> List[RegistrationResponse]:
    """Obtener todas las inscripciones de un evento"""
    # Verificar si el evento existe
    event = get_event_by_id(event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento no encontrado"
        )
    
    # Obtener inscripciones
    registrations = db.query_by_pk(
        pk=f"EVENT#{event_id}",
        sk_begins_with="REGISTRATION#"
    )
    
    result = []
    for reg in registrations:
        user_id = reg.get("SK").split("#")[1]
        result.append(RegistrationResponse(
            id=f"REG#{event_id}#{user_id}",
            event_id=event_id,
            event_name=reg.get("EventName"),
            user_id=user_id,
            user_name=reg.get("UserName"),
            user_email=reg.get("UserEmail"),
            checked_in=reg.get("CheckedIn", False),
            registration_date=reg.get("RegistrationDate")
        ))
    
    return result


def get_user_registrations(user_id: str) -> List[RegistrationResponse]:
    """Obtener todos los eventos en los que un usuario está inscrito"""
    # Buscar inscripciones (en producción, usar un GSI para mejor rendimiento)
    all_events = db.query_gsi(index_name="GSI2", pk_value="ACTIVE_EVENTS")
    
    result = []
    for event in all_events:
        event_id = event.get("PK").split("#")[1]
        
        # Verificar si el usuario está inscrito en este evento
        registration = db.get_item(
            pk=f"EVENT#{event_id}",
            sk=f"REGISTRATION#{user_id}"
        )
        
        if registration:
            result.append(RegistrationResponse(
                id=f"REG#{event_id}#{user_id}",
                event_id=event_id,
                event_name=registration.get("EventName"),
                user_id=user_id,
                user_name=registration.get("UserName"),
                user_email=registration.get("UserEmail"),
                checked_in=registration.get("CheckedIn", False),
                registration_date=registration.get("RegistrationDate")
            ))
    
    return result


def check_in_user(event_id: str, user_id: str, organizer: UserResponse) -> RegistrationResponse:
    """Registrar asistencia de un usuario a un evento (solo organizador)"""
    # Verificar que el evento existe y el organizador es el dueño
    event = get_event_by_id(event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento no encontrado"
        )
    
    if event.organizer_id != organizer.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo el organizador puede registrar asistencia"
        )
    
    # Obtener inscripción
    registration = db.get_item(
        pk=f"EVENT#{event_id}",
        sk=f"REGISTRATION#{user_id}"
    )
    
    if not registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registro no encontrado"
        )
    
    # Actualizar estado de check-in
    db.update_item(
        pk=f"EVENT#{event_id}",
        sk=f"REGISTRATION#{user_id}",
        updates={"CheckedIn": True}
    )
    
    return RegistrationResponse(
        id=f"REG#{event_id}#{user_id}",
        event_id=event_id,
        event_name=registration.get("EventName"),
        user_id=user_id,
        user_name=registration.get("UserName"),
        user_email=registration.get("UserEmail"),
        checked_in=True,
        registration_date=registration.get("RegistrationDate")
    )
