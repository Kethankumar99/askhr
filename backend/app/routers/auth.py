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

    @router.post("/forgot-password")
async def forgot_password(email_data: dict, db: Session = Depends(get_db)):
    """
    📧 Forgot Password - Send OTP to email
    """
    email = email_data.get("email")
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="Email not found")
    
    # Generate OTP
    from app.utils.otp import generate_otp, store_otp
    otp = generate_otp()
    store_otp(email, otp)
    
    return {"success": True, "message": "OTP sent to email", "otp": otp}

@router.post("/reset-password")
async def reset_password(data: dict, db: Session = Depends(get_db)):
    """
    🔒 Reset Password with OTP
    """
    email = data.get("email")
    otp = data.get("otp")
    new_password = data.get("new_password")
    
    from app.utils.otp import verify_otp
    if not verify_otp(email, otp):
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    user = db.query(User).filter(User.email == email).first()
    from app.utils.security import hash_password
    user.password_hash = hash_password(new_password)
    db.commit()
    
    return {"success": True, "message": "Password reset successful"}