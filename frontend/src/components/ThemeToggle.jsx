import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark';
  return (
    <button
      id="theme-toggle-btn"
      onClick={onToggle}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '8px 14px',
        background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '999px', cursor: 'pointer',
        color: isDark ? '#fbbf24' : '#f59e0b',
        fontWeight: 600, fontSize: '0.82rem', fontFamily: 'Inter, sans-serif',
        transition: 'all 0.2s ease',
      }}
      onMouseOver={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'}
      onMouseOut={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}
    >
      {isDark ? <Moon size={14} /> : <Sun size={14} />}
    </button>
  );
}
