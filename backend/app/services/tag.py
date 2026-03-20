from typing import List, Optional
from datetime import datetime
import uuid
from app.database.dynamodb import db
from app.schemas.tag import TagCreate, TagUpdate, TagResponse
from fastapi import HTTPException, status
from boto3.dynamodb.conditions import Attr


def create_tag(tag_data: TagCreate) -> TagResponse:
    """Crear una nueva etiqueta"""
    # Check if a tag with the same name already exists
    # Esto requiere un scan o mantener un índice GSI por nombre. 
    # Usaremos un scan simple ya que no esperamos miles de etiquetas.
    filter_exp = Attr('PK').begins_with('TAG#') & Attr('SK').eq('METADATA') & Attr('Name').eq(tag_data.name)
    existing_tags = db.scan_all(filter_expression=filter_exp)
    if existing_tags:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe una etiqueta con este nombre"
        )
        
    tag_id = str(uuid.uuid4())
    created_at = datetime.utcnow().isoformat() + 'Z'
    
    tag_item = {
        "PK": f"TAG#{tag_id}",
        "SK": "METADATA",
        "Type": "Tag",
        "Name": tag_data.name,
        "Color": tag_data.color,
        "CreatedAt": created_at
    }
    
    db.put_item(tag_item)
    
    return TagResponse(
        id=tag_id,
        name=tag_data.name,
        color=tag_data.color,
        created_at=created_at
    )


def get_all_tags() -> List[TagResponse]:
    """Obtener todas las etiquetas"""
    filter_exp = Attr('PK').begins_with('TAG#') & Attr('SK').eq('METADATA')
    items = db.scan_all(filter_expression=filter_exp)
    
    tags = []
    for item in items:
        tags.append(TagResponse(
            id=item.get("PK").split("#")[1],
            name=item.get("Name"),
            color=item.get("Color", "#000000"),
            created_at=item.get("CreatedAt")
        ))
        
    # Sort alphabetically by name
    tags.sort(key=lambda t: t.name.lower())
    return tags


def get_tag_by_id(tag_id: str) -> Optional[TagResponse]:
    """Obtener una etiqueta por ID"""
    tag_item = db.get_item(pk=f"TAG#{tag_id}", sk="METADATA")
    if not tag_item:
        return None
        
    return TagResponse(
        id=tag_id,
        name=tag_item.get("Name"),
        color=tag_item.get("Color", "#000000"),
        created_at=tag_item.get("CreatedAt")
    )


def update_tag(tag_id: str, tag_data: TagUpdate) -> TagResponse:
    """Actualizar una etiqueta"""
    tag_item = db.get_item(pk=f"TAG#{tag_id}", sk="METADATA")
    if not tag_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Etiqueta no encontrada"
        )
        
    updates = {}
    if tag_data.name is not None:
        updates["Name"] = tag_data.name
    if tag_data.color is not None:
        updates["Color"] = tag_data.color
        
    if updates:
        db.update_item(pk=f"TAG#{tag_id}", sk="METADATA", updates=updates)
        
    return get_tag_by_id(tag_id)


def delete_tag(tag_id: str) -> None:
    """Eliminar una etiqueta"""
    tag_item = db.get_item(pk=f"TAG#{tag_id}", sk="METADATA")
    if not tag_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Etiqueta no encontrada"
        )
        
    db.delete_item(pk=f"TAG#{tag_id}", sk="METADATA")
    # Nota: No eliminamos la etiqueta de los eventos existentes para simplificar,
    # simplemente el frontend ignorará IDs de etiquetas que ya no existan al renderizar.
