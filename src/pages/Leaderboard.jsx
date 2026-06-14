import { useState, useMemo, useEffect, useRef } from 'react';
import { Trophy, Crown, Medal, Award, Flame, Star, Users, TrendingUp, Filter } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend } from 'recharts';
import { useCarbon } from '../context/CarbonContext';
import { generateLeaderboard, getPercentile, timeFilters, categoryFilters } from '../data/leaderboardData';
import { categoryColors, categoryLabels } from '../data/carbonFactors';

/* -------------------------------------------------- */
/*  Animated counter                                  */
/* -------------------------------------------------- */
function AnimatedCounter({ value, duration = 1000, suffix = '', prefix = '' }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const target = Number(value) || 0;
    let start = null;
    const from = 0;

    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(from + (target - from) * eased);
      if (progress < 1) ref.current = requestAnimationFrame(step);
    };

    ref.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(ref.current);
  }, [value, duration]);

  return (
    <span>
      {prefix}{Math.round(display)}{suffix}
    </span>
  );
}

/* -------------------------------------------------- */
/*  Rank badge icons for top 3                        */
/* -------------------------------------------------- */
function RankIcon({ rank }) {
  if (rank === 1) return <Crown className="w-6 h-6 text-amber-400 drop-shadow-lg" />;
  if (rank === 2) return <Medal className="w-6 h-6 text-slate-400" />;
  if (rank === 3) return <Medal className="w-6 h-6 text-amber-700" />;
  return (
    <span className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 tabular-nums">
      {rank}
    </span>
  );
}

