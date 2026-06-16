import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Goals from './Goals';
import { CarbonProvider } from '../context/CarbonContext';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key, fallback) => fallback }),
}));

describe('Goals Page', () => {
  it('renders correctly when no goals exist', () => {
    render(
      <CarbonProvider>
        <Goals />
      </CarbonProvider>
    );
    expect(screen.getByText(/No active goals yet/i)).toBeInTheDocument();
  });

  it('allows opening the new goal form', () => {
    render(
      <CarbonProvider>
        <Goals />
      </CarbonProvider>
    );
    
    const createBtn = screen.getByText('Create New Goal');
    fireEvent.click(createBtn);

    expect(screen.getByText('Goal Title')).toBeInTheDocument();
  });
});
