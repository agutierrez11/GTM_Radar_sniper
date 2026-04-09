from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routers import empresas
from core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="NERV GTM Intelligence API - Tactical Backend"
)

# Configuración de CORS para hablar con Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir Routers
app.include_router(empresas.router)

@app.get("/")
async def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "version": settings.VERSION,
        "docs": "/docs"
    }

@app.get("/health")
async def health():
    return {"status": "healthy", "engine": "Python 3.14"}
