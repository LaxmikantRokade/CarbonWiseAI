import { useTranslation } from 'react-i18next';
import { Settings as SettingsIcon, Moon, Sun, Monitor, Globe, Check, Eye } from 'lucide-react';
import { useCarbon } from '../context/CarbonContext';
import { motion } from 'framer-motion';
import { useEffect } from 'react';

export default function Settings() {
  const { t, i18n } = useTranslation();
  const { state, setTheme, setHighContrast, setLanguage } = useCarbon();

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    setLanguage(lang);
  };

  useEffect(() => {
    if (state.language && i18n.language !== state.language) {
      i18n.changeLanguage(state.language);
    }
  }, [state.language, i18n]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto space-y-8 p-4 md:p-8"
    >
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-gray-500 to-slate-700 rounded-xl shadow-lg shadow-gray-500/20">
          <SettingsIcon className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('settings.title')}
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Theme Settings */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-2 mb-4 text-gray-800 dark:text-white">
            <Moon className="w-5 h-5 text-indigo-500" />
            <h2 className="text-xl font-semibold">{t('settings.appearance')}</h2>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.theme')}</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'light', icon: Sun, label: t('settings.light') },
                { id: 'dark', icon: Moon, label: t('settings.dark') },
                { id: 'system', icon: Monitor, label: t('settings.system') },
              ].map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setTheme(id)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    state.theme === id 
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' 
                    : 'border-transparent bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Accessibility Settings */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-2 mb-4 text-gray-800 dark:text-white">
            <Eye className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl font-semibold">{t('settings.accessibility')}</h2>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{t('settings.highContrast')}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Improves readability with higher color contrast.</p>
            </div>
            <button
              onClick={() => setHighContrast(!state.highContrast)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${state.highContrast ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${state.highContrast ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </motion.section>

        {/* Language Settings */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6 md:col-span-2"
        >
          <div className="flex items-center gap-2 mb-4 text-gray-800 dark:text-white">
            <Globe className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-semibold">{t('settings.language')}</h2>
          </div>
          
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { id: 'en', label: 'English', native: 'English' },
              { id: 'hi', label: 'Hindi', native: 'हिन्दी' },
              { id: 'mr', label: 'Marathi', native: 'मराठी' },
            ].map(({ id, label, native }) => (
              <button
                key={id}
                onClick={() => handleLanguageChange(id)}
                className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                  state.language === id 
                  ? 'border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-400' 
                  : 'border-transparent bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'
                }`}
              >
                <div className="text-left">
                  <p className="font-semibold">{native}</p>
                  <p className="text-xs opacity-70">{label}</p>
                </div>
                {state.language === id && <Check className="w-5 h-5" />}
              </button>
            ))}
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
}
