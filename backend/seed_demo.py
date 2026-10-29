import os
import hashlib
import json
from datetime import datetime
from pathlib import Path
import numpy as np
import cv2

from database import db
from models import Case, Evidence, AnalysisResult, TimelineEvent
from config import Config

def create_sample_forensic_image(save_path: Path):
    """Creates a synthetic CCTV surveillance frame with timestamp and grid overlay."""
    img = np.zeros((720, 1280, 3), dtype=np.uint8)
    # Background: dark surveillance camera night tone
    img[:] = (32, 28, 22)

    # Grid overlay
    for y in range(0, 720, 90):
        cv2.line(img, (0, y), (1280, y), (45, 40, 35), 1)
    for x in range(0, 1280, 160):
        cv2.line(img, (x, 0), (x, 720), (45, 40, 35), 1)

    # Simulated building silhouette / vehicle
    cv2.rectangle(img, (700, 340), (1200, 620), (60, 50, 40), -1)
    cv2.putText(img, "VEHICLE TARGET - SEDAN", (720, 380), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (140, 140, 140), 1)

    # Person silhouette outline
    cv2.rectangle(img, (320, 240), (480, 650), (80, 70, 60), 2)
    cv2.circle(img, (400, 280), 30, (90, 80, 70), -1)
    cv2.putText(img, "SUBJECT #1", (330, 230), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 212, 255), 2)

    # Simulated OSD (On Screen Display)
    cv2.putText(img, "CAM-04 [NORTH PERIMETER ALLEY] - 1080p 30FPS", (30, 45), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 180), 2)
    cv2.putText(img, "REC 2026-10-24 22:14:08 UTC", (30, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 180), 1)

    cv2.imwrite(str(save_path), img)


