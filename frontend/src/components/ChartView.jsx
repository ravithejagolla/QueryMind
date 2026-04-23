import { useState, useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { BarChart2, PieChart as PieIcon, TrendingUp } from 'lucide-react';

const COLORS = [
  '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444',
  '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1',
];

const CHART_TYPES = [
  { id: 'bar',  label: 'Bar',  Icon: BarChart2 },
  { id: 'line', label: 'Line', Icon: TrendingUp },
  { id: 'pie',  label: 'Pie',  Icon: PieIcon },
];

function detectChartData(columns, data) {
  if (!columns || !data || data.length === 0) return null;

  const numericCols = columns.filter(col =>
    data.some(row => {
      const v = row[col];
      return v !== null && v !== undefined && !isNaN(Number(v));
    })
  );
  const textCols = columns.filter(col => !numericCols.includes(col));

  if (numericCols.length === 0) return null;

  const labelCol = textCols[0] || columns[0];
  const valueCols = numericCols.slice(0, 4);

  const chartData = data.slice(0, 20).map(row => {
    const entry = { name: String(row[labelCol] ?? '').slice(0, 20) };
    valueCols.forEach(col => {
      entry[col] = parseFloat(Number(row[col]).toFixed(2));
    });
    return entry;
  });

  return { chartData, labelCol, valueCols };
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1e293b',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: '10px',
      padding: '10px 14px',
      fontSize: '0.82rem',
      color: '#f1f5f9',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    }}>
      <p style={{ color: '#94a3b8', marginBottom: 6 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: <strong>{Number(p.value).toLocaleString()}</strong>
        </p>
      ))}
    </div>
  );
};

const CustomPieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1e293b',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: '10px',
      padding: '10px 14px',
      fontSize: '0.82rem',
      color: '#f1f5f9',
    }}>
      <p style={{ color: payload[0].payload.fill }}>{payload[0].name}</p>
      <p><strong>{Number(payload[0].value).toLocaleString()}</strong></p>
    </div>
  );
};

export default function ChartView({ result, embedded = false }) {
  const [chartType, setChartType] = useState('bar');

  const detected = useMemo(
    () => result ? detectChartData(result.columns, result.data) : null,
    [result]
  );

  if (!result || result.status !== 'success' || !detected) return null;

  const { chartData, valueCols } = detected;
  const chartHeight = embedded ? 260 : 280;

  // When embedded inside the panel, don't use the card wrapper
  if (embedded) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
        {/* Chart type toggle */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {CHART_TYPES.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setChartType(id)}
              style={{
                padding: '4px 12px', borderRadius: '999px',
                cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
                fontFamily: 'Inter, sans-serif',
                display: 'flex', alignItems: 'center', gap: '5px',
                transition: 'all 0.2s',
                background: chartType === id ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.06)',
                color: chartType === id ? '#60a5fa' : '#64748b',
                border: chartType === id ? '1px solid rgba(59,130,246,0.4)' : '1px solid transparent',
              }}
            >
              <Icon size={12} />{label}
            </button>
          ))}
        </div>
        {/* Chart */}
        <div style={{ height: chartHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} angle={-30} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip content={<CustomTooltip />} />
                {valueCols.length > 1 && <Legend wrapperStyle={{ fontSize: '0.72rem', color: '#94a3b8' }} />}
                {valueCols.map((col, i) => (
                  <Bar key={col} dataKey={col} fill={COLORS[i % COLORS.length]} radius={[3, 3, 0, 0]} />
                ))}
              </BarChart>
            ) : chartType === 'line' ? (
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} angle={-30} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip content={<CustomTooltip />} />
                {valueCols.length > 1 && <Legend wrapperStyle={{ fontSize: '0.72rem', color: '#94a3b8' }} />}
                {valueCols.map((col, i) => (
                  <Line key={col} type="monotone" dataKey={col} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                ))}
              </LineChart>
            ) : (
              <PieChart>
                <Pie data={chartData} dataKey={valueCols[0]} nameKey="name" cx="50%" cy="50%" outerRadius={90} paddingAngle={3}
                  label={({ name, percent }) => `${name.slice(0, 8)} ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                >
                  {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>
        {/* Data summary */}
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', paddingBottom: '4px' }}>
          Showing {Math.min(chartData.length, 20)} of {result.data.length} rows
        </div>
      </div>
    );
  }

  return (
    <div className="result-card glass-panel animate-fade-in" style={{ minHeight: 320 }}>
      {/* Header */}
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart2 size={15} />
          <span>Visualisation</span>
        </div>
        {/* Chart type toggle */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {CHART_TYPES.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setChartType(id)}
              title={label}
              style={{
                padding: '4px 12px',
                borderRadius: '999px',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif',
                display: 'flex', alignItems: 'center', gap: '5px',
                transition: 'all 0.2s',
                background: chartType === id
                  ? 'rgba(59,130,246,0.25)'
                  : 'rgba(255,255,255,0.06)',
                color: chartType === id ? '#60a5fa' : '#64748b',
                border: chartType === id
                  ? '1px solid rgba(59,130,246,0.4)'
                  : '1px solid transparent',
              }}
            >
              <Icon size={12} />{label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart body */}
      <div style={{ padding: '20px 10px 10px', height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#64748b' }}
                angle={-30}
                textAnchor="end"
                interval={0}
              />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip content={<CustomTooltip />} />
              {valueCols.length > 1 && <Legend wrapperStyle={{ fontSize: '0.78rem', color: '#94a3b8' }} />}
              {valueCols.map((col, i) => (
                <Bar key={col} dataKey={col} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          ) : chartType === 'line' ? (
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#64748b' }}
                angle={-30}
                textAnchor="end"
                interval={0}
              />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip content={<CustomTooltip />} />
              {valueCols.length > 1 && <Legend wrapperStyle={{ fontSize: '0.78rem', color: '#94a3b8' }} />}
              {valueCols.map((col, i) => (
                <Line
                  key={col}
                  type="monotone"
                  dataKey={col}
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          ) : (
            <PieChart>
              <Pie
                data={chartData}
                dataKey={valueCols[0]}
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                paddingAngle={3}
                label={({ name, percent }) =>
                  `${name.slice(0, 10)} ${(percent * 100).toFixed(0)}%`
                }
                labelLine={{ stroke: 'rgba(255,255,255,0.2)' }}
              >
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
