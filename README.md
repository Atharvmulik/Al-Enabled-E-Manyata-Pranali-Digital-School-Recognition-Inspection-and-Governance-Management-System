<div align="center">

<img src="https://img.shields.io/badge/Status-Active-10B981?style=for-the-badge" />
<img src="https://img.shields.io/badge/License-MIT-1A56DB?style=for-the-badge" />
<img src="https://img.shields.io/badge/Platform-Web%20%7C%20Mobile-6C63FF?style=for-the-badge" />
<img src="https://img.shields.io/badge/AI--Enabled-ML%20Powered-F59E0B?style=for-the-badge" />

<br /><br />

# 🏫 AI-Enabled E-Manyata-Pranali

### Digital School Recognition, Inspection & Governance Management System

*A full-stack, AI-powered platform to digitize school recognition (Manyata), streamline physical inspections, and modernize state-level education governance.*

<br />

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?logo=nextdotjs&style=flat-square)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?logo=fastapi&style=flat-square)](https://fastapi.tiangolo.com/)
[![Expo](https://img.shields.io/badge/Expo-React%20Native-000020?logo=expo&style=flat-square)](https://expo.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?logo=firebase&style=flat-square)](https://firebase.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&style=flat-square)](https://www.typescriptlang.org/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-ML%20Model-F7931E?logo=scikitlearn&style=flat-square)](https://scikit-learn.org/)

</div>

---

## 📖 Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Repository Structure](#repository-structure)
4. [Tech Stack](#tech-stack)
5. [Features](#features)
6. [Branch Guide](#branch-guide)
7. [Getting Started](#getting-started)
   - [Backend Setup](#backend-setup)
   - [Web Frontend Setup](#web-frontend-setup)
   - [Inspection App Setup](#inspection-app-setup)
8. [AI Infrastructure Model](#ai-infrastructure-model)
9. [Database Schema](#database-schema)
10. [API Reference](#api-reference)
11. [Key Screens & Workflows](#key-screens--workflows)
12. [Data Flow](#data-flow)
13. [Environment Variables](#environment-variables)
14. [Contributors](#contributors)

---

## 🌟 Project Overview

**E-Manyata-Pranali** is a state-of-the-art, government-grade platform that fully digitizes the school recognition and inspection ecosystem in India. It replaces paper-based bureaucracy with a seamless, transparent, and AI-powered digital pipeline.

The system serves three distinct user groups through dedicated, purpose-built interfaces:

| Portal | User | Key Function |
|--------|------|--------------|
| 🏫 **School Portal** (Web) | School Administrators | Submit 9-step recognition applications, manage profiles, upload documents, download certificates |
| 🛡️ **Admin Portal** (Web) | State Government Officers | Review applications, run AI monitoring, assign inspectors, publish recognition orders |
| 📱 **Inspector App** (Mobile) | Field Inspection Officers | Conduct on-site audits, capture geotagged evidence, submit inspection reports |

> **What makes it unique:** An embedded Machine Learning model (`infra_smart_model.pkl`) auto-evaluates every school's infrastructure — classrooms, toilets, safety systems, utilities — and categorizes them as **Good / Moderate / Poor**, giving administrators objective, tamper-proof compliance scores before any human review.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        E-MANYATA-PRANALI SYSTEM                         │
└─────────────────────────────────────────────────────────────────────────┘

  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────────┐
  │  SCHOOL PORTAL   │    │  ADMIN PORTAL    │    │  INSPECTOR APP       │
  │  (Next.js Web)   │    │  (Next.js Web)   │    │  (Expo React Native) │
  │                  │    │                  │    │                      │
  │  • 9-step Form   │    │  • Dashboard     │    │  • GPS Recording     │
  │  • Doc Upload    │    │  • AI Monitoring │    │  • Evidence Upload   │
  │  • Certificates  │    │  • Assign Insp.  │    │  • Final Reports     │
  └────────┬─────────┘    └────────┬─────────┘    └──────────┬───────────┘
           │                       │                          │
           └───────────────────────┼──────────────────────────┘
                                   │  HTTPS (Cloudflare Tunnel)
                                   ▼
                    ┌──────────────────────────────┐
                    │       FastAPI Backend         │
                    │                              │
                    │  • JWT Authentication        │
                    │  • 20+ API Routers           │
                    │  • ML Model Inference        │
                    │  • PDF Generation            │
                    │  • Image Processing          │
                    └──────────┬───────────────────┘
                               │
            ┌──────────────────┼──────────────────┐
            ▼                  ▼                  ▼
   ┌─────────────────┐ ┌──────────────┐ ┌─────────────────┐
   │  Firebase       │ │  Cloudinary  │ │  infra_smart    │
   │  Firestore DB   │ │  CDN Storage │ │  _model.pkl     │
   │  + Cloud Store  │ │  (Images)    │ │  (Scikit-Learn) │
   └─────────────────┘ └──────────────┘ └─────────────────┘
```

---

## 📁 Repository Structure

This repository has **3 active branches**, each hosting a distinct layer of the system:

```
Al-Enabled-E-Manyata-Pranali/
│
├── main (branch)                         ← Web Frontends
│   └── schoolweb/
│       ├── app/
│       │   ├── admin/                    ← Admin/Governance Portal
│       │   │   ├── (auth)/login/
│       │   │   └── (main)/
│       │   │       ├── dashboard/
│       │   │       ├── ai-monitoring/
│       │   │       ├── inspections/
│       │   │       ├── schools/
│       │   │       ├── documents/
│       │   │       ├── reports/
│       │   │       └── audit-logs/
│       │   ├── dashboard/                ← School Dashboard
│       │   ├── profile/                  ← 9,650-line school profile form
│       │   ├── registration/             ← Recognition application
│       │   ├── inspection/               ← Inspection tracking
│       │   ├── certificates/             ← Digital certificates
│       │   ├── notifications/
│       │   ├── status/
│       │   └── components/
│       │       ├── ProfileBookletModal.tsx   ← 54,970-byte compliance viewer
│       │       └── admin/                    ← Admin modal components
│       └── lib/
│           ├── api.ts                    ← API base URL config
│           └── utils.ts                  ← Tailwind class merger (cn)
│
├── appinspection (branch)                ← Mobile Inspector App
│   └── src/
│       ├── App.tsx
│       ├── navigation/
│       │   └── AppNavigator.tsx          ← Auth-gated navigation hub
│       ├── screens/
│       │   ├── auth/                     ← Login + Splash
│       │   ├── dashboard/                ← Inspector dashboard
│       │   ├── inspections/              ← List, Details, Mode, Evidence, Report
│       │   ├── notifications/
│       │   └── profile/                  ← Profile + Edit
│       ├── components/                   ← Button, Card, Input, Badge, Shimmer
│       ├── store/                        ← Zustand state stores
│       ├── lib/                          ← API client + auth storage
│       └── theme/                        ← Design tokens
│
└── backend (branch)                      ← FastAPI Python Server
    └── app/
        ├── main.py                       ← Entry point + CORS + router registry
        ├── firebase_config.py            ← Firebase Admin SDK init
        ├── cloudinary_service.py         ← Image CDN helper
        ├── infra_smart_model.pkl         ← Trained ML model (Scikit-Learn)
        ├── models.py                     ← Firestore schema defaults
        └── routers/
            ├── auth.py
            ├── predict.py                ← AI inference engine
            ├── profile.py
            ├── registration.py
            ├── status.py
            ├── notifications.py
            ├── admin_dashboard.py
            ├── admin_schools.py
            ├── admin_applications.py
            ├── admin_inspection.py
            ├── admin_reports.py
            ├── inspection_dashboard.py
            ├── inspection_app.py
            └── inspection_reports.py
```

---

## 🛠️ Tech Stack

### Web Frontend (`main` branch)
| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 16.1.6 | App Router, SSR, routing |
| **React** | 19.2.3 | Component-based UI |
| **TypeScript** | 5.x | Type safety across all forms |
| **Tailwind CSS** | v4 | Utility-first styling with CSS custom properties |
| **Framer Motion** | 12.x | Smooth micro-animations and transitions |
| **Lucide React** | Latest | Icon library |
| **clsx + tailwind-merge** | Latest | Conflict-free dynamic class composition |

### Mobile Inspector App (`appinspection` branch)
| Technology | Version | Purpose |
|---|---|---|
| **Expo** | ~53.0 | React Native SDK and tooling |
| **React Native** | 0.79.x | Cross-platform mobile framework |
| **react-navigation** | v7 | Stack + Tab navigation |
| **Zustand** | ^5 | Lightweight global state management |
| **react-native-reanimated** | ^3.17 | GPU-thread animations |
| **react-native-gesture-handler** | ^2.22 | Touch and swipe gestures |
| **Formik + Yup** | Latest | Form state and schema validation |
| **expo-image-picker** | ~16.1 | Camera and gallery access |
| **expo-location** | Latest | GPS coordinates during inspections |
| **lottie-react-native** | ^7.2 | JSON-based animations |
| **AsyncStorage** | ^2 | Persistent JWT token storage |

### Backend (`backend` branch)
| Technology | Version | Purpose |
|---|---|---|
| **FastAPI** | Latest | High-performance async REST API |
| **Uvicorn** | Latest | ASGI server |
| **Pydantic** | Latest | Request/response validation |
| **python-jose** | Latest | JWT token generation and verification |
| **passlib + bcrypt** | Latest | Password hashing |
| **firebase-admin** | Latest | Firestore + Cloud Storage SDK |
| **Cloudinary** | Latest | CDN image upload and optimization |
| **Pandas + NumPy** | Latest | Feature engineering for ML |
| **Scikit-Learn + Joblib** | Latest | ML model training and inference |
| **ReportLab + FPDF** | Latest | PDF certificate generation |

### Cloud & Infrastructure
| Service | Purpose |
|---|---|
| **Google Firebase (Firestore)** | Primary NoSQL database |
| **Google Cloud Storage** | Document and evidence file storage |
| **Cloudinary** | Image CDN with auto-optimization |
| **Cloudflare Tunnel** | Secure localhost-to-internet tunnel for development |

---

## ✨ Features

### 🏫 School Portal
- **9-Step Registration Wizard** — Captures every government-standard compliance field: basic details, financial records, legal documents, location/GIS data, infrastructure, staff, safety audits, student capacity, vocational education, and transportation
- **Auto-Save Per Step** — Progress is persisted to Firestore after each form page, preventing data loss on long forms
- **UDISE Auto-Population** — Entering a UDISE number auto-fills verified fields from federal education records
- **Document Upload System** — Upload trust deeds, fire NOCs, structural stability reports, and water quality scans with progress indicators
- **Real-Time Application Status** — Visual vertical timeline: Draft → Submitted → Under Review → Approved / Rejected
- **Digital Certificate Download** — Cryptographically signed PDF certificates for approved schools
- **Notification Inbox** — Receive alerts for inspection scheduling, query corrections, and approval updates

### 🛡️ Admin / Governance Portal
- **Macro Analytics Dashboard** — State-wide counts of registrations, pending inspections, infrastructure ratios, and approval funnels
- **AI Monitoring Dashboard** — Select any school to load its infrastructure compliance score, or trigger batch predictions across all institutions to flag high-risk "Severe Deficiency" structures instantly
- **Inspection Management** — View schools on map, assign field inspectors, schedule visits, handle reassignments, log post-inspection feedback
- **Document Review Module** — Inline PDF viewer for uploaded compliance documents with approve / flag-for-correction controls
- **Custom Report Generator** — Build and export reports by status, district, or compliance score as spreadsheets or PDFs
- **Audit Logs** — Immutable operational action logging for accountability
- **5 Operational Modals** — Schedule Inspection, Reassign Inspector, Request Changes, Reschedule Inspection, Send Notification

### 📱 Inspector Mobile App
- **Secure JWT Authentication** — Role-gated login: only `inspector` role accounts can access the app
- **Live Dashboard** — Animated stat cards with count-up animations: Total, Pending, Completed, Overdue, High Priority
- **Inspection Mode** — Active recording screen with live GPS coordinates, elapsed timer, and pulsing recording indicator
- **Evidence Capture** — Capture and tag photos/videos (classroom, lab, safety, infrastructure, staff, sanitation) with geolocation metadata
- **Document Verification** — Review and mark each school document as Verified or Rejected with remarks
- **Final Report Submission** — Submit overall score, risk category, recommendation (Approve / Reject / Re-Inspection), and detailed findings
- **Swipeable Notifications** — Swipe-to-delete, mark-as-read, and navigate to related inspections
- **Pull-to-Refresh** — All list screens support pull-to-refresh for real-time data updates
- **Shimmer Skeletons** — Smooth loading states for all data-fetching screens
- **Offline-Ready Architecture** — App state hydrated from AsyncStorage on startup; session survives app restarts

---

## 🌿 Branch Guide

| Branch | Contents | Start Command |
|--------|----------|---------------|
| `main` | Next.js web app (School Portal + Admin Portal) | `npm run dev` |
| `appinspection` | Expo React Native inspector mobile app | `npx expo start` |
| `backend` | FastAPI Python backend server | `uvicorn app.main:app --reload` |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ and npm
- Python 3.10+
- Expo CLI (`npm install -g @expo/cli`)
- Firebase project with Firestore and Storage enabled
- Cloudinary account
- A `serviceAccountKey.json` from your Firebase project settings

---

### Backend Setup

```bash
# 1. Switch to the backend branch
git checkout backend

# 2. Create a virtual environment
python -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r app/requirements.txt

# 4. Place your Firebase service account key
# Copy serviceAccountKey.json into the app/ directory

# 5. Configure environment variables (see Environment Variables section)

# 6. Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Optional: expose via Cloudflare Tunnel for device access
cloudflared tunnel --url http://localhost:8000
```

The API will be available at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

---

### Web Frontend Setup

```bash
# 1. Switch to the main branch
git checkout main

# 2. Navigate to the web app
cd schoolweb/Al-Enabled-E-Manyata-Pranali-Digital-School-Recognition-Inspection-and-Governance-Management-System

# 3. Install dependencies
npm install

# 4. Configure the API base URL
# Edit lib/api.ts and set API_BASE_URL to your backend URL

# 5. Start the development server
npm run dev
```

Open `http://localhost:3000` in your browser.

| Route | Portal |
|-------|--------|
| `/` | Public landing page |
| `/login` | School administrator login |
| `/signup` | School registration / onboarding |
| `/dashboard` | School dashboard (authenticated) |
| `/profile` | 9-step profile editor |
| `/registration` | Recognition application submission |
| `/status` | Application status timeline |
| `/admin/login` | Government administrator login |
| `/admin/dashboard` | Admin analytics hub |
| `/admin/ai-monitoring` | AI compliance scoring dashboard |
| `/admin/inspections` | Inspector assignment and scheduling |

---

### Inspection App Setup

```bash
# 1. Switch to the appinspection branch
git checkout appinspection

# 2. Install dependencies
npm install

# 3. Configure the backend URL
# Edit src/lib/api.ts and set the BASE_URL to your Cloudflare Tunnel or local IP

# 4. Start the Expo development server
npx expo start

# 5. Scan QR code with Expo Go app (iOS/Android)
# Or press 'a' for Android emulator, 'i' for iOS simulator
```

> **Note:** The inspector app requires a user account with `role: "inspector"` to log in. Create one via the backend's `/auth/register` endpoint or the admin panel.

---

## 🤖 AI Infrastructure Model

The heart of the system's intelligence is the `infra_smart_model.pkl` — a trained Scikit-Learn classification pipeline loaded into memory at backend startup.

### Feature Engineering (`app/routers/predict.py`)

When a prediction is requested, the engine parses the school's Firestore profile and engineers the following numerical features:

| Feature | Calculation |
|---|---|
| **Toilet Score** | `functional_toilets / total_toilet_installations` |
| **Classroom Score** | `sound_rooms / (sound_rooms + dilapidated_rooms)` |
| **Electricity** | Binary indicator (0 or 1) |
| **Internet** | Binary indicator (0 or 1) |
| **Lab Presence** | Binary indicator |
| **Library Presence** | Binary indicator |
| **Safety Score** | Aggregate of fire extinguishers, CCTV, disaster drills, and safety audits |

### Output Labels

| Prediction | Label | Severity |
|---|---|---|
| `2` | ✅ Excellent Infrastructure | Low |
| `1` | ⚠️ Adequate Facilities | Medium |
| `0` | 🔴 Severe Deficiencies | High — triggers automatic inspector alert |

### AI Pipeline Flow

```
School submits 9-step profile
          │
          ▼
Data committed to Firestore (school_profiles)
          │
          ▼
Admin loads AI Monitoring Dashboard
          │
          ▼
Backend engineers feature vector from Firestore record
          │
          ▼
infra_smart_model.pkl runs classification
          │
          ├── GOOD (2)     → Auto-cleared for expedited review
          ├── MODERATE (1) → Queued for standard inspection
          └── POOR (0)     → Flagged; inspector auto-notified
```

Admins can also trigger **batch predictions** across all registered schools at once from the AI Monitoring dashboard, producing an instant state-wide risk map.

---

## 🗃️ Database Schema

The system uses **Google Firestore** (NoSQL) with the following primary collections:

### `school_profiles` Collection

```
school_profiles/
└── {school_id}/
    ├── meta
    │   ├── application_type         (new_recognition | renewal | upgradation)
    │   └── step_completion_tracker  {step_1: true, step_2: false, ...}
    ├── basic_details
    │   ├── udise_number, school_name, establishment_year
    │   ├── medium_of_instruction, school_type, pm_shri_status
    │   └── management_group, smc_info, pta_info
    ├── receipts_expenditure
    │   ├── grants_received, maintenance_cost
    │   ├── construction_fees, teacher_salaries
    │   └── annual_operational_expenses
    ├── legal_details
    │   ├── recognition_number, recognition_date
    │   └── affiliation_numbers, society_trust_registration
    ├── location
    │   ├── gis_coordinates, gram_panchayat
    │   ├── assembly_constituency, parliamentary_constituency
    │   └── revenue_block, district, state
    ├── infrastructure
    │   ├── instructional_rooms (sound vs. dilapidated)
    │   ├── boys_toilets, girls_toilets, functional_toilets
    │   ├── water_source, water_quality_test
    │   ├── internet_speed, electricity_available
    │   └── labs (science, computer, language), library
    ├── staff_summary
    │   ├── total_teaching, total_non_teaching
    │   ├── vocational_staff, tet_qualified
    │   └── staff_quarters_available
    ├── safety
    │   ├── cctv_cameras, fire_extinguishers
    │   ├── disaster_management_drills, structural_audit
    │   └── fire_noc, self_defense_grants
    ├── vocational_education
    │   ├── trade_sectors, guest_lectures
    │   └── enrollment, placement_numbers
    │
    ├── teachers/           ← Sub-collection: individual teacher records
    ├── students/           ← Sub-collection: enrolled pupil records
    └── profile_documents/  ← Sub-collection: uploaded compliance files
```

### Other Collections

| Collection | Purpose |
|---|---|
| `school_registrations` | Drafts mirror during the application process |
| `applications` | Finalized submissions queued for government review |
| `users` | Authenticated school administrators and inspectors |
| `inspections` | Assigned inspection records with schedules and results |
| `notifications` | System notifications per user |

---

## 📡 API Reference

All endpoints are prefixed under the FastAPI server base URL. Authentication uses **Bearer JWT tokens** in the `Authorization` header.

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/token` | School/Admin login — returns JWT |
| `POST` | `/auth/signup` | New school administrator registration |
| `POST` | `/admin/login` | Government officer authentication |

### School Profile
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/profile/{school_id}` | Load complete school profile |
| `PUT` | `/profile/{school_id}/step/{n}` | Save individual step (1–9) |
| `POST` | `/profile/{school_id}/documents` | Upload compliance document |
| `POST` | `/user/upload-image` | Upload profile photograph |

### Inspections (Inspector App)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/inspection/dashboard` | Inspector dashboard stats |
| `GET` | `/inspection/inspections` | All assigned inspections |
| `GET` | `/inspection/inspections/{id}` | Single inspection details |
| `POST` | `/inspection/evidence` | Upload geotagged evidence |
| `POST` | `/inspection/inspections/{id}/report` | Submit final inspection report |
| `GET` | `/inspection/notifications` | Inspector notifications |
| `PATCH` | `/inspection/notifications/{id}/read` | Mark notification as read |
| `PATCH` | `/inspection/notifications/read-all` | Mark all notifications as read |
| `DELETE` | `/inspection/notifications/{id}` | Delete notification |
| `GET` | `/inspection/user` | Inspector profile |
| `PUT` | `/inspection/user` | Update inspector profile |

### Admin Governance
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/admin/dashboard` | State-wide analytics |
| `GET` | `/admin/schools` | All registered institutions |
| `GET` | `/admin/applications` | Pending application queue |
| `POST` | `/admin/schools/{id}/submit` | Trigger final submission |
| `POST` | `/admin/predict/{school_id}` | Run AI infrastructure assessment |
| `POST` | `/admin/predict/batch` | Batch AI scoring for all schools |
| `POST` | `/admin/inspections/assign` | Assign inspector to school |
| `GET` | `/admin/reports` | Generate compliance reports |

---

## 🖥️ Key Screens & Workflows

### Inspector Mobile App

```
SplashScreen (AsyncStorage check)
      │
      ├── [No token / expired] ──▶ LoginScreen
      │                                │
      │                          POST /auth/login
      │                          Role check: inspector only
      │                                │
      └── [Valid token] ◀──────────────┘
            │
            ▼
      BottomTabNavigator
      ├── DashboardScreen     ← Animated stat cards, recent inspections, overdue alerts
      ├── InspectionListScreen ← Search + filter by status
      │       │
      │       └── InspectionDetailsScreen
      │               ├── Overview, Documents, Evidence, Report tabs
      │               └── "Start Inspection" ──▶ InspectionModeScreen
      │                                               ├── Live GPS + timer
      │                                               ├── Document verify/reject
      │                                               └── ──▶ EvidenceUploadScreen
      │                                                           (photo/video + tag)
      │                       └── ──▶ FinalReportScreen
      │                                   (score + recommendation + submit)
      ├── NotificationsScreen ← Swipeable, mark-as-read, navigate to inspection
      └── ProfileScreen       ← Edit profile, logout
```

### School Registration Flow

```
/signup ──▶ Create account + UDISE number
      │
      ▼
/profile ──▶ Fill 9-step compliance form
      │       (auto-saved per step to Firestore)
      │
      ▼
/registration ──▶ Profile completion check
      │           (all steps must be ✅)
      │
      ▼
Submit application ──▶ POST /admin/schools/{id}/submit
      │
      ▼
/status ──▶ Track: Draft → Submitted → Under Review → Approved/Rejected
      │
      ▼
/certificates ──▶ Download digitally signed PDF certificate
```

### Admin AI Monitoring Flow

```
/admin/ai-monitoring
      │
      ├── Select single school ──▶ POST /admin/predict/{school_id}
      │                                   │
      │                             Feature engineering
      │                             (toilets, rooms, safety ratios)
      │                                   │
      │                             infra_smart_model.pkl inference
      │                                   │
      │                         ┌─────────┴──────────┐
      │                    GOOD (2)            POOR (0) ──▶ Alert inspector
      │
      └── Batch score all ──▶ POST /admin/predict/batch
                                   ──▶ State-wide risk map
```

---

## 🔄 Data Flow

```
                    ┌────────────────────────────────┐
                    │   App Startup (SplashScreen)    │
                    └───────────────┬────────────────┘
                                    │ checkAuth()
                           ┌────────▼────────┐
                           │  AsyncStorage    │
                           │ (JWT Token)      │
                           └────────┬────────┘
               ┌────────────────────┴───────────────────┐
           No Token                                  Token Found
               │                                         │
      ┌────────▼───────┐                      ┌──────────▼───────┐
      │  LoginScreen   │                      │  Check Expiry     │
      └────────┬───────┘                      └──────┬───────────┘
               │                             Valid   │   Expired
      POST /auth/login                        │      │
               │                       ┌─────▼─┐  ┌─▼──────────┐
      Save token to AsyncStorage        │ Main  │  │  logout()  │
      Update Zustand store              │ Stack │  │  → Login   │
               │                       └───────┘  └────────────┘
               ▼
      Navigator detects
      isAuthenticated = true
      → Renders Main Stack
```

---

## 🔐 Environment Variables

### Backend (`backend` branch — `.env` or environment)

```env
# Firebase
FIREBASE_SERVICE_ACCOUNT_PATH=app/serviceAccountKey.json
FIREBASE_STORAGE_BUCKET=your-project.appspot.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# JWT
SECRET_KEY=your_jwt_secret_key_minimum_32_chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

### Web Frontend (`main` branch — `lib/api.ts`)

```typescript
// lib/api.ts
export const API_BASE_URL = "https://your-cloudflare-tunnel.trycloudflare.com";
```

### Inspector App (`appinspection` branch — `src/lib/api.ts`)

```typescript
// src/lib/api.ts
private readonly baseURL = "https://your-cloudflare-tunnel.trycloudflare.com";
```

---

## 🎨 Design System

### Color Palette

| Token | Hex | Usage |
|---|---|---|
| `primary` | `#1A56DB` | Main blue — CTAs, active states, links |
| `primaryDark` | `#1345B5` | Hover states, pressed buttons |
| `secondary` | `#6C63FF` | Purple — secondary actions |
| `accent` | `#F59E0B` | Amber/gold — warnings, highlights |
| `success` | `#10B981` | Approved, completed, verified |
| `error` | `#EF4444` | Rejected, overdue, critical |
| `warning` | `#F59E0B` | Pending, medium priority |
| `background` | `#F9FAFB` | App background |
| `surface` | `#FFFFFF` | Cards, modals |

### Typography Scale

```
xs: 11px  sm: 13px  base: 15px  lg: 17px  xl: 20px  2xl: 24px  3xl: 30px
```

### Spacing Scale

```
xs: 4px  sm: 8px  md: 12px  lg: 16px  xl: 24px  xxl: 32px  xxxl: 48px
```

---

## 🧩 Architectural Decisions

| Decision | Rationale |
|---|---|
| **Zustand over Redux** | Minimal boilerplate; no actions/reducers/selectors complexity for a focused mobile app |
| **Conditional navigator rendering** | React re-renders the tree when `isAuthenticated` changes — no programmatic navigation needed |
| **Formik + Yup** | Declarative form state with schema-based validation — production standard for complex multi-step forms |
| **react-native-reanimated v3** | Animations run on the UI thread, staying smooth even during heavy JS computation |
| **AsyncStorage for JWT** | Simple built-in persistence sufficient for JWT tokens; survives app restarts |
| **Centralized API client class** | Auth header injected automatically — no token passing needed in individual screens |
| **Cloudflare Tunnel** | Allows real physical devices to reach the localhost FastAPI backend during development without port forwarding |
| **Firestore segmented schema** | 9-step profile split into sub-documents allows partial saves without overwriting unrelated fields |
| **`cn` utility (clsx + twMerge)** | Prevents Tailwind class conflicts when components accept dynamic `className` overrides |
| **`isHydrated` state flag** | Prevents SplashScreen flicker while AsyncStorage token check is in progress |

---

## 📊 Project Statistics

| Metric | Value |
|---|---|
| Total Branches | 3 (main, backend, appinspection) |
| Backend API Routers | 15+ |
| School Profile Form Lines | ~9,650 lines |
| ProfileBookletModal Size | ~54,970 bytes |
| Registration Steps | 9 steps |
| Firestore Collections | 6 primary |
| Mobile App Screens | 12+ |
| ML Model Output Classes | 3 (Good / Moderate / Poor) |
| Inspection Status States | 8 stages |

---

## 👥 Contributors

<table>
  <tr>
    <td align="center" width="200">
      <strong>Atharv Mulik</strong><br/>
      <em>Backend Lead</em><br/><br/>
      🔧 FastAPI backend architecture<br/>
      🤖 AI/ML model development (<code>infra_smart_model.pkl</code>)<br/>
      🔐 JWT authentication system<br/>
      📡 All API routers (15+ modules)<br/>
      🚀 Cloudflare Tunnel configuration<br/>
      📄 PDF certificate generation<br/>
      🖼️ Cloudinary image service<br/>
      🔥 Firebase Admin SDK integration<br/>
      📱 Inspector mobile app (Expo/React Native)<br/>
      🧭 Navigation architecture (Zustand + react-navigation)<br/>
      🎨 Mobile UI components and animations<br/>
      🧩 Zustand state management stores<br/>
      🔑 AsyncStorage auth persistence layer
    </td>
    <td align="center" width="200">
      <strong>Tejas</strong><br/>
      <em>Database Lead</em><br/><br/>
      🗃️ Firestore schema design and modeling<br/>
      📐 9-collection data architecture<br/>
      🔄 School profile step-by-step data staging<br/>
      📊 Sub-collection structures (teachers, students, documents)<br/>
      🔗 Firebase + backend data integration<br/>
      🏗️ Firestore security rules configuration
    </td>
    <td align="center" width="200">
      <strong>Siddhi</strong><br/>
      <em>Frontend Developer</em><br/><br/>
      🖥️ Next.js web frontend development<br/>
      🏫 School Portal UI (dashboard, registration, status)<br/>
      🛡️ Admin Portal UI (governance, reports, documents)<br/>
      🎨 Tailwind CSS v4 design system<br/>
      ✨ Framer Motion animations<br/>
      📋 ProfileBookletModal component
    </td>
    <td align="center" width="200">
      <strong>Vaishnavi</strong><br/>
      <em>Frontend Developer</em><br/><br/>
      🖥️ Next.js web frontend development<br/>
      🏫 School Portal UI (dashboard, registration, status)<br/>
      🛡️ Admin Portal UI (governance, reports, documents)<br/>
      🎨 Tailwind CSS v4 design system<br/>
      ✨ Framer Motion animations<br/>
      📋 ProfileBookletModal component
    </td>
  </tr>
</table>

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Built with ❤️ for modernizing education governance in India

**E-Manyata-Pranali** — Bringing transparency, efficiency, and AI to school recognition

[⬆ Back to Top](#-ai-enabled-e-manyata-pranali)

</div>
