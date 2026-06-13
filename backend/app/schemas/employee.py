from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class EmployeeCreate(BaseModel):
    email: str
    name: Optional[str] = None
    department: Optional[str] = None

class EmployeeBulkCreate(BaseModel):
    employees: List[EmployeeCreate]

class EmployeeResponse(BaseModel):
    id: int
    email: str
    name: Optional[str] = None
    department: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class EmployeeDelete(BaseModel):
    email: str