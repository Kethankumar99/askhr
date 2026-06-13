from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.document import DocumentDelete
from app.services.document_service import upload_document, get_all_documents, delete_document
from app.utils.security import verify_token

router = APIRouter(prefix="/api/documents", tags=["Documents"])
security = HTTPBearer()

def get_company_email(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload.get("sub")

@router.post("/upload")
async def upload_doc(
    file: UploadFile = File(...),
    company_email: str = Depends(get_company_email),
    db: Session = Depends(get_db)
):
    """
    📄 Upload Document (PDF/DOCX/TXT)
    Auto extracts text and stores in Vector DB
    """
    
    # Validate file type
    allowed_types = ['pdf', 'docx', 'txt', 'csv']
    file_ext = file.filename.split('.')[-1].lower()
    
    if file_ext not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: {', '.join(allowed_types)}"
        )
    
    content = await file.read()
    
    result = upload_document(db, content, file.filename, company_email)
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
    
    return result

@router.get("/")
async def list_documents(
    company_email: str = Depends(get_company_email),
    db: Session = Depends(get_db)
):
    """
    📚 List All Documents
    """
    return get_all_documents(db, company_email)

@router.delete("/delete")
async def delete_doc(
    doc: DocumentDelete,
    company_email: str = Depends(get_company_email),
    db: Session = Depends(get_db)
):
    """
    🗑️ Delete Document
    """
    result = delete_document(db, doc.document_id, company_email)
    
    if not result["success"]:
        raise HTTPException(status_code=404, detail=result["message"])
    
    return result