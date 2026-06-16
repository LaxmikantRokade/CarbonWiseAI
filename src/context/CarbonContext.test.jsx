import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CarbonProvider, useCarbon } from './CarbonContext';
import { createElement } from 'react';

// Wrapper for hooks
const wrapper = ({ children }) => createElement(CarbonProvider, null, children);

describe('CarbonContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('provides initial state', () => {
    const { result } = renderHook(() => useCarbon(), { wrapper });
    expect(result.current.state.carbonScore).toBe(50);
    expect(result.current.state.entries).toEqual([]);
    expect(result.current.state.goals).toEqual([]);
    expect(result.current.state.theme).toBe('system');
    expect(result.current.state.language).toBe('en');
  });

  it('adds and deletes a carbon entry', () => {
    const { result } = renderHook(() => useCarbon(), { wrapper });

    act(() => {
      result.current.addEntry({
        category: 'transport',
        subType: 'car',
        amount: 5,
        label: 'Drive to work',
      });
    });

    expect(result.current.state.entries).toHaveLength(1);
    expect(result.current.state.entries[0].amount).toBe(5);

    const entryId = result.current.state.entries[0].id;

    act(() => {
      result.current.deleteEntry(entryId);
    });

    expect(result.current.state.entries).toHaveLength(0);
  });

  it('adds, updates, and deletes a goal', () => {
    const { result } = renderHook(() => useCarbon(), { wrapper });

    act(() => {
      result.current.addGoal({
        title: 'Reduce driving',
        targetValue: 10,
        unit: 'trips',
        category: 'transport'
      });
    });

    expect(result.current.state.goals).toHaveLength(1);
    const goalId = result.current.state.goals[0].id;

    act(() => {
      result.current.updateGoal({ id: goalId, currentValue: 5 });
    });

    expect(result.current.state.goals[0].currentValue).toBe(5);

    act(() => {
      result.current.deleteGoal(goalId);
    });

    expect(result.current.state.goals).toHaveLength(0);
  });

  it('switches themes correctly', () => {
    const { result } = renderHook(() => useCarbon(), { wrapper });

    act(() => {
      result.current.setTheme('dark');
    });

    expect(result.current.state.theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    act(() => {
      result.current.setTheme('light');
    });

    expect(result.current.state.theme).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('switches language correctly', () => {
    const { result } = renderHook(() => useCarbon(), { wrapper });

    act(() => {
      result.current.setLanguage('hi');
    });

    expect(result.current.state.language).toBe('hi');
  });
});
