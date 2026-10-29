const API_BASE = '/api';

export const api = {
  // System & Health
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  async getDashboardStats() {
    const res = await fetch(`${API_BASE}/dashboard/stats`);
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return res.json();
  },

  async getAIServices() {
    const res = await fetch(`${API_BASE}/ai/services`);
    return res.json();
  },

  // Cases
  async getCases() {
    const res = await fetch(`${API_BASE}/cases`);
    if (!res.ok) throw new Error('Failed to fetch cases');
    return res.json();
  },

  async getCase(id) {
    const res = await fetch(`${API_BASE}/cases/${id}`);
    if (!res.ok) throw new Error('Failed to fetch case details');
    return res.json();
  },

  async createCase(data) {
    const res = await fetch(`${API_BASE}/cases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to create case');
    return json;
  },

  async updateCase(id, data) {
    const res = await fetch(`${API_BASE}/cases/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update case');
    return json;
  },

  async deleteCase(id) {
    const res = await fetch(`${API_BASE}/cases/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to delete case');
    return json;
  },

  // Evidence
  async getCaseEvidence(caseId) {
    const res = await fetch(`${API_BASE}/cases/${caseId}/evidence`);
    if (!res.ok) throw new Error('Failed to fetch evidence');
    return res.json();
  },

  async uploadEvidence(caseId, formData) {
    const res = await fetch(`${API_BASE}/cases/${caseId}/evidence`, {
      method: 'POST',
      body: formData, // multipart/form-data
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Evidence upload failed');
    return json;
  },

  async deleteEvidence(evidenceId) {
    const res = await fetch(`${API_BASE}/evidence/${evidenceId}`, { method: 'DELETE' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to delete evidence');
    return json;
  },

  // Analysis
  async analyzeEvidence(evidenceId, { mode = 'demo', sample_interval = 3.0 } = {}) {
    const res = await fetch(`${API_BASE}/evidence/${evidenceId}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, sample_interval }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Analysis failed');
    return json;
  },

  // Timeline
  async getCaseTimeline(caseId) {
    const res = await fetch(`${API_BASE}/cases/${caseId}/timeline`);
    if (!res.ok) throw new Error('Failed to fetch timeline');
    return res.json();
  },

  async addTimelineEvent(caseId, data) {
    const res = await fetch(`${API_BASE}/cases/${caseId}/timeline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to add timeline event');
    return json;
  },

  async deleteTimelineEvent(eventId) {
    const res = await fetch(`${API_BASE}/timeline/${eventId}`, { method: 'DELETE' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to delete timeline event');
    return json;
  },

  // AI Chat
  async chatCase(caseId, message, history = []) {
    const res = await fetch(`${API_BASE}/cases/${caseId}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'AI Chat failed');
    return json;
  },

  // Report Download URL
  getReportUrl(caseId) {
    return `${API_BASE}/cases/${caseId}/report`;
  },

  // Seed Demo Case
  async seedDemo() {
    const res = await fetch(`${API_BASE}/seed-demo`, { method: 'POST' });
    return res.json();
  }
};
