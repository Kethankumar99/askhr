from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database import Base

class Employee(Base):
    __tablename__ = "employees"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)
    department = Column(String, nullable=True)
    company_email = Column(String, nullable=False)  # HR email (who added)
    created_at = Column(DateTime(timezone=True), server_default=func.now())