from pydantic import BaseModel, ConfigDict
from typing import Optional


class TagCreate(BaseModel):
    """Schema for creating a tag"""
    name: str
    color: str  # Hex color code, e.g., "#FF0000"
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "Tecnología",
                "color": "#0044ff"
            }
        }
    )


class TagUpdate(BaseModel):
    """Schema for updating a tag"""
    name: Optional[str] = None
    color: Optional[str] = None
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "Innovación",
                "color": "#ffaa00"
            }
        }
    )


class TagResponse(BaseModel):
    """Schema for returning a tag"""
    id: str
    name: str
    color: str
    created_at: str
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "name": "Tecnología",
                "color": "#0044ff",
                "created_at": "2026-02-25T10:00:00Z"
            }
        }
    )
