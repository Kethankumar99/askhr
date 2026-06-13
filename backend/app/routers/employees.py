from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.employee import EmployeeCreate, EmployeeDelete
from app.services.employee_service import (
    add_employee, add_bulk_employees, get_all_employees, delete_employee
)
from app.utils.security import verify_token
import re
import io
import csv
import pandas as pd

router = APIRouter(prefix="/api/employees", tags=["Employees"])
security = HTTPBearer()

def get_company_email(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Extract company email from JWT token"""
    token = credentials.credentials
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload.get("sub")

def extract_emails_from_text(text: str) -> list:
    """Extract all email addresses from text"""
    email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    emails = re.findall(email_pattern, text)
    # Remove duplicates & strip
    unique_emails = list(set([email.strip().lower() for email in emails]))
    return unique_emails

@router.post("/add")
async def add_single_employee(
    employee: EmployeeCreate,
    company_email: str = Depends(get_company_email),
    db: Session = Depends(get_db)
):
    """
    ➕ Add Single Employee
    """
    result = add_employee(
        db,
        email=employee.email,
        name=employee.name or "",
        department=employee.department or "",
        company_email=company_email
    )
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
    
    return result

@router.post("/upload-file")
async def upload_file_extract_emails(
    file: UploadFile = File(...),
    company_email: str = Depends(get_company_email),
    db: Session = Depends(get_db)
):
    """
    📁 Upload Any File - Auto Extract Emails
    
    Supports: CSV, Excel (.xlsx), PDF, Word (.docx), TXT
    File lo nundi emails automatic ga extract chestham
    """
    
    filename = file.filename.lower()
    content = await file.read()
    emails = []
    
    try:
        # ── TXT / CSV Files ──
        if filename.endswith('.txt') or filename.endswith('.csv'):
            text = content.decode('utf-8', errors='ignore')
            emails = extract_emails_from_text(text)
        
        # ── Excel Files ──
        elif filename.endswith('.xlsx') or filename.endswith('.xls'):
            try:
                df = pd.read_excel(io.BytesIO(content))
                # All columns lo emails search
                for col in df.columns:
                    text = ' '.join(df[col].astype(str).tolist())
                    emails.extend(extract_emails_from_text(text))
            except:
                # If pandas fails, try reading as text
                text = content.decode('utf-8', errors='ignore')
                emails = extract_emails_from_text(text)
        
        # ── PDF Files ──
        elif filename.endswith('.pdf'):
            try:
                import PyPDF2
                pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))
                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text() + " "
                emails = extract_emails_from_text(text)
            except:
                raise HTTPException(status_code=400, detail="Could not read PDF. Install PyPDF2: pip install PyPDF2")
        
        # ── Word Files ──
        elif filename.endswith('.docx'):
            try:
                import docx
                doc = docx.Document(io.BytesIO(content))
                text = " ".join([para.text for para in doc.paragraphs])
                emails = extract_emails_from_text(text)
            except:
                raise HTTPException(status_code=400, detail="Could not read DOCX. Install python-docx: pip install python-docx")
        
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported file format: {filename}")
        
        # ── Remove duplicates ──
        emails = list(set(emails))
        
        if not emails:
            return {
                "success": False,
                "message": "No email addresses found in the file",
                "emails_found": [],
                "added": [],
                "skipped": []
            }
        
        print(f"\n📧 Extracted {len(emails)} emails: {emails}\n")
        
        # ── Add to database ──
        employees_list = [{"email": e, "name": "", "department": ""} for e in emails]
        result = add_bulk_employees(db, employees_list, company_email)
        
        return {
            "success": True,
            "message": f"Found {len(emails)} emails. Added: {len(result['added'])}, Already exists: {len(result['skipped'])}",
            "emails_found": emails,
            "added": result["added"],
            "skipped": result["skipped"]
        }
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error processing file: {str(e)}")

@router.get("/")
async def list_employees(
    company_email: str = Depends(get_company_email),
    db: Session = Depends(get_db)
):
    """
    👥 List All Employees
    """
    result = get_all_employees(db, company_email)
    return result

@router.delete("/delete")
async def delete_employee_route(
    employee: EmployeeDelete,
    company_email: str = Depends(get_company_email),
    db: Session = Depends(get_db)
):
    """
    🗑️ Delete Employee
    """
    result = delete_employee(db, email=employee.email, company_email=company_email)
    
    if not result["success"]:
        raise HTTPException(status_code=404, detail=result["message"])
    
    return result