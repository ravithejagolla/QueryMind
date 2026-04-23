import { useState } from 'react';
import { PlusCircle, Trash2, X, ChevronDown, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { insertRow, deleteRow } from '../services/api';

// Table schema definitions for building the insert form
const TABLE_SCHEMAS = {
  customers: [
    { field: 'first_name', label: 'First Name', type: 'text', required: true },
    { field: 'last_name', label: 'Last Name', type: 'text', required: true },
    { field: 'email', label: 'Email', type: 'email', required: true },
    { field: 'phone', label: 'Phone', type: 'text', required: false },
    { field: 'city', label: 'City', type: 'text', required: false },
    { field: 'country', label: 'Country', type: 'text', required: false },
  ],
  products: [
    { field: 'product_name', label: 'Product Name', type: 'text', required: true },
    { field: 'category', label: 'Category', type: 'text', required: false },
    { field: 'price', label: 'Price ($)', type: 'number', required: true },
    { field: 'stock_quantity', label: 'Stock Quantity', type: 'number', required: false },
  ],
  orders: [
    { field: 'customer_id', label: 'Customer ID', type: 'number', required: true },
    { field: 'status', label: 'Status', type: 'select', options: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], required: false },
    { field: 'total_price', label: 'Total Price ($)', type: 'number', required: false },
    { field: 'shipping_city', label: 'Shipping City', type: 'text', required: false },
    { field: 'shipping_country', label: 'Shipping Country', type: 'text', required: false },
  ],
  order_items: [
    { field: 'order_id', label: 'Order ID', type: 'number', required: true },
    { field: 'product_id', label: 'Product ID', type: 'number', required: true },
    { field: 'quantity', label: 'Quantity', type: 'number', required: true },
    { field: 'unit_price', label: 'Unit Price ($)', type: 'number', required: true },
  ],
};

const TABLE_PK_LABELS = {
  customers: 'customer_id',
  products: 'product_id',
  orders: 'order_id',
  order_items: 'item_id',
};

