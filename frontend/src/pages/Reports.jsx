import React, { useState } from 'react';
import {
  FileText,
  Download,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  Hash,
  AlertTriangle,
  Printer
} from 'lucide-react';
import { StatusBadge } from '../components/Badge';

export default function Reports({ activeCase, evidenceList, timeline, onNavigate }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadReport = () => {
    if (!activeCase) return;
    setDownloading(true);
    // Trigger direct download of the generated ReportLab PDF
    window.location.href = `/api/cases/${activeCase.id}/report`;
    setTimeout(() => setDownloading(false), 2000);
  };

  if (!activeCase) {
    return (
      <div className="page-content animate-fade-in" style={{ padding: '60px', textAlign: 'center' }}>
        <FileText size={40} style={{ color: 'var(--text-dim)', marginBottom: '16px' }} />
        <h3 style={{ color: '#ffffff', marginBottom: '8px' }}>No Investigation Case Selected</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
          Select a case dossier to preview and compile certified forensic reports.
        </p>
        <button onClick={() => onNavigate('cases')} className="btn btn-primary">
          Select Case Dossier
        </button>
      </div>
    );
  }

  const analyzedCount = evidenceList.filter(e => e.status === 'Analyzed').length;

  return (
    <div className="page-content animate-fade-in">
      {/* Header & Download Bar */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '10px',
        padding: '18px 24px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '8px',
            background: 'linear-gradient(135deg, #1e3a8a, #00d4ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
          }}>
            <FileText size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
              Forensic Examination & Evidence Report
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Official Court Dossier for <span className="font-mono text-cyan">{activeCase.case_number}</span> &bull; ReportLab PDF Engine
            </div>
          </div>
        </div>

        <button
          onClick={handleDownloadReport}
          disabled={downloading}
          className="btn btn-primary"
          style={{ padding: '10px 20px', fontSize: '0.9rem' }}
        >
          <Download size={16} />
          <span>{downloading ? 'Compiling PDF...' : 'Download Official PDF Report'}</span>
        </button>
      </div>

      {/* Report Preview Document */}
      <div className="forensic-card" style={{ maxWidth: '900px', margin: '0 auto', background: '#0a101d', border: '1px solid rgba(0, 212, 255, 0.25)', boxShadow: '0 12px 36px rgba(0,0,0,0.5)' }}>
        {/* Document Header */}
        <div style={{ borderBottom: '2px solid #1e3a8a', paddingBottom: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent-cyan)', fontWeight: 700 }}>
              CRIMEVISION FORENSIC PLATFORM &bull; CHAIN OF CUSTODY REPORT
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
              FORENSIC INVESTIGATION REPORT
            </h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Case File: <strong style={{ color: '#ffffff' }}>{activeCase.title}</strong>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="badge badge-red" style={{ fontSize: '0.75rem', marginBottom: '4px' }}>
              LAW ENFORCEMENT SENSITIVE
            </span>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Docket: <span className="font-mono">{activeCase.case_number}</span>
            </div>
          </div>
        </div>

        {/* Section 1: Case Summary */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--accent-cyan)', letterSpacing: '0.05em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>1. Investigation Case Dossier</span>
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '0.82rem' }}>
            <div><span style={{ color: 'var(--text-muted)' }}>Case Number:</span> <strong className="font-mono text-cyan">{activeCase.case_number}</strong></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Status:</span> <strong>{activeCase.status}</strong></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Incident Date:</span> <strong>{activeCase.incident_date || 'N/A'}</strong></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Priority:</span> <strong>{activeCase.priority}</strong></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Location:</span> <strong>{activeCase.location || 'N/A'}</strong></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Lead Examiner:</span> <strong>{activeCase.lead_investigator || 'Unassigned'}</strong></div>
          </div>
          {activeCase.description && (
            <p style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              <strong>Case Narrative:</strong> {activeCase.description}
            </p>
          )}
        </div>

        {/* Section 2: Chain of Custody & Hashes */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--accent-cyan)', letterSpacing: '0.05em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Hash size={14} />
            <span>2. Evidence Registry & SHA-256 Cryptographic Hashes ({evidenceList.length})</span>
          </h4>
          <table className="forensic-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Format</th>
                <th>Filename</th>
                <th>SHA-256 Hash</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {evidenceList.map((ev, i) => (
                <tr key={ev.id}>
                  <td>#{i + 1}</td>
                  <td><StatusBadge status={ev.file_type} /></td>
                  <td style={{ color: '#fff', fontWeight: 600 }}>{ev.filename}</td>
                  <td className="font-mono" style={{ fontSize: '0.72rem', color: '#93c5fd' }}>
                    {ev.sha256_hash}
                  </td>
                  <td><StatusBadge status={ev.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section 3: Analysis Findings */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--accent-cyan)', letterSpacing: '0.05em', marginBottom: '10px' }}>
            3. Multimodal Forensic Analysis Findings
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {evidenceList.filter(e => e.analysis).map((item) => (
              <div key={item.id} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong style={{ color: '#ffffff' }}>{item.filename} ({item.file_type.toUpperCase()})</strong>
                  <span className="badge badge-purple">{item.analysis.model_used}</span>
                </div>
                <div style={{ color: 'var(--text-main)', marginBottom: '4px' }}>
                  <strong>Summary:</strong> {item.analysis.summary}
                </div>
                {item.analysis.scene_description && (
                  <div style={{ color: 'var(--text-muted)' }}>
                    <strong>Telemetry:</strong> {item.analysis.scene_description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Timeline Reconstruction */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--accent-cyan)', letterSpacing: '0.05em', marginBottom: '10px' }}>
            4. Unified Chronological Timeline ({timeline.length} Markers)
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {timeline.slice(0, 5).map((t) => (
              <div key={t.id} style={{ display: 'flex', gap: '10px', fontSize: '0.78rem' }}>
                <span className="font-mono" style={{ color: 'var(--accent-cyan)', width: '70px', flexShrink: 0 }}>
                  [{t.timestamp_str}]
                </span>
                <span style={{ color: '#ffffff', fontWeight: 600 }}>{t.title}:</span>
                <span style={{ color: 'var(--text-muted)' }}>{t.description}</span>
              </div>
            ))}
            {timeline.length > 5 && (
              <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                + {timeline.length - 5} additional chronological markers included in compiled PDF report...
              </div>
            )}
          </div>
        </div>

        {/* Section 5: Legal & AI Limitations Disclaimer */}
        <div style={{ padding: '14px', background: 'rgba(239, 68, 68, 0.04)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
          <div style={{ fontWeight: 700, color: '#f87171', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={14} />
            <span>Forensic Integrity, AI Limitations & Judicial Disclaimers</span>
          </div>
          All evidence binaries have been hashed using cryptographic SHA-256 algorithms upon ingestion. Multimodal AI outputs (RT-DETR, Whisper, BLIP, CLIP) represent algorithmic hypotheses and confidence indices; they do NOT constitute legal proof of guilt. All electronic records must be corroborated by a certified digital forensics examiner.
        </div>
      </div>
    </div>
  );
}
