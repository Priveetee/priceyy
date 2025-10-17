import pytest
import sys
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
from src.models.base import Base
from src.database import get_db
from main import app
from src.models.user import User
from src.services.auth_service import AuthService

TEST_DATABASE_URL = os.getenv("TEST_DATABASE_URL", "postgresql://priceyy:priceyy@postgres-test:5432/priceyy_test")

@pytest.fixture(scope="function")
def test_db():
    engine = create_engine(TEST_DATABASE_URL)
    
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()
    
    app.dependency_overrides[get_db] = override_get_db
    db = TestingSessionLocal()
    yield db
    db.close()
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(test_db):
    return TestClient(app)

@pytest.fixture(scope="function")
def test_user(test_db):
    user = User(
        username="testuser",
        email="test@example.com",
        hashed_password=AuthService.get_password_hash("TestPass123!")
    )
    test_db.add(user)
    test_db.commit()
    test_db.refresh(user)
    return user

@pytest.fixture(scope="function")
def auth_token(client, test_user):
    response = client.post(
        "/api/auth/login",
        json={"username": "testuser", "password": "TestPass123!"}
    )
    return response.json()["access_token"]
