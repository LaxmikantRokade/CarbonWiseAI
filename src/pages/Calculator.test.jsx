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

  it('allows logging an activity', () => {
    render(
      <CarbonProvider>
        <BrowserRouter>
          <Calculator />
        </BrowserRouter>
      </CarbonProvider>
    );

    const distanceInput = screen.getAllByRole('spinbutton')[0];
    fireEvent.change(distanceInput, { target: { value: '10' } });

    const logBtn = screen.getByRole('button', { name: /Log /i });
    fireEvent.click(logBtn);
  });

  it('allows logging an electricity activity', () => {
    render(
      <CarbonProvider>
        <BrowserRouter>
          <Calculator />
        </BrowserRouter>
      </CarbonProvider>
    );

    fireEvent.click(screen.getByText('Electricity'));
    
    const kwhInput = screen.getAllByRole('spinbutton')[0];
    fireEvent.change(kwhInput, { target: { value: '200' } });

    const logBtn = screen.getByRole('button', { name: /Log /i });
    fireEvent.click(logBtn);
  });

  it('allows logging a waste activity', () => {
    render(
      <CarbonProvider>
        <BrowserRouter>
          <Calculator />
        </BrowserRouter>
      </CarbonProvider>
    );

    fireEvent.click(screen.getByText('Waste'));
    
    const wasteInput = screen.getAllByRole('spinbutton')[0];
    fireEvent.change(wasteInput, { target: { value: '15' } });

    const logBtn = screen.getByRole('button', { name: /Log /i });
    fireEvent.click(logBtn);
  });
});
