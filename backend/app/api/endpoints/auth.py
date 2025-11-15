from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.auth import GoogleAuthRequest, AuthResponse, UserResponse
from app.services.google_oauth import GoogleOAuthService
from app.models.user import User
from app.core.security import create_access_token, create_refresh_token
from datetime import datetime, timedelta
import uuid

router = APIRouter()


@router.post("/google", response_model=AuthResponse)
async def google_auth(
    request: GoogleAuthRequest,
    db: Session = Depends(get_db),
):
    """Authenticate with Google OAuth"""
    try:
        # Exchange code for tokens
        redirect_uri = request.redirect_uri or "http://localhost:3000/oauth2callback"
        tokens = await GoogleOAuthService.exchange_code_for_tokens(
            request.code, redirect_uri
        )

        # Get user info from Google
        user_info = await GoogleOAuthService.get_user_info(tokens["access_token"])
        if not user_info:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to get user info from Google",
            )

        # Check if user exists
        user = db.query(User).filter(User.google_id == user_info["id"]).first()

        if not user:
            # Create new user
            user = User(
                id=str(uuid.uuid4()),
                google_id=user_info["id"],
                email=user_info["email"],
                name=user_info.get("name", user_info["email"]),
                avatar_url=user_info.get("picture"),
                role="member",
                google_access_token=tokens["access_token"],
                google_refresh_token=tokens.get("refresh_token"),
                token_expires_at=tokens.get("expiry"),
            )
            db.add(user)
        else:
            # Update existing user tokens
            user.google_access_token = tokens["access_token"]
            if tokens.get("refresh_token"):
                user.google_refresh_token = tokens["refresh_token"]
            user.token_expires_at = tokens.get("expiry")
            user.avatar_url = user_info.get("picture")
            user.name = user_info.get("name", user.name)

        db.commit()
        db.refresh(user)

        # Create JWT tokens
        access_token = create_access_token({"sub": user.id})
        refresh_token = create_refresh_token({"sub": user.id})

        return AuthResponse(
            user=UserResponse.model_validate(user),
            access_token=access_token,
            refresh_token=refresh_token,
        )

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Authentication failed: {str(e)}",
        )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_db),
):
    """Get current user information"""
    from app.api.deps.auth import get_current_user

    user = get_current_user(current_user)
    return UserResponse.model_validate(user)
