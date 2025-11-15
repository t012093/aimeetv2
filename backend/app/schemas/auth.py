from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class GoogleAuthRequest(BaseModel):
    """Google OAuth authentication request"""

    code: str
    redirect_uri: Optional[str] = None


class TokenResponse(BaseModel):
    """Token response"""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class UserResponse(BaseModel):
    """User response"""

    id: str
    email: EmailStr
    name: str
    avatar_url: Optional[str] = None
    role: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    """Authentication response"""

    user: UserResponse
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
