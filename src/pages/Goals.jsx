import { useState, useMemo } from 'react';
import {
  Target,
  Plus,
  ChevronDown,
  ChevronUp,
  Trash2,
  CheckCircle2,
  TrendingUp,
  Zap,
  Leaf,
  Bus,
  Utensils,
  Recycle,
  BatteryCharging,
  Sparkles,
  ArrowUpCircle,
} from 'lucide-react';
import goalsImg from '../assets/images/goals.webp';
import { useCarbon } from '../context/CarbonContext';
import { useTranslation } from 'react-i18next';

/* ─── Suggested goal templates ─── */
const suggestedGoals = [
  {
    title: 'Reduce transport emissions',
    description: 'Reduce transport emissions by 5kg this week',
    targetValue: 5,
    unit: 'kg CO₂',
    category: 'transport',
    icon: Bus,
  },
  {
    title: 'Plant-based meals',
    description: 'Eat 5 plant-based meals this week',
    targetValue: 5,
    unit: 'meals',
    category: 'food',
    icon: Utensils,
  },
  {
    title: 'Recycle waste',
    description: 'Recycle 3kg of waste',
    targetValue: 3,
    unit: 'kg CO₂',
    category: 'waste',
    icon: Recycle,
  },
  {
    title: 'Public transit trips',
    description: 'Use public transit 3 times',
    targetValue: 3,
    unit: 'trips',
    category: 'transport',
    icon: Bus,
  },
  {
    title: 'Reduce electricity',
    description: 'Reduce electricity usage by 10kWh',
    targetValue: 10,
    unit: 'items',
    category: 'electricity',
    icon: BatteryCharging,
  },
];

const categoryIcons = {
  transport: Bus,
  electricity: BatteryCharging,
  food: Utensils,
  waste: Recycle,
};

const categoryColors = {
  transport: 'from-blue-500 to-cyan-400',
  electricity: 'from-amber-500 to-yellow-400',
  food: 'from-emerald-500 to-green-400',
  waste: 'from-rose-500 to-pink-400',
};

const categoryBgColors = {
  transport: 'bg-blue-500/10 text-blue-500 dark:bg-blue-500/20 dark:text-blue-400',
  electricity: 'bg-amber-500/10 text-amber-500 dark:bg-amber-500/20 dark:text-amber-400',
  food: 'bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-400',
  waste: 'bg-rose-500/10 text-rose-500 dark:bg-rose-500/20 dark:text-rose-400',
};

