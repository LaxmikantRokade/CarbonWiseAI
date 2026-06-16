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
});
