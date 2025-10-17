import pytest
from src.services.auth_service import AuthService
from src.models.user import User

def test_get_password_hash():
    password = "TestPass123!"
    hashed = AuthService.get_password_hash(password)
    
    assert hashed != password
    assert len(hashed) > 20

def test_verify_password():
    password = "TestPass123!"
    hashed = AuthService.get_password_hash(password)
    
    assert AuthService.verify_password(password, hashed)
    assert not AuthService.verify_password("WrongPass123!", hashed)

def test_verify_password_long_input():
    long_password = "A" * 100 + "123!"
    hashed = AuthService.get_password_hash(long_password)
    
    assert AuthService.verify_password(long_password, hashed)

def test_create_access_token():
    token = AuthService.create_access_token(data={"sub": "test-user-id"})
    
    assert token is not None
    assert len(token) > 50

def test_verify_token():
    token = AuthService.create_access_token(data={"sub": "test-user-id"})
    payload = AuthService.verify_token(token)
    
    assert payload is not None
    assert payload["sub"] == "test-user-id"

def test_verify_token_invalid():
    payload = AuthService.verify_token("invalid-token")
    assert payload is None

def test_authenticate_user(test_db, test_user):
    user = AuthService.authenticate_user(test_db, "testuser", "TestPass123!")
    
    assert user is not None
    assert user.username == "testuser"

def test_authenticate_user_wrong_password(test_db, test_user):
    user = AuthService.authenticate_user(test_db, "testuser", "WrongPass123!")
    
    assert user is None

def test_authenticate_user_not_found(test_db):
    user = AuthService.authenticate_user(test_db, "nonexistent", "TestPass123!")
    
    assert user is None
