import { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import { achievements } from '../data/achievements';

const CarbonContext = createContext(null);

const initialState = {
  entries: [],
  goals: [],
  unlockedAchievements: [],
  streak: 0,
  lastLogDate: null,
  carbonScore: 50,
  profile: {
    name: 'Eco Warrior',
    joinDate: new Date().toISOString(),
  },
  theme: 'system',
  highContrast: false,
  language: 'en',
  chatHistory: [],
};

function calculateCarbonScore(entries) {
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const weeklyEntries = entries.filter(e => new Date(e.date) >= weekAgo);
  const weeklyTotal = weeklyEntries.reduce((sum, e) => sum + e.amount, 0);

  // National avg is ~22 kg/day = 154 kg/week
  const weeklyAvg = 154;
  const score = Math.max(0, Math.min(100, Math.round(100 - (weeklyTotal / weeklyAvg) * 50)));
  
  // Boost score for consistent tracking and green choices
  const greenActions = weeklyEntries.filter(e => e.amount <= 0 || e.subType === 'bike' || e.subType === 'walk').length;
  const trackingBonus = Math.min(10, weeklyEntries.length);
  const greenBonus = Math.min(10, greenActions * 2);
  
  return Math.min(100, score + trackingBonus + greenBonus);
}

function calculateStreak(entries, currentStreak, lastLogDate) {
  if (entries.length === 0) return 0;

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (lastLogDate === today) {
    return currentStreak;
  } else if (lastLogDate === yesterday) {
    return currentStreak + 1;
  } else if (!lastLogDate) {
    return 1;
  } else {
    return 1; // streak broken
  }
}

function checkAchievements(state) {
  const newUnlocks = [];
  achievements.forEach(badge => {
    if (!state.unlockedAchievements.includes(badge.id)) {
      try {
        if (badge.condition(state)) {
          newUnlocks.push(badge.id);
        }
      } catch {
        // ignore condition evaluation errors
      }
    }
  });
  return newUnlocks;
}

function carbonReducer(state, action) {
  switch (action.type) {
    case 'ADD_ENTRY': {
      const today = new Date().toISOString().split('T')[0];
      const newEntry = {
        ...action.payload,
        id: Date.now().toString(),
        date: action.payload.date || new Date().toISOString(),
      };
      const newEntries = [...state.entries, newEntry];
      const newStreak = calculateStreak(newEntries, state.streak, state.lastLogDate);
      const newScore = calculateCarbonScore(newEntries);

      const newState = {
        ...state,
        entries: newEntries,
        streak: newStreak,
        lastLogDate: today,
        carbonScore: newScore,
      };

      // Check achievements
      const newUnlocks = checkAchievements(newState);
      if (newUnlocks.length > 0) {
        newState.unlockedAchievements = [...state.unlockedAchievements, ...newUnlocks];
      }

      return newState;
    }

    case 'DELETE_ENTRY': {
      const filtered = state.entries.filter(e => e.id !== action.payload);
      return {
        ...state,
        entries: filtered,
        carbonScore: calculateCarbonScore(filtered),
      };
    }

    case 'ADD_GOAL': {
      const newGoal = {
        ...action.payload,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        completed: false,
        progress: 0,
      };
      return { ...state, goals: [...state.goals, newGoal] };
    }

    case 'UPDATE_GOAL': {
      const updatedGoals = state.goals.map(g =>
        g.id === action.payload.id ? { ...g, ...action.payload } : g
      );
      const newState = { ...state, goals: updatedGoals };
      const newUnlocks = checkAchievements(newState);
      if (newUnlocks.length > 0) {
        newState.unlockedAchievements = [...state.unlockedAchievements, ...newUnlocks];
      }
      return newState;
    }

    case 'DELETE_GOAL':
      return { ...state, goals: state.goals.filter(g => g.id !== action.payload) };

    case 'SET_THEME':
      return { ...state, theme: action.payload };

    case 'SET_HIGH_CONTRAST':
      return { ...state, highContrast: action.payload };

    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };

    case 'UPDATE_PROFILE':
      return { ...state, profile: { ...state.profile, ...action.payload } };

    case 'ADD_CHAT_MESSAGE':
      return { ...state, chatHistory: [...state.chatHistory, action.payload] };

    case 'LOAD_STATE':
      return { ...action.payload, theme: state.theme };

    default:
      return state;
  }
}

