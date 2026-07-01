import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { LanguageProvider } from './contexts/LanguageContext';
import './i18n/i18n';
import './index.css';

function Root() {
  return (
    <React.StrictMode>
      <BrowserRouter>
        <LanguageProvider>
          <App />
          <Toaster position="top-center" toastOptions={{ duration: 4000, style: { borderRadius: '12px', padding: '12px 16px' } }} />
        </LanguageProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<Root />);
