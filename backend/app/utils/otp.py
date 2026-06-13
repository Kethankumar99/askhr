import random
from datetime import datetime, timedelta
from app.utils.email import send_otp_email

otp_store = {}

def generate_otp() -> str:
    return str(random.randint(100000, 999999))

def store_otp(email: str, otp: str):
    """Store OTP and send email"""
    otp_store[email] = {
        "otp": otp,
        "expires_at": datetime.now() + timedelta(minutes=5)
    }
    
    # Send real email
    send_otp_email(email, otp)
    
    # Also print in terminal (backup)
    print(f"\n📧 OTP for {email}: {otp}\n")

def verify_otp(email: str, otp: str) -> bool:
    if email in otp_store:
        stored = otp_store[email]
        if datetime.now() < stored["expires_at"] and stored["otp"] == otp:
            del otp_store[email]
            return True
    return False