import os
from datetime import datetime, timezone, timedelta
from PIL import Image, ImageDraw, ImageFont

from backend.core.database import SessionLocal, Base, engine
from backend.core.security import get_password_hash
from backend.core.config import settings
from backend.models.user import User, UserRole
from backend.models.report import Report, WasteCategory, ReportStatus

def create_sample_image(filename: str, label: str, bg_color: tuple):
    path = os.path.join(settings.UPLOAD_DIR, "reports", filename)
    if os.path.exists(path):
        return
    img = Image.new("RGB", (640, 480), color=bg_color)
    draw = ImageDraw.Draw(img)
    # Simple rectangle and text
    draw.rectangle([20, 20, 620, 460], outline=(255, 255, 255), width=4)
    draw.text((60, 220), label, fill=(255, 255, 255))
    img.save(path)

def seed_database():
    print("[Seed] Creating database tables if not exist...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Create sample images
        os.makedirs(os.path.join(settings.UPLOAD_DIR, "reports"), exist_ok=True)
        create_sample_image("sample_plastic_1.jpg", "Plastic Bottles Pile - Taman Kota", (37, 99, 235))
        create_sample_image("sample_organic_1.jpg", "Organic Kitchen Waste - Pasar Induk", (22, 163, 74))
        create_sample_image("sample_paper_1.jpg", "Cardboard & Paper Waste - Pertokoan", (202, 138, 4))
        create_sample_image("sample_plastic_2.jpg", "Plastic Bags - Bantaran Sungai", (79, 70, 229))

        # Check existing admin
        admin = db.query(User).filter(User.email == "admin@smartwaste.local").first()
        if not admin:
            print("[Seed] Creating Admin account: admin@smartwaste.local ...")
            admin = User(
                email="admin@smartwaste.local",
                name="System Administrator",
                hashed_password=get_password_hash("admin123"),
                role=UserRole.ADMIN,
                is_active=True
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
        else:
            print("[Seed] Admin account already exists.")

        # Check existing user
        user1 = db.query(User).filter(User.email == "budi@smartwaste.local").first()
        if not user1:
            print("[Seed] Creating Citizen user: budi@smartwaste.local ...")
            user1 = User(
                email="budi@smartwaste.local",
                name="Budi Santoso",
                hashed_password=get_password_hash("user123"),
                role=UserRole.USER,
                is_active=True
            )
            db.add(user1)
            db.commit()
            db.refresh(user1)

        user2 = db.query(User).filter(User.email == "siti@smartwaste.local").first()
        if not user2:
            print("[Seed] Creating Citizen user: siti@smartwaste.local ...")
            user2 = User(
                email="siti@smartwaste.local",
                name="Siti Rahma",
                hashed_password=get_password_hash("user123"),
                role=UserRole.USER,
                is_active=True
            )
            db.add(user2)
            db.commit()
            db.refresh(user2)

        # Seed sample reports if table is empty
        report_count = db.query(Report).count()
        if report_count == 0:
            print("[Seed] Seeding sample reports...")
            now = datetime.now(timezone.utc)
            sample_reports = [
                Report(
                    user_id=user1.id,
                    title="Tumpukan Botol Plastik di Pinggir Taman Kota",
                    description="Banyak botol plastik minuman berserakan di sekitar bangku taman dekat air mancur.",
                    category=WasteCategory.PLASTIC,
                    status=ReportStatus.PENDING,
                    image_url="/uploads/reports/sample_plastic_1.jpg",
                    latitude=-6.2088,
                    longitude=106.8456,
                    address="Jl. Menteng Raya No. 12, Jakarta Pusat",
                    ai_prediction="Plastic Waste",
                    ai_confidence=0.96,
                    created_at=now - timedelta(days=2)
                ),
                Report(
                    user_id=user1.id,
                    title="Sampah Sisa Sayuran & Organik Pasar",
                    description="Sisa sayuran dan buah menumpuk di tempat pembuangan sementara tanpa penutup.",
                    category=WasteCategory.ORGANIC,
                    status=ReportStatus.IN_PROGRESS,
                    image_url="/uploads/reports/sample_organic_1.jpg",
                    latitude=-6.2201,
                    longitude=106.8522,
                    address="Pasar Tradisional Tebet Barat, Jakarta Selatan",
                    ai_prediction="Organic Waste",
                    ai_confidence=0.91,
                    admin_notes="Petugas kebersihan telah dijadwalkan mengangkut pukul 14:00.",
                    created_at=now - timedelta(days=5)
                ),
                Report(
                    user_id=user2.id,
                    title="Kardus & Kertas Bekas Paket Belanja",
                    description="Kardus paket pengiriman menumpuk basah di selokan samping ruko.",
                    category=WasteCategory.PAPER,
                    status=ReportStatus.COMPLETED,
                    image_url="/uploads/reports/sample_paper_1.jpg",
                    latitude=-6.1754,
                    longitude=106.8272,
                    address="Komplek Pertokoan Gambir, Jakarta Pusat",
                    ai_prediction="Paper Waste",
                    ai_confidence=0.89,
                    admin_notes="Telah diangkut oleh tim bank sampah mitra dinas kebersihan.",
                    created_at=now - timedelta(days=8)
                ),
                Report(
                    user_id=user2.id,
                    title="Sampah Plastik Kresek di Tepi Saluran Air",
                    description="Kantong plastik kresek menghambat aliran saluran pembuangan air.",
                    category=WasteCategory.PLASTIC,
                    status=ReportStatus.REJECTED,
                    image_url="/uploads/reports/sample_plastic_2.jpg",
                    latitude=-6.2382,
                    longitude=106.8015,
                    address="Jl. Senopati No. 45, Kebayoran Baru, Jakarta Selatan",
                    ai_prediction="Plastic Waste",
                    ai_confidence=0.94,
                    admin_notes="Foto tidak jelas menunjukkan titik koordinat yang dapat diakses armada.",
                    created_at=now - timedelta(days=10)
                ),
            ]
            db.add_all(sample_reports)
            db.commit()
            print(f"[Seed] Successfully seeded {len(sample_reports)} sample reports!")
        else:
            print(f"[Seed] Reports already exist ({report_count} reports).")
            
        print("[Seed] Database seeding completed successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()

