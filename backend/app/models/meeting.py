from sqlalchemy import Column, String, Boolean, TIMESTAMP, Text, CheckConstraint, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class Meeting(Base):
    """Meeting model"""

    __tablename__ = "meetings"

    id = Column(String(36), primary_key=True)
    project_id = Column(String(36), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    start_datetime = Column(TIMESTAMP, nullable=False, index=True)
    end_datetime = Column(TIMESTAMP, nullable=False)
    meet_link = Column(Text, nullable=True)
    calendar_event_id = Column(String(255), nullable=True, index=True)
    is_recurring = Column(Boolean, nullable=False, default=False)
    recurring_series_id = Column(String(36), nullable=True, index=True)
    recurrence_rule = Column(JSON, nullable=True)
    created_by = Column(String(36), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    project = relationship("Project", back_populates="meetings")
    creator = relationship("User", foreign_keys=[created_by], back_populates="created_meetings")
    participants = relationship("MeetingParticipant", back_populates="meeting", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint("end_datetime > start_datetime", name="chk_meetings_datetime"),
    )


class MeetingParticipant(Base):
    """Meeting participant model"""

    __tablename__ = "meeting_participants"

    id = Column(String(36), primary_key=True)
    meeting_id = Column(String(36), nullable=False, index=True)
    user_id = Column(String(36), nullable=False, index=True)
    status = Column(String(20), nullable=False, default="pending", index=True)  # pending/accepted/declined/tentative
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    meeting = relationship("Meeting", back_populates="participants")
    user = relationship("User", back_populates="meeting_participations")
