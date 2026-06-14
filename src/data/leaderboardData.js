/* Simulated community leaderboard data */

const firstNames = ['Alex', 'Jordan', 'Sam', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Quinn', 'Avery', 'Cameron', 'Drew', 'Skyler', 'Reese', 'Finley', 'Sage', 'Rowan', 'Emery', 'Blake', 'Hayden', 'Dakota', 'Kai', 'Lennox', 'Phoenix', 'River', 'Atlas', 'Oakley', 'Zion', 'Eden', 'Nova', 'Wren'];

const avatarColors = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#3b82f6', '#14b8a6', '#f97316', '#6366f1'];

function generateUser(rank) {
  const name = firstNames[Math.floor(Math.random() * firstNames.length)];
  const score = Math.max(15, Math.min(99, Math.round(95 - rank * 2.5 + (Math.random() * 10 - 5))));
  const totalReduction = Math.round(score * 1.8 + Math.random() * 200);
  const streak = Math.max(0, Math.round(score * 0.4 + Math.random() * 10 - 5));
  const badges = Math.max(1, Math.round(score * 0.15 + Math.random() * 3));
  const color = avatarColors[rank % avatarColors.length];
  const joinedMonthsAgo = Math.round(Math.random() * 12 + 1);

  return {
    id: `user_${rank}`,
    rank,
    name: `${name} ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}.`,
    score,
    totalReduction,
    streak,
    badges,
    color,
    joinedMonthsAgo,
    categoryScores: {
      transport: Math.round(score * (0.7 + Math.random() * 0.6)),
      food: Math.round(score * (0.7 + Math.random() * 0.6)),
      electricity: Math.round(score * (0.7 + Math.random() * 0.6)),
      waste: Math.round(score * (0.7 + Math.random() * 0.6)),
    },
  };
}

export function generateLeaderboard(userScore = 65, userName = 'You') {
  const users = [];

  // Generate 30 simulated users
  for (let i = 1; i <= 30; i++) {
    users.push(generateUser(i));
  }

  // Sort by score descending
  users.sort((a, b) => b.score - a.score);

  // Re-assign ranks
  users.forEach((u, i) => { u.rank = i + 1; });

  // Find where the current user would rank
  let userRank = users.findIndex(u => u.score <= userScore);
  if (userRank === -1) userRank = users.length;

  // Insert current user
  const currentUser = {
    id: 'current_user',
    rank: userRank + 1,
    name: userName,
    score: userScore,
    totalReduction: Math.round(userScore * 1.8 + 50),
    streak: 0,
    badges: 0,
    color: '#10b981',
    isCurrentUser: true,
    joinedMonthsAgo: 1,
    categoryScores: {
      transport: Math.round(userScore * 0.9),
      food: Math.round(userScore * 0.85),
      electricity: Math.round(userScore * 0.95),
      waste: Math.round(userScore * 0.8),
    },
  };

  users.splice(userRank, 0, currentUser);

  // Update ranks after insertion
  users.forEach((u, i) => { u.rank = i + 1; });

  return users;
}

export function getPercentile(userScore) {
  // Simulated percentile based on normal distribution
  if (userScore >= 90) return 95;
  if (userScore >= 80) return 85;
  if (userScore >= 70) return 70;
  if (userScore >= 60) return 55;
  if (userScore >= 50) return 40;
  if (userScore >= 40) return 25;
  if (userScore >= 30) return 15;
  return 5;
}

export const timeFilters = [
  { id: 'weekly', label: 'This Week' },
  { id: 'monthly', label: 'This Month' },
  { id: 'alltime', label: 'All Time' },
];

export const categoryFilters = [
  { id: 'overall', label: 'Overall', icon: '🌍' },
  { id: 'transport', label: 'Transport', icon: '🚗' },
  { id: 'food', label: 'Food', icon: '🍽️' },
  { id: 'electricity', label: 'Energy', icon: '⚡' },
  { id: 'waste', label: 'Waste', icon: '♻️' },
];
