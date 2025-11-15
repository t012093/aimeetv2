from sqlalchemy import Column, String, Date, Time, TIMESTAMP, Text, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class ShiftRequest(Base):
    """Shift request model"""

    __tablename__ = "shift_requests"

    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    comment = Column(Text, nullable=True)
    status = Column(String(20), nullable=False, default="draft", index=True)  # draft/submitted/approved/rejected
    submitted_at = Column(TIMESTAMP, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="shift_requests")

    __table_args__ = (
        CheckConstraint("end_time > start_time", name="chk_shift_requests_time"),
    )


class ConfirmedShift(Base):
    """Confirmed shift model"""

    __tablename__ = "confirmed_shifts"

    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), nullable=False, index=True)
    project_id = Column(String(36), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    calendar_event_id = Column(String(255), nullable=True, index=True)
    comment = Column(Text, nullable=True)
    created_by = Column(String(36), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="confirmed_shifts")
    project = relationship("Project", back_populates="confirmed_shifts")
    creator = relationship("User", foreign_keys=[created_by], back_populates="created_shifts")

    __table_args__ = (
        CheckConstraint("end_time > start_time", name="chk_confirmed_shifts_time"),
    )
