from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class UserCreate(BaseModel):
    email: str
    password: str
    company_name: str
    bot_name: str

class UserLogin(BaseModel):
    email: str
    password: str

class OTPVerify(BaseModel):
    email: str
    otp: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    company_name: str
    bot_name: str

class UserResponse(BaseModel):
    id: int
    email: str
    company_name: str
    bot_name: str
    is_verified: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class MessageResponse(BaseModel):
    message: str
    success: bool