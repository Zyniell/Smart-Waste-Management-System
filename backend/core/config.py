import os
from pathlib import Path
from pydantic_settings import BaseSettings

# Look for .env in current folder and parent folder
BASE_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = BASE_DIR.parent
env_file = BASE_DIR / ".env" if (BASE_DIR / ".env").exists() else ROOT_DIR / ".env"

class Settings(BaseSettings):
    PROJECT_NAME: str = "Smart Waste Management System"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api"
    
    DATABASE_URL: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/smart_waste_db"
    
    SECRET_KEY: str = "smartwaste_super_secret_jwt_key_2026_secure"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    
    KAGGLE_USERNAME: str = ""
    KAGGLE_KEY: str = ""
    
    BASE_DIR: Path = BASE_DIR
    UPLOAD_DIR: str = str(BASE_DIR / "uploads")
    
    class Config:
        env_file = str(env_file)
        extra = "allow"

settings = Settings()
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_DIR, "reports"), exist_ok=True)

