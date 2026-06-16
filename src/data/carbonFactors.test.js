import { describe, it, expect } from 'vitest';
import { dietPresets, transportFactors } from './carbonFactors';

describe('Carbon Factors Logic', () => {
  it('has correct transport factors', () => {
    expect(transportFactors.car_gasoline.factor).toBe(0.21); // kg CO2 per km
    expect(transportFactors.bus.factor).toBe(0.089);
  });

  it('has correct diet presets', () => {
    expect(dietPresets.vegan.dailyCO2).toBe(2.9); // kg CO2 per day
    expect(dietPresets.omnivore.dailyCO2).toBe(7.2);
  });
});
