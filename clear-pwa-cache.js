// Script to clear PWA cache and fix port issues
// Run this in the browser console when the PWA is open

console.log('Clearing PWA cache...');

// Clear all caches
if ('caches' in window) {
  caches.keys().then((cacheNames) => {
    return Promise.all(
      cacheNames.map((cacheName) => {
        console.log('Deleting cache:', cacheName);
        return caches.delete(cacheName);
      })
    );
  }).then(() => {
    console.log('All caches cleared!');
  });
}

// Unregister service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      console.log('Unregistering service worker:', registration.scope);
      registration.unregister();
    });
  });
}

// Clear localStorage and sessionStorage
localStorage.clear();
sessionStorage.clear();
console.log('Storage cleared!');

// Reload the page
setTimeout(() => {
  console.log('Reloading page...');
  window.location.reload();
}, 1000);
