import { Routes, Route, useLocation } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/Layout';

// Lazy load pages for route splitting and bundle size optimization
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Calculator = lazy(() => import('./pages/Calculator'));
const Tracker = lazy(() => import('./pages/Tracker'));
const EcoCoach = lazy(() => import('./pages/EcoCoach'));
const Simulator = lazy(() => import('./pages/Simulator'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const Goals = lazy(() => import('./pages/Goals'));
const Achievements = lazy(() => import('./pages/Achievements'));
const Report = lazy(() => import('./pages/Report'));
const Settings = lazy(() => import('./pages/Settings'));

// Global loading fallback
function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

function App() {

  if (window.logDebug) window.logDebug('App.jsx rendered');
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Layout />}>
          <Route index element={
            <Suspense fallback={<PageLoader />}><Dashboard /></Suspense>
          } />
          <Route path="calculator" element={
            <Suspense fallback={<PageLoader />}><Calculator /></Suspense>
          } />
          <Route path="tracker" element={
            <Suspense fallback={<PageLoader />}><Tracker /></Suspense>
          } />
          <Route path="coach" element={
            <Suspense fallback={<PageLoader />}><EcoCoach /></Suspense>
          } />
          <Route path="simulator" element={
            <Suspense fallback={<PageLoader />}><Simulator /></Suspense>
          } />
          <Route path="leaderboard" element={
            <Suspense fallback={<PageLoader />}><Leaderboard /></Suspense>
          } />
          <Route path="goals" element={
            <Suspense fallback={<PageLoader />}><Goals /></Suspense>
          } />
          <Route path="achievements" element={
            <Suspense fallback={<PageLoader />}><Achievements /></Suspense>
          } />
          <Route path="report" element={
            <Suspense fallback={<PageLoader />}><Report /></Suspense>
          } />
          <Route path="settings" element={
            <Suspense fallback={<PageLoader />}><Settings /></Suspense>
          } />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

export default App;
