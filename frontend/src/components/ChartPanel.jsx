import { useState, useRef, useCallback, useEffect } from 'react';
import { BarChart2, ChevronRight, ChevronLeft, GripVertical } from 'lucide-react';
import ChartView from './ChartView';

const MIN_WIDTH = 280;
const MAX_WIDTH = 700;
const DEFAULT_WIDTH = 380;

export default function ChartPanel({ result }) {
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(0);
  const panelRef = useRef(null);

  const hasChart =
    result &&
    result.status === 'success' &&
    result.data?.length > 0;

  // Auto-open the panel when a chartable result comes in
  useEffect(() => {
    if (hasChart) setIsOpen(true);
  }, [result]);

  // ── Drag handlers ──────────────────────────────────────────
  const onMouseDown = useCallback((e) => {
    e.preventDefault();
    dragStartX.current = e.clientX;
    dragStartWidth.current = width;
    setIsDragging(true);
  }, [width]);

  useEffect(() => {
    if (!isDragging) return;

    const onMove = (e) => {
      const delta = dragStartX.current - e.clientX; // drag left = wider
      const newW = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, dragStartWidth.current + delta));
      setWidth(newW);
    };
    const onUp = () => setIsDragging(false);

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isDragging]);

  return (
    <>
      {/* ── Toggle tab (always visible on the right edge) ── */}
      <div
        id="chart-panel-toggle"
        onClick={() => setIsOpen(o => !o)}
        title={isOpen ? 'Hide Visualisation' : 'Show Visualisation'}
        style={{
          position: 'fixed',
          right: isOpen ? width : 0,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 600,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          width: '26px',
          padding: '18px 0',
          background: hasChart
            ? 'linear-gradient(180deg, #3b82f6, #8b5cf6)'
            : 'rgba(255,255,255,0.08)',
          borderRadius: '10px 0 0 10px',
          cursor: 'pointer',
          transition: 'right 0.3s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: '-4px 0 20px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRight: 'none',
        }}
      >
        {isOpen ? <ChevronRight size={14} color="#fff" /> : <ChevronLeft size={14} color={hasChart ? '#fff' : '#64748b'} />}
        <div style={{
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
          fontSize: '0.65rem',
          fontWeight: 700,
          letterSpacing: '0.08em',
          color: hasChart ? '#fff' : '#64748b',
          fontFamily: 'Inter, sans-serif',
          userSelect: 'none',
        }}>
          CHART
        </div>
        {hasChart && (
          <BarChart2 size={12} color="#fff" />
        )}
      </div>

      {/* ── Slide-in chart panel ── */}
      <div
        ref={panelRef}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: isOpen ? `${width}px` : '0px',
          height: '100vh',
          background: 'var(--bg-secondary)',
          borderLeft: '1px solid var(--border-color)',
          zIndex: 500,
          display: 'flex',
          flexDirection: 'row',
          overflow: 'hidden',
          transition: isDragging ? 'none' : 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: isOpen ? '-8px 0 40px rgba(0,0,0,0.4)' : 'none',
        }}
      >
        {/* ── Drag Handle ── */}
        {isOpen && (
          <div
            onMouseDown={onMouseDown}
            style={{
              width: '8px',
              height: '100%',
              cursor: 'col-resize',
              background: isDragging
                ? 'rgba(59,130,246,0.5)'
                : 'transparent',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s',
              position: 'relative',
            }}
            onMouseOver={e => { if (!isDragging) e.currentTarget.style.background = 'rgba(59,130,246,0.2)'; }}
            onMouseOut={e => { if (!isDragging) e.currentTarget.style.background = 'transparent'; }}
          >
            <GripVertical
              size={14}
              color={isDragging ? '#3b82f6' : '#475569'}
              style={{ pointerEvents: 'none' }}
            />
            {/* Blue drag line indicator */}
            <div style={{
              position: 'absolute',
              top: 0, bottom: 0,
              left: '3px',
              width: '2px',
              background: isDragging ? '#3b82f6' : 'transparent',
              transition: 'background 0.15s',
            }} />
          </div>
        )}

        {/* ── Panel content ── */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minWidth: 0,
        }}>
          {/* Panel header */}
          <div style={{
            padding: '14px 16px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(0,0,0,0.15)',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: 28, height: 28,
                borderRadius: '8px',
                background: 'linear-gradient(135deg, rgba(59,130,246,0.3), rgba(139,92,246,0.3))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid rgba(59,130,246,0.3)',
              }}>
                <BarChart2 size={14} color="#60a5fa" />
              </div>
              <div>
                <p style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Visualisation
                </p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>
                  Drag handle ← to resize
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', padding: '4px', borderRadius: '6px',
                display: 'flex', alignItems: 'center',
                transition: 'color 0.2s',
              }}
              onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Chart content */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}>
            {hasChart ? (
              <ChartView result={result} embedded />
            ) : (
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                color: 'var(--text-muted)',
                textAlign: 'center',
                padding: '40px 20px',
              }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '16px',
                  background: 'rgba(59,130,246,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid rgba(59,130,246,0.2)',
                }}>
                  <BarChart2 size={28} color="#3b82f6" opacity={0.5} />
                </div>
                <div>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    No chart data yet
                  </p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Run a query that returns numeric data to see charts here. Try asking about totals, counts, or averages.
                  </p>
                </div>
                {/* Example queries hint */}
                <div style={{
                  background: 'rgba(59,130,246,0.08)',
                  border: '1px solid rgba(59,130,246,0.2)',
                  borderRadius: '10px',
                  padding: '12px',
                  fontSize: '0.75rem',
                  color: '#60a5fa',
                  lineHeight: 1.7,
                  textAlign: 'left',
                  width: '100%',
                }}>
                  <strong style={{ display: 'block', marginBottom: '4px' }}>💡 Chart-friendly queries:</strong>
                  • Total revenue by country<br />
                  • Top 5 best-selling products<br />
                  • Orders count by status<br />
                  • Average order value by month
                </div>
              </div>
            )}
          </div>

          {/* Width indicator while dragging */}
          {isDragging && (
            <div style={{
              position: 'absolute',
              bottom: '16px', left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(59,130,246,0.9)',
              color: '#fff',
              borderRadius: '999px',
              padding: '4px 12px',
              fontSize: '0.72rem',
              fontWeight: 700,
              fontFamily: 'Fira Code, monospace',
              pointerEvents: 'none',
            }}>
              {width}px
            </div>
          )}
        </div>
      </div>

      {/* Cursor overlay while dragging to prevent iframe/select interference */}
      {isDragging && (
        <div style={{
          position: 'fixed', inset: 0,
          cursor: 'col-resize',
          zIndex: 9999,
        }} />
      )}
    </>
  );
}
