import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# ⚠️ Your Gmail credentials (replace with yours)
SMTP_EMAIL = "chevurukethankumar99@gmail.com"  # ← Change this
SMTP_PASSWORD = "kczn eljr uwno uwvy"  # ← 16-digit App Password

def send_otp_email(to_email: str, otp: str, company_name: str = "AskHR") -> bool:
    """Send OTP via email"""
    
    try:
        # Email content
        subject = f"🔐 {company_name} - Email Verification OTP"
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
            <div style="max-width: 500px; margin: auto; background: #f9f9f9; padding: 30px; border-radius: 10px;">
                <h2 style="color: #2563EB;">🤖 {company_name}</h2>
                <h3>Email Verification</h3>
                <p>Your OTP for registration is:</p>
                <div style="background: #2563EB; color: white; font-size: 32px; text-align: center; padding: 15px; border-radius: 8px; letter-spacing: 10px; font-weight: bold;">
                    {otp}
                </div>
                <p style="color: #666; margin-top: 20px;">This OTP is valid for 5 minutes.</p>
                <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore.</p>
                <hr>
                <p style="color: #999; font-size: 12px; text-align: center;">Powered by AskHR</p>
            </div>
        </body>
        </html>
        """
        
        # Create message
        msg = MIMEMultipart('alternative')
        msg['From'] = f"AskHR <{SMTP_EMAIL}>"
        msg['To'] = to_email
        msg['Subject'] = subject
        
        # Attach HTML
        msg.attach(MIMEText(html_content, 'html'))
        
        # Send email
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            server.send_message(msg)
        
        print(f"📧 OTP email sent to {to_email}")
        return True
        
    except Exception as e:
        print(f"❌ Email error: {str(e)}")
        return False