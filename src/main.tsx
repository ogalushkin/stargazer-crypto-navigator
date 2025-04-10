
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Immediately set document title
document.title = 'Stargazer';

// Function to force browser to update favicon
const updateFavicon = () => {
  // First, remove any existing favicon links to ensure clean state
  const existingLinks = document.querySelectorAll("link[rel*='icon']");
  existingLinks.forEach(link => {
    document.head.removeChild(link);
  });
  
  // Add timestamp to prevent caching
  const timestamp = Date.now();
  
  // Create SVG favicon
  const svgLink = document.createElement('link');
  svgLink.rel = 'icon';
  svgLink.type = 'image/svg+xml';
  svgLink.href = `/src/assets/stargazer-favicon.svg?t=${timestamp}`;
  document.head.appendChild(svgLink);
  
  // Create shortcut icon
  const shortcutLink = document.createElement('link');
  shortcutLink.rel = 'shortcut icon';
  shortcutLink.type = 'image/svg+xml';
  shortcutLink.href = `/src/assets/stargazer-favicon.svg?t=${timestamp}`;
  document.head.appendChild(shortcutLink);
  
  // Create Apple touch icon
  const appleLink = document.createElement('link');
  appleLink.rel = 'apple-touch-icon';
  appleLink.href = `/src/assets/stargazer-favicon.svg?t=${timestamp}`;
  document.head.appendChild(appleLink);
  
  // Create fallback ICO
  const icoLink = document.createElement('link');
  icoLink.rel = 'alternate icon';
  icoLink.type = 'image/x-icon';
  icoLink.href = `/favicon.ico?t=${timestamp}`;
  document.head.appendChild(icoLink);
  
  console.log('Favicon updated at:', new Date().toISOString());
};

// Run immediately
updateFavicon();

// Set title and update favicon when DOM is fully loaded
window.addEventListener('DOMContentLoaded', () => {
  document.title = 'Stargazer';
  updateFavicon();
});

// Reset title on route changes
window.addEventListener('popstate', () => {
  document.title = 'Stargazer';
});

// Create a MutationObserver to watch for any title changes
const titleObserver = new MutationObserver(() => {
  if (document.title !== 'Stargazer') {
    document.title = 'Stargazer';
  }
});

// Start observing title changes
if (document.querySelector('title')) {
  titleObserver.observe(document.querySelector('title')!, { 
    subtree: true, 
    characterData: true, 
    childList: true 
  });
} else {
  const titleElement = document.createElement('title');
  titleElement.textContent = 'Stargazer';
  document.head.appendChild(titleElement);
  titleObserver.observe(titleElement, { 
    subtree: true, 
    characterData: true, 
    childList: true 
  });
}

createRoot(document.getElementById("root")!).render(<App />);

