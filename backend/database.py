from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Database location
DATABASE_URL = "sqlite:///./memoryverse.db"

# Create database engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

# Create database session
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Create base class
Base = declarative_base()