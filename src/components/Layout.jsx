import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Calculator, LineChart, Bot,
  SlidersHorizontal, Trophy, Target, Award, FileText,
  Leaf, Menu, X, MoreHorizontal, ChevronRight, Settings as SettingsIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import ThemeToggle from './ThemeToggle';
import { useCarbon } from '../context/CarbonContext';
import { useTranslation } from 'react-i18next';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/calculator', icon: Calculator, label: 'Calculator' },
  { to: '/tracker', icon: LineChart, label: 'Tracker' },
  { to: '/coach', icon: Bot, label: 'AI Coach' },
  { to: '/simulator', icon: SlidersHorizontal, label: 'Simulator' },
  { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { to: '/goals', icon: Target, label: 'Goals' },
  { to: '/achievements', icon: Award, label: 'Achievements' },
  { to: '/report', icon: FileText, label: 'Report' },
  { to: '/settings', icon: SettingsIcon, label: 'Settings' },
];

const mobileTabItems = [
  { to: '/', icon: LayoutDashboard, label: 'Home', end: true },
  { to: '/calculator', icon: Calculator, label: 'Calc' },
  { to: '/coach', icon: Bot, label: 'Coach' },
  { to: '/goals', icon: Target, label: 'Goals' },
  { to: '/achievements', icon: Award, label: 'Badges' },
];

export default function Layout() {
  console.log('[App Init] Layout.jsx rendered');
  if (window.logDebug) window.logDebug('Layout.jsx rendered');
  const { state } = useCarbon();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const moreItems = navItems.filter(
    (item) => !mobileTabItems.some((tab) => tab.to === item.to)
  );

  return (
    <div className="flex-1 flex w-full bg-gray-50 dark:bg-carbon-950 overflow-hidden relative">
      <div className="aurora-bg"></div>
      
      {/* ======= Desktop Sidebar ======= */}
      <aside className="hidden md:flex flex-col w-64 shrink-0
        bg-white/70 dark:bg-white/5 backdrop-blur-xl
        border-r border-white/30 dark:border-white/10 z-30">

        {/* Logo */}
        <div className="p-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500
            flex items-center justify-center shadow-lg shadow-primary-500/25">
            <Leaf size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-gradient leading-tight">CarbonWise</h1>
            <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
              AI Coach
            </p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200 group relative
                  ${isActive
                    ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Active left border */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5
                        bg-primary-500 rounded-r-full" />
                    )}
                    <Icon size={18} className={`shrink-0 transition-transform duration-200
                      ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />
                    <span>{t(`nav.${item.to === '/' ? 'dashboard' : item.to.replace('/', '')}`, item.label)}</span>
                    {isActive && (
                      <ChevronRight size={14} className="ml-auto opacity-50" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom user section + theme */}
        <div className="p-4 border-t border-gray-200/50 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-500
              flex items-center justify-center text-white font-bold text-sm shadow-md">
              {state.profile?.name?.[0] || 'E'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {state.profile?.name || 'Eco Warrior'}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                🔥 {state.streak || 0} day streak
              </p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* ======= Mobile Sidebar Overlay ======= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-72
            bg-white/95 dark:bg-carbon-900/95 backdrop-blur-xl
            border-r border-white/20 dark:border-white/10
            animate-slide-in-right shadow-2xl">
            <div className="p-4 flex items-center justify-between border-b border-gray-200/50 dark:border-white/5">
              <div className="flex items-center gap-2">
                <Leaf size={20} className="text-primary-500" />
                <span className="font-extrabold text-gradient">CarbonWise</span>
              </div>
              <button
                aria-label="Close menu"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <nav className="p-3 space-y-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                      transition-all duration-200
                      ${isActive
                        ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                      }`
                    }
                  >
                    <Icon size={18} />
                    <span>{t(`nav.${item.to === '/' ? 'dashboard' : item.to.replace('/', '')}`, item.label)}</span>
                  </NavLink>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* ======= Main Content Area ======= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3
          bg-white/80 dark:bg-carbon-900/80 backdrop-blur-xl
          border-b border-gray-200/50 dark:border-white/5 z-20">
          <button
            aria-label="Open menu"
            onClick={() => setMobileMenuOpen(true)}
            className="p-3 min-h-[44px] min-w-[44px] flex items-center justify-center -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10
              transition-colors cursor-pointer"
          >
            <Menu size={20} className="text-gray-700 dark:text-gray-300" />
          </button>
          <div className="flex items-center gap-2">
            <Leaf size={18} className="text-primary-500" />
            <span className="font-extrabold text-sm text-gradient">CarbonWise AI</span>
          </div>
          <ThemeToggle />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gradient-mesh relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="p-4 md:p-6 lg:p-8 pb-24 md:pb-8"
          >
            <Outlet />
          </motion.div>
        </main>

        {/* ======= Mobile Bottom Tab Bar ======= */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0
          bg-white/80 dark:bg-carbon-900/80 backdrop-blur-xl
          border-t border-gray-200/50 dark:border-white/5
          flex items-center z-20 pb-[env(safe-area-inset-bottom)]">

          {mobileTabItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex-1 flex flex-col items-center justify-center gap-0.5 py-3 min-h-[56px] text-[10px] font-semibold
                  transition-all duration-200
                  ${isActive
                    ? 'text-primary-500'
                    : 'text-gray-400 dark:text-gray-500'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`p-1 rounded-lg transition-all duration-200
                      ${isActive ? 'bg-primary-500/10 scale-110' : ''}`}>
                      <Icon size={20} />
                    </div>
                    <span>{t(`nav.${item.to === '/' ? 'dashboard' : item.to.replace('/', '')}`, item.label)}</span>
                  </>
                )}
              </NavLink>
            );
          })}

          {/* More button */}
          <div className="relative flex-1">
            <button
              aria-label="More options"
              aria-expanded={moreMenuOpen}
              onClick={() => setMoreMenuOpen(!moreMenuOpen)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-3 min-h-[56px] w-full text-[10px] font-semibold
                transition-all duration-200 cursor-pointer
                ${moreMenuOpen ? 'text-primary-500' : 'text-gray-400 dark:text-gray-500'}`}
            >
              <div className={`p-1 rounded-lg transition-all duration-200
                ${moreMenuOpen ? 'bg-primary-500/10 scale-110' : ''}`}>
                <MoreHorizontal size={20} />
              </div>
              <span>More</span>
            </button>

            {/* More dropdown (pops upward) */}
            {moreMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMoreMenuOpen(false)} />
                <div className="absolute bottom-full right-0 mb-2 w-48
                  bg-white/95 dark:bg-carbon-900/95 backdrop-blur-xl
                  border border-gray-200/50 dark:border-white/10
                  rounded-xl shadow-xl z-20 overflow-hidden animate-scale-in origin-bottom-right">
                  {moreItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => setMoreMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-2.5 text-sm font-medium
                          transition-colors duration-150
                          ${isActive
                            ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
                          }`
                        }
                      >
                        <Icon size={16} />
                        <span>{t(`nav.${item.to === '/' ? 'dashboard' : item.to.replace('/', '')}`, item.label)}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
}
