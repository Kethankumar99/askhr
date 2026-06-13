from sqlalchemy.orm import Session
from app.models.employee import Employee

def add_employee(db: Session, email: str, name: str, department: str, company_email: str) -> dict:
    """Add single employee"""
    
    # Check if already exists
    existing = db.query(Employee).filter(
        Employee.email == email,
        Employee.company_email == company_email
    ).first()
    
    if existing:
        return {"success": False, "message": f"Employee {email} already exists"}
    
    new_employee = Employee(
        email=email,
        name=name or "",
        department=department or "",
        company_email=company_email
    )
    
    db.add(new_employee)
    db.commit()
    db.refresh(new_employee)
    
    return {
        "success": True,
        "message": f"Employee {email} added successfully",
        "employee": {
            "id": new_employee.id,
            "email": new_employee.email,
            "name": new_employee.name,
            "department": new_employee.department,
            "created_at": str(new_employee.created_at)
        }
    }

def add_bulk_employees(db: Session, employees: list, company_email: str) -> dict:
    """Add multiple employees"""
    
    added = []
    skipped = []
    
    for emp in employees:
        # Handle both dict and object
        if isinstance(emp, dict):
            email = emp.get("email", "")
            name = emp.get("name", "")
            department = emp.get("department", "")
        else:
            email = emp.email
            name = emp.name or ""
            department = emp.department or ""
        
        if not email:
            skipped.append("no_email")
            continue
        
        result = add_employee(
            db,
            email=email,
            name=name,
            department=department,
            company_email=company_email
        )
        
        if result["success"]:
            added.append(email)
        else:
            skipped.append(email)
    
    return {
        "success": True,
        "message": f"Added: {len(added)}, Skipped: {len(skipped)}",
        "added": added,
        "skipped": skipped
    }

def get_all_employees(db: Session, company_email: str) -> dict:
    """Get all employees for a company"""
    
    employees = db.query(Employee).filter(
        Employee.company_email == company_email
    ).all()
    
    employee_list = []
    for emp in employees:
        employee_list.append({
            "id": emp.id,
            "email": emp.email,
            "name": emp.name,
            "department": emp.department,
            "created_at": str(emp.created_at)
        })
    
    return {
        "success": True,
        "count": len(employee_list),
        "employees": employee_list
    }

def delete_employee(db: Session, email: str, company_email: str) -> dict:
    """Delete employee by email"""
    
    employee = db.query(Employee).filter(
        Employee.email == email,
        Employee.company_email == company_email
    ).first()
    
    if not employee:
        return {"success": False, "message": f"Employee {email} not found"}
    
    db.delete(employee)
    db.commit()
    
    return {"success": True, "message": f"Employee {email} deleted successfully"}