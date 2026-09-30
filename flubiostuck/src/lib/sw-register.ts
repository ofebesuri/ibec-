/**
 * SW registration helper - call from client side
 */
export function registerServiceWorker() {
  if (typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('[FluBioStack] Service Worker registered:', reg.scope);
      })
      .catch((err) => {
        console.warn('[FluBioStack] Service Worker registration failed:', err);
      });
  });
}
