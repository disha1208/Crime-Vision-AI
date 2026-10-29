# CrimeVision AI – Intelligent Multimodal Forensic Analysis Platform

CrimeVision AI is an end-to-end full-stack digital forensics and multimodal investigation platform designed for law enforcement, digital forensics units (DFU), and incident response teams. It features automatic cryptographic **SHA-256 chain-of-custody verification**, multimodal analysis (object detection, temporal video keyframing, acoustic speech diarization), unified chronological timeline reconstruction, and court-ready **ReportLab PDF report generation**.

---

## 🛡️ Architecture & Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18, Vite 5, CSS3, Lucide React | Dark forensic dashboard, interactive bounding boxes, responsive media views |
| **Backend** | Python 3.11+, Flask 3, Flask-CORS, SQLAlchemy | REST API, cryptographic hashing, modular AI services |
| **Database** | SQLite 3 | Relational schema for Cases, Evidence, Analysis, and Timelines |
| **Computer Vision** | OpenCV (`cv2`), Pillow | Video keyframe sampling, aspect ratio analysis, image metrics |
| **Reporting** | ReportLab | Court-ready, two-pass numbered canvas PDF report generation |
| **AI (Demo Mode)** | Built-in Local Forensic Engine | Zero-download, zero-API-key realistic forensic simulation |
| **AI (Real AI Mode)** | RT-DETR, CLIP, BLIP, Whisper, Groq | Optional neural inference with automatic fallback |

---

## 📁 Project Structure

```
crime vision 2.0/
├── backend/
│   ├── app.py                  # Main Flask REST API & endpoint controllers
│   ├── models.py               # SQLAlchemy models (Case, Evidence, AnalysisResult, TimelineEvent)
│   ├── database.py             # DB engine & directory initialization
│   ├── config.py               # Settings (file limits, allowed exts, Groq config)
│   ├── report_generator.py     # ReportLab PDF generator (Two-pass numbered canvas)
│   ├── seed_demo.py            # Sample case seeder for instant demonstration
│   ├── requirements.txt        # Backend dependencies
│   ├── .env.example            # Environment variables template
│   ├── .env                    # Local configuration
│   ├── uploads/                # Evidence binary repository
│   │   └── frames/             # Extracted video keyframe thumbnails
│   ├── reports/                # Compiled PDF forensic reports
│   └── ai_services/
│       ├── __init__.py
│       ├── demo_engine.py      # Local forensic heuristic engine (Image, Video, Audio)
│       ├── rtdetr_service.py   # RT-DETR object detector service module
│       ├── clip_service.py     # CLIP zero-shot classification module
│       ├── blip_service.py     # BLIP scene captioning module
│       ├── whisper_service.py  # Whisper speech transcription module
│       └── groq_service.py     # Groq LLM forensic chat assistant
├── frontend/
│   ├── package.json            # Vite + React dependencies
│   ├── vite.config.js          # Vite config with backend proxy (/api -> 5000)
│   ├── index.html              # HTML shell with dark theme fonts
│   └── src/
│       ├── main.jsx            # React root mount
│       ├── App.jsx             # Top-level state and routing
│       ├── App.css             # Forensic dark design system
│       ├── index.css           # Global reset & CSS variables
│       ├── api.js              # Centralized backend REST client
│       ├── components/
│       │   ├── Sidebar.jsx     # Navigation sidebar with status & seed button
│       │   ├── Header.jsx      # Top header with case switcher
│       │   └── Badge.jsx       # Status badge components
│       └── pages/
│           ├── Dashboard.jsx           # Page 1: Statistics & AI health
│           ├── CasesEvidence.jsx       # Page 2: Case CRUD & evidence vault
│           ├── MultimodalAnalysis.jsx  # Page 3: Visual & acoustic analysis
│           ├── UnifiedTimeline.jsx     # Page 4: Chronological timeline
│           ├── AIChat.jsx              # Page 5: Interactive evidence interrogation
│           └── Reports.jsx             # Page 6: Court-ready PDF generation
├── .gitignore
└── README.md
```

---

## ⚡ Quick Start Guide (Windows)

