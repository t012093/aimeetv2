from pydantic import BaseModel
from typing import Optional
from datetime import date, time, datetime


class ShiftRequestCreate(BaseModel):
    """Shift request creation"""

    date: date
    start_time: time
    end_time: time
    comment: Optional[str] = None


class ShiftRequestUpdate(BaseModel):
    """Shift request update"""

    date: Optional[date] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    comment: Optional[str] = None
    status: Optional[str] = None


class ShiftRequestResponse(BaseModel):
    """Shift request response"""

    id: str
    user_id: str
    date: date
    start_time: time
    end_time: time
    comment: Optional[str] = None
    status: str
    submitted_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ConfirmedShiftCreate(BaseModel):
    """Confirmed shift creation"""

    user_id: str
    project_id: str
    date: date
    start_time: time
    end_time: time
    comment: Optional[str] = None


class ConfirmedShiftResponse(BaseModel):
    """Confirmed shift response"""

    id: str
    user_id: str
    project_id: str
    date: date
    start_time: time
    end_time: time
    calendar_event_id: Optional[str] = None
    comment: Optional[str] = None
    created_by: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
