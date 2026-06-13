from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.auth_service import get_dashboard
from app.utils.security import verify_token

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])
security = HTTPBearer()

@router.get("/")
async def dashboard(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials
    payload = verify_token(token)
    
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    result = get_dashboard(db, payload.get("sub"))
    return result["data"]