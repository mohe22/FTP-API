from dotenv import load_dotenv
import os

load_dotenv()
class Config:
    SHARED_FOLDER = os.getenv("SHARED_FOLDER")

    FRONTEND_URL = os.getenv("FRONTEND_URL")




    SECRET_KEY = os.getenv("SECRET_KEY")

    # SMTP settings for email
    SMTP_SERVER = os.getenv("SMTP_SERVER")
    SMTP_PORT = int(os.getenv("SMTP_PORT", 587))  # Default to 587
    SMTP_USERNAME = os.getenv("SMTP_USERNAME")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")