from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import uuid

from app.db.database import get_db
from app.api.deps.auth import get_current_user, get_current_admin_user
from app.models.user import User
from app.models.shift import ShiftRequest
from app.models.project import Project
from app.models.optimization import OptimizationSuggestion, OptimizationAssignment
from app.services.llm_service import LLMService
from pydantic import BaseModel


class OptimizeRequest(BaseModel):
    """Optimization request"""

    month: str  # YYYY-MM format


class OptimizationResponse(BaseModel):
    """Optimization response"""

    id: str
    month: str
    status: str
    summary: dict
    created_at: datetime

    class Config:
        from_attributes = True


router = APIRouter()


@router.post("/shifts", response_model=OptimizationResponse)
async def optimize_shifts(
    request: OptimizeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Generate shift optimization using LLM (admin only)"""

    # Get shift requests for the month
    shift_requests = (
        db.query(ShiftRequest)
        .filter(ShiftRequest.status == "submitted")
        .filter(ShiftRequest.date.like(f"{request.month}%"))
        .all()
    )

    if not shift_requests:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No submitted shift requests found for {request.month}",
        )

    # Get active projects
    projects = db.query(Project).filter(Project.is_active == True).all()

    if not projects:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active projects found",
        )

    # Prepare data for LLM
    shift_data = [
        {
            "user_id": sr.user_id,
            "date": sr.date.isoformat(),
            "start_time": sr.start_time.isoformat(),
            "end_time": sr.end_time.isoformat(),
            "comment": sr.comment,
        }
        for sr in shift_requests
    ]

    project_data = [
        {
            "id": p.id,
            "name": p.name,
            "required_members": p.required_members,
        }
        for p in projects
    ]

    # Call LLM service
    try:
        result = await LLMService.optimize_shifts(
            shift_requests=shift_data,
            projects=project_data,
            month=request.month,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate optimization: {str(e)}",
        )

    # Save optimization suggestion
    suggestion = OptimizationSuggestion(
        id=str(uuid.uuid4()),
        month=request.month,
        status="pending",
        summary=result.get("summary", {}),
        created_by=current_user.id,
    )
    db.add(suggestion)
    db.flush()

    # Save assignments
    for assignment in result.get("assignments", []):
        opt_assignment = OptimizationAssignment(
            id=str(uuid.uuid4()),
            suggestion_id=suggestion.id,
            user_id=assignment["user_id"],
            project_id=assignment["project_id"],
            date=datetime.fromisoformat(assignment["date"]).date(),
            start_time=datetime.fromisoformat(f"2000-01-01T{assignment['start_time']}").time(),
            end_time=datetime.fromisoformat(f"2000-01-01T{assignment['end_time']}").time(),
        )
        db.add(opt_assignment)

    db.commit()
    db.refresh(suggestion)

    return OptimizationResponse.model_validate(suggestion)


@router.get("/suggestions", response_model=List[OptimizationResponse])
async def get_optimization_suggestions(
    month: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get optimization suggestions"""
    query = db.query(OptimizationSuggestion)

    if month:
        query = query.filter(OptimizationSuggestion.month == month)

    suggestions = query.order_by(OptimizationSuggestion.created_at.desc()).all()
    return [OptimizationResponse.model_validate(s) for s in suggestions]


@router.post("/suggestions/{suggestion_id}/approve")
async def approve_optimization(
    suggestion_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
):
    """Approve optimization suggestion and create confirmed shifts"""
    from app.models.shift import ConfirmedShift

    suggestion = (
        db.query(OptimizationSuggestion)
        .filter(OptimizationSuggestion.id == suggestion_id)
        .first()
    )

    if not suggestion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Optimization suggestion not found",
        )

    if suggestion.status == "approved":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Optimization already approved",
        )

    # Create confirmed shifts from assignments
    assignments = (
        db.query(OptimizationAssignment)
        .filter(OptimizationAssignment.suggestion_id == suggestion_id)
        .all()
    )

    for assignment in assignments:
        confirmed_shift = ConfirmedShift(
            id=str(uuid.uuid4()),
            user_id=assignment.user_id,
            project_id=assignment.project_id,
            date=assignment.date,
            start_time=assignment.start_time,
            end_time=assignment.end_time,
            created_by=current_user.id,
        )
        db.add(confirmed_shift)

    # Update suggestion status
    suggestion.status = "approved"
    suggestion.approved_by = current_user.id
    suggestion.approved_at = datetime.utcnow()

    db.commit()

    return {"message": "Optimization approved successfully"}
