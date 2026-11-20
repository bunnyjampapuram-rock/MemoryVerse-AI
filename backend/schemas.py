from pydantic import BaseModel
from typing import Optional


class MemoryCreate(BaseModel):

    title: Optional[str] = None

    content: str