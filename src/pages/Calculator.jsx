import { useState, useMemo } from 'react';
import { Car, Zap, Utensils, Trash2, Bike, Bus, Train, Plane, Footprints, CheckCircle2 } from 'lucide-react';
import { useCarbon } from '../context/CarbonContext';
import { transportFactors, electricityFactors, foodFactors, wasteFactors, dietPresets, categoryColors } from '../data/carbonFactors';

const tabs = [
  { id: 'transport', label: 'Transport', icon: Car, color: 'amber' },
  { id: 'electricity', label: 'Electricity', icon: Zap, color: 'blue' },
  { id: 'food', label: 'Food', icon: Utensils, color: 'emerald' },
  { id: 'waste', label: 'Waste', icon: Trash2, color: 'rose' },
];

const lucideIcons = { Car, Bike, Bus, Train, Plane, Zap, Footprints };

function AnimatedNumber({ value }) {
  return (
    <span className="tabular-nums text-4xl md:text-5xl font-extrabold text-gradient animate-fade-in">
      {value.toFixed(2)}
    </span>
  );
}

function SuccessToast({ show, onClose }) {
  if (!show) return null;
  return (
    <div className="fixed top-6 right-6 z-50 animate-slide-in-right">
      <div className="glass-card flex items-center gap-3 px-5 py-3 shadow-lg border border-emerald-500/30">
        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Entry logged successfully!</span>
        <button onClick={onClose} className="ml-2 text-gray-400 hover:text-gray-600">✕</button>
      </div>
    </div>
  );
}

