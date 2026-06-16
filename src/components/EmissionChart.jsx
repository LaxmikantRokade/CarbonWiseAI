import { Component, memo } from 'react';
import {
  PieChart, Pie, Cell,
  BarChart, Bar,
  LineChart, Line,
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import ResizeObserverPolyfill from 'resize-observer-polyfill';

// Polyfill structuredClone for older WebViews
if (typeof window !== 'undefined' && typeof window.structuredClone !== 'function') {
  window.structuredClone = function (obj) {
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch (e) {
      return obj;
    }
  };
}

// Polyfill ResizeObserver for older WebViews
if (typeof window !== 'undefined' && typeof window.ResizeObserver !== 'function') {
  window.ResizeObserver = ResizeObserverPolyfill;
}

class ChartErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[EmissionChart] Caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center w-full h-full min-h-[200px] bg-white/50 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-white/10 p-6 text-center">
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
            Chart rendering unavailable on this device.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}


const defaultColors = ['#10b981', '#06b6d4', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#3b82f6', '#f97316'];

function GlassTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white/90 dark:bg-carbon-900/90 backdrop-blur-xl
      border border-white/30 dark:border-white/10
      rounded-xl px-4 py-3 shadow-xl">
      {label && (
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">{label}</p>
      )}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-600 dark:text-gray-300 font-medium">{entry.name}:</span>
          <span className="font-bold text-gray-900 dark:text-white ml-auto">
            {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function renderPieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null;

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
      className="text-xs font-bold drop-shadow-md">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

const EmissionChart = memo(function EmissionChart({
  type = 'bar',
  data = [],
  colors = defaultColors,
  height = 300,
  title,
  subtitle,
}) {
  const axisStyle = {
    fontSize: 11,
    fill: '#9ca3af',
    fontFamily: 'Inter, system-ui, sans-serif',
  };

  const renderChart = () => {
    switch (type) {
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="55%"
              outerRadius="85%"
              paddingAngle={3}
              dataKey="value"
              labelLine={false}
              label={renderPieLabel}
              animationBegin={0}
              animationDuration={1200}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} stroke="none" />
              ))}
            </Pie>
            <Tooltip content={<GlassTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 12, fontWeight: 500 }}
            />
          </PieChart>
        );

      case 'line':
        return (
          <LineChart data={data}>
            <defs>
              {colors.slice(0, 3).map((color, i) => (
                <linearGradient key={i} id={`lineGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.2} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
            <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
            <Tooltip content={<GlassTooltip />} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, fontWeight: 500 }} />
            {data.length > 0 &&
              Object.keys(data[0])
                .filter((k) => k !== 'name')
                .map((key, i) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={colors[i % colors.length]}
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: colors[i % colors.length], strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                    animationDuration={1500}
                  />
                ))}
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart data={data}>
            <defs>
              {colors.slice(0, 4).map((color, i) => (
                <linearGradient key={i} id={`areaGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
            <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
            <Tooltip content={<GlassTooltip />} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, fontWeight: 500 }} />
            {data.length > 0 &&
              Object.keys(data[0])
                .filter((k) => k !== 'name')
                .map((key, i) => (
                  <Area
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={colors[i % colors.length]}
                    strokeWidth={2}
                    fill={`url(#areaGrad${i})`}
                    animationDuration={1500}
                  />
                ))}
          </AreaChart>
        );

      case 'bar':
      default:
        return (
          <BarChart data={data} barGap={4}>
            <defs>
              {colors.slice(0, 4).map((color, i) => (
                <linearGradient key={i} id={`barGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.9} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.5} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
            <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
            <Tooltip content={<GlassTooltip />} cursor={{ fill: 'rgba(148,163,184,0.08)' }} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, fontWeight: 500 }} />
            {data.length > 0 &&
              Object.keys(data[0])
                .filter((k) => k !== 'name')
                .map((key, i) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    fill={`url(#barGrad${i})`}
                    radius={[6, 6, 0, 0]}
                    animationDuration={1200}
                  />
                ))}
          </BarChart>
        );
    }
  };

  return (
    <div className="w-full min-w-0 overflow-hidden">
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-base font-bold text-gray-900 dark:text-white">{title}</h3>
          )}
          {subtitle && (
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
          )}
        </div>
      )}

      <ChartErrorBoundary>
        <ResponsiveContainer width="100%" height={height}>
          {renderChart()}
        </ResponsiveContainer>
      </ChartErrorBoundary>
    </div>
  );
});

export default EmissionChart;
