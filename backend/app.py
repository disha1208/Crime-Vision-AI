import os
import hashlib
import uuid
from datetime import datetime
from pathlib import Path
from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename

from config import Config
from database import db, init_db
from models import Case, Evidence, AnalysisResult, TimelineEvent
from report_generator import ForensicReportGenerator

# AI Services
from ai_services.demo_engine import DemoEngine
from ai_services.rtdetr_service import RTDETRService
from ai_services.clip_service import CLIPService
from ai_services.blip_service import BLIPService
from ai_services.whisper_service import WhisperService
from ai_services.groq_service import GroqService

app = Flask(__name__)
app.config.from_object(Config)

# Enable CORS for all routes so React Vite frontend on port 5173 can communicate seamlessly
CORS(app, resources={r"/api/*": {"origins": "*"}})

init_db(app)

# Initialize AI Service instances
rtdetr_svc = RTDETRService()
clip_svc = CLIPService()
blip_svc = BLIPService()
whisper_svc = WhisperService(Config.GROQ_API_KEY)
groq_svc = GroqService(Config.GROQ_API_KEY, Config.GROQ_MODEL)


def get_file_type(extension: str) -> str:
    ext = extension.lower().lstrip('.')
    if ext in Config.ALLOWED_IMAGE_EXTS:
        return 'image'
    elif ext in Config.ALLOWED_VIDEO_EXTS:
        return 'video'
    elif ext in Config.ALLOWED_AUDIO_EXTS:
        return 'audio'
    return 'unknown'


def compute_sha256(file_path: Path) -> str:
    hasher = hashlib.sha256()
    with open(file_path, 'rb') as f:
        for chunk in iter(lambda: f.read(65536), b''):
            hasher.update(chunk)
    return hasher.hexdigest()


# ==========================================
# 1. HEALTH & DASHBOARD STATS
# ==========================================

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'platform': 'CrimeVision AI – Intelligent Multimodal Forensic Analysis Platform',
        'timestamp': datetime.utcnow().isoformat()
    })


@app.route('/api/dashboard/stats', methods=['GET'])
def dashboard_stats():
    total_cases = Case.query.count()
    total_evidence = Evidence.query.count()
    analyzed_evidence = Evidence.query.filter_by(status='Analyzed').count()
    pending_evidence = Evidence.query.filter_by(status='Pending').count()
    total_events = TimelineEvent.query.count()

    recent_cases = [c.to_dict() for c in Case.query.order_by(Case.created_at.desc()).limit(5).all()]
    recent_evidence = [e.to_dict() for e in Evidence.query.order_by(Evidence.uploaded_at.desc()).limit(5).all()]

    ai_statuses = {
        'groq': groq_svc.get_status(),
        'whisper': whisper_svc.get_status(),
        'rtdetr': rtdetr_svc.get_status(),
        'clip': clip_svc.get_status(),
        'blip': blip_svc.get_status()
    }

    return jsonify({
        'stats': {
            'total_cases': total_cases,
            'total_evidence': total_evidence,
            'analyzed_evidence': analyzed_evidence,
            'pending_evidence': pending_evidence,
            'total_events': total_events
        },
        'recent_cases': recent_cases,
        'recent_evidence': recent_evidence,
        'ai_services': ai_statuses
    })


@app.route('/api/ai/services', methods=['GET'])
def get_ai_services():
    return jsonify({
        'groq': groq_svc.get_status(),
        'whisper': whisper_svc.get_status(),
        'rtdetr': rtdetr_svc.get_status(),
        'clip': clip_svc.get_status(),
        'blip': blip_svc.get_status(),
        'demo_mode_active': not (groq_svc.is_available() and rtdetr_svc.is_available)
    })


# ==========================================
# 2. CASE MANAGEMENT CRUD
# ==========================================

@app.route('/api/cases', methods=['GET'])
def list_cases():
    cases = Case.query.order_by(Case.created_at.desc()).all()
    return jsonify({'cases': [c.to_dict() for c in cases]})


@app.route('/api/cases', methods=['POST'])
def create_case():
    data = request.get_json() or {}
    title = data.get('title', '').strip()
    if not title:
        return jsonify({'error': 'Case title is required'}), 400

    # Auto-generate case number if not provided
    case_number = data.get('case_number', '').strip()
    if not case_number:
        case_number = f"CASE-{datetime.utcnow().strftime('%Y')}-{uuid.uuid4().hex[:4].upper()}"

    # Verify uniqueness
    if Case.query.filter_by(case_number=case_number).first():
        case_number = f"CASE-{datetime.utcnow().strftime('%Y')}-{uuid.uuid4().hex[:6].upper()}"

    new_case = Case(
        case_number=case_number,
        title=title,
        description=data.get('description', ''),
        incident_date=data.get('incident_date', datetime.utcnow().strftime('%Y-%m-%d %H:%M')),
        location=data.get('location', ''),
        status=data.get('status', 'Active'),
        priority=data.get('priority', 'Medium'),
        lead_investigator=data.get('lead_investigator', 'Forensic Unit 1')
    )
    db.session.add(new_case)
    db.session.commit()

    return jsonify({'message': 'Case created successfully', 'case': new_case.to_dict()}), 201


