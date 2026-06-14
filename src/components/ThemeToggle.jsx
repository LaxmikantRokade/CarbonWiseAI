import { useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useCarbon } from '../context/CarbonContext';

const modes = [
  { key: 'light', icon: Sun, label: 'Light Mode', color: 'text-amber-500' },
  { key: 'dark', icon: Moon, label: 'Dark Mode', color: 'text-indigo-400' },
  { key: 'system', icon: Monitor, label: 'System Mode', color: 'text-primary-500' },
];

export default function ThemeToggle() {
  const { state, setTheme } = useCarbon();
  const [isHovered, setIsHovered] = useState(false);
  const [isRotating, setIsRotating] = useState(false);

  const currentIndex = modes.findIndex((m) => m.key === state.theme) ?? 2;
  const current = modes[currentIndex];
  const Icon = current.icon;

  const cycleTheme = () => {
    setIsRotating(true);
    const nextIndex = (currentIndex + 1) % modes.length;
    setTheme(modes[nextIndex].key);
    setTimeout(() => setIsRotating(false), 400);
  };

  return (
    <div className="relative">
      <button
        onClick={cycleTheme}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative flex items-center justify-center w-10 h-10 rounded-full
          bg-white/60 dark:bg-white/10 backdrop-blur-xl
          border border-white/40 dark:border-white/15
          shadow-sm hover:shadow-md
          transition-all duration-300 ease-out
          hover:scale-110 active:scale-95
          cursor-pointer group"
        aria-label={`Theme: ${current.label}. Click to cycle.`}
      >
        <Icon
          size={18}
          className={`${current.color} transition-all duration-400 ease-out
            ${isRotating ? 'rotate-[360deg] scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`}
        />

        {/* Glow ring on hover */}
        <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100
          transition-opacity duration-300
          ring-2 ring-primary-500/30 dark:ring-primary-400/20" />
      </button>

      {/* Tooltip */}
      <div
        className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5
          rounded-lg text-xs font-medium whitespace-nowrap
          bg-gray-900 dark:bg-white text-white dark:text-gray-900
          shadow-lg pointer-events-none
          transition-all duration-200 ease-out
          ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'}`}
      >
        {current.label}
        <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45
          bg-gray-900 dark:bg-white" />
      </div>
    </div>
  );
}
