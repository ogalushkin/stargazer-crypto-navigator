
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Set the document title immediately
document.title = 'Stargazer';

// Force browser to update favicon
const updateFavicon = () => {
  try {
    // First, remove any existing favicon links
    const existingLinks = document.querySelectorAll("link[rel*='icon']");
    existingLinks.forEach(link => {
      document.head.removeChild(link);
    });
    
    // Create fresh favicon links with timestamp to force refresh
    const timestamp = new Date().getTime();
    
    // SVG favicon (primary)
    const svgLink = document.createElement('link');
    svgLink.type = 'image/svg+xml';
    svgLink.rel = 'icon';
    svgLink.href = `/src/assets/stargazer-favicon.svg?v=${timestamp}`;
    document.head.appendChild(svgLink);
    
    // Fallback ICO favicon
    const icoLink = document.createElement('link');
    icoLink.type = 'image/x-icon';
    icoLink.rel = 'alternate icon';
    icoLink.href = `/favicon.ico?v=${timestamp}`;
    document.head.appendChild(icoLink);
    
    // Apple touch icon
    const appleLink = document.createElement('link');
    appleLink.rel = 'apple-touch-icon';
    appleLink.href = `/src/assets/stargazer-favicon.svg?v=${timestamp}`;
    document.head.appendChild(appleLink);
    
    console.log('Favicon updated at:', new Date().toISOString());
  } catch (e) {
    console.error('Error updating favicon:', e);
  }
};

// Run immediately
updateFavicon();

// Also run when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Set title again to be absolutely sure
  document.title = 'Stargazer';
  // Update favicon again
  updateFavicon();
});

// Set title when route changes too
window.addEventListener('popstate', () => {
  document.title = 'Stargazer';
});

// Create a MutationObserver to watch for any title changes and override them
const titleObserver = new MutationObserver(() => {
  if (document.title !== 'Stargazer') {
    document.title = 'Stargazer';
  }
});

// Start observing title changes
titleObserver.observe(document.querySelector('title') || document.head, { 
  subtree: true, 
  characterData: true, 
  childList: true 
});

createRoot(document.getElementById("root")!).render(<App />);
