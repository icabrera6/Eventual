# 🎓 Eventual - Plataforma de Gestión de Eventos

**Aplicación web completa para gestión de eventos educativos y corporativos**

Proyecto de Trabajo de Fin de Grado (TFG) para DAM - Desarrollo de Aplicaciones Multiplataforma

🌐 **Live Demo**: [eventual.icabrera-portfolio.com](https://eventual.icabrera-portfolio.com)

---

## 📋 Descripción

**Eventual** es una plataforma web moderna y elegante diseñada para la gestión completa de eventos. Permite a organizadores crear eventos, gestionar inscripciones, realizar check-in de asistentes y visualizar estadísticas en tiempo real, todo desde una interfaz minimalista con efectos visuales premium.

### Características Principales

- ✨ **Crear y administrar eventos** - Sistema completo para organizadores
- 👥 **Gestión de asistentes** - Control de aforo y registro automático
- ✅ **Check-in** de participantes - Sistema de verificación en tiempo real
- 🌍 **Filtro geográfico avanzado** - Búsqueda de eventos por país, comunidad autónoma y ciudad
- 🔒 **Registro verificado (OTP)** - Sistema de confirmación de registro con código de 6 dígitos
- 📊 **Estadísticas** detalladas - Métricas de asistencia y ocupación
- 🎯 **Landing page premium** - Efectos visuales interactivos con partículas y glow
- 🔐 **Autenticación segura** - AWS Cognito con manejo de sesiones y verificación de cuentas
- 👨‍💼 **Panel de administración** - Gestión de usuarios y eventos
- 🚀 **CI/CD automatizado** - Despliegue automático con GitHub Actions

---

## 🛠️ Arquitectura y Tecnologías

### Frontend

- **Vite 7.x** - Build tool ultra-rápido
- **JavaScript Vanilla** - SPA con router personalizado
- **Canvas API** - Sistema de partículas interactivas (80 partículas flotantes)
- **AWS Cognito SDK** - Autenticación y gestión de usuarios
- **Diseño moderno**:
  - Glassmorphism y efectos de desenfoque
  - Animaciones fluidas y transiciones
  - Glow effect que sigue el cursor
  - Gradientes dinámicos
  - Sistema de diseño minimalista (negro, blanco, dorado)

### Backend

- **Python 3.11+** - Lenguaje de programación
- **FastAPI** - Framework web asíncrono de alto rendimiento
- **Pydantic** - Validación automática de datos
- **Boto3** - SDK de AWS para Python
- **Uvicorn** - Servidor ASGI
- **Mangum** - Adaptador FastAPI para AWS Lambda

### Autenticación y Usuarios

- **AWS Cognito** - Servicio gestionado de autenticación
  - User Pool con verificación de email
  - Grupos de usuarios (Admin, Organizador, Asistente)
  - Tokens JWT automáticos
  - Gestión de contraseñas (reset, cambio)
- **Atributos personalizados**: Nombre, rol

### Base de Datos

- **AWS DynamoDB** - Base de datos NoSQL serverless
- **Single Table Design** - Patrón optimizado con GSI
- **Capacidad bajo demanda** - Escalado automático

### Infraestructura AWS

- **S3** - Hosting estático del frontend
- **CloudFront** - CDN global con HTTPS y compresión
- **Route 53** - Gestión de DNS
- **ACM** - Certificados SSL/TLS gratuitos
- **Cognito** - Autenticación y gestión de usuarios
- **DynamoDB** - Almacenamiento de datos
- **API Gateway** - (Opcional) Backend serverless
- **Lambda** - (Opcional) Funciones serverless
- **GitHub Actions** - CI/CD automatizado

---




## �🚀 Instalación y Configuración

### Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **Cuenta de AWS** (Free Tier suficiente)
- **Git**

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/Eventual.git
cd Eventual
```

### 2. Configurar AWS Cognito

1. **Ir a AWS Console → Cognito**
2. **Crear User Pool**:
   - Nombre: `EventualUserPool`
   - Sign-in: Email
   - Contraseña mínima: 8 caracteres
   - MFA: Opcional (off para desarrollo)
   - Atributos requeridos: `email`, `name` (custom)
   - Atributos mutables: `name`, `custom:role`
3. **Crear App Client**:
   - Nombre: `EventualWebClient`
   - Generar secret client: NO
   - Habilitar: Username password auth (ALLOW_USER_PASSWORD_AUTH)
4. **Crear grupos**:
   - `Admin`
   - `Organizador`
   - `Asistente`
5. **Anotar**:
   - User Pool ID (ej: `eu-south-2_ZhxFI6euI`)
   - App Client ID (ej: `abc123def456...`)

### 3. Configurar Backend

```bash
cd backend

# Crear entorno virtual
python3 -m venv venv

# Activar entorno virtual
source venv/bin/activate  # Mac/Linux
# venv\Scripts\activate  # Windows

# Instalar dependencias
pip install -r requirements.txt

# Crear archivo de variables de entorno
touch .env
# Editar .env con las variables mostradas abajo
```

#### Variables de Entorno (.env)

```bash
# AWS Configuration
AWS_REGION=eu-south-2
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here

# DynamoDB
DYNAMODB_TABLE_NAME=EventManagementTable

# Cognito (No necesario en backend, usado en frontend)
# COGNITO_USER_POOL_ID=eu-south-2_ZhxFI6euI
# COGNITO_CLIENT_ID=your_client_id_here

# CORS
CORS_ORIGINS=http://localhost:5173,https://eventual.icabrera-portfolio.com
```

#### Crear Tabla DynamoDB (AWS Console)

1. **Ir a AWS Console → DynamoDB**
2. **Click en "Create table"**
3. **Configurar tabla**:
   - **Table name**: `EventManagementTable`
   - **Partition key**: `PK` (String)
   - **Sort key**: `SK` (String)
4. **Table settings**: 
   - Seleccionar **"Customize settings"**
   - **Capacity mode**: On-demand
5. **Secondary indexes** → Click "Create global index":
   
   **GSI1**:
   - **Index name**: `GSI1`
   - **Partition key**: `GSI1PK` (String)
   - **Sort key**: `GSI1SK` (String)
   - **Projected attributes**: All
   
   **GSI2**:
   - Click "Create global index" de nuevo
   - **Index name**: `GSI2`
   - **Partition key**: `GSI2PK` (String)
   - **Sort key**: `GSI2SK` (String)
   - **Projected attributes**: All

6. **Click "Create table"**
7. **Esperar** a que el estado sea "Active" (~1-2 minutos)

> [!TIP]
> Los índices GSI1 y GSI2 se usan para:
> - **GSI1**: Búsqueda de inscripciones por usuario
> - **GSI2**: Listado de eventos ordenados por fecha


### 4. Configurar Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Crear archivo de variables de entorno
touch .env
# Editar .env con las variables mostradas abajo
```

#### Variables de Entorno Frontend (.env)

```bash
VITE_API_URL=http://localhost:8000
VITE_COGNITO_USER_POOL_ID=eu-south-2_ZhxFI6euI
VITE_COGNITO_CLIENT_ID=your_client_id_here
```

---

## 🎯 Ejecución Local

### Backend

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- **API**: http://localhost:8000
- **Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Frontend

```bash
cd frontend
npm run dev
```

- **App**: http://localhost:5173

### Crear Usuario Admin (Primera vez)

```bash
cd backend
python scripts/promote_admin.py
# Ingresar email del usuario a promover
```

---

## 🌐 Deployment (Producción)

### Arquitectura de Producción

Usamos una arquitectura de **Proxy Unificado (Unified Proxy)** donde CloudFront actúa como el punto de entrada único para seguridad y rendimiento.

```text
Usuario
  ↓
Route 53 (eventual.icabrera-portfolio.com)
  ↓
CloudFront CDN (HTTPS, Gzip, Unified Proxy)
  ├── Ruta /* (S3 Bucket) → Frontend Estático
  ├── Ruta /api/* (API Gateway) → AWS Lambda → DynamoDB (Datos lógicos)
  └── Amazon Cognito (SDK) → Autenticación
```

### CI/CD con GitHub Actions

El proyecto incluye workflows automatizados para despliegue:

#### `.github/workflows/deploy-frontend.yml`

Despliega automáticamente el frontend a S3 cuando hay push a `main`:

```yaml
# Features:
- Checkout code
- Setup Node.js 18
- Install dependencies
- Build con variables de entorno
- Sync a S3
- Invalidate CloudFront cache
```

#### `.github/workflows/deploy-backend.yml`

Despliega el backend a AWS Lambda:

```yaml
# Features:
- Package backend code
- Create Lambda deployment package
- Update Lambda function
- Verify deployment
```

#### Configurar GitHub Secrets

En tu repositorio de GitHub:
`Settings → Secrets and variables → Actions → New repository secret`

Agregar:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `VITE_API_URL` (URL de producción del backend)
- `VITE_COGNITO_USER_POOL_ID`
- `VITE_COGNITO_CLIENT_ID`

### Despliegue Manual Frontend

#### 1. Build del Proyecto

```bash
cd frontend
npm run build
```

#### 2. Subir a S3 (AWS Console)

1. **Ir a AWS Console → S3**
2. **Buscar y abrir** el bucket `eventual.icabrera-portfolio.com`
3. **Click en "Upload"**
4. **Arrastrar** todos los archivos de la carpeta `dist/`
5. **Importante**: Marcar "Replace existing files"
6. **Click en "Upload"**
7. **Esperar** a que termine la subida

#### 3. Invalidar Caché CloudFront (AWS Console)

1. **Ir a AWS Console → CloudFront**
2. **Buscar y click** en la distribución `E1G79SNXZM6SSL`
3. **Tab "Invalidations"** → Click "Create invalidation"
4. **Object paths**: `/*`
5. **Click "Create invalidation"**
6. **Esperar** 1-2 minutos para que se propague

---

## 🎨 Funcionalidades

### Landing Page

#### Hero Section
- Gradiente animado con colores dorado y morado
- Glow effect interactivo que sigue el cursor
- Sistema de partículas con Canvas:
  - 80 partículas doradas flotantes
  - Efecto de brillo al acercar cursor
  - Líneas de conexión entre partículas cercanas
  - Animación fluida a 60 FPS

#### Sección de Eventos Destacados
- Grid responsive de tarjetas de eventos
- Lazy loading de imágenes
- Glassmorphism en diseño

#### Footer con Redes Sociales
- Enlaces a GitHub y LinkedIn
- Diseño minimalista elegante

### Dashboard de Usuario

#### Para Asistentes:
- Explorar eventos disponibles con **filtros avanzados** (búsqueda, etiquetas, comunidad autónoma y ordenación).
- Inscribirse a eventos (validación automática de aforo disponible).
- Ver mis inscripciones.
- Cancelar inscripciones.

#### Para Organizadores:
- Todas las funciones de asistente
- Crear eventos con aforo máximo
- Editar/eliminar eventos propios
- Ver lista de inscritos
- Realizar check-in de asistentes
- Ver estadísticas detalladas

#### Para Administradores:
- Panel de administración completo
- Gestión de usuarios (ver, eliminar)
- Gestión de eventos (ver todos, eliminar)
- Tabs: Usuarios | Eventos

---


## 👤 Roles de Usuario

| Rol | Permisos |
|-----|----------|
| **Asistente** | Ver eventos, inscribirse, cancelar inscripciones |
| **Organizador** | + Crear eventos, gestionar inscritos, check-in, estadísticas |
| **Admin** | + Gestionar todos los usuarios y eventos |

---

## 🗄️ Modelo de Datos

### AWS Cognito
- **User Pool**: `EventualUserPool`
- **Atributos**:
  - `email` (Username)
  - `name`
  - `custom:role` (Admin, Organizador, Asistente)
- **Grupos**: Admin, Organizador, Asistente

### DynamoDB - Single Table Design

**Tabla**: `EventManagementTable`

| Entidad | PK | SK | Attributes |
|---------|----|----|------------|
| Evento | EVENT#{uuid} | METADATA | name, description, date, location, autonomous_community, city, max_capacity, organizer_id, organizer_name, image_url, tags |
| Inscripción | EVENT#{event_id} | REGISTRATION#{user_id} | user_name, user_email, checked_in, registered_at |

**GSI1**: Búsqueda por user_id
**GSI2**: Eventos ordenados por fecha

---

## 📚 API Endpoints

### Autenticación (Cognito)
Manejo automático en frontend mediante `amazon-cognito-identity-js`

### Eventos
- `GET /events` - Listar todos los eventos
- `GET /events/{id}` - Detalles de un evento
- `POST /events` - Crear evento 🔒 (Organizador)
- `PUT /events/{id}` - Actualizar evento 🔒 (Organizador, solo propios)
- `DELETE /events/{id}` - Eliminar evento 🔒 (Organizador, solo propios)
- `GET /events/my-events` - Mis eventos 🔒 (Organizador)

### Inscripciones
- `POST /registrations?event_id={id}` - Inscribirse 🔒
- `DELETE /registrations/{event_id}` - Cancelar inscripción 🔒
- `GET /registrations/my-registrations` - Mis inscripciones 🔒
- `GET /registrations/event/{event_id}` - Lista inscritos 🔒 (Organizador)

### Check-in
- `POST /checkin/{event_id}/{user_id}` - Check-in 🔒 (Organizador)

### Estadísticas
- `GET /statistics/{event_id}` - Estadísticas del evento 🔒 (Organizador)

### Etiquetas (Tags)
- `GET /tags` - Listar todas las etiquetas
- `GET /tags/{id}` - Obtener detalles de una etiqueta
- `POST /tags` - Crear etiqueta 🔒 (Admin)
- `PUT /tags/{id}` - Actualizar etiqueta 🔒 (Admin)
- `DELETE /tags/{id}` - Eliminar etiqueta 🔒 (Admin)

### Admin
- `GET /admin/users` - Listar usuarios 🔒 (Admin)
- `DELETE /admin/users/{user_id}` - Eliminar usuario 🔒 (Admin)
- `GET /admin/events` - Listar todos los eventos 🔒 (Admin)
- `DELETE /admin/events/{event_id}` - Eliminar evento 🔒 (Admin)

---

## 👤 Roles de Usuario

| Rol | Permisos |
|-----|----------|
| **Asistente** | Ver eventos, inscribirse, cancelar inscripciones |
| **Organizador** | + Crear eventos, gestionar inscritos, check-in, estadísticas |
| **Admin** | + Gestionar todos los usuarios y eventos |

---

## 🗄️ Modelo de Datos

### AWS Cognito
- **User Pool**: `EventualUserPool`
- **Atributos**:
  - `email` (Username)
  - `name`
  - `custom:role` (Admin, Organizador, Asistente)
- **Grupos**: Admin, Organizador, Asistente

### DynamoDB - Single Table Design

**Tabla**: `EventManagementTable`

| Entidad | PK | SK | Attributes |
|---------|----|----|------------|
| Evento | EVENT#{uuid} | METADATA | name, description, date, location, autonomous_community, city, max_capacity, organizer_id, organizer_name, image_url, tags |
| Inscripción | EVENT#{event_id} | REGISTRATION#{user_id} | user_name, user_email, checked_in, registered_at |

**GSI1**: Búsqueda por user_id
**GSI2**: Eventos ordenados por fecha

---

## 📦 Estructura del Proyecto

```
Eventual/
├── .github/
│   └── workflows/
│       ├── deploy-frontend.yml    # CI/CD Frontend
│       └── deploy-backend.yml     # CI/CD Backend
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py              # AWS, CORS config
│   │   ├── main.py                # FastAPI app
│   │   ├── database/
│   │   │   ├── __init__.py
│   │   │   └── dynamodb.py        # DynamoDB client
│   │   ├── schemas/               # Pydantic models
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── event.py
│   │   │   └── registration.py
│   │   ├── services/              # Business logic
│   │   │   ├── __init__.py
│   │   │   ├── auth.py            # JWT helpers
│   │   │   ├── user.py
│   │   │   ├── event.py
│   │   │   ├── registration.py
│   │   │   └── statistics.py
│   │   └── routers/               # API endpoints
│   │       ├── __init__.py
│   │       ├── auth.py            # /auth/me endpoint
│   │       ├── events.py
│   │       ├── registrations.py
│   │       ├── checkin.py
│   │       ├── statistics.py
│   │       └── admin.py           # Admin endpoints
│   ├── scripts/
│   │   └── promote_admin.py       # Script para promover admin
│   ├── lambda_handler.py          # Handler para AWS Lambda
│   ├── requirements.txt
│   ├── .env                       # Variables de entorno (no incluir en git)
│   └── .gitignore
├── frontend/
│   ├── src/
│   │   ├── main.js                # SPA Router
│   │   ├── style.css              # Sistema de diseño global
│   │   ├── config/
│   │   │   └── api.js             # API client
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   ├── EventCard.js
│   │   │   ├── Common.js          # Loading, EmptyState
│   │   │   └── Notifications.js   # Toast, Modal
│   │   ├── pages/
│   │   │   ├── Landing.js         # Landing page principal
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js
│   │   │   ├── EventDetail.js
│   │   │   ├── CreateEvent.js
│   │   │   ├── MyEvents.js
│   │   │   ├── MyRegistrations.js
│   │   │   └── AdminDashboard.js  # Panel admin
│   │   ├── styles/
│   │   │   ├── Landing.css
│   │   │   ├── Auth.css
│   │   │   ├── Dashboard.css
│   │   │   └── Admin.css
│   │   └── utils/
│   │       ├── auth.js            # LocalStorage helpers
│   │       ├── cognito.js         # AWS Cognito SDK
│   │       ├── formatters.js      # Date, % formatters
│   │       └── validator.js       # Form validation
│   ├── public/
│   │   └── favicon.png
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
├── README.md
└── .gitignore
```

---

## 🔧 Troubleshooting

### Error: "Cannot read properties of null (reading 'name')"

**Causa**: LocalStorage con datos antiguos o corruptos

**Solución**:
```javascript
// En consola del navegador (F12 → Console)
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Error: Línea negra entre navbar y hero section

**Causa**: Caché del navegador

**Solución**:
1. Hard refresh: `Ctrl+Shift+R` (Windows) o `Cmd+Shift+R` (Mac)
2. O limpiar caché completo

### Error: "Incorrect username or password" (Cognito)

**Verificar**:
1. Usuario existe en Cognito User Pool
2. Usuario está confirmado (no en estado `FORCE_CHANGE_PASSWORD`)
3. Contraseña cumple requisitos
4. User Pool ID y Client ID correctos en `.env`

**Verificar en AWS Console**:
1. Ir a **AWS Console → Cognito → User pools**
2. Seleccionar `EventualUserPool`
3. Tab **"Users"** → Buscar el usuario
4. Verificar estado: debe estar "Confirmed" y "Enabled"

### CloudFront muestra contenido antiguo

**Solución (AWS Console)**:
1. Ir a **CloudFront** → Distribución `E1G79SNXZM6SSL`
2. Tab **"Invalidations"** → **"Create invalidation"**
3. Object paths: `/*`
4. Click **"Create invalidation"**
5. Esperar 1-2 minutos

### Error: GitHub Actions workflow fails

**Verificar GitHub Secrets**:
- `AWS_ACCESS_KEY_ID` y `AWS_SECRET_ACCESS_KEY` correctos
- Usuario IAM tiene permisos:
  - `AmazonS3FullAccess`
  - `CloudFrontFullAccess` (con `cloudfront:CreateInvalidation`)
  - `AWSLambdaFullAccess` (si usas Lambda)

---

## 🧪 Testing

### Backend

```bash
# Health check
curl http://localhost:8000/

# Listar eventos
curl http://localhost:8000/events

# Ver documentación
open http://localhost:8000/docs
```

### Frontend

1. Abrir DevTools (F12)
2. Network tab → ver requests a API
3. Console → verificar errores JavaScript
4. Application → verificar localStorage para tokens

---

## 💰 Costos AWS (Estimados)

| Servicio | Free Tier | Después Free Tier |
|----------|-----------|-------------------|
| **S3** | 5GB storage | ~$0.023/GB/mes |
| **CloudFront** | 1TB transfer (12 meses) | ~$0.085/GB |
| **Route 53** Zone | $0.50/mes | $0.50/mes |
| **ACM Certificate** | **Gratis siempre** | **Gratis** |
| **DynamoDB** | 25GB + 200M requests/mes | On-demand |
| **Cognito** | 50,000 MAU | $0.0055/MAU después |
| **Lambda** | 1M requests/mes | $0.20/1M requests |
| **TOTAL** mes 1-12 | ~$0.50/mes | ~$2-5/mes (tráfico bajo) |

---

## 🎓 Autor

**Isaac Cabrera**  
Desarrollo de Aplicaciones Multiplataforma (DAM)  
Proyecto Intermodular - TFG 2026

**Contacto**:
- GitHub: [@icabrera6](https://github.com/icabrera6)
- LinkedIn: [Isaac Cabrera](https://www.linkedin.com/in/icabrerar/)
- Email: icabrerar06@gmail.com

---

## 📄 Licencia

Este proyecto es de uso educativo para Trabajo de Fin de Grado (TFG).

---

## 🔗 Links Útiles

- **Aplicación Live**: https://eventual.icabrera-portfolio.com
- **API Docs (local)**: http://localhost:8000/docs
- **AWS Console**: https://console.aws.amazon.com
- **Cognito Console**: https://console.aws.amazon.com/cognito
- **CloudFront Console**: https://console.aws.amazon.com/cloudfront

---

## 🚀 Roadmap Futuro

- [ ] Tests automatizados (Jest, Pytest)
- [ ] Notificaciones por email (SES)
- [ ] Exportar lista de inscritos a CSV
- [ ] QR codes para check-in
- [ ] App móvil (React Native)
- [ ] Integración con calendarios (Google Calendar, Outlook)
- [ ] Sistema de valoraciones y comentarios
- [ ] Modo oscuro/claro toggle
