
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// Import assets to ensure they're included in the build
import './assets/stargazer-favicon.svg'
import './assets/stargazer-placeholder.svg'

// Ensure title is set correctly - this is a failsafe
document.title = 'Stargazer';

// Force browser to update favicon
const updateFavicon = () => {
  try {
    // Update all icon links to ensure browser refreshes them
    const links = document.querySelectorAll("link[rel*='icon']");
    links.forEach(link => {
      const linkElement = link as HTMLLinkElement;
      const href = linkElement.href;
      linkElement.href = '';
      setTimeout(() => { linkElement.href = href + '?v=' + new Date().getTime(); }, 50);
    });
    
    // Create fallback icon link if none exist
    if (links.length === 0) {
      const link = document.createElement('link');
      link.type = 'image/svg+xml';
      link.rel = 'icon';
      link.href = '/src/assets/stargazer-favicon.svg?v=' + new Date().getTime();
      document.head.appendChild(link);
    }
  } catch (e) {
    console.error('Error updating favicon:', e);
  }
};

// Run once DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Set title again to be absolutely sure
  document.title = 'Stargazer';
  // Update favicon
  updateFavicon();
});

// Dynamically set title when route changes
window.addEventListener('popstate', () => {
  document.title = 'Stargazer';
});

createRoot(document.getElementById("root")!).render(<App />);
