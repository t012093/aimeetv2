from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime
import uuid

from app.db.database import get_db
from app.api.deps.auth import get_current_user, get_current_admin_user
from app.models.user import User
from app.models.shift import ShiftRequest, ConfirmedShift
from app.schemas.shift import (
    ShiftRequestCreate,
    ShiftRequestUpdate,
    ShiftRequestResponse,
    ConfirmedShiftCreate,
    ConfirmedShiftResponse,
)

router = APIRouter()


# Shift Requests
@router.post("/requests", response_model=ShiftRequestResponse, status_code=status.HTTP_201_CREATED)
async def create_shift_request(
    shift_data: ShiftRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new shift request"""
    shift = ShiftRequest(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        date=shift_data.date,
        start_time=shift_data.start_time,
        end_time=shift_data.end_time,
        comment=shift_data.comment,
        status="draft",
    )
    db.add(shift)
    db.commit()
    db.refresh(shift)
    return shift


@router.get("/requests", response_model=List[ShiftRequestResponse])
async def get_shift_requests(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get shift requests for current user"""
    query = db.query(ShiftRequest).filter(ShiftRequest.user_id == current_user.id)

    if start_date:
        query = query.filter(ShiftRequest.date >= start_date)
    if end_date:
        query = query.filter(ShiftRequest.date <= end_date)
    if status_filter:
        query = query.filter(ShiftRequest.status == status_filter)

    shifts = query.order_by(ShiftRequest.date, ShiftRequest.start_time).all()
    return shifts


@router.get("/requests/{shift_id}", response_model=ShiftRequestResponse)
async def get_shift_request(
    shift_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific shift request"""
    shift = db.query(ShiftRequest).filter(ShiftRequest.id == shift_id).first()
    if not shift:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shift request not found")

    if shift.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return shift


@router.patch("/requests/{shift_id}", response_model=ShiftRequestResponse)
async def update_shift_request(
    shift_id: str,
    shift_data: ShiftRequestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a shift request"""
    shift = db.query(ShiftRequest).filter(ShiftRequest.id == shift_id).first()
    if not shift:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shift request not found")

    if shift.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    # Update fields
    for field, value in shift_data.model_dump(exclude_unset=True).items():
        setattr(shift, field, value)

    db.commit()
    db.refresh(shift)
    return shift


@router.post("/requests/{shift_id}/submit", response_model=ShiftRequestResponse)
async def submit_shift_request(
    shift_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Submit a shift request"""
    shift = db.query(ShiftRequest).filter(ShiftRequest.id == shift_id).first()
    if not shift:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shift request not found")

    if shift.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    shift.status = "submitted"
    shift.submitted_at = datetime.utcnow()

    db.commit()
    db.refresh(shift)
    return shift


@router.delete("/requests/{shift_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_shift_request(
    shift_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a shift request"""
    shift = db.query(ShiftRequest).filter(ShiftRequest.id == shift_id).first()
    if not shift:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shift request not found")

    if shift.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    db.delete(shift)
    db.commit()


# Confirmed Shifts
@router.post("/confirmed", response_model=ConfirmedShiftResponse, status_code=status.HTTP_201_CREATED)
async def create_confirmed_shift(
    shift_data: ConfirmedShiftCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Create a confirmed shift (admin only)"""
    shift = ConfirmedShift(
        id=str(uuid.uuid4()),
        user_id=shift_data.user_id,
        project_id=shift_data.project_id,
        date=shift_data.date,
        start_time=shift_data.start_time,
        end_time=shift_data.end_time,
        comment=shift_data.comment,
        created_by=current_user.id,
    )
    db.add(shift)
    db.commit()
    db.refresh(shift)
    return shift


@router.get("/confirmed", response_model=List[ConfirmedShiftResponse])
async def get_confirmed_shifts(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    user_id: Optional[str] = Query(None),
    project_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get confirmed shifts"""
    query = db.query(ConfirmedShift)

    # Filter by user if specified, otherwise show all shifts for current user
    if current_user.role == "admin":
        if user_id:
            query = query.filter(ConfirmedShift.user_id == user_id)
    else:
        query = query.filter(ConfirmedShift.user_id == current_user.id)

    if start_date:
        query = query.filter(ConfirmedShift.date >= start_date)
    if end_date:
        query = query.filter(ConfirmedShift.date <= end_date)
    if project_id:
        query = query.filter(ConfirmedShift.project_id == project_id)

    shifts = query.order_by(ConfirmedShift.date, ConfirmedShift.start_time).all()
    return shifts


@router.delete("/confirmed/{shift_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_confirmed_shift(
    shift_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Delete a confirmed shift (admin only)"""
    shift = db.query(ConfirmedShift).filter(ConfirmedShift.id == shift_id).first()
    if not shift:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Confirmed shift not found")

    db.delete(shift)
    db.commit()
