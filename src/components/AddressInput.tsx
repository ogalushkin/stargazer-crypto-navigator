
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import NetworkSelector, { NetworkType } from './NetworkSelector';
import { validateAddress } from '@/utils/validation';
import { toast } from 'sonner';

const AddressInput: React.FC = () => {
  const [address, setAddress] = useState('');
  const [network, setNetwork] = useState<NetworkType>('ethereum');
  const [isValidating, setIsValidating] = useState(false);
  const navigate = useNavigate();

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
  };

  const clearAddress = () => {
    setAddress('');
  };

  const handleNetworkChange = (newNetwork: NetworkType) => {
    setNetwork(newNetwork);
  };

  const handleSearch = async () => {
    if (!address.trim()) {
      toast.error('Please enter an address');
      return;
    }
    
    setIsValidating(true);
    
    try {
      const isValid = await validateAddress(address, network);
      
      if (isValid) {
        navigate(`/address/${network}/${address}`);
      } else {
        toast.error(`Invalid ${network} address format`);
      }
    } catch (error) {
      toast.error('Error validating address');
      console.error('Validation error:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="w-full flex flex-col md:flex-row gap-3 animate-slide-in">
      <div className="relative flex-grow">
        <Input
          value={address}
          onChange={handleAddressChange}
          onKeyDown={handleKeyDown}
          placeholder={`Enter ${network} address...`}
          className="h-12 pl-4 pr-10 bg-stargazer-muted/70 backdrop-blur-md border-stargazer-muted/80 focus:border-violet-500 text-base transition-all-cubic"
        />
        {address && (
          <button 
            onClick={clearAddress}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-all-cubic"
            aria-label="Clear address"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      <div className="w-full md:w-40">
        <NetworkSelector 
          selectedNetwork={network} 
          onNetworkChange={handleNetworkChange}
        />
      </div>
      <Button 
        onClick={handleSearch}
        disabled={isValidating || !address.trim()}
        className="h-12 px-8 bg-violet-600 hover:bg-violet-700 text-white transition-all-cubic"
      >
        {isValidating ? (
          <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
        ) : (
          <>
            <Search className="mr-2 h-5 w-5" />
            <span>Search</span>
          </>
        )}
      </Button>
    </div>
  );
};

export default AddressInput;
