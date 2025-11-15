from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class MeetingCreate(BaseModel):
    """Meeting creation"""

    project_id: str
    title: str
    description: Optional[str] = None
    start_datetime: datetime
    end_datetime: datetime
    participant_ids: List[str]
    is_recurring: bool = False
    recurrence_rule: Optional[dict] = None


class MeetingResponse(BaseModel):
    """Meeting response"""

    id: str
    project_id: str
    title: str
    description: Optional[str] = None
    start_datetime: datetime
    end_datetime: datetime
    meet_link: Optional[str] = None
    calendar_event_id: Optional[str] = None
    is_recurring: bool
    recurring_series_id: Optional[str] = None
    recurrence_rule: Optional[dict] = None
    created_by: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MeetingParticipantResponse(BaseModel):
    """Meeting participant response"""

    id: str
    meeting_id: str
    user_id: str
    status: str
    updated_at: datetime

    class Config:
        from_attributes = True
