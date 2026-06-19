/* AI Eco Coach — Rule-based recommendation engine (Mock / No API dependency) */

const tipDatabase = {
  transport: {
    high: [
      { title: 'Switch to Public Transit', message: 'Your transport emissions are high. Taking the bus or train just 3 days a week could reduce your transport footprint by up to 65%. Consider a monthly transit pass — it often saves money too!', impact: 'high' },
      { title: 'Try Carpooling', message: 'Sharing rides with colleagues or neighbors can cut your per-trip emissions by 50-75%. Apps like BlaBlaCar make it easy to find carpooling partners.', impact: 'high' },
      { title: 'Work From Home', message: 'If possible, working from home even 2 days a week eliminates commute emissions entirely on those days. That could save 1-2 tonnes of CO₂ per year!', impact: 'high' },
      { title: 'Consider an EV', message: 'Electric vehicles produce 50-70% less lifetime emissions than gasoline cars. With growing charging infrastructure, now might be the time to consider switching.', impact: 'high' },
    ],
    medium: [
      { title: 'Combine Your Trips', message: 'Planning your errands to combine multiple stops in one trip can reduce unnecessary driving by 20-30%. Try mapping out your weekly route in advance.', impact: 'medium' },
      { title: 'Eco-Driving Tips', message: 'Smooth acceleration, maintaining steady speeds, and proper tire inflation can improve fuel efficiency by 15-20%. Small driving habit changes add up!', impact: 'medium' },
    ],
    low: [
      { title: 'Great Transport Habits! 🌟', message: "Your transport emissions are below average — fantastic! Keep using green transportation methods. Every bike ride and walk makes a difference.", impact: 'positive' },
    ],
  },
  electricity: {
    high: [
      { title: 'Switch to LED Bulbs', message: 'LED bulbs use 75% less energy than incandescent bulbs and last 25x longer. Switching all your lights could save 400+ kg CO₂ per year.', impact: 'high' },
      { title: 'Unplug Phantom Loads', message: 'Devices on standby consume 5-10% of household electricity. Using smart power strips or unplugging chargers when not in use can save 200+ kg CO₂ annually.', impact: 'medium' },
      { title: 'Optimize Your Thermostat', message: 'Adjusting your thermostat by just 2°C (lower in winter, higher in summer) can reduce heating/cooling energy by 10%. Smart thermostats automate this.', impact: 'high' },
      { title: 'Consider Renewable Energy', message: 'Many utility providers now offer green energy plans. Solar panels have become 70% cheaper in the last decade — explore your options!', impact: 'high' },
    ],
    medium: [
      { title: 'Wash Cold, Save Energy', message: 'Washing clothes in cold water uses 90% less energy than hot water washes. Modern detergents work great in cold water!', impact: 'medium' },
      { title: 'Air Dry When Possible', message: 'Using a clothesline or drying rack instead of a dryer can save 2-3 kg CO₂ per load. Plus, your clothes last longer!', impact: 'medium' },
    ],
    low: [
      { title: 'Energy Efficiency Star! ⚡', message: 'Your electricity usage is impressively low. You\'re already making great choices. Consider sharing your energy-saving tips with friends and family!', impact: 'positive' },
    ],
  },
  food: {
    high: [
      { title: 'Try Meatless Mondays', message: 'Reducing meat consumption by just one day a week can save 600+ kg CO₂ per year. Start with one meatless day and gradually increase.', impact: 'high' },
      { title: 'Reduce Beef Consumption', message: 'Beef produces 5-10x more emissions than chicken or pork. Swapping beef for chicken in just half your meals could cut food emissions by 35%.', impact: 'high' },
      { title: 'Explore Plant Proteins', message: 'Lentils, beans, and tofu provide excellent protein with 10-50x less carbon footprint than beef. Try incorporating them into your favorite recipes!', impact: 'high' },
    ],
    medium: [
      { title: 'Buy Local & Seasonal', message: 'Locally sourced, seasonal produce travels shorter distances and requires less energy-intensive storage. Visit your local farmers market!', impact: 'medium' },
      { title: 'Reduce Food Waste', message: 'About 1/3 of food produced is wasted. Planning meals, using leftovers, and composting can significantly reduce your food-related emissions.', impact: 'medium' },
    ],
    low: [
      { title: 'Eco-Foodie! 🥗', message: 'Your food choices are planet-friendly! Your diet has a lower carbon footprint than most. Keep exploring sustainable and delicious plant-based recipes.', impact: 'positive' },
    ],
  },
  waste: {
    high: [
      { title: 'Start Recycling', message: 'Recycling aluminum saves 95% of the energy needed to make new aluminum. Start separating your recyclables — paper, plastic, glass, and metal.', impact: 'high' },
      { title: 'Compost Organic Waste', message: 'Composting food scraps prevents methane emissions from landfills and creates nutrient-rich soil. Even apartment dwellers can use countertop composters!', impact: 'high' },
      { title: 'Reduce Single-Use Plastics', message: 'Carry reusable bags, water bottles, and containers. Refusing single-use plastics reduces waste AND the emissions from producing them.', impact: 'high' },
    ],
    medium: [
      { title: 'Buy in Bulk', message: 'Bulk buying reduces packaging waste by up to 80%. Bring your own containers to bulk stores for maximum impact.', impact: 'medium' },
      { title: 'Repair Before Replacing', message: 'Extending the life of electronics and appliances by repairing them prevents manufacturing emissions and e-waste. Many items are easier to fix than you think!', impact: 'medium' },
    ],
    low: [
      { title: 'Waste Warrior! ♻️', message: 'Your waste management is excellent! You\'re keeping materials out of landfills and reducing emissions. Consider mentoring others on proper waste sorting.', impact: 'positive' },
    ],
  },
};

