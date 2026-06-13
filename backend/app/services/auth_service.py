from sqlalchemy.orm import Session
from app.models.user import User
from app.models.employee import Employee
from app.models.document import Document
from app.utils.security import hash_password, verify_password, create_access_token
from app.utils.otp import generate_otp, store_otp, verify_otp

# Temp storage
temp_users = {}

def register_user(db: Session, user_data) -> dict:
    # Check email
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        return {"success": False, "message": "Email already registered"}
    
    # Check company name (case insensitive)
    from sqlalchemy import func
    existing_company = db.query(User).filter(
        func.lower(User.company_name) == user_data.company_name.lower()
    ).first()
    if existing_company:
        return {"success": False, "message": "Company name already taken"}
    
    otp = generate_otp()
    store_otp(user_data.email, otp)
    
    temp_users[user_data.email] = {
        "password": user_data.password,
        "company_name": user_data.company_name,
        "bot_name": user_data.bot_name
    }
    
    return {"success": True, "message": "OTP sent", "otp": otp}
    
    return {"success": True, "message": "OTP sent", "otp": otp}

def verify_and_create(db: Session, email: str, otp: str) -> dict:
    if not verify_otp(email, otp):
        return {"success": False, "message": "Invalid OTP"}
    
    if email not in temp_users:
        return {"success": False, "message": "Register again"}
    
    data = temp_users[email]
    
    new_user = User(
        email=email,
        password_hash=hash_password(data["password"]),
        company_name=data["company_name"],
        bot_name=data["bot_name"],
        is_verified=True
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    del temp_users[email]
    
    token = create_access_token({"sub": new_user.email, "company": new_user.company_name})
    
    return {
        "success": True,
        "access_token": token,
        "company_name": new_user.company_name,
        "bot_name": new_user.bot_name
    }

def login_user(db: Session, email: str, password: str) -> dict:
    user = db.query(User).filter(User.email == email).first()
    
    if not user or not verify_password(password, user.password_hash):
        return {"success": False, "message": "Invalid credentials"}
    
    token = create_access_token({"sub": user.email, "company": user.company_name})
    
    return {
        "success": True,
        "access_token": token,
        "company_name": user.company_name,
        "bot_name": user.bot_name
    }

def get_dashboard(db: Session, email: str) -> dict:
    """Get dashboard with real counts"""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return {"success": False, "message": "User not found"}
    
    # Get real counts from database
    employee_count = db.query(Employee).filter(
        Employee.company_email == email
    ).count()
    
    document_count = db.query(Document).filter(
        Document.company_email == email
    ).count()
    
    return {
        "success": True,
        "data": {
            "company_name": user.company_name,
            "bot_name": user.bot_name,
            "email": user.email,
            "employees": employee_count,
            "documents": document_count,
            "chats": 0  # Chat history feature future lo add chestham
        }
    }