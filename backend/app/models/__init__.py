"""Database models"""

from app.models.user import User
from app.models.project import Project, ProjectMember
from app.models.shift import ShiftRequest, ConfirmedShift
from app.models.meeting import Meeting, MeetingParticipant
from app.models.optimization import OptimizationSuggestion, OptimizationAssignment
from app.models.template import Template, TemplateShift
from app.models.notification import Notification

__all__ = [
    "User",
    "Project",
    "ProjectMember",
    "ShiftRequest",
    "ConfirmedShift",
    "Meeting",
    "MeetingParticipant",
    "OptimizationSuggestion",
    "OptimizationAssignment",
    "Template",
    "TemplateShift",
    "Notification",
]
