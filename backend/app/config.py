# Configuración de la aplicación: variables de entorno, AWS, Cognito, CORS

try:
    from pydantic_settings import BaseSettings
except ImportError:
    from pydantic import BaseSettings
from typing import List, Optional


class Settings(BaseSettings):
    """Configuración de la aplicación cargada desde variables de entorno"""
    
    # Configuración de AWS
    aws_region: str = "eu-south-2"
    aws_access_key_id: Optional[str] = None
    aws_secret_access_key: Optional[str] = None
    
    # DynamoDB
    dynamodb_table_name: str = "EventManagementTable"
    
    # S3
    s3_bucket_name: str = "tfg-eventos-images"
    
    # Configuración JWT
    jwt_secret_key: str = "your-secret-key-change-this"
    jwt_algorithm: str = "HS256"
    jwt_expiration_minutes: int = 1440  # 24 horas

    # Configuración de Cognito
    cognito_user_pool_id: str = "eu-south-2_ZhxFI6euI"
    cognito_app_client_id: str = "5c3nprohb36p5907kli5dngt9r"
    
    # CORS
    cors_origins: str = "*"
    
    # Entorno
    environment: str = "development"
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        # CRÍTICO: No leer credenciales de AWS de variables de entorno
        # En Lambda, se auto-completan pero no deben usarse
        # Lambda debe usar el rol IAM en su lugar
        fields = {
            'aws_access_key_id': {'env': 'CUSTOM_AWS_ACCESS_KEY_ID'},
            'aws_secret_access_key': {'env': 'CUSTOM_AWS_SECRET_ACCESS_KEY'}
        }
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Convertir cadena de orígenes CORS a lista"""
        return [origin.strip() for origin in self.cors_origins.split(",")]


# Instancia global de configuración
settings = Settings()
