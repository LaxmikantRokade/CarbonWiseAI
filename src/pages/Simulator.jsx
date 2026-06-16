import { useState, useMemo, useEffect, useRef } from 'react';
import { SlidersHorizontal, TrendingDown, TreePine, DollarSign, Leaf, ArrowDown } from 'lucide-react';
import simulatorImg from '../assets/images/simulator.webp';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useCarbon } from '../context/CarbonContext';
import { simulatorScenarios, calculateSavings } from '../data/simulatorData';
import { categoryColors, averages } from '../data/carbonFactors';

/* -------------------------------------------------- */
/*  Animated counter — counts from 0 to target value  */
/* -------------------------------------------------- */
function AnimatedCounter({ value, duration = 1200, prefix = '', suffix = '', decimals = 0 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const target = Number(value) || 0;
    let start = null;
    const from = display;

    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplay(from + (target - from) * eased);
      if (progress < 1) ref.current = requestAnimationFrame(step);
    };

    ref.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(ref.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  return (
    <span>
      {prefix}
      {display.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
      {suffix}
    </span>
  );
}

/* -------------------------------------------------- */
/*  Tree row — render tree emojis proportionally      */
/* -------------------------------------------------- */
function TreeRow({ count }) {
  const capped = Math.min(count, 30);
  if (capped <= 0) return <span className="text-slate-400 dark:text-slate-600 text-sm">—</span>;
  return (
    <span className="inline-flex flex-wrap gap-0.5 leading-tight">
      {Array.from({ length: capped }).map((_, i) => (
        <span key={i} className="text-sm">🌳</span>
      ))}
      {count > 30 && <span className="text-xs text-slate-500">+{count - 30}</span>}
    </span>
  );
}

/* -------------------------------------------------- */
/*  Impact gauge — visual arc meter                   */
/* -------------------------------------------------- */
function ImpactGauge({ percentage }) {
  const capped = Math.min(Math.max(percentage, 0), 100);
  const circumference = 2 * Math.PI * 60;
  const dashOffset = circumference - (capped / 100) * circumference * 0.75; // 270° arc

  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg viewBox="0 0 140 140" className="w-full h-full -rotate-[135deg]">
        <circle cx="70" cy="70" r="60" fill="none" stroke="currentColor"
          className="text-slate-200 dark:text-slate-700" strokeWidth="10"
          strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
          strokeLinecap="round" />
        <circle cx="70" cy="70" r="60" fill="none" strokeWidth="10"
          stroke="url(#gaugeGrad)" strokeLinecap="round"
          strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 0.8s ease-out' }} />
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
        <span className="text-3xl font-extrabold text-gradient">{Math.round(capped)}%</span>
        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">REDUCTION</span>
      </div>
    </div>
  );
}

/* -------------------------------------------------- */
/*  Scenario Card                                     */
/* -------------------------------------------------- */
function ScenarioCard({ scenario, value, onChange }) {
  const savings = useMemo(() => calculateSavings(scenario, value), [scenario, value]);
  const borderColor = categoryColors[scenario.category] || '#10b981';

  return (
    <div className="glass-card p-5 animate-slide-up"
      style={{ borderLeft: `4px solid ${borderColor}` }}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <span className="text-3xl">{scenario.icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-800 dark:text-white text-sm leading-tight">
            {scenario.title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {scenario.description}
          </p>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
          style={{ background: `${borderColor}20`, color: borderColor }}>
          {scenario.category}
        </span>
      </div>

      {/* Slider */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
            {scenario.currentLabel}
          </label>
          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {value} {scenario.currentUnit}
          </span>
        </div>
        <div className="relative">
          <input
            type="range"
            min={0}
            max={scenario.maxValue}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer
              bg-slate-200 dark:bg-slate-700
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-emerald-500
              [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(16,185,129,0.5)]
              [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white
              [&::-webkit-slider-thumb]:dark:border-slate-800
              [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-150
              [&::-webkit-slider-thumb]:hover:scale-125
              [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5
              [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-emerald-500
              [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white
              [&::-moz-range-thumb]:shadow-[0_0_10px_rgba(16,185,129,0.5)]"
            style={{
              background: `linear-gradient(to right, #10b981 0%, #10b981 ${(value / scenario.maxValue) * 100}%, ${typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? '#334155' : '#e2e8f0'} ${(value / scenario.maxValue) * 100}%, ${typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? '#334155' : '#e2e8f0'} 100%)`,
            }}
          />
        </div>
      </div>

      {/* Savings Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        {[
          { label: 'Daily', val: `${savings.dailyCO2} kg` },
          { label: 'Weekly', val: `${savings.weeklyCO2} kg` },
          { label: 'Monthly', val: `${savings.monthlyCO2} kg` },
          { label: 'Annual', val: `${savings.annualCO2} kg` },
        ].map((item) => (
          <div key={item.label}
            className="bg-emerald-50/50 dark:bg-emerald-500/5 rounded-lg p-2 text-center">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium">
              {item.label}
            </p>
            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
              {item.val}
            </p>
          </div>
        ))}
      </div>

      {/* Trees & Money */}
      <div className="flex items-center justify-between gap-4 pt-3 border-t border-slate-100 dark:border-slate-700/50">
        <div className="flex items-center gap-1.5">
          <TreePine className="w-4 h-4 text-emerald-500" />
          <span className="text-xs text-slate-600 dark:text-slate-300">
            <strong>{savings.trees}</strong> trees equivalent
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <DollarSign className="w-4 h-4 text-amber-500" />
          <span className="text-xs text-slate-600 dark:text-slate-300">
            <strong>${savings.moneySaved}</strong>/year saved
          </span>
        </div>
      </div>

      {/* Tree visual row */}
      {savings.trees > 0 && (
        <div className="mt-2">
          <TreeRow count={savings.trees} />
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------- */
/*  Custom chart tooltip                              */
/* -------------------------------------------------- */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 !rounded-lg shadow-lg text-sm">
      <p className="font-semibold text-slate-800 dark:text-white mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs" style={{ color: p.fill }}>
          {p.name}: <strong>{Number(p.value).toLocaleString()} kg CO₂</strong>
        </p>
      ))}
    </div>
  );
}

/* ================================================== */
/*  SIMULATOR PAGE                                    */
/* ================================================== */
export default function Simulator() {
  const { state } = useCarbon();

  // Slider values keyed by scenario id
  const [values, setValues] = useState(() =>
    Object.fromEntries(simulatorScenarios.map((s) => [s.id, s.defaultValue]))
  );

  const updateValue = (id, val) => setValues((prev) => ({ ...prev, [id]: val }));

  /* ---- Aggregate totals ---- */
  const totals = useMemo(() => {
    let annualCO2 = 0;
    let trees = 0;
    let money = 0;

    simulatorScenarios.forEach((s) => {
      const sv = calculateSavings(s, values[s.id]);
      annualCO2 += Number(sv.annualCO2);
      trees += sv.trees;
      money += Number(sv.moneySaved);
    });

    return { annualCO2, trees, money };
  }, [values]);

  /* ---- Chart data ---- */
  const estimatedAnnual = averages.yearly_per_person_kg; // 8000 kg
  const projectedAnnual = Math.max(0, estimatedAnnual - totals.annualCO2);
  const reductionPct = estimatedAnnual > 0
    ? ((totals.annualCO2 / estimatedAnnual) * 100).toFixed(1)
    : 0;

  const chartData = [
    { name: 'Current Estimate', value: estimatedAnnual, fill: '#ef4444' },
    { name: 'After Changes', value: projectedAnnual, fill: '#10b981' },
  ];

  const categoryBreakdown = useMemo(() => {
    const cats = {};
    simulatorScenarios.forEach((s) => {
      const sv = calculateSavings(s, values[s.id]);
      const cat = s.category;
      if (!cats[cat]) cats[cat] = { current: 0, saved: 0 };
      cats[cat].saved += Number(sv.annualCO2);
    });

    return [
      { name: 'Transport', current: 2400, saved: cats.transport?.saved || 0, color: categoryColors.transport },
      { name: 'Food', current: 2200, saved: cats.food?.saved || 0, color: categoryColors.food },
      { name: 'Energy', current: 2000, saved: cats.electricity?.saved || 0, color: categoryColors.electricity },
      { name: 'Waste', current: 1400, saved: cats.waste?.saved || 0, color: categoryColors.waste },
    ];
  }, [values]);

  return (
    <div className="page-enter space-y-6">
      {/* Header */}
      <div className="stagger-1 animate-slide-up relative glass-card overflow-hidden rounded-3xl p-6 md:p-8 mb-6">
        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          <div className="flex-1 space-y-3 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white flex items-center justify-center md:justify-start gap-3">
              <SlidersHorizontal className="w-7 h-7 text-emerald-500" />
              Carbon Savings <span className="text-gradient">Simulator</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-300 max-w-lg mx-auto md:mx-0 text-sm md:text-base">
              See how changing your daily habits impacts your footprint and discover the best ways to reduce emissions.
            </p>
          </div>
          <div className="w-32 h-32 md:w-40 md:h-40 shrink-0 relative">
            <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full" />
            <img src={simulatorImg} alt="Simulator" loading="lazy" className="w-full h-full object-contain relative z-10 animate-float" />
          </div>
        </div>
      </div>

      {/* ========== Total Impact Summary ========== */}
      <div className="stagger-2 animate-slide-up">
        <div className="gradient-border glass-card p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-5">
            <Leaf className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">
              Total Impact Summary
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-center">
            {/* Gauge */}
            <div className="flex justify-center">
              <ImpactGauge percentage={Number(reductionPct)} />
            </div>

            {/* Big stats */}
            <div className="text-center sm:text-left">
              <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold mb-1">
                Annual CO₂ Saved
              </p>
              <p className="text-3xl sm:text-4xl font-extrabold text-gradient tabular-nums">
                <AnimatedCounter value={totals.annualCO2} suffix=" kg" />
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                ≈ {(totals.annualCO2 / 1000).toFixed(1)} tonnes CO₂ per year
              </p>
            </div>

            <div className="text-center sm:text-left">
              <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold mb-1">
                <TreePine className="w-3.5 h-3.5 inline -mt-0.5 mr-1 text-emerald-500" />
                Trees Equivalent
              </p>
              <p className="text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
                <AnimatedCounter value={totals.trees} suffix=" 🌳" />
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                That's like planting {totals.trees} trees
              </p>
            </div>

            <div className="text-center sm:text-left">
              <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold mb-1">
                <DollarSign className="w-3.5 h-3.5 inline -mt-0.5 mr-1 text-amber-500" />
                Money Saved
              </p>
              <p className="text-3xl sm:text-4xl font-extrabold text-amber-600 dark:text-amber-400 tabular-nums">
                <AnimatedCounter value={totals.money} prefix="$" />
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Save ${Math.round(totals.money)} annually
              </p>
            </div>
          </div>

          {/* Comparison Bars */}
          <div className="mt-6 pt-5 border-t border-slate-200/60 dark:border-slate-700/40 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 w-20 shrink-0">Current</span>
              <div className="flex-1 h-5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                <div className="h-full rounded-full bg-gradient-to-r from-rose-400 to-rose-500 transition-all duration-700 flex items-center justify-end pr-2"
                  style={{ width: '100%' }}>
                  <span className="text-[10px] font-bold text-white">
                    {estimatedAnnual.toLocaleString()} kg
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 w-20 shrink-0">Projected</span>
              <div className="flex-1 h-5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-700 flex items-center justify-end pr-2"
                  style={{ width: `${(projectedAnnual / estimatedAnnual) * 100}%`, minWidth: '60px' }}>
                  <span className="text-[10px] font-bold text-white">
                    {projectedAnnual.toLocaleString()} kg
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-1.5 pt-1">
              <ArrowDown className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {reductionPct}% reduction possible
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========== Scenario Cards Grid ========== */}
      <div className="stagger-3 animate-slide-up">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">⚙️</span> Adjust Your Scenarios
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {simulatorScenarios.map((scenario) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              value={values[scenario.id]}
              onChange={(val) => updateValue(scenario.id, val)}
            />
          ))}
        </div>
      </div>

      {/* ========== Impact Visualization Chart ========== */}
      <div className="stagger-4 animate-slide-up">
        <div className="glass-card p-5 sm:p-6">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-1 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-emerald-500" />
            Impact Visualization
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
            Current estimated annual emissions vs projected after changes
          </p>

          {/* Main comparison chart */}
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={20} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }}
                  stroke="rgba(148,163,184,0.5)" />
                <YAxis tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `${(v / 1000).toFixed(1)}t`}
                  stroke="rgba(148,163,184,0.5)" />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="value" name="CO₂ Emissions" radius={[8, 8, 0, 0]} barSize={60}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category breakdown bars */}
          <div className="mt-6 pt-5 border-t border-slate-200/60 dark:border-slate-700/40">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Savings by Category
            </h3>
            <div className="space-y-3">
              {categoryBreakdown.map((cat) => {
                const pct = cat.current > 0 ? Math.min((cat.saved / cat.current) * 100, 100) : 0;
                return (
                  <div key={cat.name} className="flex items-center gap-3">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300 w-20 shrink-0">
                      {cat.name}
                    </span>
                    <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: cat.color }} />
                    </div>
                    <span className="text-xs font-semibold tabular-nums w-16 text-right"
                      style={{ color: cat.color }}>
                      {Math.round(cat.saved)} kg
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
