import os
import firebase_admin
from firebase_admin import credentials, firestore, storage

if not firebase_admin._apps:
    # serviceAccountKey.json is in the app/ folder
    cred = credentials.Certificate("app/serviceAccountKey.json")
    firebase_admin.initialize_app(cred, {
        "storageBucket": "ai-enabled-school-system.appspot.com"
    })