def run_seed():
    # Check if sample case already exists
    existing = Case.query.filter_by(case_number="CASE-2026-0814").first()
    if existing:
        return {"status": "exists", "message": "Demo forensic case already populated", "case_id": existing.id}

    # 1. Create Case
    case = Case(
        case_number="CASE-2026-0814",
        title="Commercial Facility Intrusion & Security Breach",
        description="Unauthorized nocturnal breach into East Wing secure commercial warehouse. Physical lock bypassed, safe access attempted, subject departed eastbound.",
        incident_date="2026-10-24 22:14",
        location="Apex Logistics Terminal, Dock 4, Sector 7",
        status="Under Review",
        priority="High",
        lead_investigator="Senior Insp. Sarah Vance (Badge #408)"
    )
    db.session.add(case)
    db.session.commit()

    # 2. Create Sample Image Evidence
    img_filename = "cctv_cam04_221408.jpg"
    img_stored = f"seed_{img_filename}"
    img_path = Config.UPLOAD_FOLDER / img_stored
    create_sample_forensic_image(img_path)

    # Compute hash
    hasher = hashlib.sha256()
    with open(img_path, 'rb') as f:
        hasher.update(f.read())
    img_hash = hasher.hexdigest()

    evidence_img = Evidence(
        case_id=case.id,
        filename=img_filename,
        stored_filename=img_stored,
        file_type="image",
        file_size=os.path.getsize(str(img_path)),
        mime_type="image/jpeg",
        sha256_hash=img_hash,
        status="Analyzed",
        notes="High-definition frame capture from fixed overhead surveillance post."
    )
    db.session.add(evidence_img)
    db.session.commit()

    # Add Image Analysis Result
    img_detections = [
        {
            "id": "det-1",
            "label": "Person / Suspect",
            "category": "Person of Interest",
            "confidence": 0.94,
            "bbox": [320, 240, 160, 410],
            "attributes": {"outerwear": "Dark hooded windbreaker, tactical gloves", "height_est": "5ft 10in"}
        },
        {
            "id": "det-2",
            "label": "Motor Vehicle (Dark Sedan)",
            "category": "Vehicle",
            "confidence": 0.88,
            "bbox": [700, 340, 500, 280],
            "attributes": {"color": "Dark metallic blue", "status": "Engine idling"}
        },
        {
            "id": "det-3",
            "label": "Concealed Hardware Tool",
            "category": "Potential Weapon / Tool",
            "confidence": 0.81,
            "bbox": [430, 420, 80, 120],
            "attributes": {"type": "Mechanical bypass pry tool"}
        }
    ]

    analysis_img = AnalysisResult(
        evidence_id=evidence_img.id,
        analysis_mode="demo",
        model_used="Forensic Demo Engine (RT-DETR & BLIP Simulated)",
        summary="CCTV frame resolved 3 entities: Adult subject (94% conf), stationary sedan (88% conf), and pry implement (81% conf).",
        scene_description="Overhead perimeter view under sodium vapor lamp lighting. Low natural ambient illumination. High contrast profile.",
        detected_objects_json=json.dumps(img_detections),
        transcription="",
        audio_segments_json="[]",
        video_frames_json="[]",
        risk_assessment_json=json.dumps({
            "threat_level": "Elevated",
            "breach_vector": "East secondary loading dock bypass",
            "tampering_indicators": "Negative (Cryptographic integrity verified)"
        }),
        is_simulated=True
    )
    db.session.add(analysis_img)

    # 3. Create Sample Audio Evidence
    audio_filename = "radio_dispatch_unit4.wav"
    audio_stored = f"seed_{audio_filename}"
    audio_path = Config.UPLOAD_FOLDER / audio_stored
    
    # Write a simple clean dummy WAV byte structure
    with open(audio_path, 'wb') as f:
        # 44 byte standard WAV header followed by 1024 zero bytes
        f.write(b'RIFF$\x04\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00D\xac\x00\x00\x88X\x01\x00\x02\x00\x10\x00data\x00\x04\x00\x00' + (b'\x00' * 1024))

    hasher_audio = hashlib.sha256()
    with open(audio_path, 'rb') as f:
        hasher_audio.update(f.read())
    audio_hash = hasher_audio.hexdigest()

    evidence_audio = Evidence(
        case_id=case.id,
        filename=audio_filename,
        stored_filename=audio_stored,
        file_type="audio",
        file_size=os.path.getsize(str(audio_path)),
        mime_type="audio/wav",
        sha256_hash=audio_hash,
        status="Analyzed",
        notes="Security dispatcher transmission recording during active alarm trigger."
    )
    db.session.add(evidence_audio)
    db.session.commit()

    audio_segments = [
        {"id": "seg-1", "start": "00:00", "end": "00:05", "speaker": "Caller (Terminal Guard)", "text": "Dispatch, sensor trip on Dock 4. Motion detected near breaker box.", "confidence": 0.95},
        {"id": "seg-2", "start": "00:06", "end": "00:12", "speaker": "Central Dispatch", "text": "Acknowledged. Routing patrol unit 12. Confirm if subject is in view.", "confidence": 0.98},
        {"id": "seg-3", "start": "00:13", "end": "00:20", "speaker": "Caller (Terminal Guard)", "text": "Visual confirmed on Cam 4. Single subject dressed in dark clothing, carrying heavy tool.", "confidence": 0.93}
    ]

    analysis_audio = AnalysisResult(
        evidence_id=evidence_audio.id,
        analysis_mode="demo",
        model_used="Forensic Demo Engine (Whisper Simulated)",
        summary="Security dispatch radio audio processed. Confirms perimeter breach and physical description.",
        scene_description="2-way radio transmission audio with standard background static.",
        detected_objects_json="[]",
        transcription=" ".join([f"[{s['speaker']}]: {s['text']}" for s in audio_segments]),
        audio_segments_json=json.dumps(audio_segments),
        video_frames_json="[]",
        risk_assessment_json=json.dumps({
            "threat_level": "Elevated",
            "vocal_urgency": "High stress markers detected"
        }),
        is_simulated=True
    )
    db.session.add(analysis_audio)

    # 4. Populate Unified Chronological Timeline
    timeline_events = [
        TimelineEvent(
            case_id=case.id,
            evidence_id=evidence_audio.id,
            timestamp_str="22:13:45",
            source_type="audio",
            title="Acoustic Alarm Trigger",
            description="Terminal security sensor trip on Dock 4 reported via radio.",
            confidence=0.95,
            tags_json=json.dumps(["sensor_alarm", "audio_log"])
        ),
        TimelineEvent(
            case_id=case.id,
            evidence_id=evidence_img.id,
            timestamp_str="22:14:08",
            source_type="image",
            title="Visual Acquisition on Cam 4",
            description="Subject captured entering perimeter alleyway; vehicle in background.",
            confidence=0.94,
            tags_json=json.dumps(["visual_confirmation", "person_detected"])
        ),
        TimelineEvent(
            case_id=case.id,
            evidence_id=evidence_img.id,
            timestamp_str="22:14:35",
            source_type="investigator_note",
            title="Bypass Tool Identification",
            description="Investigator analysis identifies mechanical pry implement matching door frame markings.",
            confidence=0.88,
            tags_json=json.dumps(["tool_mark", "examiner_note"])
        ),
        TimelineEvent(
            case_id=case.id,
            evidence_id=evidence_audio.id,
            timestamp_str="22:15:20",
            source_type="audio",
            title="Patrol Intercept Dispatched",
            description="Central dispatch instructs Unit 12 to deploy roadblock at 4th & Elm.",
            confidence=0.98,
            tags_json=json.dumps(["dispatch", "police_action"])
        )
    ]

    for ev in timeline_events:
        db.session.add(ev)

    db.session.commit()
    return {"status": "created", "case_id": case.id, "case_number": case.case_number}
