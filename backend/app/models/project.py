from sqlalchemy import Column, String, Integer, Boolean, TIMESTAMP, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class Project(Base):
    """Project model"""

    __tablename__ = "projects"

    id = Column(String(36), primary_key=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    required_members = Column(Integer, nullable=False, default=1)
    color = Column(String(7), nullable=True, default="#3B82F6")
    is_active = Column(Boolean, nullable=False, default=True, index=True)
    created_at = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    members = relationship("ProjectMember", back_populates="project", cascade="all, delete-orphan")
    confirmed_shifts = relationship("ConfirmedShift", back_populates="project", cascade="all, delete-orphan")
    meetings = relationship("Meeting", back_populates="project", cascade="all, delete-orphan")
    optimization_assignments = relationship("OptimizationAssignment", back_populates="project", cascade="all, delete-orphan")


class ProjectMember(Base):
    """Project member relationship"""

    __tablename__ = "project_members"

    id = Column(String(36), primary_key=True)
    project_id = Column(String(36), nullable=False, index=True)
    user_id = Column(String(36), nullable=False, index=True)
    role = Column(String(20), nullable=False, default="member")
    joined_at = Column(TIMESTAMP, server_default=func.now(), nullable=False)

    # Relationships
    project = relationship("Project", back_populates="members")
    user = relationship("User", back_populates="project_memberships")

    __table_args__ = (
        {"mysql_engine": "InnoDB", "mysql_charset": "utf8mb4"},
    )
