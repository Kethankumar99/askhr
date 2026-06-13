import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

SMTP_SERVER = "smtp-relay.brevo.com"
SMTP_PORT = 587
SMTP_EMAIL = os.getenv("SMTP_EMAIL", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")

def send_otp_email(to_email: str, otp: str, company_name: str = "AskHR") -> bool:
    try:
        msg = MIMEMultipart()
        msg['From'] = f"AskHR <{SMTP_EMAIL}>"
        msg['To'] = to_email
        msg['Subject'] = f"🔐 {company_name} - Verification Code"
        
        html = f"""
        <div style="font-family:Arial;max-width:400px;margin:auto;padding:20px;">
            <h2 style="color:#4f46e5;">🤖 {company_name}</h2>
            <h3>Your verification code:</h3>
            <div style="font-size:36px;font-weight:bold;color:#4f46e5;letter-spacing:10px;text-align:center;padding:15px;">{otp}</div>
            <p style="color:#666;">Valid for 5 minutes.</p>
        </div>
        """
        msg.attach(MIMEText(html, 'html'))
        
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            server.sendmail(SMTP_EMAIL, to_email, msg.as_string())
        
        print(f"📧 OTP sent to {to_email}")
        return True
    except Exception as e:
        print(f"❌ Email error: {e}")
        return False