@app.route('/api/cases/<int:case_id>', methods=['GET'])
def get_case(case_id):
    case_obj = Case.query.get_or_404(case_id)
    return jsonify({'case': case_obj.to_dict()})


@app.route('/api/cases/<int:case_id>', methods=['PUT'])
def update_case(case_id):
    case_obj = Case.query.get_or_404(case_id)
    data = request.get_json() or {}

    if 'title' in data and data['title'].strip():
        case_obj.title = data['title'].strip()
    if 'description' in data:
        case_obj.description = data['description']
    if 'incident_date' in data:
        case_obj.incident_date = data['incident_date']
    if 'location' in data:
        case_obj.location = data['location']
    if 'status' in data:
        case_obj.status = data['status']
    if 'priority' in data:
        case_obj.priority = data['priority']
    if 'lead_investigator' in data:
        case_obj.lead_investigator = data['lead_investigator']

    db.session.commit()
    return jsonify({'message': 'Case updated successfully', 'case': case_obj.to_dict()})


@app.route('/api/cases/<int:case_id>', methods=['DELETE'])
def delete_case(case_id):
    case_obj = Case.query.get_or_404(case_id)
    db.session.delete(case_obj)
    db.session.commit()
    return jsonify({'message': f'Case {case_obj.case_number} deleted successfully'})


# ==========================================
# 3. EVIDENCE UPLOAD & RETRIEVAL
# ==========================================

@app.route('/api/cases/<int:case_id>/evidence', methods=['GET'])
def list_case_evidence(case_id):
    case_obj = Case.query.get_or_404(case_id)
    evidence_items = [e.to_dict() for e in case_obj.evidence_items]
    return jsonify({'evidence': evidence_items})


@app.route('/api/cases/<int:case_id>/evidence', methods=['POST'])
def upload_evidence(case_id):
    case_obj = Case.query.get_or_404(case_id)

    if 'file' not in request.files:
        return jsonify({'error': 'No file part in request'}), 400

    file = request.files['file']
    if not file or file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    original_filename = secure_filename(file.filename)
    extension = original_filename.rsplit('.', 1)[-1].lower() if '.' in original_filename else ''

    if extension not in Config.ALLOWED_EXTENSIONS:
        return jsonify({
            'error': f'Unsupported file type ".{extension}". Allowed: {", ".join(sorted(Config.ALLOWED_EXTENSIONS))}'
        }), 400

    file_type = get_file_type(extension)
    unique_prefix = uuid.uuid4().hex[:8]
    stored_filename = f"{unique_prefix}_{original_filename}"
    save_path = Config.UPLOAD_FOLDER / stored_filename

    # Save file to disk
    file.save(str(save_path))
    file_size = os.path.getsize(str(save_path))

    # Compute cryptographic SHA-256 hash for forensic chain of custody
    sha256_hash = compute_sha256(save_path)

    notes = request.form.get('notes', '')

    new_evidence = Evidence(
        case_id=case_obj.id,
        filename=original_filename,
        stored_filename=stored_filename,
        file_type=file_type,
        file_size=file_size,
        mime_type=file.content_type or f"{file_type}/{extension}",
        sha256_hash=sha256_hash,
        status='Pending',
        notes=notes
    )

    db.session.add(new_evidence)
    db.session.commit()

    return jsonify({
        'message': 'Evidence ingested and hashed successfully',
        'evidence': new_evidence.to_dict()
    }), 201


@app.route('/api/evidence/<int:evidence_id>', methods=['GET'])
def get_evidence(evidence_id):
    evidence = Evidence.query.get_or_404(evidence_id)
    return jsonify({'evidence': evidence.to_dict()})


@app.route('/api/evidence/<int:evidence_id>', methods=['DELETE'])
def delete_evidence(evidence_id):
    evidence = Evidence.query.get_or_404(evidence_id)
    
    # Remove file from disk if present
    file_path = Config.UPLOAD_FOLDER / evidence.stored_filename
    if file_path.exists():
        try:
            os.remove(str(file_path))
        except Exception as e:
            print(f"Error removing file {file_path}: {e}")

    db.session.delete(evidence)
    db.session.commit()
    return jsonify({'message': f'Evidence {evidence.filename} deleted successfully'})


