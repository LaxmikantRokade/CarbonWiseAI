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

  it('allows filling and submitting a new goal', () => {
    render(
      <CarbonProvider>
        <Goals />
      </CarbonProvider>
    );
    
    fireEvent.click(screen.getByText('Create New Goal'));
    
    // Fill form
    const titleInput = screen.getByPlaceholderText(/e.g., Reduce transport emissions/i);
    const targetInput = screen.getByPlaceholderText(/e.g., 5/i);
    
    fireEvent.change(titleInput, { target: { value: 'Test Goal' } });
    fireEvent.change(targetInput, { target: { value: '10' } });
    
    // Submit
    fireEvent.click(screen.getByRole('button', { name: /Add Goal/i }));
    
    // Test goal appears
    expect(screen.getByText('Test Goal')).toBeInTheDocument();
  });

  it('allows incrementing and completing a goal', () => {
    // Inject goal
    const initialState = {
      entries: [],
      goals: [{ id: '1', title: 'Test Goal', targetValue: 10, currentValue: 0, category: 'transport', unit: 'items', completed: false }]
    };

    localStorage.setItem('carbonwise_state', JSON.stringify(initialState));

    render(
      <CarbonProvider>
        <Goals />
      </CarbonProvider>
    );
    
    // Add progress
    fireEvent.click(screen.getByText('Add'));
    
    // Done
    fireEvent.click(screen.getByText('Done'));
    
    // It should move to completed
    expect(screen.getByText('Completed Goals')).toBeInTheDocument();
  });

  it('allows clicking suggested goals', () => {
    render(
      <CarbonProvider>
        <Goals />
      </CarbonProvider>
    );
    
    fireEvent.click(screen.getByText('Create New Goal'));
    
    const suggested = screen.getByText(/Reduce transport emissions by 5kg/i);
    fireEvent.click(suggested);
    
    const titleInput = screen.getByPlaceholderText(/e.g., Reduce transport emissions/i);
    expect(titleInput).toHaveValue('Reduce transport emissions');
  });
});
