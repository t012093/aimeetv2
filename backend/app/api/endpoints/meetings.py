from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import uuid

from app.db.database import get_db
from app.api.deps.auth import get_current_user
from app.models.user import User
from app.models.meeting import Meeting, MeetingParticipant
from app.schemas.meeting import (
    MeetingCreate,
    MeetingResponse,
    MeetingParticipantResponse,
)

router = APIRouter()


@router.post("", response_model=MeetingResponse, status_code=status.HTTP_201_CREATED)
async def create_meeting(
    meeting_data: MeetingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new meeting"""
    # Create meeting
    meeting = Meeting(
        id=str(uuid.uuid4()),
        project_id=meeting_data.project_id,
        title=meeting_data.title,
        description=meeting_data.description,
        start_datetime=meeting_data.start_datetime,
        end_datetime=meeting_data.end_datetime,
        is_recurring=meeting_data.is_recurring,
        recurrence_rule=meeting_data.recurrence_rule,
        created_by=current_user.id,
    )
    db.add(meeting)
    db.flush()

    # Add participants
    for participant_id in meeting_data.participant_ids:
        participant = MeetingParticipant(
            id=str(uuid.uuid4()),
            meeting_id=meeting.id,
            user_id=participant_id,
            status="pending",
        )
        db.add(participant)

    db.commit()
    db.refresh(meeting)

    return meeting


@router.get("", response_model=List[MeetingResponse])
async def get_meetings(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    project_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get meetings"""
    # Get meetings where user is a participant or creator
    query = db.query(Meeting).join(MeetingParticipant).filter(
        (MeetingParticipant.user_id == current_user.id)
        | (Meeting.created_by == current_user.id)
    )

    if start_date:
        query = query.filter(Meeting.start_datetime >= start_date)
    if end_date:
        query = query.filter(Meeting.start_datetime <= end_date)
    if project_id:
        query = query.filter(Meeting.project_id == project_id)

    meetings = query.order_by(Meeting.start_datetime).distinct().all()
    return meetings


@router.get("/{meeting_id}", response_model=MeetingResponse)
async def get_meeting(
    meeting_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific meeting"""
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found"
        )

    # Check if user has access (participant or creator)
    is_participant = (
        db.query(MeetingParticipant)
        .filter(
            MeetingParticipant.meeting_id == meeting_id,
            MeetingParticipant.user_id == current_user.id,
        )
        .first()
        is not None
    )

    if not is_participant and meeting.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Access denied"
        )

    return meeting


@router.get("/{meeting_id}/participants", response_model=List[MeetingParticipantResponse])
async def get_meeting_participants(
    meeting_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get meeting participants"""
    participants = (
        db.query(MeetingParticipant)
        .filter(MeetingParticipant.meeting_id == meeting_id)
        .all()
    )
    return participants


@router.patch("/{meeting_id}/participants/{user_id}/status")
async def update_participant_status(
    meeting_id: str,
    user_id: str,
    status_value: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update participant status"""
    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Can only update your own status",
        )

    participant = (
        db.query(MeetingParticipant)
        .filter(
            MeetingParticipant.meeting_id == meeting_id,
            MeetingParticipant.user_id == user_id,
        )
        .first()
    )

    if not participant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Participant not found"
        )

    participant.status = status_value
    db.commit()

    return {"message": "Status updated successfully"}


@router.delete("/{meeting_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_meeting(
    meeting_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a meeting"""
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found"
        )

    if meeting.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only meeting creator can delete",
        )

    db.delete(meeting)
    db.commit()
