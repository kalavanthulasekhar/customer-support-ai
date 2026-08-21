from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.complaint_service import ComplaintService


router = APIRouter(
    prefix="/complaint",
    tags=["Complaint"]
)

service = ComplaintService()


class UpdateComplaintStatus(BaseModel):
    status: str


class UpdateComplaintPriority(BaseModel):
    priority: str


class UpdateComplaintCategory(BaseModel):
    category: str


class UpdateAdminNote(BaseModel):
    admin_note: str


class UpdateComplaintAssignment(BaseModel):
    assigned_to: str


# ==========================================
# GET ALL COMPLAINTS
# ==========================================

@router.get("/list")
async def list_complaints():
    return service.get_all_complaints()


# ==========================================
# GET COMPLAINT ACTIVITY HISTORY
# IMPORTANT: Keep this before /{ticket_id}
# ==========================================

@router.get("/{ticket_id}/activity")
async def get_complaint_activity(ticket_id: str):

    complaint = service.get_complaint(ticket_id)

    if not complaint:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found"
        )

    return service.get_activity_history(ticket_id)


# ==========================================
# GET SINGLE COMPLAINT
# ==========================================

@router.get("/{ticket_id}")
async def get_complaint(ticket_id: str):

    complaint = service.get_complaint(ticket_id)

    if not complaint:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found"
        )

    return complaint


# ==========================================
# UPDATE STATUS
# ==========================================

@router.put("/{ticket_id}/status")
async def update_complaint_status(
    ticket_id: str,
    request: UpdateComplaintStatus
):

    updated = service.update_status(
        ticket_id,
        request.status
    )

    if not updated:
        raise HTTPException(
            status_code=400,
            detail="Invalid status or complaint not found"
        )

    return updated


# ==========================================
# UPDATE PRIORITY
# ==========================================

@router.put("/{ticket_id}/priority")
async def update_complaint_priority(
    ticket_id: str,
    request: UpdateComplaintPriority
):

    updated = service.update_priority(
        ticket_id,
        request.priority
    )

    if not updated:
        raise HTTPException(
            status_code=400,
            detail="Invalid priority or complaint not found"
        )

    return updated


# ==========================================
# UPDATE CATEGORY
# ==========================================

@router.put("/{ticket_id}/category")
async def update_complaint_category(
    ticket_id: str,
    request: UpdateComplaintCategory
):

    updated = service.update_category(
        ticket_id,
        request.category
    )

    if not updated:
        raise HTTPException(
            status_code=400,
            detail="Invalid category or complaint not found"
        )

    return updated


# ==========================================
# UPDATE ADMIN NOTE
# ==========================================

@router.put("/{ticket_id}/note")
async def update_admin_note(
    ticket_id: str,
    request: UpdateAdminNote
):

    updated = service.update_admin_note(
        ticket_id,
        request.admin_note
    )

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found"
        )

    return updated


# ==========================================
# ASSIGN COMPLAINT
# ==========================================

@router.put("/{ticket_id}/assign")
async def assign_complaint(
    ticket_id: str,
    request: UpdateComplaintAssignment
):

    updated = service.update_assigned_to(
        ticket_id,
        request.assigned_to
    )

    if not updated:
        raise HTTPException(
            status_code=400,
            detail="Complaint not found or assignment update failed"
        )

    return updated