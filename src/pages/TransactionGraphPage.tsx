
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import TransactionGraph from '@/components/TransactionGraph';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Info, Loader2 } from "lucide-react";
import { NetworkType } from '@/utils/types';
import { fetchAddressData } from '@/utils/api';
import { detectNetwork, validateAddress } from '@/utils/validation';
import { toast } from 'sonner';

const TransactionGraphPage = () => {
  const { network = 'ethereum', address = '' } = useParams<{ network: string; address: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [isAddressValid, setIsAddressValid] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const validateAndFetchData = async () => {
      setIsLoading(true);
      setFetchError(null);
      
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
          navigate(`/graph/${detectedNetwork}/${address}`, { replace: true });
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
        
        console.log(`Fetching address data for ${network}:${address}`);
        // Fetch address data
        const data = await fetchAddressData(address, network as NetworkType);
        
        // Important: Make sure we're setting the transactions correctly
        if (data && Array.isArray(data.transactions)) {
          console.log("Fetched transactions:", data.transactions.length);
          setTransactions(data.transactions);
          setIsAddressValid(true);
          
          if (data.transactions.length === 0) {
            setFetchError("No transactions found for this address");
          }
        } else {
          console.error('Invalid transaction data format:', data);
          setFetchError("Invalid transaction data format");
          toast.error('Failed to load transaction data: invalid format');
        }
      } catch (error) {
        console.error('Error fetching transaction data:', error);
        setFetchError(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        toast.error('Failed to fetch transaction data');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (address) {
      validateAndFetchData();
    }
  }, [address, network, navigate]);

  const handleBackClick = () => {
    navigate(`/address/${network}/${address}`);
  };

  const handleTryAnotherAddress = () => {
    navigate('/');
  };

  if (!isAddressValid && !isLoading) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-black overflow-hidden">
      <div className="container mx-auto px-4">
        <Header />
        
        <div className="py-3 flex items-center">
          <Button 
            variant="outline" 
            size="sm" 
            className="mr-2 bg-stargazer-muted/70 hover:bg-stargazer-muted border-stargazer-muted/80"
            onClick={handleBackClick}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Address
          </Button>
          <h2 className="text-sm text-white/70 truncate">
            <span className="text-white/50 mr-1">Address:</span> 
            {address}
          </h2>
        </div>
        
        <main className="pb-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 h-[calc(100vh-140px)]">
              <Loader2 className="w-12 h-12 text-violet-500 animate-spin mb-4" />
              <p className="text-white/70">Loading transaction data...</p>
            </div>
          ) : (
            <div className="w-full h-[calc(100vh-140px)] bg-black">
              {transactions && transactions.length > 0 ? (
                <TransactionGraph 
                  address={address}
                  network={network as NetworkType}
                  transactions={transactions}
                  fullPage={true}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <Info className="w-10 h-10 text-yellow-500 mb-3" />
                  <p className="text-white/70 mb-2">No transactions found for this address</p>
                  {fetchError && (
                    <p className="text-white/50 mb-4 text-sm max-w-lg text-center">{fetchError}</p>
                  )}
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      className="bg-stargazer-muted/70 hover:bg-stargazer-muted border-stargazer-muted/80"
                      onClick={handleBackClick}
                    >
                      Back to Address
                    </Button>
                    <Button 
                      className="bg-violet-600 hover:bg-violet-700"
                      onClick={handleTryAnotherAddress}
                    >
                      Try Another Address
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default TransactionGraphPage;
