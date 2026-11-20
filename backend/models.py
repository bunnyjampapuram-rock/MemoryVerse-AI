from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime

from database import Base


# Create Memories Table
class Memory(Base):

    __tablename__ = "memories"

    # Unique ID for every memory
    id = Column(Integer, primary_key=True, index=True)

    # Memory headline
    title = Column(String(200), nullable=True)

    # Actual memory content
    content = Column(Text, nullable=False)

    # Memory creation date
    created_at = Column(DateTime, default=datetime.utcnow)

    # Memory update date
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )