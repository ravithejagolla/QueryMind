import { useState } from 'react';
import { ChevronDown, ChevronRight, Database, Hash } from 'lucide-react';

function TableSchemaItem({ tableName, columns, rowCount }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="table-schema">
      <div className="table-schema-header" onClick={() => setOpen(o => !o)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={14} color="#60a5fa" />
          <span style={{ color: '#f1f5f9' }}>{tableName}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {rowCount !== undefined && (
            <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Hash size={11} />{rowCount}
            </span>
          )}
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </div>
      </div>
      {open && (
        <div className="table-columns">
          {columns.map(col => (
            <div key={col.column} className="column-item">
              <span className="column-name">{col.column}</span>
              <span className="column-type">{col.type}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ schema, tableCounts, dbStatus }) {
  if (!schema) {
    return (
      <aside className="sidebar glass-panel">
        <div className="sidebar-header">
          <Database size={16} />
          <span>Schema</span>
        </div>
        <div className="sidebar-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.85rem' }}>
          {dbStatus === 'error' ? 'DB not connected' : 'Loading schema…'}
        </div>
      </aside>
    );
  }

  return (
    <aside className="sidebar glass-panel">
      <div className="sidebar-header">
        <Database size={16} color="#60a5fa" />
        <span>Database Schema</span>
        <span
          title={dbStatus === 'ok' ? 'Connected' : 'Disconnected'}
          style={{
            marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%',
            background: dbStatus === 'ok' ? '#10b981' : '#ef4444',
          }}
        />
      </div>
      <div className="sidebar-content">
        {Object.entries(schema).map(([table, cols]) => (
          <TableSchemaItem
            key={table}
            tableName={table}
            columns={cols}
            rowCount={tableCounts?.[table]}
          />
        ))}
      </div>
    </aside>
  );
}
