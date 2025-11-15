from sqlalchemy import Column, String, TIMESTAMP, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class User(Base):
    """User model"""

    __tablename__ = "users"

    id = Column(String(36), primary_key=True)
    google_id = Column(String(255), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    avatar_url = Column(Text, nullable=True)
    role = Column(String(20), nullable=False, default="member", index=True)
    google_access_token = Column(Text, nullable=True)
    google_refresh_token = Column(Text, nullable=True)
    token_expires_at = Column(TIMESTAMP, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    shift_requests = relationship("ShiftRequest", back_populates="user", cascade="all, delete-orphan")
    confirmed_shifts = relationship("ConfirmedShift", back_populates="user", cascade="all, delete-orphan")
    created_shifts = relationship("ConfirmedShift", foreign_keys="ConfirmedShift.created_by", back_populates="creator")
    project_memberships = relationship("ProjectMember", back_populates="user", cascade="all, delete-orphan")
    created_meetings = relationship("Meeting", foreign_keys="Meeting.created_by", back_populates="creator")
    meeting_participations = relationship("MeetingParticipant", back_populates="user", cascade="all, delete-orphan")
    templates = relationship("Template", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    created_optimizations = relationship("OptimizationSuggestion", foreign_keys="OptimizationSuggestion.created_by", back_populates="creator")
    approved_optimizations = relationship("OptimizationSuggestion", foreign_keys="OptimizationSuggestion.approved_by", back_populates="approver")
