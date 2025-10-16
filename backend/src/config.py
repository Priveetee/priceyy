import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/priceyy")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    AZURE_SUBSCRIPTION_ID: str = os.getenv("AZURE_SUBSCRIPTION_ID", "")
    
    class Config:
        env_file = ".env"

settings = Settings()
SECRET_KEY = settings.SECRET_KEY