const generalTips = [
  { title: 'Track Consistently', message: 'Regular tracking helps you identify patterns and make informed decisions. Try logging at least one entry every day for the best insights.', impact: 'info' },
  { title: 'Set Weekly Goals', message: 'People who set specific goals are 42% more likely to achieve them. Head to the Goals page and set a realistic target for this week!', impact: 'info' },
  { title: 'Celebrate Small Wins', message: "Every emission you prevent matters. A single person's sustainable choices can prevent 2-4 tonnes of CO₂ per year — that's like planting 12-24 trees!", impact: 'positive' },
  { title: 'Share Your Journey', message: 'Talking about sustainability with friends and family multiplies your impact. Studies show each person influences an average of 5 others!', impact: 'info' },
];


export async function generateMockCoachResponse(state, userMessage = '') {
  // Simulate AI thinking delay for realism
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1000));

  const responses = [];
  const lowerMsg = userMessage.toLowerCase();

  // Analyze user's emission patterns
  const categoryTotals = { transport: 0, electricity: 0, food: 0, waste: 0 };
  const recentEntries = state.entries.filter(e => {
    const entryDate = new Date(e.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return entryDate >= weekAgo;
  });

  recentEntries.forEach(e => {
    if (categoryTotals[e.category] !== undefined) {
      categoryTotals[e.category] += e.amount;
    }
  });


  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const highestCategory = sortedCategories.length > 0 && sortedCategories[0][1] > 0 ? sortedCategories[0] : null;

  if (lowerMsg.includes('transport') || lowerMsg.includes('car') || lowerMsg.includes('drive') || lowerMsg.includes('commut')) {
    const level = categoryTotals.transport > 30 ? 'high' : categoryTotals.transport > 10 ? 'medium' : 'low';
    const tips = tipDatabase.transport[level];
    responses.push(tips[Math.floor(Math.random() * tips.length)]);
  } else if (lowerMsg.includes('electric') || lowerMsg.includes('energy') || lowerMsg.includes('power')) {
    const level = categoryTotals.electricity > 40 ? 'high' : categoryTotals.electricity > 15 ? 'medium' : 'low';
    const tips = tipDatabase.electricity[level];
    responses.push(tips[Math.floor(Math.random() * tips.length)]);
  } else if (lowerMsg.includes('food') || lowerMsg.includes('eat') || lowerMsg.includes('diet') || lowerMsg.includes('meat')) {
    const level = categoryTotals.food > 30 ? 'high' : categoryTotals.food > 10 ? 'medium' : 'low';
    const tips = tipDatabase.food[level];
    responses.push(tips[Math.floor(Math.random() * tips.length)]);
  } else if (lowerMsg.includes('waste') || lowerMsg.includes('recycl') || lowerMsg.includes('trash')) {
    const level = categoryTotals.waste > 15 ? 'high' : categoryTotals.waste > 5 ? 'medium' : 'low';
    const tips = tipDatabase.waste[level];
    responses.push(tips[Math.floor(Math.random() * tips.length)]);
  } else if (lowerMsg.includes('score') || lowerMsg.includes('how am i') || lowerMsg.includes('progress')) {
    const score = state.carbonScore || 50;
    responses.push({
      title: `Your Carbon Score: ${score}/100`,
      message: score >= 80
        ? `Outstanding! Your score of ${score} puts you in the top 10% of eco-conscious users. Keep it up!`
        : score >= 60
        ? `Good progress! Your score of ${score} shows you're making conscious choices.`
        : `Your score of ${score} has room for improvement. Let's work together to bring it up!`,
      impact: score >= 80 ? 'positive' : score >= 60 ? 'medium' : 'high',
    });
  } else if (lowerMsg.includes('goal') || lowerMsg.includes('target') || lowerMsg.includes('plan')) {
    const activeGoals = state.goals.filter(g => !g.completed);
    if (activeGoals.length > 0) {
      const goalsText = activeGoals.map(g => '"' + g.title + '" is ' + Math.round(g.progress || 0) + '% complete').join('. ');
      responses.push({
        title: 'Your Active Goals',
        message: `You have ${activeGoals.length} active goal(s). ${goalsText}. Keep pushing — you're almost there!`,
        impact: 'info',
      });
    } else {
      responses.push({
        title: 'Set a New Goal!',
        message: "You don't have any active goals. Setting specific targets helps you stay motivated and track progress.",
        impact: 'info',
      });
    }
  } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey') || lowerMsg === '') {
    if (state.entries.length === 0) {
      responses.push({
        title: 'Welcome to CarbonWise AI! 🌱',
        message: "I'm your personal eco coach. I'll help you understand and reduce your carbon footprint with personalized tips and actionable insights. Start by logging your first carbon entry in the Calculator!",
        impact: 'info',
      });
    } else {
      responses.push({
        title: 'Welcome Back!',
        message: `You've logged ${state.entries.length} entries so far. Your highest category is ${highestCategory ? highestCategory[0] : 'unknown'}. What would you like to focus on today?`,
        impact: 'info',
      });
    }
  } else {
    if (highestCategory && highestCategory[1] > 0) {
      const level = highestCategory[1] > 25 ? 'high' : highestCategory[1] > 10 ? 'medium' : 'low';
      const categoryTips = tipDatabase[highestCategory[0]]?.[level] || [];
      if (categoryTips.length > 0) {
        responses.push(categoryTips[Math.floor(Math.random() * categoryTips.length)]);
      }
    }
    responses.push(generalTips[Math.floor(Math.random() * generalTips.length)]);
  }

  if (responses.length === 0) {
    responses.push(generalTips[Math.floor(Math.random() * generalTips.length)]);
  }

  return responses;
}

export const conversationStarters = [
  { label: '🚗 Reduce transport emissions', query: 'How can I reduce my transport emissions?' },
  { label: '⚡ Save energy at home', query: 'How can I reduce my electricity usage?' },
  { label: '🥗 Eat more sustainably', query: 'How can I improve my food carbon footprint?' },
  { label: '♻️ Reduce waste', query: 'How can I reduce my waste and recycle better?' },
  { label: '📊 Check my progress', query: 'How am I doing with my carbon score?' },
  { label: '🎯 Set sustainability goals', query: 'Help me set goals for reducing my footprint' },
];
