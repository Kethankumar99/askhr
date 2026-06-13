from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class DocumentResponse(BaseModel):
    id: int
    filename: str
    original_name: str
    file_type: str
    chunk_count: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class DocumentDelete(BaseModel):
    document_id: int