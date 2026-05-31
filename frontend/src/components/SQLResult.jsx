import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Code2, Copy, Check, Info, AlertTriangle, HelpCircle, Key, ExternalLink } from 'lucide-react';

export default function SQLResult({ result, onOpenApiKeyModal }) {
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const { status, sql, explanation, message } = result;

  if (status === 'quota_exceeded') {
    return (
      <div 
        className="result-card glass-panel animate-fade-in"
        style={{
          border: '1px solid rgba(245, 158, 11, 0.3)',
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
          padding: '24px',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div 
            style={{
              background: 'rgba(245, 158, 11, 0.15)',
              color: '#fbbf24',
              padding: '10px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AlertTriangle size={24} style={{ animation: 'pulseGlow 2s infinite' }} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#fef08a' }}>
              Gemini API Quota Exceeded (429)
            </h4>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              RESOURCE_EXHAUSTED • Too Many Requests
            </p>
          </div>
        </div>

        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
          {explanation || message}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '4px', alignItems: 'center' }}>
          <button
            onClick={onOpenApiKeyModal}
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 18px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={e => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
            }}
          >
            <Key size={14} />
            Configure Custom API Key
          </button>

          <a
            href="https://aistudio.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#60a5fa',
              textDecoration: 'none',
              fontSize: '0.82rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '8px 12px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.color = '#93c5fd';
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
              e.currentTarget.style.color = '#60a5fa';
            }}
          >
            Get Free Gemini Key <ExternalLink size={12} />
          </a>
        </div>
      </div>
    );
  }

  const copySQL = () => {
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const badgeClass =
    status === 'success' ? 'status-badge status-success' :
    status === 'clarification_needed' ? 'status-badge status-clarification' :
    'status-badge status-error';

  const badgeLabel =
    status === 'success' ? 'Success' :
    status === 'clarification_needed' ? 'Clarification Needed' :
    'Error';

  const StatusIcon =
    status === 'success' ? Info :
    status === 'clarification_needed' ? HelpCircle :
    AlertTriangle;

  return (
    <div className="result-card glass-panel animate-fade-in">
      {/* Card Header */}
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Code2 size={15} />
          <span>Generated SQL</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {result.modelUsed && (
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', background: 'rgba(255, 255, 255, 0.05)', padding: '3px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', fontFamily: 'monospace' }}>
              {result.modelUsed}
            </span>
          )}
          <span className={badgeClass}>{badgeLabel}</span>
          {sql && (
            <button
              onClick={copySQL}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: copied ? '#10b981' : '#64748b', display: 'flex', alignItems: 'center',
                transition: 'color 0.2s',
              }}
              title="Copy SQL"
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
            </button>
          )}
        </div>
      </div>

      {/* SQL Code Block */}
      {sql ? (
        <div style={{ overflowX: 'auto' }}>
          <SyntaxHighlighter
            language="sql"
            style={vscDarkPlus}
            customStyle={{ margin: 0, borderRadius: 0, fontSize: '0.88rem', background: '#0d1117' }}
            showLineNumbers={false}
          >
            {sql}
          </SyntaxHighlighter>
        </div>
      ) : (
        <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8' }}>
          <StatusIcon size={16} />
          <span style={{ fontStyle: 'italic' }}>{message}</span>
        </div>
      )}

      {/* Explanation */}
      {explanation && (
        <div className="explanation-box">
          <p style={{ fontSize: '0.85rem', color: '#a7f3d0', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <Info size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
            {explanation}
          </p>
        </div>
      )}
    </div>
  );
}
