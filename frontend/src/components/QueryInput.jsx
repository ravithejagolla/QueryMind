import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Send, Zap } from 'lucide-react';

const QueryInput = forwardRef(function QueryInput({ onSubmit, suggestions, loading }, ref) {
  const [query, setQuery] = useState('');
  const textareaRef = useRef(null);

  // Expose focus to parent via ref
  useImperativeHandle(ref, () => ({
    focus: () => textareaRef.current?.focus(),
  }));

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [query]);

  const handleSubmit = () => {
    const q = query.trim();
    if (!q || loading) return;
    onSubmit(q);
    setQuery('');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="chat-section glass-panel">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Zap size={18} color="#60a5fa" />
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          Ask anything about your data
        </h2>
        <span style={{
          marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--text-muted)',
          background: 'rgba(255,255,255,0.05)', borderRadius: '6px', padding: '2px 8px',
        }}>
          Ctrl+Enter to focus
        </span>
      </div>

      {/* Input row */}
      <div className="input-container">
        <textarea
          ref={textareaRef}
          className="query-input"
          rows={1}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKey}
          placeholder="e.g. Show me the top 5 best-selling products…"
          style={{ resize: 'none', minHeight: '52px', maxHeight: '160px', overflowY: 'auto' }}
        />
        <button
          className="submit-btn"
          onClick={handleSubmit}
          disabled={loading || !query.trim()}
          aria-label="Submit query"
        >
          {loading
            ? <div className="loader" style={{ width: 16, height: 16, borderWidth: 2 }} />
            : <Send size={16} />}
        </button>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Try a sample query:
          </p>
          <div className="suggestions">
            {suggestions.slice(0, 6).map((s, i) => (
              <button
                key={i}
                className="suggestion-chip"
                onClick={() => { setQuery(s); textareaRef.current?.focus(); }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

export default QueryInput;
