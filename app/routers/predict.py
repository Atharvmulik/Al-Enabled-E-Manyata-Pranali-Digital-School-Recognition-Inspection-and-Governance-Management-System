"""
Production-ready ML Infrastructure Prediction Router
"""

from fastapi import APIRouter, HTTPException
import joblib
import numpy as np

from app.models import get_school_profile

router = APIRouter(prefix="/predict", tags=["ML Prediction"])


# ─────────────────────────────────────────────
# Load Model
# ─────────────────────────────────────────────
try:
    model = joblib.load("app/infra_smart_model.pkl")
except Exception:
    model = None


# ─────────────────────────────────────────────
# Helper Functions
# ─────────────────────────────────────────────

def to_int(value, default=0):
    try:
        return int(value)
    except:
        return default


def yes_no_to_binary(value):
    if not value:
        return 0
    return 1 if "yes" in str(value).lower() else 0


# ─────────────────────────────────────────────
# Feature Engineering (🔥 MOST IMPORTANT)
# ─────────────────────────────────────────────

def build_features(school: dict):
    infra = school.get("infrastructure", {})
    safety = school.get("safety", {})

    # ─── Toilet Score ─────────────────────────
    boys_total = to_int(infra.get("toilet_boys_total"))
    boys_func = to_int(infra.get("toilet_boys_func"))

    girls_total = to_int(infra.get("toilet_girls_total"))
    girls_func = to_int(infra.get("toilet_girls_func"))

    toilet_score = (boys_func + girls_func) / (boys_total + girls_total + 1)

    # ─── Classroom Score ─────────────────────
    total_rooms = to_int(infra.get("total_instructional_rooms"))
    good_rooms = total_rooms - to_int(infra.get("classrooms_dilapidated"))

    classroom_score = good_rooms / (total_rooms + 1)

    # ─── Electricity ─────────────────────────
    electricity_score = yes_no_to_binary(infra.get("has_electricity"))

    # ─── Internet ────────────────────────────
    internet_score = yes_no_to_binary(infra.get("has_internet"))

    # ─── Lab Score ───────────────────────────
    lab_score = 1 if to_int(infra.get("lab_count")) > 0 else 0

    # ─── Library Score ───────────────────────
    library_score = yes_no_to_binary(infra.get("has_library"))

    # ─── Safety Score ────────────────────────
    safety_score = (
        yes_no_to_binary(safety.get("has_fire_extinguishers")) +
        yes_no_to_binary(safety.get("has_cctv")) +
        yes_no_to_binary(safety.get("has_safety_training"))
    ) / 3

    return np.array([[
        toilet_score,
        classroom_score,
        electricity_score,
        internet_score,
        lab_score,
        library_score,
        safety_score
    ]])


# ─────────────────────────────────────────────
# Prediction Endpoint
# ─────────────────────────────────────────────

@router.get("/from-db/{school_id}")
async def predict_from_db(school_id: str):

    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    school = get_school_profile(school_id)

    if not school:
        raise HTTPException(status_code=404, detail="School not found")

    try:
        features = build_features(school)

        prediction = int(model.predict(features)[0])
        probabilities = model.predict_proba(features)[0]

        confidence = float(max(probabilities) * 100)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

    # ─────────────────────────────
    # Response Mapping
    # ─────────────────────────────

    if prediction == 2:
        return {
            "infraScore": round(confidence),
            "qualityCategory": "Good",
            "aiStatus": "Excellent Infrastructure",
            "suggestion": "Maintain current standards",
            "severity": "Low"
        }

    elif prediction == 1:
        return {
            "infraScore": round(confidence),
            "qualityCategory": "Moderate",
            "aiStatus": "Adequate Facilities",
            "suggestion": "Improve labs, classrooms, or safety",
            "severity": "Medium"
        }

    else:
        return {
            "infraScore": round(confidence),
            "qualityCategory": "Poor",
            "aiStatus": "Severe Deficiencies",
            "suggestion": "Immediate infrastructure upgrade required",
            "severity": "High"
        }
    




@router.get("/schools")
async def get_all_schools():
    """
    Returns list of schools for dropdown
    """
    from app.models import get_db, COL_SCHOOLS

    db = get_db()

    try:
        docs = db.collection(COL_SCHOOLS).stream()

        schools = []

        for doc in docs:
            data = doc.to_dict()

            # Get school name safely
            basic = data.get("basic_details", {})
            name = basic.get("school_name", "Unnamed School")

            schools.append({
                "school_id": doc.id,
                "school_name": name
            })

        return {"schools": schools}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))




@router.get("/all")
async def predict_all_schools():
    """
    Returns prediction for ALL schools
    """
    from app.models import get_db, COL_SCHOOLS

    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    db = get_db()

    try:
        docs = db.collection(COL_SCHOOLS).stream()

        results = []

        for doc in docs:
            school = doc.to_dict()
            school_id = doc.id

            basic = school.get("basic_details", {})
            school_name = basic.get("school_name", "Unnamed School")

            try:
                features = build_features(school)

                prediction = int(model.predict(features)[0])
                probabilities = model.predict_proba(features)[0]
                confidence = float(max(probabilities) * 100)

                if prediction == 2:
                    result = {
                        "school": school_name,
                        "infraScore": round(confidence),
                        "qualityCategory": "Good",
                        "aiStatus": "Excellent Infrastructure",
                        "suggestion": "Maintain current standards",
                        "severity": "Low"
                    }

                elif prediction == 1:
                    result = {
                        "school": school_name,
                        "infraScore": round(confidence),
                        "qualityCategory": "Moderate",
                        "aiStatus": "Adequate Facilities",
                        "suggestion": "Improve infrastructure",
                        "severity": "Medium"
                    }

                else:
                    result = {
                        "school": school_name,
                        "infraScore": round(confidence),
                        "qualityCategory": "Poor",
                        "aiStatus": "Severe Deficiencies",
                        "suggestion": "Urgent improvements required",
                        "severity": "High"
                    }

                results.append(result)

            except:
                continue  # skip bad data

        return {"reports": results}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))