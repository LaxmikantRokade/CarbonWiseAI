import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { CarbonProvider } from './context/CarbonContext';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <CarbonProvider>
        <App />
      </CarbonProvider>
    </BrowserRouter>
  </StrictMode>
);
