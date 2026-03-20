# Cliente DynamoDB: operaciones CRUD sobre la tabla de gestión de eventos

import boto3
from boto3.dynamodb.conditions import Key, Attr
from typing import Dict, List, Optional, Any
from datetime import datetime
from app.config import settings


class DynamoDBClient:
    """Cliente para interactuar con DynamoDB"""
    
    def __init__(self):
        """Inicializar cliente DynamoDB y recurso de tabla"""
        # Configurar recurso boto3
        # En Lambda: usar rol IAM (no se necesitan credenciales)
        # En local: usar credenciales explícitas de la configuración
        has_credentials = (
            settings.aws_access_key_id and 
            settings.aws_secret_access_key and
            settings.aws_access_key_id.strip() != "" and
            settings.aws_secret_access_key.strip() != ""
        )
        
        if has_credentials:
            # Desarrollo local con credenciales explícitas
            self.dynamodb = boto3.resource(
                'dynamodb',
                region_name=settings.aws_region,
                aws_access_key_id=settings.aws_access_key_id,
                aws_secret_access_key=settings.aws_secret_access_key
            )
        else:
            # Lambda: usar rol IAM automáticamente (sin credenciales)
            self.dynamodb = boto3.resource(
                'dynamodb',
                region_name=settings.aws_region
            )
        self.table = self.dynamodb.Table(settings.dynamodb_table_name)
    
    def put_item(self, item: Dict[str, Any]) -> Dict[str, Any]:
        """Insertar o actualizar un elemento"""
        self.table.put_item(Item=item)
        return item
    
    def get_item(self, pk: str, sk: str) -> Optional[Dict[str, Any]]:
        """Obtener un elemento por PK y SK"""
        response = self.table.get_item(
            Key={'PK': pk, 'SK': sk}
        )
        return response.get('Item')
    
    def query_by_pk(self, pk: str, sk_begins_with: Optional[str] = None) -> List[Dict[str, Any]]:
        """Consultar elementos por clave de partición, opcionalmente filtrando por prefijo SK"""
        if sk_begins_with:
            response = self.table.query(
                KeyConditionExpression=Key('PK').eq(pk) & Key('SK').begins_with(sk_begins_with)
            )
        else:
            response = self.table.query(
                KeyConditionExpression=Key('PK').eq(pk)
            )
        return response.get('Items', [])
    
    def query_gsi(self, index_name: str, pk_value: str, sk_value: Optional[str] = None) -> List[Dict[str, Any]]:
        """Consultar un Índice Secundario Global"""
        if sk_value:
            response = self.table.query(
                IndexName=index_name,
                KeyConditionExpression=Key(f'{index_name}PK').eq(pk_value) & Key(f'{index_name}SK').eq(sk_value)
            )
        else:
            response = self.table.query(
                IndexName=index_name,
                KeyConditionExpression=Key(f'{index_name}PK').eq(pk_value)
            )
        return response.get('Items', [])
    
    def delete_item(self, pk: str, sk: str) -> None:
        """Eliminar un elemento por PK y SK"""
        self.table.delete_item(
            Key={'PK': pk, 'SK': sk}
        )
    
    def update_item(self, pk: str, sk: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        """Actualizar atributos específicos de un elemento"""
        update_expression = "SET " + ", ".join([f"#{k} = :{k}" for k in updates.keys()])
        expression_attribute_names = {f"#{k}": k for k in updates.keys()}
        expression_attribute_values = {f":{k}": v for k, v in updates.items()}
        
        response = self.table.update_item(
            Key={'PK': pk, 'SK': sk},
            UpdateExpression=update_expression,
            ExpressionAttributeNames=expression_attribute_names,
            ExpressionAttributeValues=expression_attribute_values,
            ReturnValues="ALL_NEW"
        )
        return response.get('Attributes', {})
    
    def scan_all(self, filter_expression: Optional[Any] = None) -> List[Dict[str, Any]]:
        """Escanear todos los elementos (usar con moderación, operación cara)"""
        if filter_expression:
            response = self.table.scan(FilterExpression=filter_expression)
        else:
            response = self.table.scan()
        return response.get('Items', [])

    def execute_transaction(self, transact_items: List[Dict[str, Any]]) -> None:
        """Ejecutar una transacción atómica de escritura"""
        self.dynamodb.meta.client.transact_write_items(TransactItems=transact_items)


# Instancia global del cliente DynamoDB
db = DynamoDBClient()
