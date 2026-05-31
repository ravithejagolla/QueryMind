import { useEffect, useState } from 'react';
import { Brain, Activity, Key } from 'lucide-react';
import { healthCheck } from '../services/api';
import ThemeToggle from './ThemeToggle';
import QueryHistory from './QueryHistory';

export default function Header({ children, theme, onThemeToggle, history, onRerun, onClearHistory, onOpenApiKeyModal }) {
  const [dbStatus, setDbStatus] = useState('checking');
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    healthCheck()
      .then(() => setDbStatus('ok'))
      .catch(() => setDbStatus('error'));

    const timer = setInterval(() => {
      healthCheck()
        .then(() => setDbStatus('ok'))
        .catch(() => setDbStatus('error'));
    }, 15000);

    return () => clearInterval(timer);
  }, []);

  return (
    <header className="header">
      {/* Brand */}
      <div className="header-title">
        <Brain size={22} className="header-icon" style={{ color: '#60a5fa' }} />
        QueryMind
      </div>
      <span style={{ marginLeft: '10px', fontSize: '0.7rem', color: '#475569', padding: '2px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '999px' }}>
        NL → SQL
      </span>

      {/* Right side */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* DataManager & other children */}
        {children}

        {/* Query History */}
        <QueryHistory
          history={history}
          onRerun={onRerun}
          onClear={onClearHistory}
          isOpen={historyOpen}
          onToggle={() => setHistoryOpen(o => !o)}
        />

        {/* Custom API Key Configuration */}
        <button
          onClick={onOpenApiKeyModal}
          title="Configure Gemini API Key"
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 14px',
            background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '999px', cursor: 'pointer',
            color: '#60a5fa',
            fontWeight: 600, fontSize: '0.82rem', fontFamily: 'Inter, sans-serif',
            transition: 'all 0.2s ease',
          }}
          onMouseOver={e => e.currentTarget.style.background = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'}
          onMouseOut={e => e.currentTarget.style.background = theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}
        >
          <Key size={14} />
          <span style={{ fontSize: '0.8rem' }}>API Key</span>
        </button>

        {/* Theme Toggle */}
        <ThemeToggle theme={theme} onToggle={onThemeToggle} />

        {/* DB status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#94a3b8' }}>
          <Activity size={14} />
          <span>DB</span>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: dbStatus === 'ok' ? '#10b981' : dbStatus === 'checking' ? '#f59e0b' : '#ef4444',
            animation: dbStatus === 'checking' ? 'pulseGlow 1.5s infinite' : 'none',
          }} />
          <span style={{ color: dbStatus === 'ok' ? '#10b981' : dbStatus === 'checking' ? '#f59e0b' : '#ef4444' }}>
            {dbStatus === 'ok' ? 'Connected' : dbStatus === 'checking' ? 'Checking…' : 'Disconnected'}
          </span>
        </div>

        <span style={{ fontSize: '0.75rem', color: '#475569' }}>Powered by Gemini</span>
      </div>
    </header>
  );
}
