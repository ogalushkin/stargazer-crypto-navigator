
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
  
  // Generate a more unique cache-busting timestamp
  const timestamp = `v=${Date.now()}`;
  
  // Create PNG favicon with explicit versioning
  const pngLink = document.createElement('link');
  pngLink.rel = 'icon';
  pngLink.type = 'image/png';
  pngLink.href = `assets/stargazer-favicon.png?${timestamp}`;
  document.head.appendChild(pngLink);
  
  // Create shortcut icon with versioning
  const shortcutLink = document.createElement('link');
  shortcutLink.rel = 'shortcut icon';
  shortcutLink.type = 'image/png';
  shortcutLink.href = `assets/stargazer-favicon.png?${timestamp}`;
  document.head.appendChild(shortcutLink);
  
  // Create Apple touch icon with versioning
  const appleLink = document.createElement('link');
  appleLink.rel = 'apple-touch-icon';
  appleLink.href = `assets/stargazer-favicon.png?${timestamp}`;
  document.head.appendChild(appleLink);
  
  console.log('Favicon updated with unique version at:', new Date().toISOString());
};

// Run immediately
updateFavicon();

// Set title and update favicon when DOM is fully loaded
window.addEventListener('DOMContentLoaded', () => {
  document.title = 'Stargazer';
  updateFavicon();
});

// Reset title and favicon on route changes
window.addEventListener('popstate', () => {
  document.title = 'Stargazer';
  updateFavicon();
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
