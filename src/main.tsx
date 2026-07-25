import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import '@/data/i18n/config';
import { registerSW } from 'virtual:pwa-register';

// Service worker-ul PWA nu este suportat în webview-ul Tauri — îl înregistrăm doar în browser.
if (!('__TAURI_INTERNALS__' in window)) {
  registerSW({ immediate: true });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
