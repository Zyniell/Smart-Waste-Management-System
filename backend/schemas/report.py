from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from backend.models.report import WasteCategory, ReportStatus
from backend.schemas.user import UserResponse

class ReportBase(BaseModel):
    title: str
    description: str
    category: WasteCategory
    latitude: float
    longitude: float
    address: Optional[str] = None

class ReportCreate(ReportBase):
    ai_prediction: Optional[str] = None
    ai_confidence: Optional[float] = None

class ReportStatusUpdate(BaseModel):
    status: ReportStatus
    admin_notes: Optional[str] = None

class ReportUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[WasteCategory] = None
    status: Optional[ReportStatus] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    admin_notes: Optional[str] = None

class ReportResponse(ReportBase):
    id: int
    user_id: int
    status: ReportStatus
    image_url: str
    ai_prediction: Optional[str] = None
    ai_confidence: Optional[float] = None
    admin_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    user: Optional[UserResponse] = None

    model_config = ConfigDict(from_attributes=True)

