import os
import firebase_admin
from firebase_admin import credentials, firestore, storage

if not firebase_admin._apps:
    # serviceAccountKey.json is in the app/ folder
    key_path = os.path.join(os.path.dirname(__file__), "serviceAccountKey.json")
    cred = credentials.Certificate(key_path)
    firebase_admin.initialize_app(cred, {
        "storageBucket": "ai-enabled-school-system.appspot.com"
    })