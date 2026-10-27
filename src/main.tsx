import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// Permanent dark mode
document.documentElement.classList.add('dark');

// Lazy route chunks from a previous deploy may be gone; reload once (guarded so a truly broken chunk can't loop)
window.addEventListener('vite:preloadError', () => {
  try {
    if (sessionStorage.getItem('chunkReload')) return;
    sessionStorage.setItem('chunkReload', '1');
  } catch {
    return;
  }
  window.location.reload();
});

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
