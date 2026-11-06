from typing import Dict
from pydantic import BaseModel

class PredictionResponse(BaseModel):
    category: str
    confidence: float
    probabilities: Dict[str, float]
    message: str

