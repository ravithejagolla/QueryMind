import { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import QueryInput from './components/QueryInput';
import SQLResult from './components/SQLResult';
import ResultsTable from './components/ResultsTable';
import ChartPanel from './components/ChartPanel';
import DataManager from './components/DataManager';
import { executeQuery, getSchema, getSuggestions } from './services/api';
import './index.css';

let historyIdCounter = 0;

export default function App() {
  const [schema, setSchema] = useState(null);
  const [tableCounts, setTableCounts] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [dbStatus, setDbStatus] = useState('checking');
  const [queryHistory, setQueryHistory] = useState([]);
  const [theme, setTheme] = useState('dark');
  const queryInputRef = useRef(null);

  // Apply theme to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Global Ctrl+Enter keyboard shortcut → focus query input
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        queryInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const loadSchema = useCallback(() => {
    getSchema()
      .then(({ schema: s, tableCounts: tc }) => {
        setSchema(s);
        setTableCounts(tc);
        setDbStatus('ok');
      })
      .catch(() => setDbStatus('error'));
  }, []);

  useEffect(() => {
    loadSchema();
    getSuggestions()
      .then(({ suggestions: s }) => setSuggestions(s))
      .catch(() => {});
  }, [loadSchema]);

  const handleQuery = useCallback(async (question) => {
    setLoading(true);
    setResult(null);
    try {
      const data = await executeQuery(question);
      setResult(data);
      // Add to history
      setQueryHistory(prev => [
        ...prev,
        {
          id: ++historyIdCounter,
          question,
          status: data.status,
          sql: data.sql,
          rowCount: data.rowCount,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      const errResult = {
        status: 'error',
        message: err?.response?.data?.message || err.message || 'Failed to reach the server.',
        sql: null,
        data: null,
        columns: null,
        rowCount: 0,
      };
      setResult(errResult);
      setQueryHistory(prev => [
        ...prev,
        {
          id: ++historyIdCounter,
          question,
          status: 'error',
          sql: null,
          rowCount: 0,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="app-container">
      <Header
        theme={theme}
        onThemeToggle={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
        history={queryHistory}
        onRerun={handleQuery}
        onClearHistory={() => setQueryHistory([])}
      >
        <DataManager onDataChanged={loadSchema} />
      </Header>

      <div className="main-content">
        {/* Sidebar */}
        <Sidebar schema={schema} tableCounts={tableCounts} dbStatus={dbStatus} />

        {/* Main column */}
        <div className="content-area">
          {/* Query input */}
          <QueryInput
            ref={queryInputRef}
            onSubmit={handleQuery}
            suggestions={suggestions}
            loading={loading}
          />

          {/* Loading pulse */}
          {loading && (
            <div
              className="glass-panel animate-fade-in"
              style={{
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                borderRadius: '12px',
                color: '#94a3b8',
              }}
            >
              <div className="loader" />
              <span>Asking Gemini to generate SQL…</span>
            </div>
          )}

          {/* SQL result card */}
          {result && !loading && <SQLResult result={result} />}

          {/* Data table */}
          {!loading && (
            <ResultsTable result={result} onDataChanged={loadSchema} />
          )}
        </div>
      </div>

      {/* Draggable chart panel — fixed on the right edge */}
      <ChartPanel result={result} />
    </div>
  );
}
