/* Carbon emission factors in kg CO₂e per unit */

export const transportFactors = {
  car_gasoline: { factor: 0.21, unit: 'km', label: 'Car (Gasoline)', icon: 'Car' },
  car_diesel: { factor: 0.27, unit: 'km', label: 'Car (Diesel)', icon: 'Car' },
  car_hybrid: { factor: 0.11, unit: 'km', label: 'Car (Hybrid)', icon: 'Car' },
  car_electric: { factor: 0.05, unit: 'km', label: 'Car (Electric)', icon: 'Zap' },
  bus: { factor: 0.089, unit: 'km', label: 'Bus', icon: 'Bus' },
  train: { factor: 0.041, unit: 'km', label: 'Train', icon: 'Train' },
  bike: { factor: 0, unit: 'km', label: 'Bicycle', icon: 'Bike' },
  walk: { factor: 0, unit: 'km', label: 'Walking', icon: 'Footprints' },
  flight_short: { factor: 0.255, unit: 'km', label: 'Flight (Short Haul)', icon: 'Plane' },
  flight_long: { factor: 0.195, unit: 'km', label: 'Flight (Long Haul)', icon: 'Plane' },
  motorcycle: { factor: 0.103, unit: 'km', label: 'Motorcycle', icon: 'Bike' },
};

export const electricityFactors = {
  grid_average: { factor: 0.42, unit: 'kWh', label: 'Grid Average' },
  coal: { factor: 0.91, unit: 'kWh', label: 'Coal' },
  natural_gas: { factor: 0.45, unit: 'kWh', label: 'Natural Gas' },
  solar: { factor: 0.04, unit: 'kWh', label: 'Solar' },
  wind: { factor: 0.01, unit: 'kWh', label: 'Wind' },
  nuclear: { factor: 0.02, unit: 'kWh', label: 'Nuclear' },
  hydro: { factor: 0.02, unit: 'kWh', label: 'Hydroelectric' },
};

export const foodFactors = {
  beef: { factor: 27.0, unit: 'kg', label: 'Beef', category: 'meat' },
  lamb: { factor: 39.2, unit: 'kg', label: 'Lamb', category: 'meat' },
  pork: { factor: 12.1, unit: 'kg', label: 'Pork', category: 'meat' },
  chicken: { factor: 6.9, unit: 'kg', label: 'Chicken', category: 'meat' },
  fish: { factor: 6.1, unit: 'kg', label: 'Fish', category: 'meat' },
  cheese: { factor: 13.5, unit: 'kg', label: 'Cheese', category: 'dairy' },
  milk: { factor: 3.2, unit: 'liter', label: 'Milk', category: 'dairy' },
  eggs: { factor: 4.8, unit: 'kg', label: 'Eggs', category: 'dairy' },
  rice: { factor: 2.7, unit: 'kg', label: 'Rice', category: 'grains' },
  pasta: { factor: 1.2, unit: 'kg', label: 'Pasta', category: 'grains' },
  bread: { factor: 0.8, unit: 'kg', label: 'Bread', category: 'grains' },
  vegetables: { factor: 0.4, unit: 'kg', label: 'Vegetables', category: 'plant' },
  fruits: { factor: 0.5, unit: 'kg', label: 'Fruits', category: 'plant' },
  legumes: { factor: 0.9, unit: 'kg', label: 'Legumes', category: 'plant' },
  nuts: { factor: 0.3, unit: 'kg', label: 'Nuts', category: 'plant' },
  tofu: { factor: 2.0, unit: 'kg', label: 'Tofu', category: 'plant' },
  coffee: { factor: 16.5, unit: 'kg', label: 'Coffee', category: 'beverages' },
  processed_food: { factor: 3.5, unit: 'kg', label: 'Processed Food', category: 'processed' },
};

export const wasteFactors = {
  landfill: { factor: 0.58, unit: 'kg', label: 'Landfill Waste' },
  recycling_paper: { factor: -0.18, unit: 'kg', label: 'Paper Recycling' },
  recycling_plastic: { factor: -0.14, unit: 'kg', label: 'Plastic Recycling' },
  recycling_glass: { factor: -0.31, unit: 'kg', label: 'Glass Recycling' },
  recycling_metal: { factor: -1.02, unit: 'kg', label: 'Metal Recycling' },
  composting: { factor: -0.23, unit: 'kg', label: 'Composting' },
  e_waste: { factor: 1.5, unit: 'kg', label: 'Electronic Waste' },
};

export const dietPresets = {
  omnivore: { label: 'Omnivore', dailyCO2: 7.2, description: 'Regular mixed diet' },
  flexitarian: { label: 'Flexitarian', dailyCO2: 5.5, description: 'Mostly plant-based, occasional meat' },
  pescatarian: { label: 'Pescatarian', dailyCO2: 4.8, description: 'Fish and plant-based' },
  vegetarian: { label: 'Vegetarian', dailyCO2: 3.8, description: 'No meat, includes dairy/eggs' },
  vegan: { label: 'Vegan', dailyCO2: 2.9, description: 'Fully plant-based' },
};

/* National/global averages for comparison */
export const averages = {
  daily_per_person_kg: 22, // ~8 tonnes per year / 365
  yearly_per_person_kg: 8000,
  yearly_us_per_person_kg: 16000,
  yearly_eu_per_person_kg: 6800,
  yearly_india_per_person_kg: 1900,
  trees_per_tonne_co2: 6, // approximate trees needed to offset 1 tonne CO2/year
};

export const categoryColors = {
  transport: '#f59e0b',
  electricity: '#3b82f6',
  food: '#10b981',
  waste: '#ef4444',
};

export const categoryLabels = {
  transport: 'Transportation',
  electricity: 'Electricity',
  food: 'Food & Diet',
  waste: 'Waste',
};
