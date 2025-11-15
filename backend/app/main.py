from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.endpoints import auth, shifts, meetings, calendar, optimization

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix=f"{settings.API_V1_PREFIX}/auth", tags=["auth"])
app.include_router(shifts.router, prefix=f"{settings.API_V1_PREFIX}/shifts", tags=["shifts"])
app.include_router(meetings.router, prefix=f"{settings.API_V1_PREFIX}/meetings", tags=["meetings"])
app.include_router(calendar.router, prefix=f"{settings.API_V1_PREFIX}/calendar", tags=["calendar"])
app.include_router(optimization.router, prefix=f"{settings.API_V1_PREFIX}/optimization", tags=["optimization"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "SIFUT API",
        "version": settings.APP_VERSION,
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy"}
