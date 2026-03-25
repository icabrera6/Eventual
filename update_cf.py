import subprocess
import json
import os

DIST_ID = 'E1G79SNXZM6SSL'
API_URL = '1u1hzmcg8j.execute-api.eu-south-2.amazonaws.com'

# 1. Obtener configuración actual
try:
    print("Fetching CloudFront distribution config...")
    result = subprocess.run(['aws', 'cloudfront', 'get-distribution', '--id', DIST_ID, '--output', 'json'], capture_output=True, text=True, check=True)
    dist_data = json.loads(result.stdout)
except Exception as e:
    print(f"Error fetching config: {e}")
    if result: print(result.stderr)
    exit(1)

config = dist_data['Distribution']['DistributionConfig']
etag = dist_data['ETag']

# 2. Añadir Origen
origin_id = 'APIGatewayOrigin'
origin_exists = any(o['Id'] == origin_id for o in config['Origins']['Items'])
if not origin_exists:
    print("Adding Origin...")
    new_origin = {
        'Id': origin_id,
        'DomainName': API_URL,
        'OriginPath': '',
        'CustomHeaders': {'Quantity': 0, 'Items': []},
        'CustomOriginConfig': {
            'HTTPPort': 80,
            'HTTPSPort': 443,
            'OriginProtocolPolicy': 'https-only',
            'OriginSslProtocols': {'Quantity': 1, 'Items': ['TLSv1.2']},
            'OriginReadTimeout': 30,
            'OriginKeepaliveTimeout': 5
        },
        'ConnectionAttempts': 3,
        'ConnectionTimeout': 10,
        'OriginShield': {'Enabled': False}
    }
    config['Origins']['Items'].append(new_origin)
    config['Origins']['Quantity'] = len(config['Origins']['Items'])

# 3. Añadir Cache Behavior
behavior_exists = False
if 'CacheBehaviors' in config and 'Items' in config['CacheBehaviors']:
    behavior_exists = any(b['PathPattern'] == '/api/*' for b in config['CacheBehaviors']['Items'])
else:
    config['CacheBehaviors'] = {'Quantity': 0, 'Items': []}

if not behavior_exists:
    print("Adding Cache Behavior...")
    new_behavior = {
        'PathPattern': '/api/*',
        'TargetOriginId': origin_id,
        'TrustedSigners': {'Enabled': False, 'Quantity': 0},
        'TrustedKeyGroups': {'Enabled': False, 'Quantity': 0},
        'ViewerProtocolPolicy': 'redirect-to-https',
        'AllowedMethods': {
            'Quantity': 7,
            'Items': ['GET', 'HEAD', 'OPTIONS', 'PUT', 'POST', 'PATCH', 'DELETE'],
            'CachedMethods': {'Quantity': 2, 'Items': ['GET', 'HEAD']}
        },
        'SmoothStreaming': False,
        'Compress': True,
        'LambdaFunctionAssociations': {'Quantity': 0, 'Items': []},
        'FunctionAssociations': {'Quantity': 0, 'Items': []},
        'FieldLevelEncryptionId': '',
        'CachePolicyId': '4135ea2d-6df8-44a3-9df3-4b5a84be39ad', 
        'OriginRequestPolicyId': '216adef6-5c7f-47e4-b989-5492eafa07d3' 
    }
    config['CacheBehaviors']['Items'].insert(0, new_behavior)
    config['CacheBehaviors']['Quantity'] = len(config['CacheBehaviors']['Items'])

# 4. Guardar configuración modificada
with open('/Users/icabrera/Desktop/ProyectoIntermodular/cf-config.json', 'w') as f:
    json.dump(config, f)

# 5. Actualizar distribución
print("Updating CloudFront distribution...")
try:
    update_result = subprocess.run([
        'aws', 'cloudfront', 'update-distribution', 
        '--id', DIST_ID, 
        '--if-match', etag, 
        '--distribution-config', 'file:///Users/icabrera/Desktop/ProyectoIntermodular/cf-config.json'
    ], capture_output=True, text=True, check=True)
    print("Update successful!")
except Exception as e:
    print(f"Error updating config: {e}")
    if update_result: print(update_result.stderr)
    exit(1)
