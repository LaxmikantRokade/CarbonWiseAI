import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { CarbonProvider } from './context/CarbonContext';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

console.log('[App Init] main.jsx loaded');
if (window.logDebug) window.logDebug('main.jsx loaded');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <CarbonProvider>
          <App />
        </CarbonProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);
