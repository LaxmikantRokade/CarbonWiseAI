import { useState, useMemo } from 'react';
import {
  Award,
  Lock,
  X,
  Flame,
  Trophy,
  Star,
  TrendingUp,
  ChevronRight,
} from 'lucide-react';
import achievementsImg from '../assets/images/achievements.webp';
import { useCarbon } from '../context/CarbonContext';
import { achievements, achievementCategories } from '../data/achievements';

/* ─── Badge component (inline, self-contained) ─── */
function Badge({ achievement, unlocked, onClick, delay = '' }) {
  return (
    <button
      onClick={onClick}
      className={`relative glass-card p-5 flex flex-col items-center gap-3 text-center transition-all duration-300 cursor-pointer group animate-bounce-in opacity-0 ${delay} ${
        unlocked
          ? 'hover:shadow-glow hover:scale-105'
          : 'grayscale opacity-60 hover:opacity-80 hover:grayscale-[50%]'
      }`}
    >
      {/* Glow ring for unlocked */}
      {unlocked && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 animate-pulse-glow pointer-events-none" />
      )}

      {/* Emoji icon */}
      <div
        className={`relative text-4xl transition-transform duration-300 group-hover:scale-110 ${
          unlocked ? 'drop-shadow-lg' : ''
        }`}
      >
        {achievement.icon}
        {!unlocked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-slate-900/70 dark:bg-slate-900/80 rounded-full p-1.5">
              <Lock className="w-4 h-4 text-slate-300" />
            </div>
          </div>
        )}
      </div>

      {/* Name */}
      <h3
        className={`text-sm font-bold leading-tight ${
          unlocked
            ? 'text-slate-900 dark:text-white'
            : 'text-slate-500 dark:text-slate-500'
        }`}
      >
        {achievement.name}
      </h3>

      {/* Category pill */}
      <span
        className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
        style={{
          backgroundColor: `${achievementCategories[achievement.category]?.color}20`,
          color: achievementCategories[achievement.category]?.color,
        }}
      >
        {achievementCategories[achievement.category]?.label}
      </span>
    </button>
  );
}

