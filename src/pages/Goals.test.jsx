import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Goals from './Goals';
import { CarbonProvider } from '../context/CarbonContext';
import { BrowserRouter } from 'react-router-dom';

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
        <BrowserRouter>
          <Goals />
        </BrowserRouter>
      </CarbonProvider>
    );

    const addGoalBtn = screen.getByText(/Create New Goal/i);
    fireEvent.click(addGoalBtn);

    const suggested = screen.getByText(/Reduce transport emissions by 5kg/i);
    fireEvent.click(suggested);
    
    const titleInput = screen.getByPlaceholderText(/e.g., Reduce transport emissions/i);
    expect(titleInput).toHaveValue('Reduce transport emissions');
  });

  it('allows changing goal unit and category in the form', () => {
    render(
      <CarbonProvider>
        <BrowserRouter>
          <Goals />
        </BrowserRouter>
      </CarbonProvider>
    );

    // Click "Add Goal"
    const addGoalBtn = screen.getByText(/Create New Goal/i);
    fireEvent.click(addGoalBtn);

    // Change target value
    const targetInput = screen.getByPlaceholderText('e.g., 5');
    fireEvent.change(targetInput, { target: { value: '15' } });
    expect(targetInput.value).toBe('15');

    // Change unit
    const unitSelect = screen.getByLabelText('Unit');
    fireEvent.change(unitSelect, { target: { value: 'meals' } });
    expect(unitSelect.value).toBe('meals');

    // Change category
    const categorySelect = screen.getByLabelText('Category');
    fireEvent.change(categorySelect, { target: { value: 'waste' } });
    expect(categorySelect.value).toBe('waste');
  });

  it('allows toggling the completed goals section', () => {
    render(
      <CarbonProvider>
        <BrowserRouter>
          <Goals />
        </BrowserRouter>
      </CarbonProvider>
    );

    // We need a completed goal to see the toggle. Let's add one and complete it.
    const addGoalBtn = screen.getByText(/Create New Goal/i);
    fireEvent.click(addGoalBtn);
    const titleInput = screen.getByPlaceholderText(/e.g., Reduce transport emissions/i);
    fireEvent.change(titleInput, { target: { value: 'Completed Test Goal' } });
    const targetInput = screen.getByPlaceholderText('e.g., 5');
    fireEvent.change(targetInput, { target: { value: '1' } });
    const submitBtn = screen.getByText('Add Goal');
    fireEvent.click(submitBtn);

    // Increment to complete it
    const doneBtn = screen.getByText('Done');
    fireEvent.click(doneBtn);

    // Check for the completed section toggle
    const toggleBtn = screen.getByRole('heading', { name: /Completed Goals/i }).parentElement;
    
    // It should be visible, let's click it to toggle
    fireEvent.click(toggleBtn);
  });
});
