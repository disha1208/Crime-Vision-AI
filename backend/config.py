import os
from pathlib import Path
from dotenv import load_dotenv

# Base directory for the backend
BASE_DIR = Path(__file__).resolve().parent

# Load .env file
load_dotenv(BASE_DIR / '.env')

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'crimevision-secure-forensic-key-2026')
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL', f"sqlite:///{BASE_DIR / 'crimevision.db'}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Upload and static file locations
    UPLOAD_FOLDER = BASE_DIR / 'uploads'
    FRAMES_FOLDER = BASE_DIR / 'uploads' / 'frames'
    REPORTS_FOLDER = BASE_DIR / 'reports'
    
    # Max file upload size: 100 MB
    MAX_CONTENT_LENGTH = 100 * 1024 * 1024
    
    # Allowed evidence extensions
    ALLOWED_IMAGE_EXTS = {'jpg', 'jpeg', 'png'}
    ALLOWED_VIDEO_EXTS = {'mp4', 'avi', 'mov', 'mkv'}
    ALLOWED_AUDIO_EXTS = {'wav', 'mp3', 'ogg', 'm4a'}
    ALLOWED_EXTENSIONS = ALLOWED_IMAGE_EXTS | ALLOWED_VIDEO_EXTS | ALLOWED_AUDIO_EXTS
    
    # Groq API configuration
    GROQ_API_KEY = os.environ.get('GROQ_API_KEY', '')
    GROQ_MODEL = os.environ.get('GROQ_MODEL', 'llama-3.3-70b-versatile')
