import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EmissionChart, { GlassTooltip, renderPieLabel, ChartErrorBoundary } from './EmissionChart';

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

  describe('GlassTooltip', () => {
    it('returns null if not active', () => {
      const { container } = render(<GlassTooltip active={false} payload={[{ name: 'Test', value: 10 }]} label="Label" />);
      expect(container).toBeEmptyDOMElement();
    });

    it('returns null if no payload', () => {
      const { container } = render(<GlassTooltip active={true} payload={[]} label="Label" />);
      expect(container).toBeEmptyDOMElement();
    });

    it('renders label and payload if active and payload exists', () => {
      render(<GlassTooltip active={true} payload={[{ name: 'Test', value: 10, color: '#f00' }]} label="My Label" />);
      expect(screen.getByText('My Label')).toBeInTheDocument();
      expect(screen.getByText('Test:')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });
  });

  describe('renderPieLabel', () => {
    it('returns null if percent < 0.05', () => {
      const result = renderPieLabel({ cx: 100, cy: 100, midAngle: 90, innerRadius: 50, outerRadius: 100, percent: 0.04 });
      expect(result).toBeNull();
    });

    it('renders a text element if percent >= 0.05', () => {
      const { container } = render(renderPieLabel({ cx: 100, cy: 100, midAngle: 90, innerRadius: 50, outerRadius: 100, percent: 0.10 }));
      expect(container.querySelector('text')).toBeInTheDocument();
      expect(container).toHaveTextContent('10%');
    });
  });

  describe('ErrorBoundary', () => {
    it('catches errors and renders fallback UI', () => {
      // Mock console.error to prevent it from cluttering the test output
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const ThrowError = () => {
        throw new Error('Test Error');
      };
      
      render(
        <ChartErrorBoundary>
          <ThrowError />
        </ChartErrorBoundary>
      );
      
      expect(screen.getByText('Chart rendering unavailable on this device.')).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });
  });
});
