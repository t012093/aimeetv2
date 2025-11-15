from sqlalchemy import Column, String, Boolean, TIMESTAMP, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class Notification(Base):
    """Notification model"""

    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), nullable=False, index=True)
    type = Column(String(50), nullable=False)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    link = Column(Text, nullable=True)
    is_read = Column(Boolean, nullable=False, default=False, index=True)
    created_at = Column(TIMESTAMP, server_default=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="notifications")
