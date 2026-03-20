# Script para promocionar un usuario a rol Admin por email

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.dynamodb import db

# Busca un usuario por email en DynamoDB y le asigna el rol Admin
def promote_to_admin(email):
    print(f"Buscando usuario con email: {email}...")
    
    users = db.query_gsi(index_name="GSI1", pk_value=f"EMAIL#{email}")
    
    if not users:
        print(f"❌ No se encontró ningún usuario con el email {email}")
        return
    
    user = users[0]
    pk = user['PK']
    sk = user['SK']
    current_role = user.get('Role', 'Unknown')
    name = user.get('Name', 'Unknown')
    
    print(f"Usuario encontrado: {name} (Rol actual: {current_role})")
    
    if current_role == 'Admin':
        print("ℹ️ Este usuario ya es Administrador.")
        return

    print(f"Promocionando a {name} a Admin...")
    
    try:
        updated = db.update_item(
            pk=pk,
            sk=sk,
            updates={'Role': 'Admin'}
        )
        print(f"✅ ¡Éxito! {name} ({email}) ahora es Admin.")
    except Exception as e:
        print(f"❌ Error al actualizar: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python promote_admin.py <email>")
        sys.exit(1)
    
    email = sys.argv[1]
    promote_to_admin(email)
