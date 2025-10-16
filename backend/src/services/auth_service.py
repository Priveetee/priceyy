import hashlib
import bcrypt
import jwt
from datetime import datetime, timedelta
from src.config import settings
from src.models.user import User

class AuthService:
    @staticmethod
    def get_password_hash(password: str) -> str:
        pwd_bytes = password.encode("utf-8")
        if len(pwd_bytes) > 72:
            pwd_bytes = hashlib.sha256(pwd_bytes).digest()
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(pwd_bytes, salt).decode()

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        pwd_bytes = plain_password.encode("utf-8")
        if len(pwd_bytes) > 72:
            pwd_bytes = hashlib.sha256(pwd_bytes).digest()
        return bcrypt.checkpw(pwd_bytes, hashed_password.encode())

    @staticmethod
    def authenticate_user(db, username: str, password: str):
        user = db.query(User).filter(User.username == username).first()
        if not user:
            return None
        if not AuthService.verify_password(password, user.hashed_password):
            return None
        return user

    @staticmethod
    def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(hours=8)
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")

    @staticmethod
    def verify_token(token: str) -> dict:
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            return payload
        except jwt.InvalidTokenError:
            return None
