
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Copy, ExternalLink } from "lucide-react";
import { toast } from 'sonner';
import { NetworkType } from './NetworkSelector';

interface AddressDetailsProps {
  address: string;
  network: NetworkType;
  balance: {
    native: string;
    usd: number;
  };
  onBuildGraph: () => void;
  isLoading?: boolean;
}

const AddressDetails: React.FC<AddressDetailsProps> = ({
  address,
  network,
  balance,
  onBuildGraph,
  isLoading = false
}) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(address);
    toast.success('Address copied to clipboard');
  };

  const getExplorerUrl = () => {
    switch (network) {
      case 'ethereum':
        return `https://etherscan.io/address/${address}`;
      case 'bitcoin':
        return `https://www.blockchain.com/btc/address/${address}`;
      case 'solana':
        return `https://explorer.solana.com/address/${address}`;
      case 'ton':
        return `https://tonwhales.com/explorer/address/${address}`;
      default:
        return '#';
    }
  };

  const getNetworkName = () => {
    switch (network) {
      case 'ethereum':
        return 'Ethereum';
      case 'bitcoin':
        return 'Bitcoin';
      case 'solana':
        return 'Solana';
      case 'ton':
        return 'TON';
      default:
        return network;
    }
  };

  const getCurrencySymbol = () => {
    switch (network) {
      case 'ethereum':
        return 'ETH';
      case 'bitcoin':
        return 'BTC';
      case 'solana':
        return 'SOL';
      case 'ton':
        return 'TON';
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-stargazer-card border-stargazer-muted/40">
        <CardContent className="p-6">
          <div className="h-5 w-24 bg-stargazer-muted/50 rounded loading-pulse mb-6"></div>
          <div className="h-7 w-full bg-stargazer-muted/40 rounded loading-pulse mb-4"></div>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="h-5 w-1/3 bg-stargazer-muted/50 rounded loading-pulse mb-3"></div>
              <div className="h-9 w-2/3 bg-stargazer-muted/40 rounded loading-pulse"></div>
            </div>
            <div className="flex-1">
              <div className="h-5 w-1/3 bg-stargazer-muted/50 rounded loading-pulse mb-3"></div>
              <div className="h-9 w-2/3 bg-stargazer-muted/40 rounded loading-pulse"></div>
            </div>
          </div>
          <div className="h-11 w-full bg-stargazer-muted/40 rounded loading-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-stargazer-card border-stargazer-muted/40 animate-fade-in">
      <CardContent className="p-6">
        <div className="text-white/60 text-sm mb-1">{getNetworkName()} Address</div>
        <div className="flex items-center gap-2 mb-6 overflow-x-auto scrollbar-none">
          <div className="font-mono text-lg text-white">{address}</div>
          <button onClick={copyToClipboard} className="text-white/60 hover:text-white transition-colors p-1" aria-label="Copy address">
            <Copy className="w-4 h-4" />
          </button>
          <a href={getExplorerUrl()} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors p-1" aria-label="View in explorer">
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="text-white/60 text-sm mb-1">Native Balance</div>
            <div className="text-2xl font-semibold text-white">
              {balance.native} <span className="text-white/60">{getCurrencySymbol()}</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="text-white/60 text-sm mb-1">USD Value</div>
            <div className="text-2xl font-semibold text-white">
              ${balance.usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <Button 
          onClick={onBuildGraph}
          className="w-full bg-violet-600 hover:bg-violet-700 text-white border-none transition-all-cubic"
        >
          <span>Build Transaction Graph</span>
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default AddressDetails;