# File serving routes
@app.route('/api/uploads/<path:filename>')
def serve_upload(filename):
    return send_from_directory(str(Config.UPLOAD_FOLDER), filename)


@app.route('/api/uploads/frames/<path:filename>')
def serve_frame(filename):
    return send_from_directory(str(Config.FRAMES_FOLDER), filename)


# ==========================================
# 4. MULTIMODAL FORENSIC ANALYSIS
# ==========================================

@app.route('/api/evidence/<int:evidence_id>/analyze', methods=['POST'])
def analyze_evidence(evidence_id):
    evidence = Evidence.query.get_or_404(evidence_id)
    req_data = request.get_json() or {}
    requested_mode = req_data.get('mode', 'demo')  # 'demo' or 'real_ai'

    file_path = str(Config.UPLOAD_FOLDER / evidence.stored_filename)
    if not os.path.exists(file_path):
        return jsonify({'error': 'Evidence file binary not found on disk'}), 404

    evidence.status = 'Analyzing'
    db.session.commit()

    try:
        if evidence.file_type == 'image':
            # Run image analysis
            res = DemoEngine.analyze_image(file_path, evidence.filename, Config.FRAMES_FOLDER)
            
            # If real RT-DETR was requested and available
            if requested_mode == 'real_ai' and rtdetr_svc.is_available:
                rtdetr_res = rtdetr_svc.detect_objects(file_path)
                if rtdetr_res.get('success'):
                    res['detected_objects'] = rtdetr_res['detections']
                    res['model_used'] = 'RT-DETR (Real Inference)'
                    res['is_simulated'] = False
                    res['analysis_mode'] = 'real_ai'

        elif evidence.file_type == 'video':
            # Run video analysis (samples frames with OpenCV)
            sample_interval = float(req_data.get('sample_interval', 3.0))
            res = DemoEngine.analyze_video(file_path, evidence.filename, Config.FRAMES_FOLDER, sample_interval)

        elif evidence.file_type == 'audio':
            # If real Whisper was requested and available
            if requested_mode == 'real_ai' and whisper_svc.is_available():
                whisper_res = whisper_svc.transcribe(file_path)
                if whisper_res.get('success'):
                    res = {
                        "analysis_mode": "real_ai",
                        "model_used": whisper_res.get('model_used', 'Whisper'),
                        "summary": f"Whisper speech-to-text transcript generated with {len(whisper_res.get('segments', []))} utterances.",
                        "scene_description": "Audio stream transcribed via real Whisper model.",
                        "detected_objects": [],
                        "transcription": whisper_res.get('transcription', ''),
                        "audio_segments": whisper_res.get('segments', []),
                        "video_frames": [],
                        "risk_assessment": {"acoustic_evaluation": "Audio transcription complete."},
                        "timeline_events": [
                            {
                                "timestamp_str": seg["start"],
                                "source_type": "audio",
                                "title": f"Audio: {seg['speaker']}",
                                "description": seg["text"],
                                "confidence": seg["confidence"],
                                "tags": ["whisper_transcript"]
                            }
                            for seg in whisper_res.get('segments', [])
                        ],
                        "is_simulated": False
                    }
                else:
                    res = DemoEngine.analyze_audio(file_path, evidence.filename)
            else:
                res = DemoEngine.analyze_audio(file_path, evidence.filename)
        else:
            return jsonify({'error': f'Unsupported file type: {evidence.file_type}'}), 400

        # Save AnalysisResult to DB
        import json
        analysis_record = AnalysisResult(
            evidence_id=evidence.id,
            analysis_mode=res.get('analysis_mode', 'demo'),
            model_used=res.get('model_used', 'Demo Engine'),
            summary=res.get('summary', ''),
            scene_description=res.get('scene_description', ''),
            detected_objects_json=json.dumps(res.get('detected_objects', [])),
            transcription=res.get('transcription', ''),
            audio_segments_json=json.dumps(res.get('audio_segments', [])),
            video_frames_json=json.dumps(res.get('video_frames', [])),
            risk_assessment_json=json.dumps(res.get('risk_assessment', {})),
            is_simulated=res.get('is_simulated', True)
        )
        db.session.add(analysis_record)

        # Automatically populate timeline events if generated by video/audio analysis
        new_timeline_events = res.get('timeline_events', [])
        for evt in new_timeline_events:
            tl = TimelineEvent(
                case_id=evidence.case_id,
                evidence_id=evidence.id,
                timestamp_str=evt.get('timestamp_str', '00:00'),
                source_type=evt.get('source_type', evidence.file_type),
                title=evt.get('title', 'Forensic Event'),
                description=evt.get('description', ''),
                confidence=evt.get('confidence'),
                tags_json=json.dumps(evt.get('tags', []))
            )
            db.session.add(tl)

        evidence.status = 'Analyzed'
        db.session.commit()

        return jsonify({
            'message': 'Forensic analysis completed',
            'analysis': analysis_record.to_dict(),
            'timeline_events_added': len(new_timeline_events)
        })

    except Exception as e:
        evidence.status = 'Error'
        db.session.commit()
        return jsonify({'error': f'Analysis error: {str(e)}'}), 500


