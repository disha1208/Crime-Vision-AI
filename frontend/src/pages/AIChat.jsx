import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Cpu,
  Shield,
  Bot,
  User,
  Sparkles,
  Info,
  Clock,
  Hash,
  AlertCircle
} from 'lucide-react';

export default function AIChat({ activeCase, onNavigate, onChatCase }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `**CrimeVision Forensic AI Assistant Active.**\nI have loaded the dossier, evidence logs, SHA-256 hashes, and timeline for Case **${activeCase?.case_number || 'N/A'}**.\n\nAsk me about suspect descriptions, vehicle clues, timeline progression, tool signatures, or evidence authenticity.`,
      is_simulated: true
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (textToSend) => {
    const q = textToSend || inputValue;
    if (!q.trim() || !activeCase || loading) return;

    const userMsg = { role: 'user', content: q };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      const historyPayload = messages.slice(-6).map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await onChatCase(activeCase.id, q, historyPayload);

      const aiMsg = {
        role: 'assistant',
        content: res.reply || 'No analysis returned.',
        is_simulated: res.is_simulated,
        disclaimer: res.disclaimer,
        model: res.model
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `**Forensic Query Error:** ${err.message}`,
          is_error: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    "Summarize suspect description and observed actions",
    "What vehicle details and partial plate were identified?",
    "Reconstruct the chronological incident timeline",
    "List all evidence items and verified SHA-256 hashes",
    "What potential weapons or forced entry tools were detected?"
  ];

  if (!activeCase) {
    return (
      <div className="page-content animate-fade-in" style={{ padding: '60px', textAlign: 'center' }}>
        <MessageSquare size={40} style={{ color: 'var(--text-dim)', marginBottom: '16px' }} />
        <h3 style={{ color: '#ffffff', marginBottom: '8px' }}>No Case Dossier Selected</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
          Select an investigation case to interrogate evidence artifacts with AI.
        </p>
        <button onClick={() => onNavigate('cases')} className="btn btn-primary">
          Select Case Dossier
        </button>
      </div>
    );
  }

  return (
    <div className="page-content animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>
      {/* Top Context Bar */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '10px',
        padding: '12px 18px',
        marginBottom: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '6px',
            background: 'linear-gradient(135deg, #1e3a8a, #00d4ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
          }}>
            <Bot size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
              Forensic Evidence Copilot &bull; <span className="font-mono text-cyan">{activeCase.case_number}</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Synthesizing image detections, keyframes, transcripts, and cryptographic custody
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-purple">
            <Cpu size={12} /> Forensic Intelligence Engine
          </span>
          <span className="badge badge-blue">
            <Shield size={12} /> Objective Custody
          </span>
        </div>
      </div>

      {/* Chat Messages Log */}
      <div style={{
        flex: 1,
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '10px',
        padding: '18px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        marginBottom: '12px'
      }}>
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: '12px',
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                maxWidth: '85%'
              }}
            >
              {!isUser && (
                <div style={{
                  width: '30px', height: '30px', borderRadius: '6px',
                  background: 'linear-gradient(135deg, #1e3a8a, #00d4ff)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', flexShrink: 0
                }}>
                  <Bot size={16} />
                </div>
              )}

              <div
                style={{
                  background: isUser ? 'linear-gradient(135deg, #1d4ed8, #0284c7)' : 'rgba(255, 255, 255, 0.03)',
                  border: isUser ? '1px solid rgba(0, 212, 255, 0.3)' : '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap'
                }}
              >
                {msg.content}

                {msg.disclaimer && (
                  <div style={{
                    marginTop: '8px',
                    paddingTop: '8px',
                    borderTop: '1px solid var(--border-subtle)',
                    fontSize: '0.7rem',
                    color: 'var(--text-dim)',
                    fontStyle: 'italic'
                  }}>
                    {msg.disclaimer}
                  </div>
                )}
              </div>

              {isUser && (
                <div style={{
                  width: '30px', height: '30px', borderRadius: '6px',
                  background: '#2563eb',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', flexShrink: 0
                }}>
                  <User size={16} />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', color: 'var(--accent-cyan)', fontSize: '0.8rem' }}>
            <Bot size={18} />
            <span>Consulting case evidence repository and timeline...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Question Chips */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '8px' }}>
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(p)}
            disabled={loading}
            style={{
              padding: '5px 10px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
              fontSize: '0.74rem',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseOver={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'var(--accent-cyan)'; }}
            onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
        style={{ display: 'flex', gap: '10px' }}
      >
        <input
          type="text"
          className="form-input"
          style={{ flex: 1, padding: '12px 14px', fontSize: '0.88rem' }}
          placeholder="Inquire about suspect attributes, vehicle plates, timeline gaps, or evidence hashes..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !inputValue.trim()}
          className="btn btn-primary"
          style={{ padding: '0 20px' }}
        >
          <Send size={16} />
          <span>Inquire</span>
        </button>
      </form>
    </div>
  );
}
