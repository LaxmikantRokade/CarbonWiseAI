import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame, Award, TrendingDown, Activity, ArrowRight,
  Leaf, PlusCircle, Sparkles, Cloud,
} from 'lucide-react';
import { useCarbon } from '../context/CarbonContext';
import { categoryColors, categoryLabels } from '../data/carbonFactors';
import { achievements } from '../data/achievements';
import StatCard from '../components/StatCard';
import CarbonScore from '../components/CarbonScore';
import EmissionChart from '../components/EmissionChart';
import GoalCard from '../components/GoalCard';
import CategoryIcon from '../components/CategoryIcon';

/* ───── helper: relative time ───── */
function relativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/* ───── helper: format date ───── */
function formatToday() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/* ───── helper: get day label ───── */
function getDayLabel(dateStr) {
  const d = new Date(dateStr);
  const today = new Date();
  const diff = Math.floor((today - d) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}

export default function Dashboard() {
  console.log('[App Init] Dashboard.jsx rendered');
  if (window.logDebug) window.logDebug('Dashboard.jsx rendered');
  const { state } = useCarbon();
  const { entries, goals, unlockedAchievements, streak, carbonScore, profile } = state;

  /* ── Compute weekly data ── */
  const weeklyData = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const thisWeek = entries.filter(e => new Date(e.date) >= weekAgo);
    const lastWeek = entries.filter(e => {
      const d = new Date(e.date);
      return d >= twoWeeksAgo && d < weekAgo;
    });

    const thisWeekTotal = thisWeek.reduce((s, e) => s + e.amount, 0);
    const lastWeekTotal = lastWeek.reduce((s, e) => s + e.amount, 0);

    let trend = 0;
    if (lastWeekTotal > 0) {
      trend = Math.round(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100);
    }

    return { thisWeekTotal, lastWeekTotal, trend, thisWeek };
  }, [entries]);

  /* ── Category breakdown for pie chart ── */
  const categoryData = useMemo(() => {
    const cats = {};
    weeklyData.thisWeek.forEach(e => {
      if (e.amount > 0) {
        cats[e.category] = (cats[e.category] || 0) + e.amount;
      }
    });
    return Object.entries(cats).map(([cat, val]) => ({
      name: categoryLabels[cat] || cat,
      value: Math.round(val * 100) / 100,
      color: categoryColors[cat] || '#6b7280',
    }));
  }, [weeklyData]);

  /* ── Daily totals for area chart (last 7 days) ── */
  const dailyData = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const dayEntries = entries.filter(e => e.date?.split('T')[0] === key);
      const total = dayEntries.reduce((s, e) => s + e.amount, 0);
      days.push({
        name: getDayLabel(d),
        value: Math.round(total * 100) / 100,
      });
    }
    return days;
  }, [entries]);

  /* ── Active goals (top 3) ── */
  const activeGoals = useMemo(() => {
    return goals.filter(g => !g.completed).slice(0, 3);
  }, [goals]);

  /* ── Recent entries (last 5) ── */
  const recentEntries = useMemo(() => {
    return [...entries]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [entries]);

  /* ── Empty State ── */
  if (entries.length === 0) {
    return (
      <div className="page-enter min-h-[70vh] flex items-center justify-center px-4">
        <div className="glass-card max-w-lg w-full p-10 text-center space-y-6">
          <div className="mx-auto w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center animate-float">
            <Leaf className="w-10 h-10 text-emerald-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome to <span className="text-gradient">CarbonWise AI</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              Start tracking your carbon footprint today. Log your first entry and begin your journey to a greener life.
            </p>
          </div>
          <Link
            to="/calculator"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-glow transition-all duration-300 hover:scale-105"
          >
            <PlusCircle className="w-5 h-5" />
            Log Your First Entry
          </Link>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-400 pt-2">
            <div className="flex items-center gap-1.5">
              <Cloud className="w-4 h-4" />
              <span>Track CO₂</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Activity className="w-4 h-4" />
              <span>Set Goals</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4" />
              <span>Earn Badges</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter space-y-8 pb-8">
      {/* ═══════════════ Welcome Header ═══════════════ */}
      <section className="animate-slide-up stagger-1">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
              <span className="text-gradient">{profile?.name || 'Eco Warrior'}</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{formatToday()}</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 glass-card !rounded-full">
            <Flame className="w-5 h-5 text-amber-500" />
            <span className="font-bold text-gray-800 dark:text-white">{streak}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">day streak</span>
          </div>
        </div>
      </section>

      {/* ═══════════════ Quick Stats ═══════════════ */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up stagger-2">
        <StatCard
          icon={TrendingDown}
          label="CO₂ This Week"
          value={weeklyData.thisWeekTotal.toFixed(1)}
          suffix="kg"
          trend={weeklyData.trend}
          trendLabel={weeklyData.trend !== 0 ? `vs last week` : 'No change'}
          color="emerald"
        />
        <StatCard
          icon={Sparkles}
          label="Carbon Score"
          value={carbonScore}
          suffix="/100"
          color="cyan"
        />
        <StatCard
          icon={Flame}
          label="Current Streak"
          value={streak}
          suffix={streak === 1 ? 'day' : 'days'}
          color="amber"
        />
        <StatCard
          icon={Award}
          label="Badges Earned"
          value={unlockedAchievements.length}
          suffix={`/ ${achievements.length}`}
          color="violet"
        />
      </section>

      {/* ═══════════════ Carbon Score Ring ═══════════════ */}
      <section className="animate-slide-up stagger-3">
        <div className="glass-card p-8 flex flex-col items-center gradient-border">
          <CarbonScore score={carbonScore} size={200} label="Your Carbon Score" />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 max-w-md text-center">
            Your score reflects your weekly emissions compared to the national average. Keep it high by making green choices!
          </p>
        </div>
      </section>

      {/* ═══════════════ Charts Row ═══════════════ */}
      {/* 
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up stagger-4">
        <EmissionChart
          data={categoryData}
          type="pie"
          title="Emissions Breakdown"
          height={280}
        />
        <EmissionChart
          data={dailyData}
          type="area"
          title="Weekly Trend"
          height={280}
        />
      </section>
      */}

      {/* ═══════════════ Active Goals ═══════════════ */}
      <section className="animate-slide-up stagger-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Active Goals</h2>
          <Link
            to="/goals"
            className="flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {activeGoals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeGoals.map(goal => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        ) : (
          <div className="glass-card p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-3">No active goals yet.</p>
            <Link
              to="/goals"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium rounded-xl hover:bg-emerald-500/20 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              Set a Goal
            </Link>
          </div>
        )}
      </section>

      {/* ═══════════════ Recent Activity ═══════════════ */}
      <section className="animate-slide-up stagger-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activity</h2>
          <Link
            to="/tracker"
            className="flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="glass-card divide-y divide-gray-200/50 dark:divide-white/5">
          {recentEntries.map(entry => (
            <div
              key={entry.id}
              className="flex items-center gap-4 p-4 hover:bg-white/30 dark:hover:bg-white/5 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
            >
              <CategoryIcon category={entry.category} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                  {entry.label || entry.subType || entry.category}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {categoryLabels[entry.category] || entry.category}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className={`text-sm font-bold ${
                  entry.amount <= 0 ? 'text-emerald-500' : 'text-gray-800 dark:text-gray-200'
                }`}>
                  {entry.amount <= 0 ? '' : '+'}{entry.amount.toFixed(2)} kg
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {relativeTime(entry.date)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
