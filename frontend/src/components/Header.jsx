import React from 'react';
import { Briefcase, ShieldCheck } from 'lucide-react';

export default function Header({ title, description, cases, activeCase, onSelectCase }) {
  return (
    <header className="top-header">
      <div>
        <h1 className="page-title">{title}</h1>
        <p className="page-desc">{description}</p>
      </div>

      <div className="header-actions">
        {cases && cases.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Case Dossier:</span>
            <select
              className="form-select"
              style={{ width: '240px', padding: '6px 10px', fontSize: '0.82rem' }}
              value={activeCase ? activeCase.id : ''}
              onChange={(e) => {
                const found = cases.find(c => c.id === parseInt(e.target.value));
                if (found) onSelectCase(found);
              }}
            >
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.case_number} - {c.title.slice(0, 24)}...
                </option>
              ))}
            </select>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 10px', background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.25)', borderRadius: '6px', fontSize: '0.78rem', color: '#93c5fd' }}>
          <ShieldCheck size={14} color="#60a5fa" />
          <span>Chain of Custody SHA-256</span>
        </div>
      </div>
    </header>
  );
}
