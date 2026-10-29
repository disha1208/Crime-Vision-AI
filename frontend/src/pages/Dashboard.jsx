import React from 'react';
import {
  Briefcase,
  FileCheck2,
  Clock,
  Cpu,
  Shield,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  FileText,
  MessageSquare
} from 'lucide-react';
import { StatusBadge } from '../components/Badge';

export default function Dashboard({ statsData, onNavigate, onSelectCase, activeCase }) {
  const stats = statsData?.stats || {
    total_cases: 0,
    total_evidence: 0,
    analyzed_evidence: 0,
    pending_evidence: 0,
    total_events: 0
  };

  const aiServices = statsData?.ai_services || {};
  const recentCases = statsData?.recent_cases || [];
  const recentEvidence = statsData?.recent_evidence || [];

  return (
    <div className="page-content animate-fade-in">
      {/* Top Banner Notice */}
      <div style={{
        background: 'linear-gradient(90deg, rgba(37,99,235,0.12), rgba(0,212,255,0.06))',
        border: '1px solid rgba(0,212,255,0.25)',
        borderRadius: '10px',
        padding: '16px 20px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(0,212,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)'
          }}>
            <Shield size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
              Forensic Integrity & Multimodal Intelligence Active
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Operating in zero-setup Demo Mode with SHA-256 cryptographic proof. Real AI modules (RT-DETR, Whisper, Groq) ready for optional plug-in.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('cases')}
          className="btn btn-primary btn-sm"
        >
          <span>Manage Cases</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="stats-grid">
        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ background: 'rgba(37,99,235,0.15)', color: '#60a5fa' }}>
            <Briefcase size={22} />
          </div>
          <div>
            <div className="metric-val">{stats.total_cases}</div>
            <div className="metric-label">Active Cases</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ background: 'rgba(0,212,255,0.15)', color: '#38bdf8' }}>
            <FileCheck2 size={22} />
          </div>
          <div>
            <div className="metric-val">{stats.total_evidence}</div>
            <div className="metric-label">Evidence Files Ingested</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399' }}>
            <Cpu size={22} />
          </div>
          <div>
            <div className="metric-val">{stats.analyzed_evidence}</div>
            <div className="metric-label">Analyzed Forensically</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24' }}>
            <Clock size={22} />
          </div>
          <div>
            <div className="metric-val">{stats.total_events}</div>
            <div className="metric-label">Timeline Event Markers</div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Cases + AI Engine Matrix */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '24px', marginBottom: '24px' }}>
        {/* Recent Cases */}
        <div className="forensic-card">
          <div className="card-header-flex">
            <div className="card-title">
              <Briefcase size={18} color="var(--accent-cyan)" />
              <span>Investigation Case Dossiers</span>
            </div>
            <button
              onClick={() => onNavigate('cases')}
              className="btn btn-secondary btn-sm"
            >
              View All
            </button>
          </div>

          {recentCases.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No cases created yet. Click "Load Demo Forensic Case" on the sidebar or create a case.
            </div>
          ) : (
            <table className="forensic-table">
              <thead>
                <tr>
                  <th>Case ID</th>
                  <th>Title</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentCases.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <span className="font-mono" style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
                        {c.case_number}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#ffffff' }}>{c.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.location || 'Location unrecorded'}</div>
                    </td>
                    <td>
                      <StatusBadge status={c.priority} />
                    </td>
                    <td>
                      <StatusBadge status={c.status} />
                    </td>
                    <td>
                      <button
                        onClick={() => {
                          onSelectCase(c);
                          onNavigate('cases');
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* AI Forensic Engines Health */}
        <div className="forensic-card">
          <div className="card-header-flex">
            <div className="card-title">
              <Cpu size={18} color="#a78bfa" />
              <span>AI Engine Architecture</span>
            </div>
            <span className="badge badge-purple">Multimodal</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.entries(aiServices).map(([key, item]) => {
              const isReady = item.available;
              return (
                <div
                  key={key}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#ffffff' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {item.status_message}
                    </div>
                  </div>
                  <div>
                    {isReady ? (
                      <span className="badge badge-green">
                        <CheckCircle2 size={12} /> Live
                      </span>
                    ) : (
                      <span className="badge badge-purple">
                        Demo Heuristic
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Evidence & Quick Access */}
      <div className="forensic-card">
        <div className="card-header-flex">
          <div className="card-title">
            <FileCheck2 size={18} color="#34d399" />
            <span>Latest Forensic Evidence Ingestion</span>
          </div>
          <button onClick={() => onNavigate('analysis')} className="btn btn-secondary btn-sm">
            Launch Analysis
          </button>
        </div>

        {recentEvidence.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No evidence files ingested. Go to "Case & Evidence" to upload footage or recordings.
          </div>
        ) : (
          <table className="forensic-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>File Name</th>
                <th>Cryptographic SHA-256 Hash</th>
                <th>Status</th>
                <th>Quick Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentEvidence.map((ev) => (
                <tr key={ev.id}>
                  <td>
                    <StatusBadge status={ev.file_type} />
                  </td>
                  <td style={{ fontWeight: 600, color: '#ffffff' }}>
                    {ev.filename}
                  </td>
                  <td>
                    <span className="font-mono" style={{ fontSize: '0.72rem', color: '#93c5fd' }}>
                      {ev.sha256_hash.slice(0, 16)}...{ev.sha256_hash.slice(-8)}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={ev.status} />
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => onNavigate('analysis')}
                        className="btn btn-primary btn-sm"
                        style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                      >
                        Analyze
                      </button>
                      <button
                        onClick={() => onNavigate('chat')}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                      >
                        <MessageSquare size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
