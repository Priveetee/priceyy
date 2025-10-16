from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging
import logging.handlers
import os
from src.database import init_db
from src.redis_client import init_redis, close_redis
from src.scheduler import schedule_pricing_refresh, shutdown_scheduler
from src.api import api_router
from src.exceptions import PriceyException
from src.rate_limit import limiter, rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

audit_logger = logging.getLogger("audit")
log_dir = '/app/logs'
os.makedirs(log_dir, exist_ok=True)

audit_handler = logging.handlers.RotatingFileHandler(
    os.path.join(log_dir, 'audit.log'),
    maxBytes=10485760,
    backupCount=10,
    delay=True
)
audit_handler.setFormatter(logging.Formatter('%(message)s'))
audit_logger.addHandler(audit_handler)
audit_logger.setLevel(logging.INFO)

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    init_redis()
    schedule_pricing_refresh()
    logger.info("Application startup complete")
    yield
    close_redis()
    shutdown_scheduler()
    logger.info("Application shutdown complete")

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
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.exception_handler(PriceyException)
async def pricey_exception_handler(request: Request, exc: PriceyException):
    logger.warning(f"Pricey exception: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content=exc.detail
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unexpected error: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error"}
    )

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/ready")
async def ready():
    return {"status": "ready"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
