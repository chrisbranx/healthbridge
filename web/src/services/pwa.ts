import { useEffect } from 'react';

const swUrl = '/service-worker.js';

export function registerSW() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register(swUrl, { scope: '/' });
        console.log('SW registered:', registration.scope);
      } catch (err) {
        console.error('SW registration failed:', err);
      }
    });
  }
}

export function unregisterSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister()));
  }
}

export function usePWA() {
  useEffect(() => {
    registerSW();
    return () => unregisterSW();
  }, []);
}
