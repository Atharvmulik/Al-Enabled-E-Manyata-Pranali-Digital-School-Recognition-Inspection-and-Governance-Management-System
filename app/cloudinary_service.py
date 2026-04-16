import cloudinary
import cloudinary.uploader
import os
from dotenv import load_dotenv
from pathlib import Path

# 🔥 Always find .env relative to THIS file's location
BASE_DIR = Path(__file__).resolve().parent.parent  # goes up from app/ to project root
load_dotenv(dotenv_path=BASE_DIR / ".env")

cloudinary.config(
    cloud_name="dhq8o5ksj",          # your actual value from Image 3
    api_key="594592381479287",        # your actual value from Image 3  
    api_secret="KIOuk74F6SicXAm1Ugs85wsbvHk",  # your actual value from Image 3
)

print("CLOUDINARY CONFIG DEBUG:")
print("cloud_name:", os.getenv("CLOUDINARY_CLOUD_NAME"))
print("api_key:", os.getenv("CLOUDINARY_API_KEY"))
print("api_secret:", os.getenv("CLOUDINARY_API_SECRET"))

def upload_file(file, folder):
    try:
        file.file.seek(0)

        result = cloudinary.uploader.upload(
            file.file,
            folder=folder,
            resource_type="auto"   # 🔥 CHANGE THIS ALSO
        )

        print("🔥 CLOUDINARY RESULT:", result)

        return result   # ✅ RETURN FULL RESPONSE

    except Exception as e:
        raise Exception(f"Cloudinary upload failed: {str(e)}")
    

















