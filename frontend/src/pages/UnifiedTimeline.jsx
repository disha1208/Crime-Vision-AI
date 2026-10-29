import React, { useState } from 'react';
import {
  Clock,
  Plus,
  FileImage,
  FileVideo,
  FileAudio,
  FileText,
  Filter,
  Trash2,
  Calendar,
  Tag,
  CheckCircle2
} from 'lucide-react';
import { StatusBadge } from '../components/Badge';

export default function UnifiedTimeline({
  activeCase,
  timeline,
  onAddTimelineEvent,
  onDeleteTimelineEvent,
  onNavigate
}) {
  const [filterSource, setFilterSource] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [eventForm, setEventForm] = useState({
    timestamp_str: '22:15:00',
    title: '',
    description: '',
    source_type: 'investigator_note',
    confidence: 0.90,
    tags_str: 'investigation, physical_evidence'
  });

  const filteredTimeline = timeline.filter((ev) => {
    if (filterSource === 'all') return true;
    return ev.source_type === filterSource;
  });

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!eventForm.title.trim() || !activeCase) return;

    const tags = eventForm.tags_str
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    await onAddTimelineEvent(activeCase.id, {
      timestamp_str: eventForm.timestamp_str,
      title: eventForm.title,
      description: eventForm.description,
      source_type: eventForm.source_type,
      confidence: parseFloat(eventForm.confidence) || null,
      tags: tags
    });

    setShowAddModal(false);
    setEventForm({
      timestamp_str: '22:15:00',
      title: '',
      description: '',
      source_type: 'investigator_note',
      confidence: 0.90,
      tags_str: 'investigation, physical_evidence'
    });
  };

  const getSourceIcon = (type) => {
    switch (type) {
      case 'image':
        return <FileImage size={15} color="#38bdf8" />;
      case 'video':
        return <FileVideo size={15} color="#818cf8" />;
      case 'audio':
        return <FileAudio size={15} color="#34d399" />;
      default:
        return <FileText size={15} color="#fbbf24" />;
    }
  };

  if (!activeCase) {
    return (
      <div className="page-content animate-fade-in" style={{ padding: '60px', textAlign: 'center' }}>
        <Clock size={40} style={{ color: 'var(--text-dim)', marginBottom: '16px' }} />
        <h3 style={{ color: '#ffffff', marginBottom: '8px' }}>No Investigation Case Selected</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
          Select a case dossier to view its unified chronological timeline.
        </p>
        <button onClick={() => onNavigate('cases')} className="btn btn-primary">
          Go to Cases & Evidence
        </button>
      </div>
    );
  }

  return (
    <div className="page-content animate-fade-in">
      {/* Header & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>
            Unified Multimodal Chronological Timeline
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Case <span className="font-mono text-cyan">{activeCase.case_number}</span> &bull; Synchronized temporal reconstruction across all ingested media.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Source Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.3)', padding: '3px 8px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <Filter size={13} color="var(--text-muted)" />
            <select
              className="form-select"
              style={{ background: 'transparent', border: 'none', padding: '4px', fontSize: '0.78rem', color: 'var(--text-main)' }}
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
            >
              <option value="all" style={{ background: '#0f192c' }}>All Media Sources</option>
              <option value="image" style={{ background: '#0f192c' }}>CCTV / Images</option>
              <option value="video" style={{ background: '#0f192c' }}>Video Keyframes</option>
              <option value="audio" style={{ background: '#0f192c' }}>Audio Transcripts</option>
              <option value="investigator_note" style={{ background: '#0f192c' }}>Examiner Notes</option>
            </select>
          </div>

          <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
            <Plus size={15} />
            <span>Add Event Marker</span>
          </button>
        </div>
      </div>

      {/* Timeline Stream Container */}
      <div className="forensic-card">
        {filteredTimeline.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Clock size={32} style={{ color: 'var(--text-dim)', marginBottom: '8px' }} />
            <p style={{ fontSize: '0.85rem' }}>
              No timeline events recorded yet. Run multimodal analysis on evidence or add manual event markers.
            </p>
          </div>
        ) : (
          <div style={{ position: 'relative', paddingLeft: '28px', margin: '10px 0' }}>
            {/* Vertical timeline backbone rule */}
            <div
              style={{
                position: 'absolute',
                left: '11px',
                top: '12px',
                bottom: '12px',
                width: '2px',
                background: 'linear-gradient(to bottom, #00d4ff, #2563eb, #1e293b)'
              }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredTimeline.map((item) => (
                <div key={item.id} style={{ position: 'relative' }}>
                  {/* Timeline Node Dot */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '-23px',
                      top: '14px',
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      background: '#070d17',
                      border: '2px solid #00d4ff',
                      boxShadow: '0 0 8px rgba(0, 212, 255, 0.5)',
                      zIndex: 2
                    }}
                  />

                  {/* Event Card */}
                  <div
                    style={{
                      padding: '14px 18px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)',
                      transition: 'border-color 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="font-mono" style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: 'rgba(0, 212, 255, 0.12)',
                          color: 'var(--accent-cyan)',
                          fontSize: '0.78rem',
                          fontWeight: 700
                        }}>
                          {item.timestamp_str}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {getSourceIcon(item.source_type)}
                          <span style={{ textTransform: 'capitalize' }}>{item.source_type.replace('_', ' ')}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {item.confidence && (
                          <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>
                            {Math.round(item.confidence * 100)}% Conf
                          </span>
                        )}
                        <button
                          onClick={() => onDeleteTimelineEvent(item.id)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
                          title="Delete Event"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <h4 style={{ fontSize: '0.92rem', fontWeight: 600, color: '#ffffff', marginBottom: '4px' }}>
                      {item.title}
                    </h4>

                    <p style={{ fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.45, marginBottom: '8px' }}>
                      {item.description}
                    </p>

                    {item.tags && item.tags.length > 0 && (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {item.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: '0.68rem',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: 'rgba(255, 255, 255, 0.04)',
                              color: 'var(--text-dim)',
                              border: '1px solid var(--border-subtle)'
                            }}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Timeline Event Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
                Insert Forensic Timeline Marker
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Timestamp (HH:MM:SS / Rel)</label>
                    <input
                      type="text"
                      className="form-input font-mono"
                      value={eventForm.timestamp_str}
                      onChange={(e) => setEventForm({ ...eventForm, timestamp_str: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Source Type</label>
                    <select
                      className="form-select"
                      value={eventForm.source_type}
                      onChange={(e) => setEventForm({ ...eventForm, source_type: e.target.value })}
                    >
                      <option value="investigator_note">Investigator Note</option>
                      <option value="image">CCTV / Photo</option>
                      <option value="video">Video Keyframe</option>
                      <option value="audio">Audio Transmission</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Event Heading</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Breach Tool Impact on Lock Mechanism"
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Observation Narrative</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Specific physical or temporal details observed by examiner..."
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Confidence Index (0.0 to 1.0)</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.1"
                    max="1.0"
                    className="form-input"
                    value={eventForm.confidence}
                    onChange={(e) => setEventForm({ ...eventForm, confidence: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Forensic Tags (comma-separated)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. forced_entry, toolmark, perimeter_sensor"
                    value={eventForm.tags_str}
                    onChange={(e) => setEventForm({ ...eventForm, tags_str: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Append to Timeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
