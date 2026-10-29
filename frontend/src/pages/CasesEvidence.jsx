import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Upload,
  Trash2,
  Edit,
  Eye,
  FileCheck2,
  FileVideo,
  FileAudio,
  FileImage,
  Hash,
  AlertCircle,
  CheckCircle,
  Play
} from 'lucide-react';
import { StatusBadge } from '../components/Badge';

export default function CasesEvidence({
  cases,
  activeCase,
  evidenceList,
  onSelectCase,
  onCreateCase,
  onUpdateCase,
  onDeleteCase,
  onUploadEvidence,
  onDeleteEvidence,
  onAnalyzeEvidence,
  onNavigate
}) {
  // Modal states
  const [showCaseModal, setShowCaseModal] = useState(false);
  const [editingCase, setEditingCase] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);

  // Case Form State
  const [caseForm, setCaseForm] = useState({
    title: '',
    case_number: '',
    description: '',
    incident_date: '',
    location: '',
    priority: 'Medium',
    status: 'Active',
    lead_investigator: ''
  });

  // Upload Form State
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadNotes, setUploadNotes] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [localFilePreview, setLocalFilePreview] = useState(null);

  const openNewCaseModal = () => {
    setEditingCase(null);
    setCaseForm({
      title: '',
      case_number: `CASE-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      description: '',
      incident_date: new Date().toISOString().slice(0, 16).replace('T', ' '),
      location: '',
      priority: 'Medium',
      status: 'Active',
      lead_investigator: ''
    });
    setShowCaseModal(true);
  };

  const openEditCaseModal = (c) => {
    setEditingCase(c);
    setCaseForm({
      title: c.title,
      case_number: c.case_number,
      description: c.description || '',
      incident_date: c.incident_date || '',
      location: c.location || '',
      priority: c.priority || 'Medium',
      status: c.status || 'Active',
      lead_investigator: c.lead_investigator || ''
    });
    setShowCaseModal(true);
  };

  const handleCaseSubmit = async (e) => {
    e.preventDefault();
    if (!caseForm.title.trim()) return;

    if (editingCase) {
      await onUpdateCase(editingCase.id, caseForm);
    } else {
      await onCreateCase(caseForm);
    }
    setShowCaseModal(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setUploadError('');
    if (!file) {
      setUploadFile(null);
      setLocalFilePreview(null);
      return;
    }

    const ext = file.name.split('.').pop().toLowerCase();
    const validExts = ['jpg', 'jpeg', 'png', 'mp4', 'avi', 'mov', 'wav', 'mp3'];
    if (!validExts.includes(ext)) {
      setUploadError(`Unsupported format .${ext}. Allowed: JPG, PNG, MP4, WAV, MP3`);
      setUploadFile(null);
      setLocalFilePreview(null);
      return;
    }

    setUploadFile(file);
    if (['jpg', 'jpeg', 'png'].includes(ext)) {
      setLocalFilePreview(URL.createObjectURL(file));
    } else {
      setLocalFilePreview(null);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile || !activeCase) return;

    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('notes', uploadNotes);

      await onUploadEvidence(activeCase.id, formData);
      setShowUploadModal(false);
      setUploadFile(null);
      setUploadNotes('');
      setLocalFilePreview(null);
    } catch (err) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="page-content animate-fade-in">
      {/* Top Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>
            Investigation Dossiers & Evidence Vault
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Register cases and ingest digital artifacts with automated cryptographic SHA-256 verification.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={openNewCaseModal} className="btn btn-primary">
            <Plus size={16} />
            <span>New Case Dossier</span>
          </button>
          {activeCase && (
            <button onClick={() => setShowUploadModal(true)} className="btn btn-secondary">
              <Upload size={16} color="var(--accent-cyan)" />
              <span>Ingest Evidence</span>
            </button>
          )}
        </div>
      </div>

      {/* Case Overview Tabs / Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '20px' }}>
        {/* Cases List */}
        <div className="forensic-card" style={{ height: 'fit-content' }}>
          <div className="card-header-flex">
            <div className="card-title">
              <Briefcase size={16} color="var(--accent-cyan)" />
              <span>Registered Cases ({cases.length})</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {cases.map((c) => {
              const isSelected = activeCase && activeCase.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => onSelectCase(c)}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    background: isSelected ? 'rgba(37,99,235,0.18)' : 'rgba(255,255,255,0.02)',
                    border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span className="font-mono" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                      {c.case_number}
                    </span>
                    <StatusBadge status={c.priority} />
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#ffffff', marginBottom: '4px' }}>
                    {c.title}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    <span>{c.evidence_count} evidence item(s)</span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); openEditCaseModal(c); }}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                        title="Edit Case"
                      >
                        <Edit size={13} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDeleteCase(c.id); }}
                        style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer' }}
                        title="Delete Case"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Case Evidence Repository */}
        <div className="forensic-card">
          {activeCase ? (
            <>
              <div className="card-header-flex">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
                      {activeCase.title}
                    </h3>
                    <StatusBadge status={activeCase.status} />
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Case ID: <span className="font-mono text-cyan">{activeCase.case_number}</span> | Location: {activeCase.location || 'N/A'} | Lead: {activeCase.lead_investigator || 'Unassigned'}
                  </div>
                </div>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="btn btn-primary btn-sm"
                >
                  <Upload size={14} />
                  <span>Upload File</span>
                </button>
              </div>

              {/* Case Narrative */}
              {activeCase.description && (
                <div style={{
                  padding: '10px 14px',
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.8rem',
                  color: 'var(--text-main)',
                  marginBottom: '16px'
                }}>
                  <strong style={{ color: 'var(--accent-cyan)' }}>Investigator Brief:</strong> {activeCase.description}
                </div>
              )}

              {/* Evidence Table */}
              <div style={{ marginTop: '12px' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileCheck2 size={16} color="var(--accent-cyan)" />
                  <span>Ingested Digital Evidence ({evidenceList.length})</span>
                </h4>

                {evidenceList.length === 0 ? (
                  <div style={{
                    padding: '40px',
                    textAlign: 'center',
                    border: '1px dashed var(--border-subtle)',
                    borderRadius: '8px'
                  }}>
                    <Upload size={28} style={{ color: 'var(--text-dim)', marginBottom: '8px' }} />
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      No digital evidence attached to this dossier yet.
                    </p>
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="btn btn-secondary btn-sm"
                      style={{ marginTop: '12px' }}
                    >
                      Ingest First Artifact (Image, Video, Audio)
                    </button>
                  </div>
                ) : (
                  <table className="forensic-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Type</th>
                        <th>Cryptographic SHA-256 Hash</th>
                        <th>Size</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {evidenceList.map((ev, idx) => (
                        <tr key={ev.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {ev.file_type === 'image' && <FileImage size={16} color="#38bdf8" />}
                              {ev.file_type === 'video' && <FileVideo size={16} color="#818cf8" />}
                              {ev.file_type === 'audio' && <FileAudio size={16} color="#34d399" />}
                              <div>
                                <div style={{ fontWeight: 600, color: '#ffffff' }}>{ev.filename}</div>
                                {ev.notes && <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{ev.notes}</div>}
                              </div>
                            </div>
                          </td>
                          <td>
                            <StatusBadge status={ev.file_type} />
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Hash size={12} color="var(--accent-cyan)" />
                              <span
                                className="font-mono"
                                style={{ fontSize: '0.72rem', color: '#93c5fd' }}
                                title={ev.sha256_hash}
                              >
                                {ev.sha256_hash.slice(0, 14)}...{ev.sha256_hash.slice(-8)}
                              </span>
                            </div>
                          </td>
                          <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {(ev.file_size / 1024).toFixed(1)} KB
                          </td>
                          <td>
                            <StatusBadge status={ev.status} />
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                onClick={() => setPreviewItem(ev)}
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '3px 7px' }}
                                title="Inspect Binary & Preview"
                              >
                                <Eye size={12} />
                              </button>
                              <button
                                onClick={() => {
                                  onSelectCase(activeCase);
                                  onNavigate('analysis');
                                }}
                                className="btn btn-primary btn-sm"
                                style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                              >
                                {ev.status === 'Analyzed' ? 'View Analysis' : 'Run AI'}
                              </button>
                              <button
                                onClick={() => onDeleteEvidence(ev.id)}
                                className="btn btn-danger btn-sm"
                                style={{ padding: '3px 7px' }}
                                title="Delete Evidence"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          ) : (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Select a case dossier from the left list to view or upload evidence artifacts.
            </div>
          )}
        </div>
      </div>

      {/* Case Create / Edit Modal */}
      {showCaseModal && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
                {editingCase ? 'Edit Case Dossier' : 'Register New Investigation Case'}
              </h3>
              <button
                onClick={() => setShowCaseModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleCaseSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Case Identifier / Docket #</label>
                  <input
                    type="text"
                    className="form-input font-mono"
                    value={caseForm.case_number}
                    onChange={(e) => setCaseForm({ ...caseForm, case_number: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Case Title / Incident Label</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Vault Perimeter Intrusion & Hardware Breach"
                    value={caseForm.title}
                    onChange={(e) => setCaseForm({ ...caseForm, title: e.target.value })}
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select
                      className="form-select"
                      value={caseForm.priority}
                      onChange={(e) => setCaseForm({ ...caseForm, priority: e.target.value })}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={caseForm.status}
                      onChange={(e) => setCaseForm({ ...caseForm, status: e.target.value })}
                    >
                      <option value="Active">Active</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Incident Timestamp</label>
                    <input
                      type="text"
                      className="form-input"
                      value={caseForm.incident_date}
                      onChange={(e) => setCaseForm({ ...caseForm, incident_date: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Lead Investigator</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Det. M. Ross (Forensics)"
                      value={caseForm.lead_investigator}
                      onChange={(e) => setCaseForm({ ...caseForm, lead_investigator: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Location / Jurisdiction</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 104 Industrial Pkwy, Sector 4"
                    value={caseForm.location}
                    onChange={(e) => setCaseForm({ ...caseForm, location: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Investigator Case Notes</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Narrative summary of incident details, suspect vector, or scene notes..."
                    value={caseForm.description}
                    onChange={(e) => setCaseForm({ ...caseForm, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowCaseModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCase ? 'Save Changes' : 'Create Dossier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Evidence Modal */}
      {showUploadModal && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
                Ingest Digital Evidence Artifact
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleUploadSubmit}>
              <div className="modal-body">
                {uploadError && (
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: '6px',
                    background: 'rgba(239,68,68,0.15)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    color: '#f87171',
                    fontSize: '0.8rem',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <AlertCircle size={16} />
                    <span>{uploadError}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Select Digital File (JPG, PNG, MP4, WAV, MP3)</label>
                  <input
                    type="file"
                    className="form-input"
                    accept=".jpg,.jpeg,.png,.mp4,.avi,.mov,.wav,.mp3"
                    onChange={handleFileChange}
                    required
                  />
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    SHA-256 cryptographic signature will be calculated automatically upon ingestion.
                  </div>
                </div>

                {localFilePreview && (
                  <div style={{ marginBottom: '16px', borderRadius: '8px', overflow: 'hidden', maxHeight: '180px', border: '1px solid var(--border-subtle)' }}>
                    <img src={localFilePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Evidence Chain of Custody Notes</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="Source camera, physical drive label, recovery officer, initial custody location..."
                    value={uploadNotes}
                    onChange={(e) => setUploadNotes(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowUploadModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={uploading || !uploadFile} className="btn btn-primary">
                  {uploading ? 'Calculating SHA-256...' : 'Ingest & Secure Hash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Evidence Modal */}
      {previewItem && (
        <div className="modal-backdrop">
          <div className="modal-dialog" style={{ maxWidth: '680px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
                Evidence File Preview: {previewItem.filename}
              </h3>
              <button
                onClick={() => setPreviewItem(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '16px', background: '#000', borderRadius: '8px', overflow: 'hidden', minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {previewItem.file_type === 'image' && (
                  <img
                    src={`/api/uploads/${previewItem.stored_filename}`}
                    alt="Evidence Preview"
                    style={{ maxWidth: '100%', maxHeight: '340px', objectFit: 'contain' }}
                  />
                )}
                {previewItem.file_type === 'video' && (
                  <video
                    controls
                    src={`/api/uploads/${previewItem.stored_filename}`}
                    style={{ width: '100%', maxHeight: '340px' }}
                  />
                )}
                {previewItem.file_type === 'audio' && (
                  <div style={{ padding: '30px', width: '100%', textAlign: 'center' }}>
                    <audio
                      controls
                      src={`/api/uploads/${previewItem.stored_filename}`}
                      style={{ width: '100%' }}
                    />
                  </div>
                )}
              </div>

              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--border-subtle)', fontSize: '0.8rem' }}>
                <div style={{ marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Cryptographic SHA-256: </span>
                  <span className="font-mono" style={{ color: 'var(--accent-cyan)' }}>{previewItem.sha256_hash}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>MIME Type: </span>
                  <span>{previewItem.mime_type}</span> | <span style={{ color: 'var(--text-muted)' }}>Size: </span>
                  <span>{(previewItem.file_size / 1024).toFixed(1)} KB</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setPreviewItem(null)} className="btn btn-secondary">
                Close
              </button>
              <button
                onClick={() => {
                  setPreviewItem(null);
                  onNavigate('analysis');
                }}
                className="btn btn-primary"
              >
                Run Forensic Analysis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
