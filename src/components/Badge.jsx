import { Lock } from 'lucide-react';

export default function Badge({ achievement, unlocked = false, onClick, className = '' }) {
  const { icon, name, description } = achievement || {};

  return (
    <div
      onClick={onClick}
      className={`glass-card p-5 text-center transition-all duration-300 cursor-pointer group ${
        unlocked
          ? 'ring-1 ring-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:shadow-[0_0_30px_rgba(16,185,129,0.25)]'
          : 'opacity-60 grayscale hover:opacity-75'
      } ${className}`}
    >
      {/* Badge Icon */}
      <div className="relative inline-block mb-3">
        <span
          className={`text-4xl block transition-transform duration-300 group-hover:scale-110 ${
            unlocked ? 'animate-bounce-in' : 'blur-[2px]'
          }`}
        >
          {unlocked ? icon : '🔒'}
        </span>
        {!unlocked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Lock className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </div>
        )}
      </div>

      {/* Badge Name */}
      <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1 truncate">
        {unlocked ? name : '???'}
      </h4>

      {/* Badge Description */}
      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
        {unlocked ? description : 'Keep going to unlock!'}
      </p>

      {/* Unlocked Glow Effect */}
      {unlocked && (
        <div className="mt-2">
          <span className="inline-block px-2 py-0.5 text-[10px] font-medium bg-emerald-500/10 text-emerald-500 rounded-full">
            Unlocked ✓
          </span>
        </div>
      )}
    </div>
  );
}
