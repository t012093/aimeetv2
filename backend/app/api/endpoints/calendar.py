from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.db.database import get_db
from app.api.deps.auth import get_current_user
from app.models.user import User
from app.models.shift import ConfirmedShift
from app.models.meeting import Meeting
from app.models.project import Project
from app.services.google_calendar import GoogleCalendarService
from pydantic import BaseModel

router = APIRouter()


class SyncShiftRequest(BaseModel):
    """Sync shift to calendar request"""

    shift_id: str


class SyncMeetingRequest(BaseModel):
    """Sync meeting to calendar request"""

    meeting_id: str


@router.post("/sync/shift")
async def sync_shift_to_calendar(
    request: SyncShiftRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Sync a confirmed shift to Google Calendar"""

    # Get shift
    shift = db.query(ConfirmedShift).filter(ConfirmedShift.id == request.shift_id).first()
    if not shift:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Shift not found"
        )

    # Check if user owns this shift
    if shift.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Access denied"
        )

    # Check if user has Google tokens
    if not current_user.google_access_token or not current_user.google_refresh_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google Calendar not connected",
        )

    # Get project
    project = db.query(Project).filter(Project.id == shift.project_id).first()

    # Create calendar event
    start_datetime = datetime.combine(shift.date, shift.start_time)
    end_datetime = datetime.combine(shift.date, shift.end_time)

    result = await GoogleCalendarService.create_shift_event(
        user_access_token=current_user.google_access_token,
        user_refresh_token=current_user.google_refresh_token,
        title=f"シフト: {project.name if project else 'プロジェクト'}",
        description=shift.comment or "",
        start_datetime=start_datetime,
        end_datetime=end_datetime,
    )

    if not result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create calendar event",
        )

    # Update shift with calendar event ID
    shift.calendar_event_id = result["event_id"]
    db.commit()

    return {
        "message": "Shift synced to calendar successfully",
        "event_id": result["event_id"],
        "html_link": result.get("html_link"),
    }


@router.post("/sync/meeting")
async def sync_meeting_to_calendar(
    request: SyncMeetingRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Sync a meeting to Google Calendar with Meet link"""

    # Get meeting
    meeting = db.query(Meeting).filter(Meeting.id == request.meeting_id).first()
    if not meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found"
        )

    # Check if user is the creator
    if meeting.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only meeting creator can sync to calendar",
        )

    # Check if user has Google tokens
    if not current_user.google_access_token or not current_user.google_refresh_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google Calendar not connected",
        )

    # Get participants
    from app.models.meeting import MeetingParticipant

    participants = (
        db.query(MeetingParticipant)
        .filter(MeetingParticipant.meeting_id == meeting.id)
        .all()
    )

    participant_emails = []
    for p in participants:
        user = db.query(User).filter(User.id == p.user_id).first()
        if user:
            participant_emails.append(user.email)

    # Create calendar event with Meet link
    result = await GoogleCalendarService.create_meeting_event(
        user_access_token=current_user.google_access_token,
        user_refresh_token=current_user.google_refresh_token,
        title=meeting.title,
        description=meeting.description or "",
        start_datetime=meeting.start_datetime,
        end_datetime=meeting.end_datetime,
        attendees=participant_emails,
        create_meet_link=True,
    )

    if not result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create calendar event",
        )

    # Update meeting with calendar event ID and Meet link
    meeting.calendar_event_id = result["event_id"]
    meeting.meet_link = result.get("meet_link")
    db.commit()

    return {
        "message": "Meeting synced to calendar successfully",
        "event_id": result["event_id"],
        "html_link": result.get("html_link"),
        "meet_link": result.get("meet_link"),
    }


@router.delete("/sync/shift/{shift_id}")
async def remove_shift_from_calendar(
    shift_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Remove a shift from Google Calendar"""

    shift = db.query(ConfirmedShift).filter(ConfirmedShift.id == shift_id).first()
    if not shift:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Shift not found"
        )

    if shift.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Access denied"
        )

    if not shift.calendar_event_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Shift not synced to calendar",
        )

    # Delete from calendar
    success = await GoogleCalendarService.delete_event(
        user_access_token=current_user.google_access_token,
        user_refresh_token=current_user.google_refresh_token,
        event_id=shift.calendar_event_id,
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete calendar event",
        )

    # Remove calendar event ID from shift
    shift.calendar_event_id = None
    db.commit()

    return {"message": "Shift removed from calendar successfully"}
