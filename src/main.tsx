
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// Import assets to ensure they're included in the build
import './assets/stargazer-favicon.svg'
import './assets/stargazer-placeholder.svg'

createRoot(document.getElementById("root")!).render(<App />);
