
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import AddressInput from '@/components/AddressInput';
import AddressDetails from '@/components/AddressDetails';
import AssetList from '@/components/AssetList';
import { Button } from "@/components/ui/button";
import { NetworkIcon, ExternalLink, Loader2 } from "lucide-react";
import { NetworkType } from '@/utils/types';
import { fetchAddressData } from '@/utils/api';
import { detectNetwork, validateAddress } from '@/utils/validation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

const Address = () => {
  const { network = 'ethereum', address = '' } = useParams<{ network: string; address: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [balance, setBalance] = useState({ native: '0.0000', usd: 0 });
  const [assets, setAssets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isAddressValid, setIsAddressValid] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const validateAndFetchData = async () => {
      setIsLoading(true);
      
      try {
        // Re-detect network to ensure consistency (in case URL was edited manually)
        const detectedNetwork = detectNetwork(address);
        
        if (!detectedNetwork) {
          setIsAddressValid(false);
          toast.error('Could not detect blockchain network from address format');
          navigate('/');
          return;
        }
        
        // If the network in URL doesn't match detected network, redirect
        if (detectedNetwork !== network) {
          navigate(`/address/${detectedNetwork}/${address}`, { replace: true });
          return;
        }
        
        // Validate address format
        const isValid = await validateAddress(address, network as NetworkType);
        
        if (!isValid) {
          setIsAddressValid(false);
          toast.error(`Invalid ${network} address format`);
          navigate('/');
          return;
        }
        
        // Fetch address data
        const data = await fetchAddressData(address, network as NetworkType);
        
        setBalance(data.balance);
        setAssets(data.assets);
        setTransactions(data.transactions);
        setIsAddressValid(true);
      } catch (error) {
        console.error('Error fetching address data:', error);
        toast.error('Failed to fetch address data');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (address) {
      validateAndFetchData();
    }
  }, [address, network, navigate]);

  const handleViewGraph = () => {
    navigate(`/graph/${network}/${address}`);
  };

  if (!isAddressValid && !isLoading) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-stargazer-darkbg">
      <div className="container mx-auto px-4">
        <Header />
        
        <div className="py-6">
          <AddressInput />
        </div>
        
        <main className="py-6 space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-violet-500 animate-spin mb-4" />
              <p className="text-white/70">Loading address data...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <AddressDetails 
                    address={address}
                    network={network as NetworkType}
                    balance={balance}
                    onBuildGraph={handleViewGraph}
                  />
                </div>
                <div>
                  <AssetList assets={assets} />
                </div>
              </div>
              
              <Card className="bg-stargazer-card border-stargazer-muted/40 h-[300px]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-medium">Transaction Graph</CardTitle>
                </CardHeader>
                <CardContent className="h-[224px] flex items-center justify-center">
                  <div className="flex flex-col items-center text-center">
                    <NetworkIcon className="w-10 h-10 text-violet-500 mb-3" />
                    <p className="text-white/70 mb-4">View the interactive transaction graph for this address</p>
                    <Button 
                      className="bg-violet-600 hover:bg-violet-700"
                      onClick={handleViewGraph}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Full Transaction Graph
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Address;
