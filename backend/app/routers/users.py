from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.core.security import get_current_user
from app.models.models import User

router = APIRouter()

class UserOut(BaseModel):
    id: int; username: str; email: str; is_admin: bool
    class Config: from_attributes = True

@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user
