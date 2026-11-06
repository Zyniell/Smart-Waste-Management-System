from collections import defaultdict
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from backend.core.database import get_db
from backend.models.user import User
from backend.models.report import Report, WasteCategory, ReportStatus
from backend.schemas.stats import DashboardStatsResponse, StatusCount, CategoryCount, MonthlyStat
from backend.routers.deps import get_current_user

router = APIRouter(prefix="/stats", tags=["Dashboard Statistics"])

@router.get("/dashboard", response_model=DashboardStatsResponse)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total_reports = db.query(func.count(Report.id)).scalar() or 0
    total_users = db.query(func.count(User.id)).scalar() or 0
    
    # Status breakdown
    status_rows = db.query(Report.status, func.count(Report.id)).group_by(Report.status).all()
    status_dict = {s: count for s, count in status_rows}
    status_counts = StatusCount(
        pending=status_dict.get(ReportStatus.PENDING, 0),
        in_progress=status_dict.get(ReportStatus.IN_PROGRESS, 0),
        completed=status_dict.get(ReportStatus.COMPLETED, 0),
        rejected=status_dict.get(ReportStatus.REJECTED, 0)
    )
    
    # Category breakdown
    cat_rows = db.query(Report.category, func.count(Report.id)).group_by(Report.category).all()
    cat_dict = {c: count for c, count in cat_rows}
    category_counts = CategoryCount(
        organic=cat_dict.get(WasteCategory.ORGANIC, 0),
        plastic=cat_dict.get(WasteCategory.PLASTIC, 0),
        paper=cat_dict.get(WasteCategory.PAPER, 0)
    )
    
    # Monthly trend: last 6 months
    reports = db.query(Report.created_at).order_by(Report.created_at.asc()).all()
    month_counts = defaultdict(int)
    for r in reports:
        month_label = r.created_at.strftime("%b %Y")
        month_counts[month_label] += 1
        
    monthly_trend = [
        MonthlyStat(month=m, total=c) for m, c in month_counts.items()
    ]
    if not monthly_trend:
        current_m = datetime.now(timezone.utc).strftime("%b %Y")
        monthly_trend = [MonthlyStat(month=current_m, total=0)]
        
    # Recent reports
    recent_reports = (
        db.query(Report)
        .options(joinedload(Report.user))
        .order_by(Report.created_at.desc())
        .limit(6)
        .all()
    )
    
    recent_data = []
    for r in recent_reports:
        recent_data.append({
            "id": r.id,
            "title": r.title,
            "category": r.category.value,
            "status": r.status.value,
            "image_url": r.image_url,
            "latitude": r.latitude,
            "longitude": r.longitude,
            "address": r.address,
            "ai_prediction": r.ai_prediction,
            "ai_confidence": r.ai_confidence,
            "created_at": r.created_at.isoformat(),
            "user_name": r.user.name if r.user else "Anonymous"
        })
        
    return DashboardStatsResponse(
        total_reports=total_reports,
        total_users=total_users,
        status_counts=status_counts,
        category_counts=category_counts,
        monthly_trend=monthly_trend,
        recent_reports=recent_data
    )

