from sqlalchemy import Column, String, Integer, Time, TIMESTAMP, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class Template(Base):
    """Shift template model"""

    __tablename__ = "templates"

    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="templates")
    shifts = relationship("TemplateShift", back_populates="template", cascade="all, delete-orphan")


class TemplateShift(Base):
    """Template shift pattern model"""

    __tablename__ = "template_shifts"

    id = Column(String(36), primary_key=True)
    template_id = Column(String(36), nullable=False, index=True)
    day_of_week = Column(Integer, nullable=False)  # 0=Sunday, 1=Monday, ... 6=Saturday
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)

    # Relationships
    template = relationship("Template", back_populates="shifts")

    __table_args__ = (
        CheckConstraint("day_of_week >= 0 AND day_of_week <= 6", name="chk_template_shifts_day"),
        CheckConstraint("end_time > start_time", name="chk_template_shifts_time"),
    )
