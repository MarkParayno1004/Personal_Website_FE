import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// Permanent dark mode
document.documentElement.classList.add('dark');

// Lazy route chunks from a previous deploy may be gone; reload to fetch the new ones
window.addEventListener('vite:preloadError', () => window.location.reload());

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
