from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import NullPool
from src.config import settings
from src.models.pricing import Base as PricingBase
from src.models.estimation import Base as EstimationBase

engine = create_engine(
    settings.DATABASE_URL,
    poolclass=NullPool,
    echo=False
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

def init_db():
    PricingBase.metadata.create_all(bind=engine)
    EstimationBase.metadata.create_all(bind=engine)

def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