/* ─── Inline StatCard (self-contained) ─── */
function StatCard({ icon: Icon, label, value, color = 'emerald', delay = '' }) {
  const colorMap = {
    emerald: 'from-emerald-500 to-emerald-600',
    cyan: 'from-cyan-500 to-cyan-600',
    amber: 'from-amber-500 to-amber-600',
    rose: 'from-rose-500 to-rose-600',
  };
  return (
    <div className={`glass-card p-5 animate-slide-up opacity-0 ${delay}`}>
      <div className="flex items-center gap-3">
        <div
          className={`p-2.5 rounded-xl bg-gradient-to-br ${colorMap[color] || colorMap.emerald} shadow-lg`}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {label}
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── GoalCard (inline, self-contained) ─── */
function GoalCard({ goal, onUpdate, onDelete, delay = '' }) {
  const [incrementVal, setIncrementVal] = useState(1);
  const progress = goal.targetValue > 0 ? Math.min(100, Math.round(((goal.currentValue || 0) / goal.targetValue) * 100)) : 0;
  const CatIcon = categoryIcons[goal.category] || Leaf;
  const gradientColor = categoryColors[goal.category] || 'from-emerald-500 to-green-400';

  const handleIncrement = () => {
    const newVal = Math.min(goal.targetValue, (goal.currentValue || 0) + incrementVal);
    onUpdate({ id: goal.id, currentValue: newVal });
  };

  const handleComplete = () => {
    onUpdate({ id: goal.id, completed: true, currentValue: goal.targetValue, completedAt: new Date().toISOString() });
  };

  return (
    <div className={`glass-card p-6 animate-slide-up opacity-0 group relative overflow-hidden ${delay}`}>
      {/* Category gradient bar at top */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradientColor}`} />

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${categoryBgColors[goal.category] || 'bg-emerald-500/10 text-emerald-500'}`}>
            <CatIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{goal.title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{goal.category}</p>
          </div>
        </div>
        <button
          onClick={() => onDelete(goal.id)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
          aria-label="Delete goal"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Description */}
      {goal.description && (
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
          {goal.description}
        </p>
      )}

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-500 dark:text-slate-400">Progress</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {goal.currentValue || 0} / {goal.targetValue} {goal.unit}
          </span>
        </div>
        <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${gradientColor} transition-all duration-700 ease-out`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-right text-xs text-slate-400 mt-1">{progress}%</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-4">
        <div className="flex items-center gap-1.5 flex-1">
          <input
            type="number"
            aria-label="Value to add to progress"
            min="1"
            max={goal.targetValue - (goal.currentValue || 0)}
            value={incrementVal}
            onChange={(e) => setIncrementVal(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-16 px-2 py-1.5 text-sm rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
          <button
            onClick={handleIncrement}
            disabled={(goal.currentValue || 0) >= goal.targetValue}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ArrowUpCircle className="w-4 h-4" />
            Add
          </button>
        </div>
        <button
          onClick={handleComplete}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
        >
          <CheckCircle2 className="w-4 h-4" />
          Done
        </button>
      </div>
    </div>
  );
}

/* ─── Main Goals Page ─── */
export default function Goals() {
  const { state, addGoal, updateGoal, deleteGoal } = useCarbon();
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetValue: '',
    unit: 'kg CO₂',
    category: 'transport',
  });

  /* Derived data */
  const activeGoals = useMemo(() => state.goals.filter((g) => !g.completed), [state.goals]);
  const completedGoals = useMemo(() => state.goals.filter((g) => g.completed), [state.goals]);
  const completionRate =
    state.goals.length > 0
      ? Math.round((completedGoals.length / state.goals.length) * 100)
      : 0;

  /* Handlers */
  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.targetValue) return;
    addGoal({
      title: formData.title.trim(),
      description: formData.description.trim(),
      targetValue: Number(formData.targetValue),
      unit: formData.unit,
      category: formData.category,
      currentValue: 0,
    });
    setFormData({ title: '', description: '', targetValue: '', unit: 'kg CO₂', category: 'transport' });
    setShowForm(false);
  };

  const handleSuggestedGoal = (sg) => {
    setFormData({
      title: sg.title,
      description: sg.description,
      targetValue: sg.targetValue,
      unit: sg.unit,
      category: sg.category,
    });
    setShowForm(true);
  };

  return (
    <div className="page-enter space-y-8">
      {/* ─── Header ─── */}
      <div className="animate-slide-up opacity-0 stagger-1 relative glass-card overflow-hidden rounded-3xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          <div className="flex-1 space-y-3 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              {t('goals.title', 'Carbon')} <span className="text-gradient">{t('goals.subtitle', 'Goals')}</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-300 max-w-lg mx-auto md:mx-0 text-sm md:text-base">
              {t('goals.desc', 'Set and track your sustainability goals. Small steps lead to big impact.')}
            </p>
          </div>
          <div className="w-32 h-32 md:w-40 md:h-40 shrink-0 relative">
            <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full" />
            <img src={goalsImg} alt="Illustration of target and goals" loading="lazy" className="w-full h-full object-contain relative z-10 animate-float" />
          </div>
        </div>
      </div>

      {/* ─── Stats Row ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Target} label="Active Goals" value={activeGoals.length} color="emerald" delay="stagger-1" />
        <StatCard icon={CheckCircle2} label="Completed" value={completedGoals.length} color="cyan" delay="stagger-2" />
        <StatCard icon={TrendingUp} label="Completion Rate" value={`${completionRate}%`} color="amber" delay="stagger-3" />
      </div>

      {/* ─── Create Goal Section ─── */}
      <div className="glass-card overflow-hidden animate-slide-up opacity-0 stagger-3">
        {/* Toggle button */}
        <button
          aria-expanded={showForm}
          onClick={() => setShowForm(!showForm)}
          className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-slate-900 dark:text-white">Create New Goal</span>
          </div>
          {showForm ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </button>

        {/* Expandable form */}
        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            showForm ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-5 pb-6 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
            <form onSubmit={handleSubmit} className="space-y-5 mt-4">
              {/* Title */}
              <div>
                <label htmlFor="goalTitle" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Goal Title
                </label>
                <input
                  id="goalTitle"
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  placeholder="e.g., Reduce transport emissions"
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="goalDescription" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Description
                </label>
                <textarea
                  id="goalDescription"
                  value={formData.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  placeholder="Describe your goal..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all resize-none"
                />
              </div>

              {/* Target + Unit + Category row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="goalTarget" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Target Value
                  </label>
                  <input
                    id="goalTarget"
                    type="number"
                    min="1"
                    value={formData.targetValue}
                    onChange={(e) => handleFieldChange('targetValue', e.target.value)}
                    placeholder="e.g., 5"
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="goalUnit" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Unit
                  </label>
                  <select
                    id="goalUnit"
                    value={formData.unit}
                    onChange={(e) => handleFieldChange('unit', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="kg CO₂">kg CO₂</option>
                    <option value="trips">trips</option>
                    <option value="meals">meals</option>
                    <option value="items">items</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="goalCategory" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Category
                  </label>
                  <select
                    id="goalCategory"
                    value={formData.category}
                    onChange={(e) => handleFieldChange('category', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="transport">Transport</option>
                    <option value="electricity">Electricity</option>
                    <option value="food">Food</option>
                    <option value="waste">Waste</option>
                  </select>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold hover:shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Goal
              </button>
            </form>

            {/* ─── Suggested Goals ─── */}
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Quick Add — Suggested Goals
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {suggestedGoals.map((sg, idx) => {
                  const SgIcon = sg.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSuggestedGoal(sg)}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all text-left group"
                    >
                      <div className={`p-1.5 rounded-lg ${categoryBgColors[sg.category]} shrink-0`}>
                        <SgIcon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-tight">
                        {sg.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Active Goals Grid ─── */}
      <div>
        <div className="flex items-center gap-2 mb-4 animate-slide-up opacity-0 stagger-4">
          <Zap className="w-5 h-5 text-emerald-500" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Active Goals</h2>
          <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            {activeGoals.length}
          </span>
        </div>

        {activeGoals.length === 0 ? (
          <div className="glass-card p-12 text-center animate-scale-in opacity-0 stagger-4">
            <div className="inline-flex p-4 rounded-2xl bg-emerald-500/10 mb-4">
              <Target className="w-10 h-10 text-emerald-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              No active goals yet
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">
              Create your first sustainability goal above to start tracking your progress toward a greener lifestyle.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {activeGoals.map((goal, idx) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onUpdate={updateGoal}
                onDelete={deleteGoal}
                delay={`stagger-${Math.min(idx + 1, 6)}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ─── Completed Goals ─── */}
      {completedGoals.length > 0 && (
        <div className="animate-slide-up opacity-0 stagger-5">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-2 mb-4 group"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Completed Goals</h2>
            <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              {completedGoals.length}
            </span>
            {showCompleted ? (
              <ChevronUp className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            )}
          </button>

          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              showCompleted ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {completedGoals.map((goal, idx) => {
                const CatIcon = categoryIcons[goal.category] || Leaf;
                return (
                  <div
                    key={goal.id}
                    className={`glass-card p-5 relative overflow-hidden opacity-70 hover:opacity-100 transition-all animate-slide-up stagger-${Math.min(idx + 1, 6)}`}
                  >
                    {/* Completion overlay */}
                    <div className="absolute top-3 right-3">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${categoryBgColors[goal.category]} grayscale-[30%]`}>
                        <CatIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-sm line-through decoration-emerald-500/50">
                          {goal.title}
                        </h3>
                        <p className="text-xs text-slate-400 capitalize">{goal.category}</p>
                      </div>
                    </div>

                    {/* Full progress bar */}
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
                      <div className="h-full w-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500" />
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>
                        {goal.targetValue} / {goal.targetValue} {goal.unit}
                      </span>
                      {goal.completedAt && (
                        <span>
                          Completed {new Date(goal.completedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
