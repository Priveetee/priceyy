from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from src.database import get_db
from src.services.auth_service import AuthService
from src.models.user import User

router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = AuthService.authenticate_user(db, request.username, request.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username ou password incorrect"
        )
    
    token = AuthService.create_access_token(data={"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}

@router.post("/register")
async def register(request: LoginRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.username == request.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username exists")
    
    hashed_pwd = AuthService.get_password_hash(request.password)
    user = User(
        username=request.username,
        email=f"{request.username}@priceyy.local",
        hashed_password=hashed_pwd
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    token = AuthService.create_access_token(data={"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}
