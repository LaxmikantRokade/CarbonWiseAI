import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Calculator from './Calculator';
import { CarbonProvider } from '../context/CarbonContext';
import { BrowserRouter } from 'react-router-dom';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key, fallback) => fallback }),
}));

describe('Calculator Page', () => {
  it('renders transport calculator by default', () => {
    render(
      <CarbonProvider>
        <BrowserRouter>
          <Calculator />
        </BrowserRouter>
      </CarbonProvider>
    );

    // Look for Distance input label
    expect(screen.getByText(/Distance/i)).toBeInTheDocument();
  });

  it('switches to food calculator tab', () => {
    render(
      <CarbonProvider>
        <BrowserRouter>
          <Calculator />
        </BrowserRouter>
      </CarbonProvider>
    );

    // Click on Food tab
    const foodTab = screen.getByText('Food');
    fireEvent.click(foodTab);

    // Verify Food specific text is present
    expect(screen.getByText(/Diet Presets/i)).toBeInTheDocument();
  });

  it('calculates carbon based on input', () => {
    render(
      <CarbonProvider>
        <BrowserRouter>
          <Calculator />
        </BrowserRouter>
      </CarbonProvider>
    );

    // Change Distance input (first number input)
    const distanceInput = screen.getAllByRole('spinbutton')[0];
    fireEvent.change(distanceInput, { target: { value: '100' } });

    // 100 km * 0.21 (car_gasoline factor) = 21.0 kg
    expect(screen.getByText(/21.00 kg CO₂e/)).toBeInTheDocument();
  });
});
