import { memo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = memo(function StatCard({ icon: Icon, title, label, value, unit, suffix, trend, trendValue, trendLabel, color = 'primary', delay = 0 }) {
  const colorStyles = {
    primary: {
      iconBg: 'bg-primary-100 dark:bg-primary-500/20',
      iconText: 'text-primary-600 dark:text-primary-400',
    },
    emerald: {
      iconBg: 'bg-emerald-100 dark:bg-emerald-500/20',
      iconText: 'text-emerald-600 dark:text-emerald-400',
    },
    cyan: {
      iconBg: 'bg-cyan-100 dark:bg-cyan-500/20',
      iconText: 'text-cyan-600 dark:text-cyan-400',
    },
    amber: {
      iconBg: 'bg-amber-100 dark:bg-amber-500/20',
      iconText: 'text-amber-600 dark:text-amber-400',
    },
    rose: {
      iconBg: 'bg-rose-100 dark:bg-rose-500/20',
      iconText: 'text-rose-600 dark:text-rose-400',
    },
    blue: {
      iconBg: 'bg-blue-100 dark:bg-blue-500/20',
      iconText: 'text-blue-600 dark:text-blue-400',
    },
    violet: {
      iconBg: 'bg-violet-100 dark:bg-violet-500/20',
      iconText: 'text-violet-600 dark:text-violet-400',
    },
  };

  const cs = colorStyles[color] || colorStyles.primary;
  const staggerClass = delay > 0 && delay <= 6 ? `stagger-${delay}` : '';

  // Normalize trend: accept number or string
  const trendDir = typeof trend === 'number'
    ? (trend < 0 ? 'down' : trend > 0 ? 'up' : null)
    : trend;
  const trendDisplay = typeof trend === 'number'
    ? `${Math.abs(trend)}%`
    : trendValue;

  // Normalize label/title and unit/suffix
  const displayLabel = label || title;
  const displayUnit = suffix || unit;

  // Handle icon as element or component
  const renderIcon = () => {
    if (!Icon) return null;
    if (typeof Icon === 'function') return <Icon size={22} />;
    return Icon; // already a JSX element
  };

  return (
    <div
      className={`glass-card p-5 animate-slide-up ${staggerClass}
        group cursor-default`}
    >
      <div className="flex items-start justify-between">
        {/* Icon */}
        <div className={`${cs.iconBg} ${cs.iconText} p-3 rounded-xl
          transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
          {renderIcon()}
        </div>

        {/* Trend */}
        {trendDir && (
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold
            ${trendDir === 'down'
              ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
              : 'bg-rose-100 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400'
            }`}
          >
            {trendDir === 'down' ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
            <span>{trendDisplay}</span>
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mt-4">
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            {value}
          </span>
          {displayUnit && (
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {displayUnit}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-medium">
          {displayLabel}
        </p>
      </div>
    </div>
  );
});

export default StatCard;
