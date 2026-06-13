from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import UserCreate, UserLogin, OTPVerify, TokenResponse, MessageResponse
from app.services.auth_service import register_user, verify_and_create, login_user

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/register", response_model=MessageResponse)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    result = register_user(db, user_data)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
    return MessageResponse(message=f"OTP sent to {user_data.email}", success=True)

@router.post("/verify-otp", response_model=TokenResponse)
async def verify_otp(otp_data: OTPVerify, db: Session = Depends(get_db)):
    result = verify_and_create(db, otp_data.email, otp_data.otp)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
    return TokenResponse(
        access_token=result["access_token"],
        company_name=result["company_name"],
        bot_name=result["bot_name"]
    )

@router.post("/login", response_model=TokenResponse)
async def login(login_data: UserLogin, db: Session = Depends(get_db)):
    result = login_user(db, login_data.email, login_data.password)
    if not result["success"]:
        raise HTTPException(status_code=401, detail=result["message"])
    return TokenResponse(
        access_token=result["access_token"],
        company_name=result["company_name"],
        bot_name=result["bot_name"]
    )