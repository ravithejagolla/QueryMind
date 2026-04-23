import { History, RotateCcw, Trash2, CheckCircle, AlertCircle, HelpCircle, X } from 'lucide-react';

const STATUS_CONFIG = {
  success:              { icon: CheckCircle, color: '#10b981' },
  error:                { icon: AlertCircle, color: '#ef4444' },
  db_error:             { icon: AlertCircle, color: '#f59e0b' },
  clarification_needed: { icon: HelpCircle,  color: '#f59e0b' },
};

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export default function QueryHistory({ history, onRerun, onClear, isOpen, onToggle }) {
  return (
    <>
      <button
        id="history-toggle-btn"
        onClick={onToggle}
        style={{
          display: 'flex', alignItems: 'center', gap: '7px',
          padding: '8px 16px',
          background: isOpen ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.06)',
          color: isOpen ? '#a78bfa' : '#94a3b8',
          border: isOpen ? '1px solid rgba(139,92,246,0.4)' : '1px solid rgba(255,255,255,0.1)',
          borderRadius: '999px', cursor: 'pointer',
          fontWeight: 600, fontSize: '0.85rem', fontFamily: 'Inter, sans-serif',
          transition: 'all 0.2s ease',
        }}
      >
        <History size={15} />
        History
        {history.length > 0 && (
          <span style={{
            background: '#8b5cf6', color: '#fff',
            fontSize: '0.65rem', fontWeight: 700,
            borderRadius: '999px', padding: '1px 6px',
          }}>
            {history.length}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            onClick={onToggle}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 7999 }}
          />
          <div
            id="history-panel"
            style={{
              position: 'fixed', top: 0, right: 0,
              width: '380px', height: '100vh',
              background: '#1a2234',
              borderLeft: '1px solid rgba(255,255,255,0.1)',
              zIndex: 8000, display: 'flex', flexDirection: 'column',
              animation: 'slideInRight 0.25s ease-out forwards',
              boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{
              padding: '20px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <History size={18} color="#8b5cf6" />
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f1f5f9', margin: 0 }}>
                    Query History
                  </h3>
                  <p style={{ fontSize: '0.72rem', color: '#64748b', margin: 0 }}>
                    {history.length} queries this session
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {history.length > 0 && (
                  <button onClick={onClear} title="Clear history"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex' }}>
                    <Trash2 size={15} />
                  </button>
                )}
                <button onClick={onToggle}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex' }}>
                  <X size={18} />
                </button>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
              {history.length === 0 ? (
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', height: '60%', gap: '12px', color: '#475569',
                }}>
                  <History size={36} opacity={0.3} />
                  <p style={{ fontSize: '0.85rem' }}>No queries yet</p>
                </div>
              ) : (
                [...history].reverse().map(item => {
                  const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.error;
                  const StatusIcon = cfg.icon;
                  return (
                    <div key={item.id} style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: '10px', padding: '12px 14px', marginBottom: '8px',
                    }}>
                      <p style={{ fontSize: '0.85rem', color: '#e2e8f0', fontWeight: 500, marginBottom: '8px', lineHeight: 1.4 }}>
                        {item.question}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <StatusIcon size={12} color={cfg.color} />
                          {item.status === 'success' && (
                            <span style={{ fontSize: '0.72rem', color: '#475569' }}>{item.rowCount} rows</span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.7rem', color: '#475569' }}>{timeAgo(item.timestamp)}</span>
                          <button
                            onClick={() => onRerun(item.question)}
                            style={{
                              background: 'rgba(59,130,246,0.15)',
                              border: '1px solid rgba(59,130,246,0.3)',
                              borderRadius: '6px', cursor: 'pointer',
                              color: '#60a5fa', padding: '3px 8px',
                              display: 'flex', alignItems: 'center', gap: '4px',
                              fontSize: '0.72rem', fontWeight: 600, fontFamily: 'Inter, sans-serif',
                            }}
                          >
                            <RotateCcw size={10} /> Re-run
                          </button>
                        </div>
                      </div>
                      {item.sql && (
                        <div style={{
                          marginTop: '8px', background: 'rgba(0,0,0,0.3)',
                          borderRadius: '6px', padding: '6px 10px',
                          fontFamily: 'Fira Code, monospace', fontSize: '0.72rem',
                          color: '#7dd3fc', overflow: 'hidden',
                          whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                        }}>
                          {item.sql}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