export default function DataManager({ onDataChanged }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('insert'); // 'insert' | 'delete'
  const [selectedTable, setSelectedTable] = useState('customers');
  const [formValues, setFormValues] = useState({});
  const [deleteId, setDeleteId] = useState('');
  const [status, setStatus] = useState(null); // { type: 'success'|'error', message: string }
  const [loading, setLoading] = useState(false);

  const schema = TABLE_SCHEMAS[selectedTable] || [];

  const handleOpen = () => {
    setIsOpen(true);
    setStatus(null);
    setFormValues({});
    setDeleteId('');
  };

  const handleClose = () => {
    setIsOpen(false);
    setStatus(null);
  };

  const handleTableChange = (t) => {
    setSelectedTable(t);
    setFormValues({});
    setDeleteId('');
    setStatus(null);
  };

  const handleFieldChange = (field, value) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
  };

  const handleInsert = async () => {
    // Validate required
    const missing = schema.filter(f => f.required && !formValues[f.field]?.toString().trim());
    if (missing.length > 0) {
      setStatus({ type: 'error', message: `Missing required fields: ${missing.map(f => f.label).join(', ')}` });
      return;
    }

    // Build row (cast numbers)
    const row = {};
    schema.forEach(f => {
      const val = formValues[f.field];
      if (val === undefined || val === '') return;
      row[f.field] = f.type === 'number' ? Number(val) : val;
    });

    setLoading(true);
    setStatus(null);
    try {
      const res = await insertRow(selectedTable, row);
      setStatus({ type: 'success', message: res.message || 'Row inserted successfully!' });
      setFormValues({});
      if (onDataChanged) onDataChanged();
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || 'Insert failed.';
      setStatus({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId.toString().trim()) {
      setStatus({ type: 'error', message: 'Please enter a valid ID.' });
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const res = await deleteRow(selectedTable, deleteId);
      setStatus({ type: 'success', message: res.message || 'Row deleted successfully!' });
      setDeleteId('');
      if (onDataChanged) onDataChanged();
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || 'Delete failed.';
      setStatus({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        id="data-manager-btn"
        onClick={handleOpen}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 18px',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          color: '#fff',
          border: 'none',
          borderRadius: '999px',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '0.85rem',
          fontFamily: 'Inter, sans-serif',
          transition: 'all 0.2s ease',
          boxShadow: '0 0 16px rgba(16,185,129,0.3)',
        }}
        onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.boxShadow = '0 0 24px rgba(16,185,129,0.5)'; }}
        onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 16px rgba(16,185,129,0.3)'; }}
      >
        <PlusCircle size={15} />
        Add / Delete Data
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div
          id="data-manager-modal"
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 9000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div style={{
            background: '#1e293b',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '20px',
            width: '520px',
            maxWidth: '95vw',
            maxHeight: '90vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#f1f5f9' }}>
                  Data Manager
                </h2>
                <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  Insert or delete rows from your database tables
                </p>
              </div>
              <button
                id="data-manager-close"
                onClick={handleClose}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px', borderRadius: '6px', display: 'flex' }}
                onMouseOver={e => e.currentTarget.style.color = '#f1f5f9'}
                onMouseOut={e => e.currentTarget.style.color = '#64748b'}
              >
                <X size={18} />
              </button>
            </div>

            {/* Tab Toggle */}
            <div style={{ padding: '16px 24px 0', display: 'flex', gap: '8px' }}>
              {['insert', 'delete'].map(m => (
                <button
                  key={m}
                  id={`tab-${m}`}
                  onClick={() => { setMode(m); setStatus(null); }}
                  style={{
                    flex: 1,
                    padding: '9px 0',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    fontFamily: 'Inter, sans-serif',
                    transition: 'all 0.2s',
                    background: mode === m
                      ? (m === 'insert' ? 'rgba(59,130,246,0.2)' : 'rgba(239,68,68,0.2)')
                      : 'rgba(255,255,255,0.04)',
                    color: mode === m
                      ? (m === 'insert' ? '#60a5fa' : '#f87171')
                      : '#64748b',
                    border: mode === m
                      ? `1px solid ${m === 'insert' ? 'rgba(59,130,246,0.4)' : 'rgba(239,68,68,0.4)'}`
                      : '1px solid transparent',
                  }}
                >
                  {m === 'insert' ? '➕ Insert Row' : '🗑 Delete Row'}
                </button>
              ))}
            </div>

            {/* Table Selector */}
            <div style={{ padding: '16px 24px 0' }}>
              <label style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Table
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  id="table-selector"
                  value={selectedTable}
                  onChange={e => handleTableChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 36px 10px 14px',
                    background: '#0f172a',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '10px',
                    color: '#f1f5f9',
                    fontSize: '0.9rem',
                    fontFamily: 'Fira Code, monospace',
                    appearance: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {Object.keys(TABLE_SCHEMAS).map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
              </div>
            </div>

            {/* Form Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
              {mode === 'insert' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {schema.map(field => (
                    <div key={field.field}>
                      <label style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '5px' }}>
                        {field.label}
                        {field.required && <span style={{ color: '#f87171', marginLeft: '3px' }}>*</span>}
                      </label>
                      {field.type === 'select' ? (
                        <div style={{ position: 'relative' }}>
                          <select
                            id={`field-${field.field}`}
                            value={formValues[field.field] || ''}
                            onChange={e => handleFieldChange(field.field, e.target.value)}
                            style={{
                              width: '100%', padding: '9px 36px 9px 12px',
                              background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '8px', color: '#f1f5f9', fontSize: '0.88rem',
                              fontFamily: 'Inter, sans-serif', appearance: 'none', cursor: 'pointer',
                            }}
                          >
                            <option value="">— select —</option>
                            {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                          </select>
                          <ChevronDown size={13} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
                        </div>
                      ) : (
                        <input
                          id={`field-${field.field}`}
                          type={field.type}
                          value={formValues[field.field] || ''}
                          onChange={e => handleFieldChange(field.field, e.target.value)}
                          placeholder={`Enter ${field.label.toLowerCase()}…`}
                          style={{
                            width: '100%', padding: '9px 12px',
                            background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px', color: '#f1f5f9', fontSize: '0.88rem',
                            fontFamily: 'Inter, sans-serif', outline: 'none',
                            transition: 'border-color 0.2s',
                          }}
                          onFocus={e => e.target.style.borderColor = '#3b82f6'}
                          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <div style={{
                    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: '10px', padding: '14px', marginBottom: '16px',
                    fontSize: '0.82rem', color: '#fca5a5',
                  }}>
                    ⚠️ This will permanently delete the row. Enter the <strong style={{ fontFamily: 'Fira Code, monospace' }}>{TABLE_PK_LABELS[selectedTable]}</strong> of the row to delete.
                  </div>
                  <label style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {TABLE_PK_LABELS[selectedTable]} <span style={{ color: '#f87171' }}>*</span>
                  </label>
                  <input
                    id="delete-id-input"
                    type="number"
                    value={deleteId}
                    onChange={e => setDeleteId(e.target.value)}
                    placeholder={`Enter ${TABLE_PK_LABELS[selectedTable]}…`}
                    style={{
                      width: '100%', padding: '10px 12px',
                      background: '#0f172a', border: '1px solid rgba(239,68,68,0.3)',
                      borderRadius: '8px', color: '#f1f5f9', fontSize: '0.88rem',
                      fontFamily: 'Fira Code, monospace', outline: 'none',
                    }}
                    onFocus={e => e.target.style.borderColor = '#ef4444'}
                    onBlur={e => e.target.style.borderColor = 'rgba(239,68,68,0.3)'}
                  />
                </div>
              )}

              {/* Status message */}
              {status && (
                <div style={{
                  marginTop: '14px',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '0.85rem',
                  background: status.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                  border: `1px solid ${status.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                  color: status.type === 'success' ? '#34d399' : '#f87171',
                  animation: 'fadeIn 0.3s ease-out',
                }}>
                  {status.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
                  {status.message}
                </div>
              )}
            </div>

            {/* Footer Action */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={handleClose}
                style={{
                  padding: '9px 20px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px', color: '#94a3b8', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem',
                }}
              >
                Cancel
              </button>
              <button
                id={mode === 'insert' ? 'btn-insert' : 'btn-delete'}
                onClick={mode === 'insert' ? handleInsert : handleDelete}
                disabled={loading}
                style={{
                  padding: '9px 22px',
                  background: mode === 'insert'
                    ? 'linear-gradient(135deg, #3b82f6, #2563eb)'
                    : 'linear-gradient(135deg, #ef4444, #dc2626)',
                  border: 'none', borderRadius: '10px', color: '#fff',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 600, fontFamily: 'Inter, sans-serif', fontSize: '0.85rem',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  opacity: loading ? 0.7 : 1,
                  transition: 'all 0.2s',
                }}
              >
                {loading
                  ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Processing…</>
                  : mode === 'insert'
                    ? <><PlusCircle size={14} /> Insert Row</>
                    : <><Trash2 size={14} /> Delete Row</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