/* ─── Badge Detail Modal ─── */
function BadgeModal({ achievement, unlocked, onClose }) {
  if (!achievement) return null;
  const catInfo = achievementCategories[achievement.category];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal content */}
      <div 
        className="relative glass-card p-8 max-w-sm w-full text-center animate-scale-in z-10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors z-50 cursor-pointer"
        >
          <X className="w-4 h-4 text-slate-500" />
        </button>

        {/* Gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-violet-500" />

        {/* Icon */}
        <div className={`text-7xl mb-4 ${unlocked ? 'animate-bounce-in' : 'grayscale opacity-50'}`}>
          {achievement.icon}
        </div>

        {/* Status badge */}
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-3 ${
            unlocked
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
          }`}
        >
          {unlocked ? (
            <>
              <Star className="w-3.5 h-3.5" />
              Unlocked
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5" />
              Locked
            </>
          )}
        </div>

        {/* Name */}
        <h2 className="text-2xl font-bold text-gradient mb-2">{achievement.name}</h2>

        {/* Category */}
        <span
          className="inline-block text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-4"
          style={{
            backgroundColor: `${catInfo?.color}20`,
            color: catInfo?.color,
          }}
        >
          {catInfo?.label}
        </span>

        {/* Description */}
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed">
          {achievement.description}
        </p>

        {/* Unlock criteria */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            {unlocked ? 'Achievement Earned' : 'How to Unlock'}
          </p>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {achievement.description}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Achievements Page ─── */
export default function Achievements() {
  const { state } = useCarbon();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBadge, setSelectedBadge] = useState(null);

  /* Computed values */
  const unlockedSet = useMemo(
    () => new Set(state.unlockedAchievements || []),
    [state.unlockedAchievements]
  );

  const totalAchievements = achievements.length;
  const unlockedCount = unlockedSet.size;
  const progressPct = totalAchievements > 0 ? Math.round((unlockedCount / totalAchievements) * 100) : 0;

  const streak = state.streak || 0;

  /* Filter achievements by category */
  const filteredAchievements = useMemo(() => {
    if (selectedCategory === 'all') return achievements;
    return achievements.filter((a) => a.category === selectedCategory);
  }, [selectedCategory]);

  /* Find the next closest-to-unlock achievement */
  const nextAchievement = useMemo(() => {
    const locked = achievements.filter((a) => !unlockedSet.has(a.id));
    if (locked.length === 0) return null;

    // Heuristic: pick one from categories with most unlocked
    const catUnlockCounts = {};
    achievements.forEach((a) => {
      if (!catUnlockCounts[a.category]) catUnlockCounts[a.category] = { total: 0, unlocked: 0 };
      catUnlockCounts[a.category].total++;
      if (unlockedSet.has(a.id)) catUnlockCounts[a.category].unlocked++;
    });

    // Sort locked: prefer categories where user has most progress
    const sorted = [...locked].sort((a, b) => {
      const aRatio = (catUnlockCounts[a.category]?.unlocked || 0) / (catUnlockCounts[a.category]?.total || 1);
      const bRatio = (catUnlockCounts[b.category]?.unlocked || 0) / (catUnlockCounts[b.category]?.total || 1);
      return bRatio - aRatio;
    });

    return sorted[0];
  }, [unlockedSet]);

  const categoryKeys = Object.keys(achievementCategories);

  return (
    <div className="page-enter space-y-8">
      {/* ─── Header ─── */}
      <div className="animate-slide-up opacity-0 stagger-1 relative glass-card overflow-hidden rounded-3xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          <div className="flex-1 space-y-3 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white flex items-center justify-center md:justify-start gap-3">
              <Award className="w-7 h-7 text-amber-500" />
              Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-500">Achievements</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-300 max-w-lg mx-auto md:mx-0 text-sm md:text-base">
              Earn badges, maintain streaks, and celebrate your positive impact on the environment.
            </p>
          </div>
          <div className="w-32 h-32 md:w-40 md:h-40 shrink-0 relative">
            <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full" />
            <img src={achievementsImg} alt="Achievements" loading="lazy" className="w-full h-full object-contain relative z-10 animate-float" />
          </div>
        </div>
      </div>

      {/* ─── Streak Hero ─── */}
      <div className="gradient-border glass-card p-8 text-center animate-scale-in opacity-0 stagger-2 relative overflow-hidden">
        {/* Decorative blurs */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative">
          {/* Flame */}
          <div className="inline-flex items-center justify-center mb-4">
            <div className="relative">
              <span className="text-6xl animate-pulse-glow inline-block rounded-full">🔥</span>
              <div className="absolute -inset-3 bg-amber-500/20 rounded-full blur-xl animate-pulse-glow pointer-events-none" />
            </div>
          </div>

          {/* Counter */}
          <div className="animate-counter">
            <p className="text-6xl font-black text-gradient mb-1">{streak}</p>
            <p className="text-lg font-semibold text-slate-600 dark:text-slate-300">
              Day Streak
            </p>
          </div>

          {/* Sub-stats */}
          <div className="flex items-center justify-center gap-8 mt-6">
            <div className="text-center">
              <div className="flex items-center gap-1.5 justify-center">
                <Flame className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Current
                </span>
              </div>
              <p className="text-2xl font-bold text-amber-500">{streak}</p>
            </div>
            <div className="w-px h-10 bg-slate-200 dark:bg-slate-700" />
            <div className="text-center">
              <div className="flex items-center gap-1.5 justify-center">
                <Trophy className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Best
                </span>
              </div>
              <p className="text-2xl font-bold text-emerald-500">{Math.max(streak, 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Achievement Stats ─── */}
      <div className="glass-card p-6 animate-slide-up opacity-0 stagger-3">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white">Collection Progress</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {unlockedCount} of {totalAchievements} achievements unlocked
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gradient">{progressPct}%</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-violet-500 transition-all duration-1000 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-400">
          <span>0</span>
          <span>{totalAchievements} badges</span>
        </div>
      </div>

      {/* ─── Category Filter ─── */}
      <div className="animate-slide-up opacity-0 stagger-3">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {/* All option */}
          <button
            onClick={() => setSelectedCategory('all')}
            className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/25'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-emerald-500/50'
            }`}
          >
            All
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                selectedCategory === 'all'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
              }`}
            >
              {totalAchievements}
            </span>
          </button>

          {categoryKeys.map((key) => {
            const cat = achievementCategories[key];
            const count = achievements.filter((a) => a.category === key).length;
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  selectedCategory === key
                    ? 'text-white shadow-lg'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-emerald-500/50'
                }`}
                style={
                  selectedCategory === key
                    ? { backgroundColor: cat.color, boxShadow: `0 8px 20px ${cat.color}40` }
                    : {}
                }
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                {cat.label}
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    selectedCategory === key
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Badge Grid ─── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {filteredAchievements.map((achievement, idx) => (
          <Badge
            key={achievement.id}
            achievement={achievement}
            unlocked={unlockedSet.has(achievement.id)}
            onClick={() => setSelectedBadge(achievement)}
            delay={`stagger-${Math.min((idx % 6) + 1, 6)}`}
          />
        ))}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="glass-card p-12 text-center animate-scale-in">
          <p className="text-4xl mb-3">🏅</p>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
            No achievements in this category
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Try selecting a different category to explore badges.
          </p>
        </div>
      )}

      {/* ─── Next Achievement ─── */}
      {nextAchievement && (
        <div className="glass-card p-6 animate-slide-up opacity-0 stagger-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <h2 className="font-bold text-slate-900 dark:text-white">Up Next</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-4xl shrink-0">{nextAchievement.icon}</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900 dark:text-white">{nextAchievement.name}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                {nextAchievement.description}
              </p>
              {/* Progress toward unlock */}
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-700"
                  style={{ width: '35%' }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">Keep going — you&apos;re getting close!</p>
            </div>
            <button
              onClick={() => setSelectedBadge(nextAchievement)}
              className="shrink-0 p-2 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* ─── Badge Detail Modal ─── */}
      {selectedBadge && (
        <BadgeModal
          achievement={selectedBadge}
          unlocked={unlockedSet.has(selectedBadge.id)}
          onClose={() => setSelectedBadge(null)}
        />
      )}
    </div>
  );
}
