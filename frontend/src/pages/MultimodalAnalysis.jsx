import React, { useState } from 'react';
import {
  Cpu,
  FileImage,
  FileVideo,
  FileAudio,
  Play,
  Layers,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Sparkles,
  Info,
  ShieldAlert,
  Hash,
  ChevronRight
} from 'lucide-react';
import { StatusBadge } from '../components/Badge';

export default function MultimodalAnalysis({
  activeCase,
  evidenceList,
  onAnalyzeEvidence,
  onNavigate
}) {
  const [selectedEvidenceId, setSelectedEvidenceId] = useState(
    evidenceList.length > 0 ? evidenceList[0].id : null
  );
  const [analysisMode, setAnalysisMode] = useState('demo'); // 'demo' or 'real_ai'
  const [sampleInterval, setSampleInterval] = useState(3.0);
  const [analyzing, setAnalyzing] = useState(false);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);

  // Find currently selected evidence
  const selectedEvidence = evidenceList.find(e => e.id === selectedEvidenceId) || evidenceList[0];
  const analysis = selectedEvidence?.analysis;

  const handleRunAnalysis = async () => {
    if (!selectedEvidence) return;
    setAnalyzing(true);
    try {
      await onAnalyzeEvidence(selectedEvidence.id, {
        mode: analysisMode,
        sample_interval: sampleInterval
      });
    } catch (err) {
      alert(`Analysis error: ${err.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  if (!activeCase) {
    return (
      <div className="page-content animate-fade-in" style={{ padding: '60px', textAlign: 'center' }}>
        <Cpu size={40} style={{ color: 'var(--text-dim)', marginBottom: '16px' }} />
        <h3 style={{ color: '#ffffff', marginBottom: '8px' }}>No Investigation Case Selected</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
          Select or load a case dossier to conduct multimodal forensic analysis.
        </p>
        <button onClick={() => onNavigate('cases')} className="btn btn-primary">
          Go to Cases & Evidence
        </button>
      </div>
    );
  }

  return (
    <div className="page-content animate-fade-in">
      {/* Top Banner and AI Mode Toggle */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '10px',
        padding: '16px 20px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '8px',
            background: 'linear-gradient(135deg, #1e3a8a, #00d4ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
          }}>
            <Cpu size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
              Multimodal Neural Forensic Pipeline
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Case <span className="font-mono text-cyan">{activeCase.case_number}</span> &bull; Object Detection, Temporal Keyframing & Acoustic Diarization
            </div>
          </div>
        </div>

        {/* Mode Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => setAnalysisMode('demo')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: analysisMode === 'demo' ? 'var(--accent-blue)' : 'transparent',
                color: analysisMode === 'demo' ? '#ffffff' : 'var(--text-muted)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Demo Heuristic Mode
            </button>
            <button
              onClick={() => setAnalysisMode('real_ai')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: analysisMode === 'real_ai' ? 'linear-gradient(135deg, #7c3aed, #2563eb)' : 'transparent',
                color: analysisMode === 'real_ai' ? '#ffffff' : 'var(--text-muted)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Real AI Mode (RT-DETR/Whisper)
            </button>
          </div>

          <button
            onClick={handleRunAnalysis}
            disabled={analyzing || !selectedEvidence}
            className="btn btn-primary"
          >
            <Sparkles size={14} />
            <span>{analyzing ? 'Analyzing Artifact...' : 'Execute Analysis'}</span>
          </button>
        </div>
      </div>

      {/* Main Two Column Analysis Workspace */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '20px' }}>
        {/* Left Column: Evidence Artifact Selector */}
        <div className="forensic-card" style={{ height: 'fit-content' }}>
          <div className="card-header-flex">
            <div className="card-title" style={{ fontSize: '0.9rem' }}>
              <Layers size={16} color="var(--accent-cyan)" />
              <span>Evidence Items ({evidenceList.length})</span>
            </div>
          </div>

          {evidenceList.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              No evidence uploaded. Ingest an image, video, or audio file in Case & Evidence.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {evidenceList.map((item) => {
                const isSelected = selectedEvidence && selectedEvidence.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedEvidenceId(item.id)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: isSelected ? 'rgba(37,99,235,0.2)' : 'rgba(255,255,255,0.02)',
                      border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {item.file_type === 'image' && <FileImage size={14} color="#38bdf8" />}
                        {item.file_type === 'video' && <FileVideo size={14} color="#818cf8" />}
                        {item.file_type === 'audio' && <FileAudio size={14} color="#34d399" />}
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#ffffff' }}>
                          {item.filename.length > 18 ? item.filename.slice(0, 18) + '...' : item.filename}
                        </span>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Hash: {item.sha256_hash.slice(0, 10)}...
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Configurable Video Sampling Controls if Video selected */}
          {selectedEvidence && selectedEvidence.file_type === 'video' && (
            <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(0,0,0,0.25)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#ffffff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sliders size={14} color="var(--accent-cyan)" />
                <span>Video Keyframe Sampling</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Interval: <strong style={{ color: 'var(--accent-cyan)' }}>{sampleInterval}s</strong>
              </div>
              <input
                type="range"
                min="1.0"
                max="8.0"
                step="0.5"
                value={sampleInterval}
                onChange={(e) => setSampleInterval(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                <span>1s (Dense)</span>
                <span>8s (Sparse)</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Detailed Analysis Workspace */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {selectedEvidence ? (
            <>
              {/* Evidence Banner & SHA-256 Custody */}
              <div className="forensic-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
                        {selectedEvidence.filename}
                      </h3>
                      <StatusBadge status={selectedEvidence.file_type} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Cryptographic SHA-256 Chain of Custody: <span className="font-mono" style={{ color: 'var(--accent-cyan)' }}>{selectedEvidence.sha256_hash}</span>
                    </div>
                  </div>

                  {analysis && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {analysis.is_simulated ? (
                        <span className="badge badge-purple" style={{ padding: '6px 10px', fontSize: '0.75rem' }}>
                          <AlertTriangle size={12} /> SIMULATED / DEMO MODE
                        </span>
                      ) : (
                        <span className="badge badge-green" style={{ padding: '6px 10px', fontSize: '0.75rem' }}>
                          <CheckCircle2 size={12} /> REAL AI INFERENCE
                        </span>
                      )}
                      <span className="badge badge-blue" style={{ padding: '6px 10px', fontSize: '0.75rem' }}>
                        {analysis.model_used}
                      </span>
                    </div>
                  )}
                </div>

                {/* Simulated Mode Disclaimer as required */}
                {analysis && analysis.is_simulated && (
                  <div style={{
                    marginTop: '12px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: 'rgba(139, 92, 246, 0.08)',
                    border: '1px solid rgba(139, 92, 246, 0.25)',
                    fontSize: '0.75rem',
                    color: '#c4b5fd',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Info size={14} />
                    <span>
                      <strong>Forensic Disclosure:</strong> Results generated via simulated forensic heuristics in Demo Mode without external model weights. Never presented as verified crime proof.
                    </span>
                  </div>
                )}
              </div>

              {/* Analysis Results Display */}
              {analysis ? (
                <>
                  {/* 1. IMAGE FORENSIC VIEW */}
                  {selectedEvidence.file_type === 'image' && (
                    <div className="forensic-card">
                      <div className="card-header-flex">
                        <div className="card-title">
                          <FileImage size={18} color="#38bdf8" />
                          <span>Object Detection & Scene Segmentation</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={showBoundingBoxes}
                              onChange={(e) => setShowBoundingBoxes(e.target.checked)}
                            />
                            Show RT-DETR Bounding Boxes
                          </label>
                        </div>
                      </div>

                      {/* Visual Viewer with Bounding Boxes */}
                      <div style={{
                        position: 'relative',
                        background: '#04070d',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: '1px solid var(--border-subtle)',
                        maxHeight: '440px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '16px'
                      }}>
                        <img
                          src={`/api/uploads/${selectedEvidence.stored_filename}`}
                          alt="Forensic Frame"
                          style={{ maxWidth: '100%', maxHeight: '420px', objectFit: 'contain' }}
                        />

                        {/* Bounding Box Visual Overlays */}
                        {showBoundingBoxes && analysis.detected_objects?.map((obj) => {
                          const [x, y, w, h] = obj.bbox || [0, 0, 0, 0];
                          // Simple responsive box indicator
                          return (
                            <div
                              key={obj.id}
                              style={{
                                position: 'absolute',
                                left: `${Math.min(80, Math.max(10, (x / 1280) * 100))}%`,
                                top: `${Math.min(75, Math.max(15, (y / 720) * 100))}%`,
                                width: `${Math.min(50, Math.max(15, (w / 1280) * 100))}%`,
                                height: `${Math.min(60, Math.max(20, (h / 720) * 100))}%`,
                                border: '2px solid #00d4ff',
                                background: 'rgba(0, 212, 255, 0.12)',
                                pointerEvents: 'none',
                                borderRadius: '4px',
                                boxSizing: 'border-box'
                              }}
                            >
                              <div style={{
                                position: 'absolute',
                                top: '-22px',
                                left: 0,
                                background: '#00d4ff',
                                color: '#04070d',
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                padding: '1px 6px',
                                borderRadius: '3px',
                                whiteSpace: 'nowrap'
                              }}>
                                {obj.label} ({Math.round(obj.confidence * 100)}%)
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Detections List */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                        {analysis.detected_objects?.map((obj) => (
                          <div
                            key={obj.id}
                            style={{
                              padding: '12px',
                              borderRadius: '8px',
                              background: 'rgba(255,255,255,0.02)',
                              border: '1px solid var(--border-subtle)'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
                                {obj.label}
                              </span>
                              <span className="badge badge-cyan">
                                {Math.round(obj.confidence * 100)}% Conf
                              </span>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Category: <strong style={{ color: '#93c5fd' }}>{obj.category}</strong>
                            </div>
                            {obj.attributes && (
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                                {Object.entries(obj.attributes).map(([k, v]) => (
                                  <div key={k}>{k.replace('_', ' ')}: {String(v)}</div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Scene Description & Summary */}
                      <div style={{ padding: '14px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-cyan)', marginBottom: '4px' }}>
                          BLIP Scene Telemetry & Narrative:
                        </div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                          {analysis.scene_description}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 2. VIDEO FORENSIC VIEW */}
                  {selectedEvidence.file_type === 'video' && (
                    <div className="forensic-card">
                      <div className="card-header-flex">
                        <div className="card-title">
                          <FileVideo size={18} color="#818cf8" />
                          <span>Sampled Video Keyframes & Temporal Sequence</span>
                        </div>
                        <span className="badge badge-purple font-mono">
                          Interval: {sampleInterval}s
                        </span>
                      </div>

                      {/* Keyframe Gallery */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', marginBottom: '16px' }}>
                        {analysis.video_frames?.map((frame, idx) => (
                          <div
                            key={idx}
                            style={{
                              borderRadius: '8px',
                              overflow: 'hidden',
                              background: 'rgba(0,0,0,0.3)',
                              border: '1px solid var(--border-subtle)'
                            }}
                          >
                            <div style={{ height: '140px', background: '#0a101d', overflow: 'hidden', position: 'relative' }}>
                              <img
                                src={`/api/uploads/frames/${frame.frame_file}`}
                                alt={`Frame ${frame.timestamp_str}`}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => {
                                  // Fallback placeholder if image not rendered
                                  e.target.style.display = 'none';
                                }}
                              />
                              <div style={{
                                position: 'absolute',
                                top: '8px',
                                left: '8px',
                                background: 'rgba(0,0,0,0.7)',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '0.72rem',
                                color: 'var(--accent-cyan)',
                                fontWeight: 700
                              }}>
                                <Clock size={10} style={{ display: 'inline', marginRight: '3px' }} />
                                {frame.timestamp_str}
                              </div>
                            </div>
                            <div style={{ padding: '10px 12px' }}>
                              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#ffffff', marginBottom: '4px' }}>
                                Keyframe #{frame.frame_index}
                              </div>
                              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                                {frame.scene_note}
                              </p>
                              <div style={{ marginTop: '6px', display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                                <span>{frame.detection_count} detections</span>
                                <span>{Math.round(frame.confidence * 100)}% conf</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Video Narrative Summary */}
                      <div style={{ padding: '14px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#818cf8', marginBottom: '4px' }}>
                          Temporal Reconstruction Summary:
                        </div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                          {analysis.summary}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 3. AUDIO FORENSIC VIEW */}
                  {selectedEvidence.file_type === 'audio' && (
                    <div className="forensic-card">
                      <div className="card-header-flex">
                        <div className="card-title">
                          <FileAudio size={18} color="#34d399" />
                          <span>Whisper Acoustic Diarization & Transcripts</span>
                        </div>
                        <span className="badge badge-green font-mono">
                          Diarized Channels
                        </span>
                      </div>

                      {/* Audio Player */}
                      <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                        <audio
                          controls
                          src={`/api/uploads/${selectedEvidence.stored_filename}`}
                          style={{ width: '100%', height: '36px' }}
                        />
                      </div>

                      {/* Utterance Segments */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                        {analysis.audio_segments?.map((seg) => (
                          <div
                            key={seg.id}
                            style={{
                              padding: '12px 14px',
                              borderRadius: '8px',
                              background: 'rgba(255,255,255,0.02)',
                              border: '1px solid var(--border-subtle)',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '12px'
                            }}
                          >
                            <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', background: 'rgba(0,212,255,0.1)', padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                              {seg.start} - {seg.end}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#93c5fd' }}>
                                  {seg.speaker}
                                </span>
                                <span className="badge badge-green" style={{ fontSize: '0.68rem' }}>
                                  {Math.round(seg.confidence * 100)}% conf
                                </span>
                              </div>
                              <p style={{ fontSize: '0.82rem', color: '#ffffff', lineHeight: 1.4 }}>
                                "{seg.text}"
                              </p>
                              {seg.sentiment && (
                                <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                                  Tone index: {seg.sentiment}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Full Transcript Block */}
                      <div style={{ padding: '14px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#34d399', marginBottom: '4px' }}>
                          Composite Transcript:
                        </div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                          {analysis.transcription}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Risk Assessment Box */}
                  <div className="forensic-card" style={{ background: 'rgba(245, 158, 11, 0.03)', borderColor: 'rgba(245, 158, 11, 0.2)' }}>
                    <div className="card-header-flex">
                      <div className="card-title" style={{ color: '#fbbf24' }}>
                        <ShieldAlert size={18} />
                        <span>Investigative Risk & Threat Assessment</span>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                      <div><strong>Threat Level:</strong> {analysis.risk_assessment?.threat_level || 'Evaluated'}</div>
                      {analysis.risk_assessment?.anomalies_detected && (
                        <div style={{ marginTop: '6px' }}>
                          <strong>Flagged Anomalies:</strong>
                          <ul style={{ paddingLeft: '20px', marginTop: '4px' }}>
                            {analysis.risk_assessment.anomalies_detected.map((a, i) => (
                              <li key={i}>{a}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="forensic-card" style={{ padding: '48px', textAlign: 'center' }}>
                  <Cpu size={36} style={{ color: 'var(--accent-cyan)', marginBottom: '12px' }} />
                  <h3 style={{ color: '#ffffff', marginBottom: '6px' }}>
                    Evidence Ingested & Pending Analysis
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px', maxWidth: '440px', margin: '0 auto 20px auto' }}>
                    Run the multimodal pipeline to extract object bounding boxes, keyframe sequences, and audio transcripts.
                  </p>
                  <button
                    onClick={handleRunAnalysis}
                    disabled={analyzing}
                    className="btn btn-primary"
                  >
                    <Sparkles size={16} />
                    <span>{analyzing ? 'Analyzing...' : 'Run Forensic Analysis Now'}</span>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="forensic-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No evidence artifact available for analysis.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
