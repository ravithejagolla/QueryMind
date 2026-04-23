import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Code2, Copy, Check, Info, AlertTriangle, HelpCircle } from 'lucide-react';

export default function SQLResult({ result }) {
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const { status, sql, explanation, message } = result;

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
