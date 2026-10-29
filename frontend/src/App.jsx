import React, { useState, useEffect } from 'react';
import './App.css';
import { api } from './api';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// 6 Required Pages
import Dashboard from './pages/Dashboard';
import CasesEvidence from './pages/CasesEvidence';
import MultimodalAnalysis from './pages/MultimodalAnalysis';
import UnifiedTimeline from './pages/UnifiedTimeline';
import AIChat from './pages/AIChat';
import Reports from './pages/Reports';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [cases, setCases] = useState([]);
  const [activeCase, setActiveCase] = useState(null);
  const [evidenceList, setEvidenceList] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  // Fetch initial system data
  useEffect(() => {
    loadAllData();
  }, []);

  // When activeCase changes, refresh its evidence and timeline
  useEffect(() => {
    if (activeCase) {
      loadCaseDetails(activeCase.id);
    } else {
      setEvidenceList([]);
      setTimeline([]);
    }
  }, [activeCase?.id]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [casesRes, statsRes] = await Promise.all([
        api.getCases(),
        api.getDashboardStats()
      ]);

      const caseList = casesRes.cases || [];
      setCases(caseList);
      setStatsData(statsRes);

      if (caseList.length > 0) {
        // Retain current active case or pick the first one
        setActiveCase(prev => {
          if (prev) {
            const found = caseList.find(c => c.id === prev.id);
            return found || caseList[0];
          }
          return caseList[0];
        });
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCaseDetails = async (caseId) => {
    try {
      const [evRes, tlRes] = await Promise.all([
        api.getCaseEvidence(caseId),
        api.getCaseTimeline(caseId)
      ]);
      setEvidenceList(evRes.evidence || []);
      setTimeline(tlRes.timeline || []);
    } catch (err) {
      console.error('Failed to load case details:', err);
    }
  };

  const handleSelectCase = (caseObj) => {
    setActiveCase(caseObj);
  };

  // Case Actions
  const handleCreateCase = async (caseData) => {
    const res = await api.createCase(caseData);
    await loadAllData();
    if (res.case) setActiveCase(res.case);
    return res;
  };

  const handleUpdateCase = async (caseId, caseData) => {
    const res = await api.updateCase(caseId, caseData);
    await loadAllData();
    if (res.case) setActiveCase(res.case);
    return res;
  };

  const handleDeleteCase = async (caseId) => {
    if (!window.confirm('Are you sure you want to delete this case dossier and its evidence?')) return;
    await api.deleteCase(caseId);
    await loadAllData();
  };

  // Evidence Actions
  const handleUploadEvidence = async (caseId, formData) => {
    const res = await api.uploadEvidence(caseId, formData);
    await loadCaseDetails(caseId);
    await loadAllData();
    return res;
  };

  const handleDeleteEvidence = async (evidenceId) => {
    if (!window.confirm('Delete this evidence file and its cryptographic records?')) return;
    await api.deleteEvidence(evidenceId);
    if (activeCase) {
      await loadCaseDetails(activeCase.id);
      await loadAllData();
    }
  };

  // Analysis Action
  const handleAnalyzeEvidence = async (evidenceId, options) => {
    const res = await api.analyzeEvidence(evidenceId, options);
    if (activeCase) {
      await loadCaseDetails(activeCase.id);
      await loadAllData();
    }
    return res;
  };

  // Timeline Actions
  const handleAddTimelineEvent = async (caseId, eventData) => {
    const res = await api.addTimelineEvent(caseId, eventData);
    await loadCaseDetails(caseId);
    await loadAllData();
    return res;
  };

  const handleDeleteTimelineEvent = async (eventId) => {
    await api.deleteTimelineEvent(eventId);
    if (activeCase) {
      await loadCaseDetails(activeCase.id);
      await loadAllData();
    }
  };

  // AI Chat
  const handleChatCase = async (caseId, message, history) => {
    return await api.chatCase(caseId, message, history);
  };

  // Seed Demo Case
  const handleSeedDemo = async () => {
    try {
      setSeeding(true);
      const res = await api.seedDemo();
      await loadAllData();
      if (res.case_id) {
        const found = cases.find(c => c.id === res.case_id);
        if (found) setActiveCase(found);
      }
    } catch (err) {
      console.error('Failed to seed demo case:', err);
    } finally {
      setSeeding(false);
    }
  };

  const pageDescriptions = {
    dashboard: 'High-level forensic intelligence, case overview, and multimodal neural status.',
    cases: 'Manage investigation dossiers, ingest multi-format evidence, and verify SHA-256 hashes.',
    analysis: 'Execute RT-DETR object detection, video keyframing, and Whisper audio transcription.',
    timeline: 'Synchronized chronological reconstruction of visual, acoustic, and examiner events.',
    chat: 'Interrogate case artifacts with AI forensic reasoning powered by Groq / local heuristics.',
    reports: 'Compile and download court-ready forensic reports with verifiable cryptographic custody.'
  };

  const pageTitles = {
    dashboard: 'Forensic Intelligence Dashboard',
    cases: 'Case Management & Evidence Vault',
    analysis: 'Multimodal Forensic Analysis',
    timeline: 'Unified Incident Timeline',
    chat: 'AI Evidence Interrogation',
    reports: 'Forensic Case Reports'
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPage={currentPage}
        onSelectPage={setCurrentPage}
        activeCase={activeCase}
        onSeedDemo={handleSeedDemo}
        seeding={seeding}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Header
          title={pageTitles[currentPage]}
          description={pageDescriptions[currentPage]}
          cases={cases}
          activeCase={activeCase}
          onSelectCase={handleSelectCase}
        />

        {currentPage === 'dashboard' && (
          <Dashboard
            statsData={statsData}
            onNavigate={setCurrentPage}
            onSelectCase={handleSelectCase}
            activeCase={activeCase}
          />
        )}

        {currentPage === 'cases' && (
          <CasesEvidence
            cases={cases}
            activeCase={activeCase}
            evidenceList={evidenceList}
            onSelectCase={handleSelectCase}
            onCreateCase={handleCreateCase}
            onUpdateCase={handleUpdateCase}
            onDeleteCase={handleDeleteCase}
            onUploadEvidence={handleUploadEvidence}
            onDeleteEvidence={handleDeleteEvidence}
            onAnalyzeEvidence={handleAnalyzeEvidence}
            onNavigate={setCurrentPage}
          />
        )}

        {currentPage === 'analysis' && (
          <MultimodalAnalysis
            activeCase={activeCase}
            evidenceList={evidenceList}
            onAnalyzeEvidence={handleAnalyzeEvidence}
            onNavigate={setCurrentPage}
          />
        )}

        {currentPage === 'timeline' && (
          <UnifiedTimeline
            activeCase={activeCase}
            timeline={timeline}
            onAddTimelineEvent={handleAddTimelineEvent}
            onDeleteTimelineEvent={handleDeleteTimelineEvent}
            onNavigate={setCurrentPage}
          />
        )}

        {currentPage === 'chat' && (
          <AIChat
            activeCase={activeCase}
            onNavigate={setCurrentPage}
            onChatCase={handleChatCase}
          />
        )}

        {currentPage === 'reports' && (
          <Reports
            activeCase={activeCase}
            evidenceList={evidenceList}
            timeline={timeline}
            onNavigate={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
}