/* -------------------------------------------------- */
/*  Rank color helper                                 */
/* -------------------------------------------------- */
function getRankColors(rank) {
  if (rank === 1) return { bg: 'from-amber-500/20 to-yellow-500/10', border: 'border-amber-400/40', glow: 'shadow-amber-500/20' };
  if (rank === 2) return { bg: 'from-slate-400/15 to-slate-300/5', border: 'border-slate-400/30', glow: 'shadow-slate-400/10' };
  if (rank === 3) return { bg: 'from-amber-700/15 to-orange-400/5', border: 'border-amber-600/30', glow: 'shadow-amber-700/10' };
  return { bg: '', border: 'border-transparent', glow: '' };
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
        <p key={i} className="text-xs" style={{ color: p.color || p.fill }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
}

/* ================================================== */
/*  LEADERBOARD PAGE                                  */
/* ================================================== */
export default function Leaderboard() {
  const { state } = useCarbon();
  const [activeTime, setActiveTime] = useState('monthly');
  const [activeCategory, setActiveCategory] = useState('overall');

  // Generate leaderboard data — memoized with seed stability
  const leaderboard = useMemo(
    () => generateLeaderboard(state.carbonScore, state.profile?.name || 'You'),
    [state.carbonScore, state.profile?.name]
  );

  const currentUser = leaderboard.find((u) => u.isCurrentUser);
  const percentile = getPercentile(state.carbonScore);

  // Community average for comparison
  const communityAvg = useMemo(() => {
    const all = leaderboard.filter((u) => !u.isCurrentUser);
    if (all.length === 0) return { transport: 50, food: 50, electricity: 50, waste: 50 };
    return {
      transport: Math.round(all.reduce((s, u) => s + (u.categoryScores?.transport || 0), 0) / all.length),
      food: Math.round(all.reduce((s, u) => s + (u.categoryScores?.food || 0), 0) / all.length),
      electricity: Math.round(all.reduce((s, u) => s + (u.categoryScores?.electricity || 0), 0) / all.length),
      waste: Math.round(all.reduce((s, u) => s + (u.categoryScores?.waste || 0), 0) / all.length),
    };
  }, [leaderboard]);

  // Radar chart data
  const radarData = useMemo(() => {
    const userCats = currentUser?.categoryScores || {};
    return [
      { category: 'Transport', user: userCats.transport || 0, community: communityAvg.transport },
      { category: 'Food', user: userCats.food || 0, community: communityAvg.food },
      { category: 'Energy', user: userCats.electricity || 0, community: communityAvg.electricity },
      { category: 'Waste', user: userCats.waste || 0, community: communityAvg.waste },
    ];
  }, [currentUser, communityAvg]);

  // Bar chart comparison
  const comparisonData = useMemo(() => {
    const userCats = currentUser?.categoryScores || {};
    return [
      { name: 'Transport', you: userCats.transport || 0, avg: communityAvg.transport, color: categoryColors.transport },
      { name: 'Food', you: userCats.food || 0, avg: communityAvg.food, color: categoryColors.food },
      { name: 'Energy', you: userCats.electricity || 0, avg: communityAvg.electricity, color: categoryColors.electricity },
      { name: 'Waste', you: userCats.waste || 0, avg: communityAvg.waste, color: categoryColors.waste },
    ];
  }, [currentUser, communityAvg]);

  // Top 3 and rest
  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <div className="page-enter space-y-6">
      {/* Header */}
      <div className="stagger-1 animate-slide-up">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/25">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Community <span className="text-gradient">Leaderboard</span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              See how you compare with the community
            </p>
          </div>
        </div>
      </div>

      {/* ========== User Position Hero ========== */}
      <div className="stagger-2 animate-slide-up">
        <div className="gradient-border glass-card p-6 sm:p-8 text-center relative overflow-hidden">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-sm font-semibold mb-4">
              <Star className="w-4 h-4" />
              Your Position
            </div>

            <div className="flex items-center justify-center gap-8 sm:gap-12 flex-wrap">
              {/* Rank */}
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold mb-1">
                  Rank
                </p>
                <p className="text-5xl sm:text-6xl font-black text-gradient tabular-nums">
                  <AnimatedCounter value={currentUser?.rank || 1} prefix="#" />
                </p>
              </div>

              {/* Divider */}
              <div className="hidden sm:block w-px h-16 bg-slate-200 dark:bg-slate-700" />

              {/* Score */}
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold mb-1">
                  Score
                </p>
                <p className="text-5xl sm:text-6xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                  <AnimatedCounter value={state.carbonScore} />
                </p>
              </div>

              {/* Divider */}
              <div className="hidden sm:block w-px h-16 bg-slate-200 dark:bg-slate-700" />

              {/* Percentile */}
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold mb-1">
                  Percentile
                </p>
                <p className="text-5xl sm:text-6xl font-black text-cyan-600 dark:text-cyan-400 tabular-nums">
                  <AnimatedCounter value={percentile} suffix="%" />
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
              You are in the <strong className="text-emerald-600 dark:text-emerald-400">top {100 - percentile}%</strong> of eco-conscious users 🌿
            </p>
          </div>
        </div>
      </div>

      {/* ========== Filter Bar ========== */}
      <div className="stagger-3 animate-slide-up">
        <div className="glass-card p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            {/* Time Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              {timeFilters.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveTime(f.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                    activeTime === f.id
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="hidden sm:block w-px h-6 bg-slate-200 dark:bg-slate-700" />

            {/* Category Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {categoryFilters.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveCategory(f.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-1 ${
                    activeCategory === f.id
                      ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{f.icon}</span> {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========== Top 3 Podium ========== */}
      <div className="stagger-4 animate-slide-up">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {top3.map((user, idx) => {
            const colors = getRankColors(user.rank);
            const isMe = user.isCurrentUser;

            return (
              <div
                key={user.id}
                className={`glass-card p-5 text-center relative overflow-hidden transition-all duration-300 border ${colors.border} ${
                  isMe ? 'ring-2 ring-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.2)]' : ''
                }`}
              >
                {/* Gradient bg */}
                <div className={`absolute inset-0 bg-gradient-to-b ${colors.bg} pointer-events-none`} />

                <div className="relative z-10">
                  {/* Rank badge */}
                  <div className="flex justify-center mb-3">
                    <RankIcon rank={user.rank} />
                  </div>

                  {/* Avatar */}
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-2 ring-2 ring-white/30 shadow-lg"
                    style={{ backgroundColor: user.color }}
                  >
                    {user.name.charAt(0)}
                  </div>

                  <h3 className="font-bold text-slate-800 dark:text-white text-sm">
                    {user.name}
                    {isMe && (
                      <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] bg-emerald-500 text-white font-semibold">
                        YOU
                      </span>
                    )}
                  </h3>

                  <p className="text-2xl font-black text-gradient mt-1 tabular-nums">{user.score}</p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium">
                    Carbon Score
                  </p>

                  <div className="flex items-center justify-center gap-3 mt-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Flame className="w-3 h-3 text-orange-400" /> {user.streak}d
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="w-3 h-3 text-purple-400" /> {user.badges}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========== Leaderboard List (4+) ========== */}
      <div className="stagger-5 animate-slide-up">
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-slate-200/60 dark:border-slate-700/40">
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-400" />
              All Rankings
            </h2>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {rest.map((user, idx) => {
              const isMe = user.isCurrentUser;
              const scorePct = Math.min((user.score / 100) * 100, 100);

              return (
                <div
                  key={user.id}
                  className={`flex items-center gap-3 px-4 py-3 transition-all duration-200 hover:bg-slate-50 dark:hover:bg-white/5 ${
                    isMe
                      ? 'bg-emerald-50/60 dark:bg-emerald-500/5 ring-1 ring-inset ring-emerald-500/20'
                      : ''
                  }`}
                  style={{ animationDelay: `${idx * 0.03}s` }}
                >
                  {/* Rank */}
                  <RankIcon rank={user.rank} />

                  {/* Avatar */}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ring-1 ring-white/20"
                    style={{ backgroundColor: user.color }}
                  >
                    {user.name.charAt(0)}
                  </div>

                  {/* Name & meta */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                        {user.name}
                      </p>
                      {isMe && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500 text-white font-bold shrink-0">
                          YOU
                        </span>
                      )}
                    </div>
                    {/* Score bar */}
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${scorePct}%`,
                            background: isMe
                              ? 'linear-gradient(to right, #10b981, #06b6d4)'
                              : `${user.color}`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300 tabular-nums w-8 text-right">
                        {user.score}
                      </span>
                    </div>
                  </div>

                  {/* Streak & badges */}
                  <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1" title="Streak">
                      <Flame className="w-3 h-3 text-orange-400" /> {user.streak}
                    </span>
                    <span className="flex items-center gap-1" title="Badges">
                      <Award className="w-3 h-3 text-purple-400" /> {user.badges}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========== Stats Comparison ========== */}
      <div className="stagger-6 animate-slide-up">
        <div className="glass-card p-5 sm:p-6">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-1 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            You vs Community
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
            How your scores compare across categories
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Radar chart */}
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(148,163,184,0.2)" />
                  <PolarAngleAxis
                    dataKey="category"
                    tick={{ fontSize: 11, fill: 'rgba(148,163,184,0.8)' }}
                  />
                  <Radar name="You" dataKey="user" stroke="#10b981" fill="#10b981" fillOpacity={0.25} strokeWidth={2} />
                  <Radar name="Community Avg" dataKey="community" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} strokeWidth={2} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Bar comparison */}
            <div className="space-y-4">
              {comparisonData.map((cat) => {
                const diff = cat.you - cat.avg;
                const isAhead = diff > 0;

                return (
                  <div key={cat.name}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {cat.name}
                      </span>
                      <span className={`text-xs font-bold ${isAhead ? 'text-emerald-500' : 'text-rose-400'}`}>
                        {isAhead ? '+' : ''}{diff} {isAhead ? '▲' : '▼'}
                      </span>
                    </div>
                    {/* Your bar */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] text-slate-400 w-6">You</span>
                      <div className="flex-1 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${cat.you}%`, backgroundColor: cat.color }}
                        />
                      </div>
                      <span className="text-xs font-bold tabular-nums w-8 text-right" style={{ color: cat.color }}>
                        {cat.you}
                      </span>
                    </div>
                    {/* Avg bar */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 w-6">Avg</span>
                      <div className="flex-1 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500 bg-purple-400/40"
                          style={{ width: `${cat.avg}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-purple-400 tabular-nums w-8 text-right">
                        {cat.avg}
                      </span>
                    </div>
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
