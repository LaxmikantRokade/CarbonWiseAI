import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame, Award, TrendingDown, Activity, ArrowRight,
  Leaf, PlusCircle, Sparkles, Cloud,
} from 'lucide-react';
import { useCarbon } from '../context/CarbonContext';
import { achievements } from '../data/achievements';
import { categoryLabels } from '../data/carbonFactors';
import StatCard from '../components/StatCard';
import CarbonScore from '../components/CarbonScore';
import GoalCard from '../components/GoalCard';
import CategoryIcon from '../components/CategoryIcon';
import heroDashboardImg from '../assets/images/hero-dashboard.webp';
import { useTranslation } from 'react-i18next';

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



export default function Dashboard() {

  if (window.logDebug) window.logDebug('Dashboard.jsx rendered');
  const { state } = useCarbon();
  const { t } = useTranslation();
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
      <div className="page-enter min-h-[75vh] flex items-center justify-center px-4 md:px-8 py-10">
        <div className="glass-card max-w-6xl w-full p-8 md:p-12 lg:p-16 flex flex-col lg:flex-row items-center gap-8 lg:gap-16 gradient-border">
          {/* Left Column: Welcome Content */}
          <div className="flex-1 text-left space-y-6 md:space-y-8 order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold animate-fade-in border border-emerald-500/20">
              <Leaf className="w-3.5 h-3.5" />
              <span>Let's build a greener future</span>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white leading-tight tracking-tight">
                Welcome to <br />
                <span className="text-gradient">CarbonWise AI</span>
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base lg:text-lg leading-relaxed max-w-lg">
                Empowering you to measure, analyze, and reduce your personal carbon footprint. Log your first activity today and take the first step towards an eco-friendly lifestyle.
              </p>
            </div>

            <div className="pt-2">
              <Link
                to="/calculator"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-glow transition-all duration-300 hover:scale-[1.03]"
              >
                <PlusCircle className="w-5 h-5" />
                Log Your First Entry
              </Link>
            </div>

            {/* Features Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 md:pt-8 border-t border-gray-200/50 dark:border-white/5">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-500/15 dark:bg-emerald-500/20 rounded-lg text-emerald-500">
                  <Cloud className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-gray-800 dark:text-gray-200">Track CO₂</p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-normal">Quantify your daily actions</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-cyan-500/15 dark:bg-cyan-500/20 rounded-lg text-cyan-500">
                  <Activity className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-gray-800 dark:text-gray-200">Set Goals</p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-normal">Adopt eco-friendly habits</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-violet-500/15 dark:bg-violet-500/20 rounded-lg text-violet-500">
                  <Award className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-gray-800 dark:text-gray-200">Earn Badges</p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-normal">Celebrate eco milestones</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Image Illustration */}
          <div className="flex-1 w-full max-w-md lg:max-w-none relative group order-1 lg:order-2">
            {/* Soft decorative background glow */}
            <div className="absolute -inset-3 rounded-3xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 blur-xl opacity-75 group-hover:opacity-100 group-hover:scale-105 transition duration-700" />
            
            {/* Card wrapper for image */}
            <div className="relative glass-card border border-white/20 dark:border-white/10 overflow-hidden rounded-2xl shadow-2xl p-1 bg-white/20 dark:bg-black/20">
              <img
                src={heroDashboardImg}
                alt="CarbonWise AI Dashboard Preview"
                loading="lazy"
                fetchPriority="high"
                className="w-full h-auto object-cover rounded-xl transition-transform duration-700 group-hover:scale-[1.015]"
              />
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
              {new Date().getHours() < 12 ? t('dashboard.goodMorning', 'Good morning') : new Date().getHours() < 18 ? t('dashboard.goodAfternoon', 'Good afternoon') : t('dashboard.goodEvening', 'Good evening')},{' '}
              <span className="text-gradient">{profile?.name || 'Eco Warrior'}</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{formatToday()}</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 glass-card !rounded-full">
            <Flame className="w-5 h-5 text-amber-500" />
            <span className="font-bold text-gray-800 dark:text-white">{streak}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">{t('dashboard.streak', 'day streak')}</span>
          </div>
        </div>
      </section>

      {/* ═══════════════ Quick Stats ═══════════════ */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up stagger-2">
        <StatCard
          icon={TrendingDown}
          label={t('dashboard.co2ThisWeek', 'CO₂ This Week')}
          value={weeklyData.thisWeekTotal.toFixed(1)}
          suffix="kg"
          trend={weeklyData.trend}
          trendLabel={weeklyData.trend !== 0 ? `vs last week` : 'No change'}
          color="emerald"
        />
        <StatCard
          icon={Sparkles}
          label={t('dashboard.carbonScore', 'Carbon Score')}
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
          label={t('dashboard.badgesEarned', 'Badges Earned')}
          value={unlockedAchievements.length}
          suffix={`/ ${achievements.length}`}
          color="violet"
        />
      </section>

      {/* ═══════════════ Carbon Score Ring ═══════════════ */}
      <section className="animate-slide-up stagger-3">
        <div className="glass-card p-8 flex flex-col items-center gradient-border">
          <CarbonScore score={carbonScore} size={200} label={t('dashboard.carbonScore', 'Your Carbon Score')} />
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
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('dashboard.activeGoals', 'Active Goals')}</h2>
          <Link
            to="/goals"
            className="flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            {t('dashboard.viewAll', 'View All')} <ArrowRight className="w-4 h-4" />
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
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('dashboard.recentActivity', 'Recent Activity')}</h2>
          <Link
            to="/tracker"
            className="flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            {t('dashboard.viewAll', 'View All')} <ArrowRight className="w-4 h-4" />
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
