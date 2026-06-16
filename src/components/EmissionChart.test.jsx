import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EmissionChart from './EmissionChart';

// Mock recharts
vi.mock('recharts', async () => {
  const OriginalModule = await vi.importActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
    PieChart: () => <div data-testid="pie-chart" />,
    BarChart: () => <div data-testid="bar-chart" />,
    LineChart: () => <div data-testid="line-chart" />,
    AreaChart: () => <div data-testid="area-chart" />,
  };
});

describe('EmissionChart', () => {
  const mockData = [
    { name: 'Transport', value: 400 },
    { name: 'Food', value: 300 },
  ];

  it('renders a pie chart', () => {
    render(<EmissionChart type="pie" data={mockData} height={300} />);
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('renders a bar chart', () => {
    render(<EmissionChart type="bar" data={mockData} xKey="name" yKey="value" />);
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('renders a line chart', () => {
    render(<EmissionChart type="line" data={mockData} xKey="name" yKey="value" />);
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('renders an area chart', () => {
    render(<EmissionChart type="area" data={mockData} xKey="name" yKey="value" />);
    expect(screen.getByTestId('area-chart')).toBeInTheDocument();
  });

  it('renders without crashing on empty data', () => {
    const { container } = render(<EmissionChart data={[]} />);
    expect(container).toBeInTheDocument();
  });
});
