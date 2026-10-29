from datetime import datetime
import json
from database import db

class Case(db.Model):
    __tablename__ = 'cases'
    
    id = db.Column(db.Integer, primary_key=True)
    case_number = db.Column(db.String(64), unique=True, nullable=False, index=True)
    title = db.Column(db.String(256), nullable=False)
    description = db.Column(db.Text, default='')
    incident_date = db.Column(db.String(64), default='')
    location = db.Column(db.String(256), default='')
    status = db.Column(db.String(32), default='Active')  # Active, Under Review, Solved, Archived
    priority = db.Column(db.String(32), default='Medium')  # Low, Medium, High, Critical
    lead_investigator = db.Column(db.String(128), default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    evidence_items = db.relationship('Evidence', backref='case', lazy=True, cascade='all, delete-orphan')
    timeline_events = db.relationship('TimelineEvent', backref='case', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'case_number': self.case_number,
            'title': self.title,
            'description': self.description,
            'incident_date': self.incident_date,
            'location': self.location,
            'status': self.status,
            'priority': self.priority,
            'lead_investigator': self.lead_investigator,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'evidence_count': len(self.evidence_items),
            'timeline_count': len(self.timeline_events)
        }


class Evidence(db.Model):
    __tablename__ = 'evidence'
    
    id = db.Column(db.Integer, primary_key=True)
    case_id = db.Column(db.Integer, db.ForeignKey('cases.id', ondelete='CASCADE'), nullable=False)
    filename = db.Column(db.String(256), nullable=False)
    stored_filename = db.Column(db.String(256), nullable=False)
    file_type = db.Column(db.String(32), nullable=False)  # image, video, audio
    file_size = db.Column(db.Integer, default=0)
    mime_type = db.Column(db.String(128), default='')
    sha256_hash = db.Column(db.String(64), nullable=False, index=True)
    status = db.Column(db.String(32), default='Pending')  # Pending, Analyzed, Error
    notes = db.Column(db.Text, default='')
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    analysis_results = db.relationship('AnalysisResult', backref='evidence', lazy=True, cascade='all, delete-orphan')
    timeline_events = db.relationship('TimelineEvent', backref='evidence', lazy=True)

    def to_dict(self):
        latest_analysis = self.analysis_results[-1].to_dict() if self.analysis_results else None
        return {
            'id': self.id,
            'case_id': self.case_id,
            'filename': self.filename,
            'stored_filename': self.stored_filename,
            'file_type': self.file_type,
            'file_size': self.file_size,
            'mime_type': self.mime_type,
            'sha256_hash': self.sha256_hash,
            'status': self.status,
            'notes': self.notes,
            'uploaded_at': self.uploaded_at.isoformat() if self.uploaded_at else None,
            'analysis': latest_analysis
        }


class AnalysisResult(db.Model):
    __tablename__ = 'analysis_results'
    
    id = db.Column(db.Integer, primary_key=True)
    evidence_id = db.Column(db.Integer, db.ForeignKey('evidence.id', ondelete='CASCADE'), nullable=False)
    analysis_mode = db.Column(db.String(32), default='demo')  # demo, real_ai
    model_used = db.Column(db.String(128), default='Forensic Demo Engine')
    summary = db.Column(db.Text, default='')
    scene_description = db.Column(db.Text, default='')
    detected_objects_json = db.Column(db.Text, default='[]')
    transcription = db.Column(db.Text, default='')
    audio_segments_json = db.Column(db.Text, default='[]')
    video_frames_json = db.Column(db.Text, default='[]')
    risk_assessment_json = db.Column(db.Text, default='{}')
    is_simulated = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        try:
            detected_objects = json.loads(self.detected_objects_json or '[]')
        except Exception:
            detected_objects = []
            
        try:
            audio_segments = json.loads(self.audio_segments_json or '[]')
        except Exception:
            audio_segments = []
            
        try:
            video_frames = json.loads(self.video_frames_json or '[]')
        except Exception:
            video_frames = []
            
        try:
            risk_assessment = json.loads(self.risk_assessment_json or '{}')
        except Exception:
            risk_assessment = {}

        return {
            'id': self.id,
            'evidence_id': self.evidence_id,
            'analysis_mode': self.analysis_mode,
            'model_used': self.model_used,
            'summary': self.summary,
            'scene_description': self.scene_description,
            'detected_objects': detected_objects,
            'transcription': self.transcription,
            'audio_segments': audio_segments,
            'video_frames': video_frames,
            'risk_assessment': risk_assessment,
            'is_simulated': self.is_simulated,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class TimelineEvent(db.Model):
    __tablename__ = 'timeline_events'
    
    id = db.Column(db.Integer, primary_key=True)
    case_id = db.Column(db.Integer, db.ForeignKey('cases.id', ondelete='CASCADE'), nullable=False)
    evidence_id = db.Column(db.Integer, db.ForeignKey('evidence.id', ondelete='SET NULL'), nullable=True)
    timestamp_str = db.Column(db.String(64), nullable=False)  # ISO string or relative time e.g. 00:02:14
    event_time = db.Column(db.DateTime, default=datetime.utcnow)
    source_type = db.Column(db.String(32), default='system')  # image, video, audio, investigator_note
    title = db.Column(db.String(256), nullable=False)
    description = db.Column(db.Text, default='')
    confidence = db.Column(db.Float, nullable=True)
    tags_json = db.Column(db.Text, default='[]')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        try:
            tags = json.loads(self.tags_json or '[]')
        except Exception:
            tags = []
        return {
            'id': self.id,
            'case_id': self.case_id,
            'evidence_id': self.evidence_id,
            'timestamp_str': self.timestamp_str,
            'event_time': self.event_time.isoformat() if self.event_time else None,
            'source_type': self.source_type,
            'title': self.title,
            'description': self.description,
            'confidence': self.confidence,
            'tags': tags,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
