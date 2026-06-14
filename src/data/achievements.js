export const achievements = [
  {
    id: 'first_log',
    name: 'First Step',
    description: 'Log your first carbon entry',
    icon: '🌱',
    condition: (state) => state.entries.length >= 1,
    category: 'getting_started',
  },
  {
    id: 'five_logs',
    name: 'Getting Started',
    description: 'Log 5 carbon entries',
    icon: '📝',
    condition: (state) => state.entries.length >= 5,
    category: 'getting_started',
  },
  {
    id: 'twenty_logs',
    name: 'Dedicated Tracker',
    description: 'Log 20 carbon entries',
    icon: '📊',
    condition: (state) => state.entries.length >= 20,
    category: 'getting_started',
  },
  {
    id: 'fifty_logs',
    name: 'Data Champion',
    description: 'Log 50 carbon entries',
    icon: '🏆',
    condition: (state) => state.entries.length >= 50,
    category: 'getting_started',
  },
  {
    id: 'streak_3',
    name: 'Three-peat',
    description: 'Maintain a 3-day logging streak',
    icon: '🔥',
    condition: (state) => state.streak >= 3,
    category: 'streak',
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day logging streak',
    icon: '⚡',
    condition: (state) => state.streak >= 7,
    category: 'streak',
  },
  {
    id: 'streak_14',
    name: 'Fortnight Fighter',
    description: 'Maintain a 14-day logging streak',
    icon: '💪',
    condition: (state) => state.streak >= 14,
    category: 'streak',
  },
  {
    id: 'streak_30',
    name: 'Monthly Master',
    description: 'Maintain a 30-day logging streak',
    icon: '👑',
    condition: (state) => state.streak >= 30,
    category: 'streak',
  },
  {
    id: 'green_commute',
    name: 'Green Commuter',
    description: 'Log 5 bike or walking trips',
    icon: '🚲',
    condition: (state) => {
      const greenTrips = state.entries.filter(
        e => e.category === 'transport' && (e.subType === 'bike' || e.subType === 'walk')
      );
      return greenTrips.length >= 5;
    },
    category: 'transport',
  },
  {
    id: 'public_transit',
    name: 'Transit Rider',
    description: 'Log 10 bus or train trips',
    icon: '🚌',
    condition: (state) => {
      const transitTrips = state.entries.filter(
        e => e.category === 'transport' && (e.subType === 'bus' || e.subType === 'train')
      );
      return transitTrips.length >= 10;
    },
    category: 'transport',
  },
  {
    id: 'plant_power',
    name: 'Plant Power',
    description: 'Log 10 plant-based meals',
    icon: '🥗',
    condition: (state) => {
      const plantMeals = state.entries.filter(
        e => e.category === 'food' && ['vegetables', 'fruits', 'legumes', 'tofu', 'nuts'].includes(e.subType)
      );
      return plantMeals.length >= 10;
    },
    category: 'food',
  },
  {
    id: 'recycler',
    name: 'Recycling Hero',
    description: 'Log 10 recycling entries',
    icon: '♻️',
    condition: (state) => {
      const recycling = state.entries.filter(
        e => e.category === 'waste' && e.subType?.startsWith('recycling')
      );
      return recycling.length >= 10;
    },
    category: 'waste',
  },
  {
    id: 'composter',
    name: 'Compost Champion',
    description: 'Log 5 composting entries',
    icon: '🌿',
    condition: (state) => {
      const composting = state.entries.filter(
        e => e.category === 'waste' && e.subType === 'composting'
      );
      return composting.length >= 5;
    },
    category: 'waste',
  },
  {
    id: 'low_carbon_day',
    name: 'Low Carbon Day',
    description: 'Have a day with less than 5kg CO₂',
    icon: '🌍',
    condition: (state) => {
      const dailyTotals = {};
      state.entries.forEach(e => {
        const day = e.date?.split('T')[0];
        if (day) dailyTotals[day] = (dailyTotals[day] || 0) + e.amount;
      });
      return Object.values(dailyTotals).some(v => v < 5 && v > 0);
    },
    category: 'reduction',
  },
  {
    id: 'goal_complete',
    name: 'Goal Getter',
    description: 'Complete your first weekly goal',
    icon: '🎯',
    condition: (state) => state.goals.some(g => g.completed),
    category: 'goals',
  },
  {
    id: 'five_goals',
    name: 'Ambitious',
    description: 'Complete 5 weekly goals',
    icon: '🚀',
    condition: (state) => state.goals.filter(g => g.completed).length >= 5,
    category: 'goals',
  },
  {
    id: 'all_categories',
    name: 'Well Rounded',
    description: 'Log entries in all 4 categories',
    icon: '🌐',
    condition: (state) => {
      const cats = new Set(state.entries.map(e => e.category));
      return cats.has('transport') && cats.has('electricity') && cats.has('food') && cats.has('waste');
    },
    category: 'getting_started',
  },
  {
    id: 'energy_saver',
    name: 'Energy Saver',
    description: 'Use renewable energy source 5 times',
    icon: '☀️',
    condition: (state) => {
      const renewable = state.entries.filter(
        e => e.category === 'electricity' && ['solar', 'wind', 'hydro'].includes(e.subType)
      );
      return renewable.length >= 5;
    },
    category: 'electricity',
  },
  {
    id: 'eco_hero',
    name: 'Eco Hero',
    description: 'Earn a carbon score above 80',
    icon: '🦸',
    condition: (state) => (state.carbonScore || 0) >= 80,
    category: 'reduction',
  },
];

export const achievementCategories = {
  getting_started: { label: 'Getting Started', color: '#8b5cf6' },
  streak: { label: 'Streaks', color: '#f59e0b' },
  transport: { label: 'Transportation', color: '#3b82f6' },
  food: { label: 'Food & Diet', color: '#10b981' },
  waste: { label: 'Waste', color: '#ef4444' },
  electricity: { label: 'Energy', color: '#06b6d4' },
  reduction: { label: 'Reduction', color: '#ec4899' },
  goals: { label: 'Goals', color: '#f97316' },
};
