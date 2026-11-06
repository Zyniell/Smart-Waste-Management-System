from typing import Dict, List, Any
from pydantic import BaseModel

class StatusCount(BaseModel):
    pending: int = 0
    in_progress: int = 0
    completed: int = 0
    rejected: int = 0

class CategoryCount(BaseModel):
    organic: int = 0
    plastic: int = 0
    paper: int = 0

class MonthlyStat(BaseModel):
    month: str
    total: int

class DashboardStatsResponse(BaseModel):
    total_reports: int
    total_users: int
    status_counts: StatusCount
    category_counts: CategoryCount
    monthly_trend: List[MonthlyStat]
    recent_reports: List[Any]

