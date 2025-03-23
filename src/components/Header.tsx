
import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="py-6 border-b border-stargazer-muted/20">
      <div className="flex items-center">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-violet-800 flex items-center justify-center">
            <span className="text-white font-bold">S</span>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-purple-500 text-transparent bg-clip-text">
            Stargazer
          </h1>
        </Link>
      </div>
    </header>
  );
};

export default Header;
