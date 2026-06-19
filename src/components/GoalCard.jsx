import { useState, useEffect, memo } from 'react';
import { CheckCircle2, Trash2, PartyPopper } from 'lucide-react';
import CategoryIcon from './CategoryIcon';

const GoalCard = memo(function GoalCard({ goal, onUpdate, onDelete }) {
  const [showCelebration, setShowCelebration] = useState(false);
  const [animatedProgress, setAnimatedProgress] = useState(0);

  const progress = goal ? (goal.progress ?? Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100))) : 0;
  const isComplete = goal ? (goal.completed || progress >= 100) : false;

  // Animate the progress bar
  useEffect(() => {
    const timer = setTimeout(() => setAnimatedProgress(progress), 100);
    return () => clearTimeout(timer);
  }, [progress]);

  // Celebration when newly completed
  useEffect(() => {
    if (isComplete && !showCelebration) {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 3000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isComplete]);

  if (!goal) return null;

  const handleComplete = () => {
    onUpdate?.({ ...goal, completed: true, progress: 100, currentValue: goal.targetValue });
  };

  return (
    <div className={`glass-card p-5 relative overflow-hidden transition-all duration-300
      ${isComplete ? 'ring-2 ring-primary-500/30' : ''}`}>

      {/* Celebration overlay */}
      {showCelebration && (
        <div className="absolute inset-0 flex items-center justify-center z-10
          bg-primary-500/10 dark:bg-primary-500/5 backdrop-blur-[2px]
          animate-fade-in rounded-2xl">
          <div className="flex flex-col items-center gap-2 animate-bounce-in">
            <PartyPopper size={40} className="text-primary-500 animate-float" />
            <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
              Goal Complete! 🎉
            </span>
          </div>
        </div>
      )}

      {/* Header row */}
      <div className="flex items-start gap-3">
        <CategoryIcon category={goal.category} size="sm" />

        <div className="flex-1 min-w-0">
          <h3 className={`font-bold text-gray-900 dark:text-white truncate
            ${isComplete ? 'line-through opacity-60' : ''}`}>
            {goal.title}
          </h3>
          {goal.description && (
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
              {goal.description}
            </p>
          )}
        </div>

        {/* Percentage */}
        <div className={`text-right shrink-0 font-bold text-lg tabular-nums
          ${isComplete ? 'text-primary-500' : 'text-gray-700 dark:text-gray-200'}`}>
          {progress}%
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-2.5 rounded-full bg-gray-200 dark:bg-gray-700/50 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out
            bg-gradient-to-r from-primary-500 via-primary-400 to-accent-400"
          style={{ width: `${animatedProgress}%` }}
        />
      </div>

      {/* Value display */}
      <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>
          {goal.currentValue ?? 0} / {goal.targetValue} {goal.unit}
        </span>
        {isComplete && (
          <span className="flex items-center gap-1 text-primary-500 font-semibold">
            <CheckCircle2 size={12} />
            Completed
          </span>
        )}
      </div>

      {/* Actions */}
      {!isComplete && (
        <div className="mt-3 flex items-center gap-2 pt-3 border-t border-gray-200/50 dark:border-white/5">
          <button
            onClick={handleComplete}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
              bg-primary-500/10 text-primary-600 dark:text-primary-400
              hover:bg-primary-500/20 transition-colors duration-200 cursor-pointer"
          >
            <CheckCircle2 size={13} />
            Mark Complete
          </button>
          <button
            onClick={() => onDelete?.(goal.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
              bg-rose-500/10 text-rose-600 dark:text-rose-400
              hover:bg-rose-500/20 transition-colors duration-200 ml-auto cursor-pointer"
          >
            <Trash2 size={13} />
            Delete
          </button>
        </div>
      )}
    </div>
  );
});

export default GoalCard;