# ==========================================
# 5. UNIFIED TIMELINE
# ==========================================

@app.route('/api/cases/<int:case_id>/timeline', methods=['GET'])
def get_case_timeline(case_id):
    case_obj = Case.query.get_or_404(case_id)
    events = TimelineEvent.query.filter_by(case_id=case_obj.id).order_by(TimelineEvent.timestamp_str.asc()).all()
    return jsonify({'timeline': [ev.to_dict() for ev in events]})


@app.route('/api/cases/<int:case_id>/timeline', methods=['POST'])
def add_timeline_event(case_id):
    case_obj = Case.query.get_or_404(case_id)
    data = request.get_json() or {}
    
    title = data.get('title', '').strip()
    if not title:
        return jsonify({'error': 'Event title is required'}), 400

    import json
    new_event = TimelineEvent(
        case_id=case_obj.id,
        evidence_id=data.get('evidence_id'),
        timestamp_str=data.get('timestamp_str', '00:00:00'),
        source_type=data.get('source_type', 'investigator_note'),
        title=title,
        description=data.get('description', ''),
        confidence=data.get('confidence'),
        tags_json=json.dumps(data.get('tags', []))
    )
    db.session.add(new_event)
    db.session.commit()

    return jsonify({'message': 'Timeline event added', 'event': new_event.to_dict()}), 201


@app.route('/api/timeline/<int:event_id>', methods=['DELETE'])
def delete_timeline_event(event_id):
    event = TimelineEvent.query.get_or_404(event_id)
    db.session.delete(event)
    db.session.commit()
    return jsonify({'message': 'Timeline event deleted'})


# ==========================================
# 6. AI FORENSIC EVIDENCE CHAT
# ==========================================

@app.route('/api/cases/<int:case_id>/chat', methods=['POST'])
def chat_case(case_id):
    case_obj = Case.query.get_or_404(case_id)
    data = request.get_json() or {}
    query = data.get('message', '').strip()
    chat_history = data.get('history', [])

    if not query:
        return jsonify({'error': 'Chat message is required'}), 400

    evidence_list = [e.to_dict() for e in case_obj.evidence_items]
    timeline_events = [t.to_dict() for t in case_obj.timeline_events]

    reply_data = groq_svc.chat_about_case(
        case_data=case_obj.to_dict(),
        evidence_list=evidence_list,
        timeline_events=timeline_events,
        user_message=query,
        chat_history=chat_history
    )

    return jsonify(reply_data)


# ==========================================
# 7. FORENSIC PDF REPORT GENERATION
# ==========================================

@app.route('/api/cases/<int:case_id>/report', methods=['GET'])
def download_case_report(case_id):
    case_obj = Case.query.get_or_404(case_id)
    evidence_list = [e.to_dict() for e in case_obj.evidence_items]
    timeline_list = [t.to_dict() for t in case_obj.timeline_events]

    report_filename = f"Forensic_Report_{case_obj.case_number}.pdf"
    report_path = Config.REPORTS_FOLDER / report_filename

    try:
        ForensicReportGenerator.generate_case_report(
            case_dict=case_obj.to_dict(),
            evidence_list=evidence_list,
            timeline_list=timeline_list,
            output_path=report_path
        )
        return send_file(
            str(report_path),
            mimetype='application/pdf',
            as_attachment=True,
            download_name=report_filename
        )
    except Exception as e:
        return jsonify({'error': f'Failed to generate PDF report: {str(e)}'}), 500


# ==========================================
# 8. SEED DEMO CASE FOR INSTANT DEMONSTRATION
# ==========================================

@app.route('/api/seed-demo', methods=['POST'])
def seed_demo_data():
    """Seeds a realistic forensic sample case with synthetic evidence files so users can test immediately."""
    from seed_demo import run_seed
    result = run_seed()
    return jsonify(result)


if __name__ == '__main__':
    # Run Flask on port 5000
    app.run(host='127.0.0.1', port=5000, debug=True)
