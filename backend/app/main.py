from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.models import User, Employee, Document
from app.routers import auth, dashboard, employees, documents, chatbot
import os
import time

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AskHR",
    version="1.0.0",
    docs_url="/docs"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(employees.router)
app.include_router(documents.router)
app.include_router(chatbot.router)

@app.get("/")
async def root():
    return {"app": "AskHR", "status": "Running", "docs": "/docs"}

# @app.on_event("startup")
# async def startup():
#     from app.database import engine, Base
#     import os
#     # Drop old tables and recreate
#     Base.metadata.drop_all(bind=engine)
#     Base.metadata.create_all(bind=engine)
#     pass

@app.on_event("startup")
async def startup():
    import os
    if os.getenv("RESET_DB") == "true":
        from app.database import engine, Base
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)
        print("✅ Database reset complete!")