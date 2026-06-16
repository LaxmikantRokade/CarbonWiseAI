import { Car, Zap, Utensils, Trash2, Home, ShoppingBag, Plane, HelpCircle } from 'lucide-react';
import { memo } from 'react';

const iconMap = {
  transport: Car,
  electricity: Zap,
  food: Utensils,
  waste: Trash2,
};

const colorMap = {
  transport: 'bg-amber-500/15 text-amber-500',
  electricity: 'bg-blue-500/15 text-blue-500',
  food: 'bg-emerald-500/15 text-emerald-500',
  waste: 'bg-rose-500/15 text-rose-500',
};

const CategoryIcon = memo(function CategoryIcon({ category, size = 'md', className = '' }) {
  const Icon = iconMap[category] || Utensils;
  const color = colorMap[category] || colorMap.food;

  const sizeMap = {
    sm: 'p-1.5 rounded-lg',
    md: 'p-2.5 rounded-xl',
    lg: 'p-3.5 rounded-2xl',
  };

  const iconSizeMap = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className={`${sizeMap[size]} ${color} ${className}`}>
      <Icon className={iconSizeMap[size]} />
    </div>
  );
});

export default CategoryIcon;
