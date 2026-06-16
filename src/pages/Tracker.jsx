import { useState, useMemo } from 'react';
import { LineChart, Trash2, Calendar, TrendingDown, Activity, BarChart3 } from 'lucide-react';
import trackerImg from '../assets/images/tracker.png';
import { useCarbon } from '../context/CarbonContext';
import { categoryColors, categoryLabels } from '../data/carbonFactors';
import CategoryIcon from '../components/CategoryIcon';
import StatCard from '../components/StatCard';
import EmissionChart from '../components/EmissionChart';

function CalendarHeatmap({ entries }) {
  const days = useMemo(() => {
    const result = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayEntries = entries.filter(
        (e) => e.date && e.date.split('T')[0] === dateStr
      );
      const total = dayEntries.reduce((sum, e) => sum + (e.amount || 0), 0);
      result.push({
        date: dateStr,
        total,
        day: date.toLocaleDateString('en', { weekday: 'short' }),
        label: date.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      });
    }
    return result;
  }, [entries]);

  const maxEmission = Math.max(...days.map((d) => d.total), 1);

  const getColor = (total) => {
    if (total === 0) return 'bg-gray-100 dark:bg-gray-800';
    const ratio = total / maxEmission;
    if (ratio < 0.25) return 'bg-emerald-200 dark:bg-emerald-900';
    if (ratio < 0.5) return 'bg-emerald-400 dark:bg-emerald-700';
    if (ratio < 0.75) return 'bg-amber-400 dark:bg-amber-700';
    return 'bg-rose-400 dark:bg-rose-700';
  };

  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
        <Calendar className="w-4 h-4 text-emerald-500" /> 30-Day Activity Heatmap
      </h3>
      <div className="grid grid-cols-10 gap-1.5 sm:grid-cols-15 md:grid-cols-30">
        {days.map((day) => (
          <div key={day.date} className="group relative">
            <div
              className={`w-full aspect-square rounded-sm ${getColor(day.total)} transition-all duration-200 hover:ring-2 hover:ring-emerald-500/50 cursor-pointer`}
            />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
              <div className="glass-card px-2 py-1 text-[10px] whitespace-nowrap text-gray-700 dark:text-gray-300 shadow-lg">
                <div className="font-medium">{day.label}</div>
                <div>{day.total.toFixed(1)} kg CO₂</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-2 mt-3 text-[10px] text-gray-400">
        <span>Less</span>
        <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800" />
        <div className="w-3 h-3 rounded-sm bg-emerald-200 dark:bg-emerald-900" />
        <div className="w-3 h-3 rounded-sm bg-emerald-400 dark:bg-emerald-700" />
        <div className="w-3 h-3 rounded-sm bg-amber-400 dark:bg-amber-700" />
        <div className="w-3 h-3 rounded-sm bg-rose-400 dark:bg-rose-700" />
        <span>More</span>
      </div>
    </div>
  );
}

function getRelativeTime(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en', { month: 'short', day: 'numeric' });
}

export default function Tracker() {
  const { state, deleteEntry } = useCarbon();
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All', color: 'gray' },
    { id: 'transport', label: 'Transport', color: 'amber' },
    { id: 'electricity', label: 'Energy', color: 'blue' },
    { id: 'food', label: 'Food', color: 'emerald' },
    { id: 'waste', label: 'Waste', color: 'rose' },
  ];

  const filteredEntries = useMemo(() => {
    const sorted = [...state.entries].sort((a, b) => new Date(b.date) - new Date(a.date));
    if (activeFilter === 'all') return sorted;
    return sorted.filter((e) => e.category === activeFilter);
  }, [state.entries, activeFilter]);

  const stats = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weekEntries = state.entries.filter((e) => new Date(e.date) >= weekAgo);
    const weekTotal = weekEntries.reduce((s, e) => s + (e.amount || 0), 0);

    const dailyTotals = {};
    state.entries.forEach((e) => {
      const day = e.date?.split('T')[0];
      if (day) dailyTotals[day] = (dailyTotals[day] || 0) + (e.amount || 0);
    });
    const dayValues = Object.values(dailyTotals).filter((v) => v > 0);
    const bestDay = dayValues.length > 0 ? Math.min(...dayValues) : 0;
    const dailyAvg = dayValues.length > 0 ? dayValues.reduce((a, b) => a + b, 0) / dayValues.length : 0;

    return { total: state.entries.length, weekTotal, dailyAvg, bestDay };
  }, [state.entries]);

  const chartData = useMemo(() => {
    const catTotals = { transport: 0, electricity: 0, food: 0, waste: 0 };
    state.entries.forEach((e) => {
      if (catTotals[e.category] !== undefined) {
        catTotals[e.category] += e.amount || 0;
      }
    });
    return Object.entries(catTotals)
      .filter(([, v]) => v > 0)
      .map(([key, value]) => ({
        name: categoryLabels[key] || key,
        value: parseFloat(value.toFixed(1)),
        color: categoryColors[key],
      }));
  }, [state.entries]);

  return (
    <div className="page-enter p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="animate-slide-up relative glass-card overflow-hidden rounded-3xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          <div className="flex-1 space-y-3 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white flex items-center justify-center md:justify-start gap-3">
              <Activity className="w-7 h-7 text-emerald-500" />
              Activity <span className="text-gradient">Tracker</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-300 max-w-lg mx-auto md:mx-0 text-sm md:text-base">
              View and manage your carbon emission history and keep an eye on your green progress.
            </p>
          </div>
          <div className="w-32 h-32 md:w-40 md:h-40 shrink-0 relative">
            <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full" />
            <img src={trackerImg} alt="Tracker" className="w-full h-full object-contain relative z-10 animate-float" />
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up stagger-1">
        <StatCard icon={<BarChart3 className="w-5 h-5" />} title="Total Entries" value={stats.total} color="emerald" />
        <StatCard icon={<Activity className="w-5 h-5" />} title="This Week" value={`${stats.weekTotal.toFixed(1)}`} unit="kg" color="blue" />
        <StatCard icon={<TrendingDown className="w-5 h-5" />} title="Daily Avg" value={`${stats.dailyAvg.toFixed(1)}`} unit="kg" color="amber" />
        <StatCard icon={<Calendar className="w-5 h-5" />} title="Best Day" value={`${stats.bestDay.toFixed(1)}`} unit="kg" color="rose" />
      </div>

      {/* Heatmap */}
      <div className="animate-slide-up stagger-2">
        <CalendarHeatmap entries={state.entries} />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 animate-slide-up stagger-3">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeFilter === f.id
                ? `bg-${f.color}-500/15 text-${f.color}-600 dark:text-${f.color}-400 ring-1 ring-${f.color}-500/30`
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Entries List */}
        <div className="md:col-span-2 space-y-3">
          {filteredEntries.length === 0 ? (
            <div className="glass-card p-10 text-center">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">No entries yet</h3>
              <p className="text-sm text-gray-500 mt-1">Start logging in the Calculator to see your history here.</p>
            </div>
          ) : (
            filteredEntries.map((entry, i) => (
              <div
                key={entry.id}
                className="glass-card p-4 flex items-center gap-4 group animate-slide-up"
                style={{ animationDelay: `${Math.min(i * 0.05, 0.5)}s` }}
              >
                <CategoryIcon category={entry.category} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                    {entry.label || entry.subType}
                  </p>
                  <p className="text-xs text-gray-400">
                    {entry.quantity} {entry.unit} · {getRelativeTime(entry.date)}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${entry.amount < 0 ? 'text-emerald-500' : 'text-gray-800 dark:text-gray-200'}`}>
                    {entry.amount < 0 ? '' : '+'}{entry.amount.toFixed(2)}
                  </p>
                  <p className="text-[10px] text-gray-400">kg CO₂</p>
                </div>
                <button
                  onClick={() => deleteEntry(entry.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-rose-500/10 rounded-lg"
                >
                  <Trash2 className="w-4 h-4 text-rose-400" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Category Chart */}
        <div className="animate-slide-up stagger-4">
          {chartData.length > 0 && (
            <EmissionChart
              type="bar"
              data={chartData}
              colors={chartData.map((d) => d.color)}
              height={300}
              title="By Category"
              subtitle="Total emissions breakdown"
            />
          )}
        </div>
      </div>
    </div>
  );
}