export default function Calculator() {
  const { addEntry } = useCarbon();
  const [activeTab, setActiveTab] = useState('transport');
  const [showSuccess, setShowSuccess] = useState(false);

  // Transport state
  const [selectedTransport, setSelectedTransport] = useState('car_gasoline');
  const [distance, setDistance] = useState(10);
  const [frequency, setFrequency] = useState('onetime');

  // Electricity state
  const [selectedSource, setSelectedSource] = useState('grid_average');
  const [kwhAmount, setKwhAmount] = useState(100);

  // Food state
  const [selectedFood, setSelectedFood] = useState('chicken');
  const [foodQuantity, setFoodQuantity] = useState(0.5);

  // Waste state
  const [selectedWaste, setSelectedWaste] = useState('landfill');
  const [wasteWeight, setWasteWeight] = useState(2);

  const freqMultiplier = frequency === 'daily' ? 5 : frequency === 'weekly' ? 1 : 1;

  const calculations = useMemo(() => {
    const transport = (transportFactors[selectedTransport]?.factor || 0) * distance * freqMultiplier;
    const electricity = (electricityFactors[selectedSource]?.factor || 0) * kwhAmount;
    const food = (foodFactors[selectedFood]?.factor || 0) * foodQuantity;
    const waste = (wasteFactors[selectedWaste]?.factor || 0) * wasteWeight;
    return { transport, electricity, food, waste };
  }, [selectedTransport, distance, freqMultiplier, selectedSource, kwhAmount, selectedFood, foodQuantity, selectedWaste, wasteWeight]);

  const currentCalc = calculations[activeTab];

  const handleLog = () => {
    let entry;
    if (activeTab === 'transport') {
      entry = { category: 'transport', subType: selectedTransport, amount: calculations.transport, label: transportFactors[selectedTransport]?.label, quantity: distance, unit: 'km' };
    } else if (activeTab === 'electricity') {
      entry = { category: 'electricity', subType: selectedSource, amount: calculations.electricity, label: electricityFactors[selectedSource]?.label, quantity: kwhAmount, unit: 'kWh' };
    } else if (activeTab === 'food') {
      entry = { category: 'food', subType: selectedFood, amount: calculations.food, label: foodFactors[selectedFood]?.label, quantity: foodQuantity, unit: foodFactors[selectedFood]?.unit };
    } else {
      entry = { category: 'waste', subType: selectedWaste, amount: calculations.waste, label: wasteFactors[selectedWaste]?.label, quantity: wasteWeight, unit: 'kg' };
    }
    addEntry(entry);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="page-enter p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <SuccessToast show={showSuccess} onClose={() => setShowSuccess(false)} />

      {/* Header */}
      <div className="animate-slide-up">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Carbon <span className="text-gradient">Calculator</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Calculate and log your carbon emissions</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2 animate-slide-up stagger-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                isActive
                  ? `bg-${tab.color}-500/15 text-${tab.color}-600 dark:text-${tab.color}-400 ring-1 ring-${tab.color}-500/30`
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Live Calculation Display */}
      <div className="glass-card p-6 text-center animate-scale-in stagger-2">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Estimated CO₂ Emissions</p>
        <AnimatedNumber value={currentCalc} />
        <p className="text-lg text-gray-500 dark:text-gray-400 mt-1">kg CO₂e</p>
        {currentCalc < 0 && (
          <p className="text-emerald-500 text-sm mt-2 font-medium">🌱 This activity reduces emissions!</p>
        )}
      </div>

      {/* Tab Content */}
      <div className="glass-card p-6 animate-slide-up stagger-3">
        {activeTab === 'transport' && (
          <div className="space-y-6">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <Car className="w-5 h-5 text-amber-500" /> Select Transport Type
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {Object.entries(transportFactors).map(([key, val]) => {
                const isSelected = selectedTransport === key;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedTransport(key)}
                    className={`p-3 rounded-xl text-left transition-all duration-200 border ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white/50 dark:bg-white/5'
                    }`}
                  >
                    <div className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{val.label}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{val.factor} kg/{val.unit}</div>
                  </button>
                );
              })}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Distance (km)</label>
              <input
                type="number"
                value={distance}
                onChange={(e) => setDistance(Math.max(0, Number(e.target.value)))}
                className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all text-gray-800 dark:text-gray-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Frequency</label>
              <div className="flex gap-2">
                {[
                  { id: 'onetime', label: 'One Time' },
                  { id: 'daily', label: 'Daily (×5)' },
                  { id: 'weekly', label: 'Weekly' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFrequency(f.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      frequency === f.id
                        ? 'bg-emerald-500 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'electricity' && (
          <div className="space-y-6">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-500" /> Energy Source
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {Object.entries(electricityFactors).map(([key, val]) => {
                const isSelected = selectedSource === key;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedSource(key)}
                    className={`p-3 rounded-xl text-left transition-all duration-200 border ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white/50 dark:bg-white/5'
                    }`}
                  >
                    <div className="text-xs font-medium text-gray-800 dark:text-gray-200">{val.label}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{val.factor} kg/{val.unit}</div>
                  </button>
                );
              })}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Monthly Usage (kWh)</label>
              <input
                type="number"
                value={kwhAmount}
                onChange={(e) => setKwhAmount(Math.max(0, Number(e.target.value)))}
                className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-gray-800 dark:text-gray-200"
              />
            </div>

            {/* National average comparison */}
            <div className="bg-blue-500/5 rounded-xl p-4 border border-blue-500/10">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">Your usage</span>
                <span className="text-gray-600 dark:text-gray-400">Avg: 900 kWh/mo</span>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                  style={{ width: `${Math.min(100, (kwhAmount / 900) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {kwhAmount < 900 ? '🌟 Below national average!' : '⚡ Above national average'}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'food' && (
          <div className="space-y-6">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-emerald-500" /> Diet Presets
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {Object.entries(dietPresets).map(([key, val]) => (
                <div key={key} className="flex-shrink-0 glass-card p-3 min-w-[140px] text-center">
                  <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{val.label}</div>
                  <div className="text-lg font-bold text-gradient mt-1">{val.dailyCO2}</div>
                  <div className="text-[10px] text-gray-400">kg CO₂/day</div>
                  <div className="text-[10px] text-gray-500 mt-1">{val.description}</div>
                </div>
              ))}
            </div>

            <h3 className="font-semibold text-gray-800 dark:text-gray-200">Select Food Item</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {Object.entries(foodFactors).map(([key, val]) => {
                const isSelected = selectedFood === key;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedFood(key)}
                    className={`p-3 rounded-xl text-left transition-all duration-200 border ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white/50 dark:bg-white/5'
                    }`}
                  >
                    <div className="text-xs font-medium text-gray-800 dark:text-gray-200">{val.label}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{val.factor} kg CO₂/{val.unit}</div>
                  </button>
                );
              })}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quantity ({foodFactors[selectedFood]?.unit || 'kg'})
              </label>
              <input
                type="number"
                step="0.1"
                value={foodQuantity}
                onChange={(e) => setFoodQuantity(Math.max(0, Number(e.target.value)))}
                className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all text-gray-800 dark:text-gray-200"
              />
            </div>
          </div>
        )}

        {activeTab === 'waste' && (
          <div className="space-y-6">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-500" /> Waste Type
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(wasteFactors).map(([key, val]) => {
                const isSelected = selectedWaste === key;
                const isGreen = val.factor < 0;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedWaste(key)}
                    className={`p-3 rounded-xl text-left transition-all duration-200 border ${
                      isSelected
                        ? isGreen
                          ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                          : 'border-rose-500 bg-rose-500/10 shadow-[0_0_15px_rgba(239,68,68,0.15)]'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white/50 dark:bg-white/5'
                    }`}
                  >
                    <div className="text-xs font-medium text-gray-800 dark:text-gray-200">{val.label}</div>
                    <div className={`text-[10px] mt-0.5 ${isGreen ? 'text-emerald-500' : 'text-gray-400'}`}>
                      {isGreen ? '♻️ ' : ''}{val.factor} kg CO₂/{val.unit}
                    </div>
                  </button>
                );
              })}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Weight (kg)</label>
              <input
                type="number"
                step="0.5"
                value={wasteWeight}
                onChange={(e) => setWasteWeight(Math.max(0, Number(e.target.value)))}
                className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 outline-none transition-all text-gray-800 dark:text-gray-200"
              />
            </div>

            {wasteFactors[selectedWaste]?.factor < 0 && (
              <div className="bg-emerald-500/5 rounded-xl p-4 border border-emerald-500/10">
                <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                  🌱 Great choice! Recycling and composting reduce overall emissions.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Log Button */}
      <button
        onClick={handleLog}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold text-lg shadow-lg hover:shadow-xl hover:shadow-emerald-500/20 transform hover:-translate-y-0.5 transition-all duration-300 animate-slide-up stagger-4"
      >
        Log Entry — {Math.abs(currentCalc).toFixed(2)} kg CO₂e
      </button>
    </div>
  );
}
