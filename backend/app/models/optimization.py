from sqlalchemy import Column, String, Date, Time, TIMESTAMP, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class OptimizationSuggestion(Base):
    """LLM optimization suggestion model"""

    __tablename__ = "optimization_suggestions"

    id = Column(String(36), primary_key=True)
    month = Column(String(7), nullable=False, index=True)  # YYYY-MM format
    status = Column(String(20), nullable=False, default="pending", index=True)  # pending/approved/rejected
    summary = Column(JSON, nullable=False)
    created_by = Column(String(36), nullable=False)
    approved_by = Column(String(36), nullable=True)
    approved_at = Column(TIMESTAMP, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now(), nullable=False)

    # Relationships
    creator = relationship("User", foreign_keys=[created_by], back_populates="created_optimizations")
    approver = relationship("User", foreign_keys=[approved_by], back_populates="approved_optimizations")
    assignments = relationship("OptimizationAssignment", back_populates="suggestion", cascade="all, delete-orphan")


class OptimizationAssignment(Base):
    """Optimization assignment detail model"""

    __tablename__ = "optimization_assignments"

    id = Column(String(36), primary_key=True)
    suggestion_id = Column(String(36), nullable=False, index=True)
    user_id = Column(String(36), nullable=False, index=True)
    project_id = Column(String(36), nullable=False)
    date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)

    # Relationships
    suggestion = relationship("OptimizationSuggestion", back_populates="assignments")
    user = relationship("User")
    project = relationship("Project", back_populates="optimization_assignments")
