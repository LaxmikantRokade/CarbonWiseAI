import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Calculator from './pages/Calculator';
import Tracker from './pages/Tracker';
import EcoCoach from './pages/EcoCoach';
import Simulator from './pages/Simulator';
import Leaderboard from './pages/Leaderboard';
import Goals from './pages/Goals';
import Achievements from './pages/Achievements';
import Report from './pages/Report';
import Settings from './pages/Settings';
import { AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

function App() {
  console.log('[App Init] App.jsx rendered');
  if (window.logDebug) window.logDebug('App.jsx rendered');
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
        <Route path="calculator" element={<Calculator />} />
        <Route path="tracker" element={<Tracker />} />
        <Route path="coach" element={<EcoCoach />} />
        <Route path="simulator" element={<Simulator />} />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route path="goals" element={<Goals />} />
        <Route path="achievements" element={<Achievements />} />
        <Route path="report" element={<Report />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
    </AnimatePresence>
  );
}

export default App;
