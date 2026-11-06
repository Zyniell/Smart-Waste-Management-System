import os
import uuid
import shutil
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form
from sqlalchemy.orm import Session, joinedload

from backend.core.config import settings
from backend.core.database import get_db
from backend.models.user import User, UserRole
from backend.models.report import Report, WasteCategory, ReportStatus
from backend.schemas.report import ReportResponse, ReportStatusUpdate, ReportUpdate
from backend.routers.deps import get_current_user, require_admin

router = APIRouter(prefix="/reports", tags=["Reports Management"])

ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"]

@router.post("", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
async def create_report(
    title: str = Form(...),
    description: str = Form(...),
    category: WasteCategory = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    address: Optional[str] = Form(None),
    ai_prediction: Optional[str] = Form(None),
    ai_confidence: Optional[float] = Form(None),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if image.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tipe file gambar tidak didukung. Harap unggah JPEG, PNG, atau WEBP."
        )
    
    file_ext = os.path.splitext(image.filename)[1] or ".jpg"
    filename = f"{uuid.uuid4().hex}{file_ext}"
    dest_path = os.path.join(settings.UPLOAD_DIR, "reports", filename)
    
    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)
        
    relative_image_url = f"/uploads/reports/{filename}"
    
    new_report = Report(
        user_id=current_user.id,
        title=title,
        description=description,
        category=category,
        status=ReportStatus.PENDING,
        image_url=relative_image_url,
        latitude=latitude,
        longitude=longitude,
        address=address,
        ai_prediction=ai_prediction,
        ai_confidence=ai_confidence
    )
    
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    
    # Reload with user relationship
    report = db.query(Report).options(joinedload(Report.user)).filter(Report.id == new_report.id).first()
    return report

@router.get("", response_model=List[ReportResponse])
def get_reports(
    status: Optional[ReportStatus] = Query(None, description="Filter status laporan"),
    category: Optional[WasteCategory] = Query(None, description="Filter kategori sampah"),
    search: Optional[str] = Query(None, description="Pencarian judul, deskripsi, atau alamat"),
    my_only: bool = Query(False, description="Tampilkan hanya laporan saya"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Report).options(joinedload(Report.user))
    
    if my_only or current_user.role != UserRole.ADMIN:
        if my_only:
            query = query.filter(Report.user_id == current_user.id)
            
    if status:
        query = query.filter(Report.status == status)
    if category:
        query = query.filter(Report.category == category)
    if search:
        s = f"%{search}%"
        query = query.filter(
            (Report.title.ilike(s)) |
            (Report.description.ilike(s)) |
            (Report.address.ilike(s))
        )
        
    return query.order_by(Report.created_at.desc()).all()

@router.get("/{report_id}", response_model=ReportResponse)
def get_report_by_id(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    report = db.query(Report).options(joinedload(Report.user)).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Laporan tidak ditemukan")
    return report

@router.patch("/{report_id}/status", response_model=ReportResponse)
def update_report_status(
    report_id: int,
    status_update: ReportStatusUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    report = db.query(Report).options(joinedload(Report.user)).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Laporan tidak ditemukan")
    
    report.status = status_update.status
    if status_update.admin_notes is not None:
        report.admin_notes = status_update.admin_notes
        
    db.commit()
    db.refresh(report)
    return report

@router.put("/{report_id}", response_model=ReportResponse)
def update_report(
    report_id: int,
    report_update: ReportUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    report = db.query(Report).options(joinedload(Report.user)).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Laporan tidak ditemukan")
    
    # Only admin or the author can update general details
    if current_user.role != UserRole.ADMIN and report.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Akses ditolak")
        
    for field, value in report_update.model_dump(exclude_unset=True).items():
        setattr(report, field, value)
        
    db.commit()
    db.refresh(report)
    return report

@router.delete("/{report_id}", status_code=status.HTTP_200_OK)
def delete_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Laporan tidak ditemukan")
        
    if current_user.role != UserRole.ADMIN and report.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Akses ditolak")
        
    # Remove image file if it exists
    if report.image_url:
        clean_rel = report.image_url.lstrip("/")
        if clean_rel.startswith("uploads/"):
            clean_rel = clean_rel[len("uploads/"):]
        filepath = os.path.join(settings.UPLOAD_DIR, clean_rel)
        if os.path.exists(filepath):
            try:
                os.remove(filepath)
            except OSError:
                pass
                
    db.delete(report)
    db.commit()
    return {"message": "Laporan berhasil dihapus"}

