from fastapi import APIRouter, Depends, status
from typing import List
from app.schemas.tag import TagCreate, TagUpdate, TagResponse
from app.schemas.user import UserResponse
from app.services import tag as tag_service
from app.services.auth import get_current_user, require_admin

router = APIRouter(prefix="/tags", tags=["Tags"])


@router.get("", response_model=List[TagResponse])
async def get_all_tags():
    """Obtener todas las etiquetas (público para poder mostrarlas)"""
    return tag_service.get_all_tags()


@router.get("/{tag_id}", response_model=TagResponse)
async def get_tag(tag_id: str):
    """Obtener una etiqueta por ID"""
    tag = tag_service.get_tag_by_id(tag_id)
    if not tag:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Etiqueta no encontrada"
        )
    return tag


@router.post("", response_model=TagResponse, status_code=status.HTTP_201_CREATED)
async def create_tag(
    tag_data: TagCreate,
    current_user: UserResponse = Depends(require_admin)
):
    """Crear una nueva etiqueta (Solo Admin)"""
    return tag_service.create_tag(tag_data)


@router.put("/{tag_id}", response_model=TagResponse)
async def update_tag(
    tag_id: str,
    tag_data: TagUpdate,
    current_user: UserResponse = Depends(require_admin)
):
    """Actualizar una etiqueta (Solo Admin)"""
    return tag_service.update_tag(tag_id, tag_data)


@router.delete("/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tag(
    tag_id: str,
    current_user: UserResponse = Depends(require_admin)
):
    """Eliminar una etiqueta (Solo Admin)"""
    tag_service.delete_tag(tag_id)
