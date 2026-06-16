import { useEffect, useState, useRef, memo } from 'react';

function getScoreColor(score) {
  if (score <= 30) return { stroke: '#ef4444', glow: 'rgba(239,68,68,0.3)', label: 'Needs Work' };
  if (score <= 60) return { stroke: '#f59e0b', glow: 'rgba(245,158,11,0.3)', label: 'Getting There' };
  return { stroke: '#10b981', glow: 'rgba(16,185,129,0.3)', label: 'Great!' };
}

const CarbonScore = memo(function CarbonScore({ score = 50, size = 200, label = 'Carbon Score' }) {
  const [displayScore, setDisplayScore] = useState(0);
  const animationRef = useRef(null);
  const startTime = useRef(null);

  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeWidth = size * 0.06;
  const offset = circumference - (displayScore / 100) * circumference;

  const scoreColor = getScoreColor(score);

  // Counting animation
  useEffect(() => {
    const duration = 1500;
    startTime.current = null;

    const animate = (timestamp) => {
      if (!startTime.current) startTime.current = timestamp;
      const elapsed = timestamp - startTime.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * score));

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [score]);

  const center = size / 2;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Glow effect */}
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-40 animate-pulse-glow"
          style={{ background: `radial-gradient(circle, ${scoreColor.glow}, transparent 70%)` }}
        />

        <svg width={size} height={size} className="relative z-10 drop-shadow-lg">
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={scoreColor.stroke} />
              <stop offset="100%" stopColor={score > 60 ? '#06b6d4' : scoreColor.stroke} />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            className="score-ring-bg"
            strokeWidth={strokeWidth}
          />

          {/* Progress arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="url(#scoreGradient)"
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            filter="url(#glow)"
            style={{
              transform: 'rotate(-90deg)',
              transformOrigin: 'center',
              transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />

          {/* Score number */}
          <text
            x={center}
            y={center - 6}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-gray-900 dark:fill-white font-bold"
            style={{ fontSize: size * 0.22 }}
          >
            {displayScore}
          </text>

          {/* Score sub-label */}
          <text
            x={center}
            y={center + size * 0.12}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-gray-500 dark:fill-gray-400 font-medium"
            style={{ fontSize: size * 0.07 }}
          >
            {scoreColor.label}
          </text>
        </svg>
      </div>

      {/* Label */}
      <span className="text-sm font-semibold text-gray-600 dark:text-gray-300 tracking-wide uppercase">
        {label}
      </span>
    </div>
  );
});

export default CarbonScore;