export function CarbonProvider({ children }) {
  console.log('[App Init] CarbonProvider rendered');
  const [state, dispatch] = useReducer(carbonReducer, initialState, (initial) => {
    try {
      const saved = localStorage.getItem('carbonwise_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...initial, ...parsed };
      }
    } catch {
      // ignore
    }
    return initial;
  });

  // Persist state to localStorage
  useEffect(() => {
    try {
      const { theme, ...stateToSave } = state;
      localStorage.setItem('carbonwise_state', JSON.stringify(stateToSave));
    } catch {
      // ignore
    }
  }, [state]);

  // Theme management
  useEffect(() => {
    const root = document.documentElement;
    const savedTheme = localStorage.getItem('carbonwise_theme') || 'system';

    const applyTheme = (theme) => {
      if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme(savedTheme);

    if (savedTheme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme('system');
      
      // Backward compatibility for older Android Chrome / Safari
      if (mq.addEventListener) {
        mq.addEventListener('change', handler);
      } else if (mq.addListener) {
        mq.addListener(handler);
      }
      
      return () => {
        if (mq.removeEventListener) {
          mq.removeEventListener('change', handler);
        } else if (mq.removeListener) {
          mq.removeListener(handler);
        }
      };
    }
  }, [state.theme]);

  // High Contrast management
  useEffect(() => {
    const root = document.documentElement;
    if (state.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  }, [state.highContrast]);

  const addEntry = useCallback((entry) => {
    dispatch({ type: 'ADD_ENTRY', payload: entry });
  }, []);

  const deleteEntry = useCallback((id) => {
    dispatch({ type: 'DELETE_ENTRY', payload: id });
  }, []);

  const addGoal = useCallback((goal) => {
    dispatch({ type: 'ADD_GOAL', payload: goal });
  }, []);

  const updateGoal = useCallback((goal) => {
    dispatch({ type: 'UPDATE_GOAL', payload: goal });
  }, []);

  const deleteGoal = useCallback((id) => {
    dispatch({ type: 'DELETE_GOAL', payload: id });
  }, []);

  const setTheme = useCallback((theme) => {
    localStorage.setItem('carbonwise_theme', theme);
    dispatch({ type: 'SET_THEME', payload: theme });

    const root = document.documentElement;
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);

  const setHighContrast = useCallback((enabled) => {
    dispatch({ type: 'SET_HIGH_CONTRAST', payload: enabled });
  }, []);

  const setLanguage = useCallback((lang) => {
    dispatch({ type: 'SET_LANGUAGE', payload: lang });
  }, []);

  const addChatMessage = useCallback((message) => {
    dispatch({ type: 'ADD_CHAT_MESSAGE', payload: message });
  }, []);

  const value = useMemo(() => ({
    state,
    dispatch,
    addEntry,
    deleteEntry,
    addGoal,
    updateGoal,
    deleteGoal,
    setTheme,
    setHighContrast,
    setLanguage,
    addChatMessage,
  }), [
    state,
    addEntry,
    deleteEntry,
    addGoal,
    updateGoal,
    deleteGoal,
    setTheme,
    setHighContrast,
    setLanguage,
    addChatMessage
  ]);

  return (
    <CarbonContext.Provider value={value}>
      {children}
    </CarbonContext.Provider>
  );
}

export function useCarbon() {
  const context = useContext(CarbonContext);
  if (!context) {
    throw new Error('useCarbon must be used within a CarbonProvider');
  }
  return context;
}

export default CarbonContext;