### Prerequisites
- **Python 3.10+** (Python 3.11 tested)
- **Node.js 18+** & **npm**

### Step 1: Start Backend (Terminal 1)

Open PowerShell and navigate to the backend directory:
```powershell
cd "c:\Users\disha\Downloads\crime vision 2.0\backend"
python -m pip install -r requirements.txt
python app.py
```
> The Flask API will start on: **`http://127.0.0.1:5000`**

### Step 2: Start Frontend (Terminal 2)

Open a second PowerShell window and navigate to the frontend directory:
```powershell
cd "c:\Users\disha\Downloads\crime vision 2.0\frontend"
npm install
npm run dev
```
> The Vite development server will start on: **`http://localhost:5173`**

Open **`http://localhost:5173`** in your browser.

---

## 🔬 Core Functionality Walkthrough

### 1. Dashboard
- Real-time case counts, evidence counts, analyzed status, and timeline markers.
- Status matrix for all 5 AI modules (RT-DETR, CLIP, BLIP, Whisper, Groq).
- Quick seed button to load a full demo investigation case with a single click.

### 2. Case & Evidence Management
- Create, view, edit, and delete investigation cases.
- Ingest evidence files: **JPG, PNG, MP4, WAV, MP3**.
- Immediate automated calculation of cryptographic **SHA-256 hashes** for immutable chain of custody.
- Media preview modal for images, video player, and audio player.

### 3. Multimodal Analysis
- **Image Analysis**: RT-DETR object detection bounding boxes, confidence ratings, and BLIP scene descriptions.
- **Video Analysis**: OpenCV keyframe sampling at configurable intervals (1s to 8s), extracted thumbnail gallery, and temporal progression notes.
- **Audio Analysis**: Speech transcription with speaker diarization, timestamps, and acoustic stress indicators.
- Mode toggle: Switch between **Demo Heuristic Mode** and **Real AI Mode**. Clear forensic notices state that AI predictions are investigative aids, not conclusive guilt proof.

### 4. Unified Chronological Timeline
- Consolidates image events, video keyframes, audio dispatch utterances, and examiner notes into a single chronological stream.
- Filter by media source type (Image, Video, Audio, Examiner Note).
- Insert manual forensic timeline markers with custom timestamps, descriptions, confidence, and tags.

### 5. AI Evidence Chat
- Interactive forensic interrogation assistant grounded strictly in the active case dossier, evidence artifacts, hashes, and timeline markers.
- Suggested queries for suspect profile, vehicle clues, timeline gaps, and SHA-256 integrity.
- Powered by Groq Llama 3.3 or local context reasoning engine with ethical forensic safeguards.

### 6. Official Court Reports
- Generates court-ready PDF documents using ReportLab.
- Features case metadata, complete evidence registry with SHA-256 hashes, multimodal findings, unified chronological timeline, and forensic examiner signature blocks.
- One-click download: `/api/cases/<id>/report`.

---

## 🔑 Optional Real AI Mode (Groq API)

To enable live Groq Llama 3.3 conversational reasoning and Groq Whisper audio transcription:
1. Copy `backend/.env.example` to `backend/.env` (already done by default).
2. Set your Groq API key:
   ```env
   GROQ_API_KEY=gsk_your_groq_api_key_here
   GROQ_MODEL=llama-3.3-70b-versatile
   ```
3. Restart the Flask backend. If no key is provided, the platform functions seamlessly in zero-setup Demo Mode.

---

## ⚠️ Known Genuine Limitations
1. **Demo Mode Simulation**: In Demo Mode, object bounding boxes, scene narratives, and audio transcripts are simulated forensic heuristics. Real RT-DETR and BLIP model weights require PyTorch and GPU acceleration for live local inference.
2. **Video Audio Tracks**: Video files are analyzed visually for keyframes. For combined video audio diarization, the audio track must be ingested as a separate WAV/MP3 evidence artifact or extracted via ffmpeg.
3. **Browser Audio Codecs**: Standard browser audio preview supports WAV, MP3, and OGG formats supported natively by modern web engines.
