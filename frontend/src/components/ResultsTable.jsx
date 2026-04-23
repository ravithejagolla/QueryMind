import { useState } from 'react';
import { TableIcon, AlertCircle, Inbox, Download, Pencil, Check, X } from 'lucide-react';
import { updateRow } from '../services/api';

function formatValue(val) {
  if (val === null || val === undefined) return <span style={{ color: '#64748b', fontStyle: 'italic' }}>NULL</span>;
  if (typeof val === 'boolean') return val ? 'true' : 'false';
  if (typeof val === 'object') return JSON.stringify(val);
  const str = String(val);
  if (!isNaN(val) && str.includes('.'))
    return parseFloat(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (!isNaN(val) && Number.isInteger(Number(val)))
    return Number(val).toLocaleString();
  return str;
}

// Detect which table this result is from (best-effort by column names)
const TABLE_PK = {
  customers:   { pk: 'customer_id' },
  products:    { pk: 'product_id' },
  orders:      { pk: 'order_id' },
  order_items: { pk: 'item_id' },
};

function detectTable(columns = []) {
  for (const [table, { pk }] of Object.entries(TABLE_PK)) {
    if (columns.includes(pk)) return { table, pk };
  }
  return null;
}

function exportCSV(columns, data) {
  const header = columns.join(',');
  const rows = data.map(row =>
    columns.map(col => {
      const v = row[col];
      if (v === null || v === undefined) return '';
      const s = String(v);
      return s.includes(',') || s.includes('"') || s.includes('\n')
        ? `"${s.replace(/"/g, '""')}"`
        : s;
    }).join(',')
  );
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `query_results_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ResultsTable({ result, onDataChanged }) {
  const [editingRow, setEditingRow] = useState(null); // { index, values }
  const [saving, setSaving] = useState(false);
  const [editStatus, setEditStatus] = useState(null);

  if (!result) {
    return (
      <div className="result-card glass-panel" style={{ flex: 1, justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
        <div className="empty-state">
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TableIcon size={28} color="#3b82f6" />
          </div>
          <p style={{ color: '#94a3b8' }}>Ask a question to see results here</p>
          <p style={{ fontSize: '0.8rem', color: '#475569' }}>Results from your database will appear in this table</p>
        </div>
      </div>
    );
  }

  const { status, data, columns, rowCount, message } = result;

  if (status !== 'success' || !data) {
    return (
      <div className="result-card glass-panel" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="empty-state">
          <AlertCircle size={36} color={status === 'clarification_needed' ? '#f59e0b' : '#ef4444'} />
          <p style={{ color: '#94a3b8', maxWidth: 400, textAlign: 'center' }}>{message}</p>
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="result-card glass-panel" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="empty-state">
          <Inbox size={36} color="#64748b" />
          <p>No rows returned</p>
          <p style={{ fontSize: '0.8rem', color: '#475569' }}>The query executed successfully but returned 0 rows.</p>
        </div>
      </div>
    );
  }

  const tableInfo = detectTable(columns);
  const canEdit = !!tableInfo;

  const startEdit = (i) => {
    const row = data[i];
    setEditingRow({ index: i, values: { ...row } });
    setEditStatus(null);
  };

  const cancelEdit = () => { setEditingRow(null); setEditStatus(null); };

  const saveEdit = async () => {
    if (!tableInfo || !editingRow) return;
    const { table, pk } = tableInfo;
    const id = editingRow.values[pk];
    const updates = { ...editingRow.values };
    delete updates[pk];
    setSaving(true);
    try {
      await updateRow(table, id, updates);
      setEditStatus({ type: 'success', msg: 'Row updated!' });
      setEditingRow(null);
      if (onDataChanged) onDataChanged();
    } catch (err) {
      setEditStatus({ type: 'error', msg: err?.response?.data?.error || 'Update failed.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="result-card glass-panel animate-fade-in" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TableIcon size={15} />
          <span>Query Results</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {editStatus && (
            <span style={{
              fontSize: '0.75rem', fontWeight: 600,
              color: editStatus.type === 'success' ? '#10b981' : '#ef4444',
              animation: 'fadeIn 0.3s ease-out',
            }}>
              {editStatus.type === 'success' ? '✓' : '✗'} {editStatus.msg}
            </span>
          )}
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            {rowCount} {rowCount === 1 ? 'row' : 'rows'} · {columns.length} {columns.length === 1 ? 'col' : 'cols'}
          </span>
          <button
            id="export-csv-btn"
            onClick={() => exportCSV(columns, data)}
            title="Export as CSV"
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '4px 12px', borderRadius: '999px',
              background: 'rgba(16,185,129,0.15)',
              border: '1px solid rgba(16,185,129,0.3)',
              color: '#10b981', cursor: 'pointer',
              fontSize: '0.75rem', fontWeight: 600, fontFamily: 'Inter, sans-serif',
              transition: 'all 0.2s',
            }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(16,185,129,0.25)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(16,185,129,0.15)'}
          >
            <Download size={12} /> Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ color: '#64748b', width: '40px', textAlign: 'center' }}>#</th>
              {columns.map(col => <th key={col}>{col}</th>)}
              {canEdit && <th style={{ color: '#64748b', width: '60px', textAlign: 'center' }}>Edit</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => {
              const isEditing = editingRow?.index === i;
              return (
                <tr key={i} style={isEditing ? { background: 'rgba(59,130,246,0.06)' } : {}}>
                  <td style={{ color: '#475569', textAlign: 'center', fontSize: '0.8rem' }}>{i + 1}</td>
                  {columns.map(col => (
                    <td key={col}>
                      {isEditing && col !== tableInfo?.pk ? (
                        <input
                          value={editingRow.values[col] ?? ''}
                          onChange={e => setEditingRow(prev => ({
                            ...prev,
                            values: { ...prev.values, [col]: e.target.value }
                          }))}
                          style={{
                            background: 'rgba(15,23,42,0.8)',
                            border: '1px solid rgba(59,130,246,0.5)',
                            borderRadius: '5px', color: '#f1f5f9',
                            padding: '3px 7px', fontSize: '0.82rem',
                            fontFamily: 'inherit', width: '100%', minWidth: '80px',
                          }}
                        />
                      ) : (
                        formatValue(row[col])
                      )}
                    </td>
                  ))}
                  {canEdit && (
                    <td style={{ textAlign: 'center' }}>
                      {isEditing ? (
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                          <button
                            onClick={saveEdit}
                            disabled={saving}
                            title="Save"
                            style={{
                              background: 'rgba(16,185,129,0.2)',
                              border: '1px solid rgba(16,185,129,0.4)',
                              borderRadius: '5px', cursor: 'pointer',
                              color: '#10b981', padding: '3px 6px', display: 'flex',
                            }}
                          >
                            <Check size={12} />
                          </button>
                          <button
                            onClick={cancelEdit}
                            title="Cancel"
                            style={{
                              background: 'rgba(239,68,68,0.15)',
                              border: '1px solid rgba(239,68,68,0.3)',
                              borderRadius: '5px', cursor: 'pointer',
                              color: '#ef4444', padding: '3px 6px', display: 'flex',
                            }}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(i)}
                          title="Edit row"
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: '#64748b', padding: '3px', display: 'flex',
                            transition: 'color 0.2s',
                          }}
                          onMouseOver={e => e.currentTarget.style.color = '#60a5fa'}
                          onMouseOut={e => e.currentTarget.style.color = '#64748b'}
                        >
                          <Pencil size={13} />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
