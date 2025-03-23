
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// Import assets to ensure they're included in the build
import './assets/stargazer-favicon.svg'
import './assets/stargazer-placeholder.svg'

// Force browser to update favicon if needed
const updateFavicon = () => {
  const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
  if (link) {
    const href = link.href;
    link.href = '';
    setTimeout(() => { link.href = href + '?v=' + new Date().getTime(); }, 50);
  }
};

// Run once DOM is loaded
document.addEventListener('DOMContentLoaded', updateFavicon);

createRoot(document.getElementById("root")!).render(<App />);
