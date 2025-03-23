
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import NetworkSelector, { NetworkType } from './NetworkSelector';
import ApiKeyManager from './ApiKeyManager';

const Header: React.FC = () => {
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkType>('ethereum');

  const handleNetworkChange = (network: NetworkType) => {
    setSelectedNetwork(network);
  };

  return (
    <header className="py-6 border-b border-stargazer-muted/20">
      <div className="flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-violet-800 flex items-center justify-center">
            <span className="text-white font-bold">S</span>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-purple-500 text-transparent bg-clip-text">
            Stargazer
          </h1>
        </Link>
        
        <div className="flex items-center space-x-2">
          <NetworkSelector 
            selectedNetwork={selectedNetwork} 
            onNetworkChange={handleNetworkChange}
          />
          <ApiKeyManager />
        </div>
      </div>
    </header>
  );
};

export default Header;
