
import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Github } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="w-full py-6 px-4 sm:px-6 md:px-8 flex items-center justify-between animate-fade-in">
      <Link 
        to="/" 
        className="flex items-center gap-2 group"
      >
        <div className="relative w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-violet-700 shadow-lg group-hover:from-violet-300 group-hover:to-violet-600 transition-all duration-300">
          <div className="absolute inset-0 rounded-full bg-black/30 blur-sm opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <svg className="w-6 h-6 text-white relative z-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 11C21.7348 11 21.4804 11.1054 21.2929 11.2929C21.1054 11.4804 21 11.7348 21 12C21 13.78 20.4722 15.5201 19.4832 17.0001C18.4943 18.48 17.0887 19.6337 15.4442 20.3149C13.7996 20.9961 11.99 21.1743 10.2442 20.8271C8.49836 20.4798 6.89472 19.6226 5.63604 18.364C4.37737 17.1053 3.5202 15.5016 3.17294 13.7558C2.82567 12.01 3.0039 10.2004 3.68509 8.55585C4.36628 6.91131 5.52 5.50571 6.99993 4.51677C8.47987 3.52784 10.22 3 12 3C12.2652 3 12.5196 2.89464 12.7071 2.70711C12.8946 2.51957 13 2.26522 13 2C13 1.73478 12.8946 1.48043 12.7071 1.29289C12.5196 1.10536 12.2652 1 12 1C9.8233 1 7.69992 1.64514 5.9998 2.85383C4.29967 4.06253 3.10598 5.78049 2.55659 7.73058C2.0072 9.68066 2.13494 11.7583 2.92085 13.6395C3.70676 15.5206 5.11466 17.1014 6.92893 18.1679C8.7432 19.2349 10.8526 19.7381 12.9771 19.6005C15.1017 19.463 17.1233 18.6922 18.7664 17.3915C20.4095 16.0908 21.5909 14.327 22.1368 12.3329C22.6828 10.3388 22.5647 8.22239 21.8 6.3C21.7255 6.11375 21.5934 5.95428 21.4212 5.84133C21.249 5.72837 21.0445 5.66696 20.8354 5.66596C20.6262 5.66495 20.4211 5.72439 20.2477 5.8357C20.0743 5.94702 19.9405 6.1052 19.864 6.29067C19.7875 6.47614 19.7715 6.67951 19.8181 6.87519C19.8647 7.07086 19.9718 7.24889 20.125 7.38C20.2782 7.51111 20.471 7.59009 20.674 7.605C20.877 7.61991 21.0794 7.56974 21.25 7.46C21.6776 8.73793 21.847 10.0911 21.75 11.44C21.7495 11.4876 21.7538 11.5351 21.7628 11.5812C21.7682 11.7301 21.8341 11.8695 21.9458 11.9709C22.0574 12.0724 22.2043 12.1275 22.354 12.1244C22.5036 12.1212 22.6476 12.0602 22.7541 11.9539C22.8605 11.8476 22.9216 11.7036 22.925 11.554C22.9248 11.5313 22.924 11.5087 22.9225 11.486C22.9748 11.3255 23 11.1641 23 11C23 10.7348 22.8946 10.4804 22.7071 10.2929C22.5196 10.1054 22.2652 10 22 10V11Z" fill="currentColor"/>
            <path d="M15 1C14.7348 1 14.4804 1.10536 14.2929 1.29289C14.1054 1.48043 14 1.73478 14 2C14 2.26522 14.1054 2.51957 14.2929 2.70711C14.4804 2.89464 14.7348 3 15 3C16.5913 3 18.1174 3.63214 19.2426 4.75736C20.3679 5.88258 21 7.4087 21 9C21 9.26522 21.1054 9.51957 21.2929 9.70711C21.4804 9.89464 21.7348 10 22 10C22.2652 10 22.5196 9.89464 22.7071 9.70711C22.8946 9.51957 23 9.26522 23 9C23 6.87827 22.1571 4.84344 20.6569 3.34315C19.1566 1.84285 17.1217 1 15 1Z" fill="currentColor"/>
            <path d="M7.55 8C7.40333 8 7.26 8.048 7.14 8.138C7.02 8.228 6.93 8.356 6.888 8.5C6.67 9.188 6.424 10.012 6.25 10.5C6.138 10.812 6.142 11.106 6.263 11.372C6.383 11.6383 6.60833 11.8527 6.875 11.975C7.03833 12.0583 7.21667 12.1 7.4 12.1H8V16.6C8 17.4667 8.3 18.125 8.9 18.575C9.5 19.025 10.2333 19.25 11.1 19.25C11.4667 19.25 11.8083 19.2083 12.125 19.125C12.4417 19.0417 12.7333 18.925 13 18.775V17.025C12.8333 17.1083 12.6417 17.1667 12.425 17.2C12.2083 17.2333 12 17.25 11.8 17.25C11.4333 17.25 11.15 17.1583 10.95 16.975C10.75 16.7917 10.65 16.525 10.65 16.175V12.1H13V10.1H10.65V7.625L7.55 8Z" fill="currentColor"/>
          </svg>
        </div>
        <div className="hidden sm:block">
          <div className="text-white font-bold text-2xl tracking-tight">Stargazer</div>
          <div className="text-white/60 text-xs -mt-1">Blockchain Intelligence</div>
        </div>
      </Link>
      
      <div className="flex items-center gap-4">
        <a 
          href="https://github.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-2.5 rounded-full bg-stargazer-muted/70 hover:bg-stargazer-muted text-white/70 hover:text-white transition-all-cubic" 
          aria-label="GitHub Repository"
        >
          <Github className="w-5 h-5" />
        </a>
        <a 
          href="https://arkham.ai" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 py-2 px-3 rounded-full bg-stargazer-muted/70 hover:bg-stargazer-muted text-white/70 hover:text-white transition-all-cubic text-sm" 
        >
          <span>Inspired by Arkham</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </header>
  );
};

export default Header;
