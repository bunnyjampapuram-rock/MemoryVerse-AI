from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models
from fastapi import Depends
from sqlalchemy.orm import Session

from database import SessionLocal
from models import Memory
from schemas import MemoryCreate
# Create database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI application
app = FastAPI(
    title="MemoryVerse AI",
    description="Your personal AI memory storage application",
    version="1.0.0"
)

# Allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# First API endpoint
@app.get("/")
def home():
    return {
        "message": "Welcome to MemoryVerse AI Backend!",
        "status": "Running"
    }


# Health check API
@app.get("/health")
def health_check():
    return {
        "status": "Healthy",
        "application": "MemoryVerse AI"
    }
# Database connection dependency
def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# Save Memory API
@app.post("/memories")
def create_memory(
    memory: MemoryCreate,
    db: Session = Depends(get_db)
):

    new_memory = Memory(
        title=memory.title,
        content=memory.content
    )

    db.add(new_memory)

    db.commit()

    db.refresh(new_memory)

    return {
        "message": "Memory saved successfully",
        "memory_id": new_memory.id
    }
# Retrieve All Memories API
@app.get("/memories")
def get_memories(db: Session = Depends(get_db)):

    memories = db.query(Memory).all()

    return memories
# Search Memories API

@app.get("/memories/search")
def search_memories(
    title: str,
    db: Session = Depends(get_db)
):

    memories = db.query(Memory).filter(
        Memory.title.ilike(f"%{title}%")
    ).all()

    return memories
from fastapi import HTTPException

@app.put("/memories/{memory_id}")
def update_memory(
    memory_id: int,
    memory: MemoryCreate,
    db: Session = Depends(get_db)
):
    existing_memory = db.query(Memory).filter(
        Memory.id == memory_id
    ).first()

    if existing_memory is None:
        raise HTTPException(
            status_code=404,
            detail="Memory not found"
        )

    existing_memory.title = memory.title
    existing_memory.content = memory.content

    db.commit()
    db.refresh(existing_memory)

    return {
        "message": "Memory updated successfully",
        "memory": existing_memory
    }
@app.delete("/memories/{memory_id}")
def delete_memory(
    memory_id: int,
    db: Session = Depends(get_db)
):
    memory = db.query(Memory).filter(
        Memory.id == memory_id
    ).first()

    if memory is None:
        raise HTTPException(
            status_code=404,
            detail="Memory not found"
        )

    db.delete(memory)
    db.commit()

    return {
        "message": "Memory deleted successfully"
    }
    