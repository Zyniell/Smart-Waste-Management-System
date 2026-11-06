import io
from fastapi import APIRouter, File, UploadFile, HTTPException, status
from PIL import Image

from backend.schemas.predict import PredictionResponse
from backend.ml.predict_service import predict_waste

router = APIRouter(prefix="/predict", tags=["AI Image Detection"])

ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"]

@router.post("", response_model=PredictionResponse)
async def predict_waste_image(
    image: UploadFile = File(...)
):
    if image.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Format file tidak didukung. Harap unggah file gambar (JPEG, PNG, WEBP)."
        )
        
    try:
        contents = await image.read()
        pil_image = Image.open(io.BytesIO(contents))
        
        category, confidence, probs = predict_waste(pil_image)
        
        # Recommendations message
        tips = {
            "Organic Waste": "Sampah Organik: Cocok untuk dijadikan kompos atau pakan ternak/biogas.",
            "Paper Waste": "Sampah Kertas: Pastikan dalam kondisi kering sebelum disetorkan ke bank sampah untuk didaur ulang.",
            "Plastic Waste": "Sampah Plastik: Bersihkan dari sisa cairan/makanan dan pilah sesuai kode daur ulang plastik."
        }
        
        return PredictionResponse(
            category=category,
            confidence=confidence,
            probabilities=probs,
            message=tips.get(category, "Sampah terdeteksi.")
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal memproses gambar untuk prediksi AI: {str(e)}"
        )

