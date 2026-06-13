from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.chatbot import ChatRequest, ChatResponse
from app.services.chatbot_service import chat_with_bot

router = APIRouter(prefix="/api/chatbot", tags=["Chatbot"])

# Company emails list (for employee chatbot - no JWT needed)
# In production, this should come from a proper lookup
from app.models.user import User

def get_company_by_employee(db: Session, employee_email: str) -> str:
    """Find which company an employee belongs to"""
    from app.models.employee import Employee
    
    employee = db.query(Employee).filter(
        Employee.email == employee_email
    ).first()
    
    if not employee:
        return None
    
    return employee.company_email

@router.post("/ask", response_model=ChatResponse)
async def ask_question(
    request: ChatRequest,
    db: Session = Depends(get_db)
):
    """
    💬 Employee Chatbot
    
    Employee asks question about company policies.
    No JWT required - just employee email.
    """
    
    # Find company for this employee
    company_email = get_company_by_employee(db, request.employee_email)
    
    if not company_email:
        raise HTTPException(
            status_code=404,
            detail=f"Employee {request.employee_email} not found. Please ask HR to add you."
        )
    
    # Chat with bot
    result = chat_with_bot(
        db,
        request.employee_email,
        company_email,
        request.question
    )
    
    if not result["success"]:
        raise HTTPException(
            status_code=400,
            detail=result["message"]
        )
    
    return ChatResponse(
        question=result["question"],
        answer=result["answer"],
        sources=result.get("sources", []),
        confidence=result.get("confidence", 0)
    )

@router.get("/test")
async def test_employee(
    employee_email: str,
    db: Session = Depends(get_db)
):
    """
    🔍 Test if employee exists
    """
    company_email = get_company_by_employee(db, employee_email)
    
    if company_email:
        return {
            "exists": True,
            "employee_email": employee_email,
            "company": company_email
        }
    else:
        return {
            "exists": False,
            "message": "Employee not found"
        }