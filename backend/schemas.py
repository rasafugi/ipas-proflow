from pydantic import BaseModel
from typing import Optional

class UserRegister(BaseModel):
    user_code: str
    email: str
    password: str
    nickname: str
    avatar: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class TestRecord(BaseModel):
    user_code: str
    score: int
    correct_count: int
    total_questions: int = 20