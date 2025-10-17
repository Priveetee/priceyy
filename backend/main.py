from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging
import logging.handlers
import os
import json
from src.database import init_db
from src.redis_client import init_redis, close_redis
from src.scheduler import schedule_pricing_refresh, shutdown_scheduler
from src.api import api_router
from src.api.monitoring import router as monitoring_router
from src.exceptions import PriceyException
from src.rate_limit import limiter, rate_limit_exceeded_handler
from src.middleware.monitoring import monitoring_middleware
from src.middleware.size_limits import size_limit_middleware
from src.middleware.compression import add_compression_middleware
from src.logging_config import setup_logging
from src.services.health_service import HealthService
from slowapi.errors import RateLimitExceeded

setup_logging()
logger = logging.getLogger(__name__)

log_dir = '/app/logs'
os.makedirs(log_dir, exist_ok=True)

audit_handler = logging.handlers.RotatingFileHandler(
    os.path.join(log_dir, 'audit.log'),
    maxBytes=10485760,
    backupCount=10,
    delay=True
)
audit_handler.setFormatter(logging.Formatter('%(message)s'))
audit_logger = logging.getLogger("audit")
audit_logger.addHandler(audit_handler)
audit_logger.setLevel(logging.INFO)

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    await init_redis()
    schedule_pricing_refresh()
    logger.info(json.dumps({"event": "application.startup", "status": "ok"}))
    yield
    await close_redis()
    shutdown_scheduler()
    logger.info(json.dumps({"event": "application.shutdown", "status": "ok"}))

app = FastAPI(
    title="Priceyy",
    description="Cloud Infrastructure Cost Estimation Platform",
    version="0.1.0",
    lifespan=lifespan
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
)

add_compression_middleware(app)

app.middleware("http")(size_limit_middleware)
app.middleware("http")(monitoring_middleware)

app.include_router(api_router, prefix="/api")
app.include_router(monitoring_router, prefix="/api/monitoring")

@app.exception_handler(PriceyException)
async def pricey_exception_handler(request: Request, exc: PriceyException):
    correlation_id = getattr(request.state, 'correlation_id', 'unknown')
    logger.warning(json.dumps({
        "event": "pricey_exception",
        "correlation_id": correlation_id,
        "detail": exc.detail,
        "status_code": exc.status_code
    }))
    return JSONResponse(status_code=exc.status_code, content=exc.detail)

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    correlation_id = getattr(request.state, 'correlation_id', 'unknown')
    logger.error(json.dumps({
        "event": "unhandled_exception",
        "correlation_id": correlation_id,
        "error": str(exc),
        "path": request.url.path
    }))
    return JSONResponse(status_code=500, content={"error": "Internal server error"})

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/ready")
async def ready():
    health = await HealthService.check_all()
    if health["status"] == "ok":
        return health
    else:
        return JSONResponse(status_code=503, content=health)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
