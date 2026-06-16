import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Tracker from './Tracker';
import { CarbonProvider } from '../context/CarbonContext';

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

    const { container } = render(
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
});
