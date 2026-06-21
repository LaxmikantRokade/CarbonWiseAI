import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Tracker from './Tracker';
import { CarbonProvider } from '../context/CarbonContext';
import { BrowserRouter } from 'react-router-dom';

// Mock Recharts to avoid testing SVG elements
vi.mock('recharts', async () => {
  const OriginalModule = await vi.importActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
    LineChart: () => <div data-testid="line-chart" />,
    BarChart: () => <div data-testid="bar-chart" />,
    PieChart: () => <div data-testid="pie-chart" />,
    AreaChart: () => <div data-testid="area-chart" />,
  };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key, fallback) => fallback }),
}));

describe('Tracker Page', () => {
  it('renders the history tab by default', () => {
    render(
      <CarbonProvider>
        <Tracker />
      </CarbonProvider>
    );
    expect(screen.getByText(/No entries yet/i)).toBeInTheDocument();
  });

  it('allows switching to charts tab', () => {
    render(
      <CarbonProvider>
        <Tracker />
      </CarbonProvider>
    );

    const transportTab = screen.getByText('Transport');
    fireEvent.click(transportTab);

    expect(transportTab).toBeInTheDocument();
  });

  it('filters entries by category', () => {
    // Add mock entries and verify they are filtered
    const stateWithEntries = {
      entries: [
        { id: '1', category: 'transport', amount: 10, date: new Date().toISOString() },
        { id: '2', category: 'food', amount: 5, date: new Date().toISOString() },
      ],
      goals: []
    };

    // Initial state: both entries
    localStorage.setItem('carbonwise_state', JSON.stringify(stateWithEntries));

    render(
      <CarbonProvider>
        <Tracker />
      </CarbonProvider>
    );

    // Initial state: both entries
    // Filter to transport
    fireEvent.click(screen.getByText('Transport'));
    expect(screen.getByText('Transport')).toBeInTheDocument();
  });

  it('allows deleting an entry', () => {
    const stateWithEntries = {
      entries: [
        { id: '1', category: 'transport', amount: 10, date: new Date().toISOString() },
      ],
      goals: []
    };

    localStorage.setItem('carbonwise_state', JSON.stringify(stateWithEntries));

    render(
      <CarbonProvider>
        <Tracker />
      </CarbonProvider>
    );

    // Find the delete button (it has hover:bg-rose-500/10 and contains the Trash2 icon)
    const buttons = screen.getAllByRole('button');
    const deleteBtn = buttons[buttons.length - 1]; // Last button is the delete button
    fireEvent.click(deleteBtn);
    
    expect(screen.getByText(/No entries yet/i)).toBeInTheDocument();
  });
  describe('Relative Time Formatting', () => {
    it('formats relative times correctly', () => {
      // Create instances for different time offsets
      const now = new Date();
      const minsAgo30s = new Date(now.getTime() - 1000 * 30);
      const minsAgo5m = new Date(now.getTime() - 1000 * 60 * 5);
      const hoursAgo2h = new Date(now.getTime() - 1000 * 60 * 60 * 2);
      const daysAgo3d = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3);

      const mockState = {
        entries: [
          { id: '1', date: minsAgo30s.toISOString(), category: 'transport', label: 'Entry 1', amount: 10 },
          { id: '2', date: minsAgo5m.toISOString(), category: 'transport', label: 'Entry 2', amount: 10 },
          { id: '3', date: hoursAgo2h.toISOString(), category: 'transport', label: 'Entry 3', amount: 10 },
          { id: '4', date: daysAgo3d.toISOString(), category: 'transport', label: 'Entry 4', amount: 10 },
        ],
        goals: [],
        unlockedAchievements: [],
        streak: 0,
        carbonScore: 80,
      };
      window.localStorage.setItem('carbonwise_state', JSON.stringify(mockState));

      render(
        <CarbonProvider>
          <BrowserRouter>
            <Tracker />
          </BrowserRouter>
        </CarbonProvider>
      );

      expect(screen.getByText(/Just now/i)).toBeInTheDocument();
      expect(screen.getByText(/5m ago/i)).toBeInTheDocument();
      expect(screen.getByText(/2h ago/i)).toBeInTheDocument();
      expect(screen.getByText(/3d ago/i)).toBeInTheDocument();
    });
  });
});
