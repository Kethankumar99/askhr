from pydantic import BaseModel
from typing import Optional, List

class ChatRequest(BaseModel):
    employee_email: str
    question: str

class ChatResponse(BaseModel):
    question: str
    answer: str
    sources: Optional[List[str]] = []
    confidence: Optional[float] = None