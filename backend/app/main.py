# Punto de entrada de la API: crea la app FastAPI, configura CORS e incluye los routers

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import auth, events, registrations, checkin, statistics, admin, tags

# Crear aplicación FastAPI
app = FastAPI(
    title="Event Management API",
    description="API REST para gestión de eventos - TFG DAM",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(auth.router)
app.include_router(events.router)
app.include_router(registrations.router)
app.include_router(checkin.router)
app.include_router(statistics.router)
app.include_router(admin.router)
app.include_router(tags.router)


@app.get("/")
async def root():
    """Endpoint de verificación de estado"""
    return {
        "status": "online",
        "message": "Event Management API - TFG DAM",
        "version": "1.0.0"
    }


@app.get("/health")
async def health():
    """Verificación de estado detallada"""
    return {
        "status": "healthy",
        "environment": settings.environment,
        "database": "DynamoDB",
        "table": settings.dynamodb_table_name
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
