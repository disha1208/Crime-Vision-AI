import React from 'react';
import {
  LayoutDashboard,
  Briefcase,
  Cpu,
  Clock,
  MessageSquare,
  FileText,
  Shield,
  Sparkles,
  RefreshCw
} from 'lucide-react';

export default function Sidebar({ currentPage, onSelectPage, activeCase, onSeedDemo, seeding }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'cases', label: 'Case & Evidence', icon: Briefcase },
    { id: 'analysis', label: 'Multimodal Analysis', icon: Cpu },
    { id: 'timeline', label: 'Unified Timeline', icon: Clock },
    { id: 'chat', label: 'AI Evidence Chat', icon: MessageSquare },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Shield size={22} />
        </div>
        <div>
          <div className="brand-title">CrimeVision AI</div>
          <div className="brand-subtitle">Forensic Intelligence</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="nav-links">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectPage(item.id)}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* Active Case Indicator */}
        <div style={{ marginTop: 'auto', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Briefcase size={12} color="var(--accent-cyan)" /> Selected Case
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {activeCase ? activeCase.case_number : 'No Case Selected'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {activeCase ? activeCase.title : 'Select or create a case'}
          </div>
        </div>

        {/* Quick Seed Demo Button */}
        <button
          onClick={onSeedDemo}
          disabled={seeding}
          className="btn btn-secondary btn-sm"
          style={{ width: '100%', marginTop: '8px', fontSize: '0.75rem' }}
          title="Seed realistic sample forensic case for immediate testing"
        >
          {seeding ? <RefreshCw size={13} className="spin" /> : <Sparkles size={13} color="#38bdf8" />}
          <span>{seeding ? 'Seeding...' : 'Load Demo Forensic Case'}</span>
        </button>
      </nav>

      {/* Footer System Status */}
      <div className="sidebar-footer">
        <div className="system-status-pill">
          <div className="status-dot"></div>
          <span style={{ fontWeight: 600 }}>Demo Mode: Active</span>
        </div>
        <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '6px', textAlign: 'center' }}>
          Zero-config local engine ready
        </div>
      </div>
    </aside>
  );
}
