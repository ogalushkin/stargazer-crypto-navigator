
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ArrowDownRight, ArrowUpRight, ChevronDown, ChevronUp, SortAsc } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface Asset {
  symbol: string;
  name: string;
  balance: string;
  value: number;
  price: number;
  change24h: number;
  icon?: string;
}

interface AssetListProps {
  assets: Asset[];
  isLoading?: boolean;
}

// Helper function to get correct crypto logo URLs
const getCryptoLogoUrl = (symbol: string): string => {
  const tokenMap: Record<string, string> = {
    'ETH': 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
    'BTC': 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
    'USDT': 'https://cryptologos.cc/logos/tether-usdt-logo.png',
    'USDC': 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
    'DAI': 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png',
    'LINK': 'https://cryptologos.cc/logos/chainlink-link-logo.png',
    'SOL': 'https://cryptologos.cc/logos/solana-sol-logo.png',
    'AAVE': 'https://cryptologos.cc/logos/aave-aave-logo.png',
    'UNI': 'https://cryptologos.cc/logos/uniswap-uni-logo.png',
    'TON': 'https://cryptologos.cc/logos/toncoin-ton-logo.png',
    'SHIB': 'https://cryptologos.cc/logos/shiba-inu-shib-logo.png',
    'WETH': 'https://cryptologos.cc/logos/ethereum-eth-logo.png', // Wrapped ETH uses ETH logo
    'cbBTC': 'https://cryptologos.cc/logos/bitcoin-btc-logo.png', // Coinbase wrapped BTC uses BTC logo
  };
  
  return tokenMap[symbol] || '';
}

const AssetList: React.FC<AssetListProps> = ({ assets, isLoading = false }) => {
  const [sortKey, setSortKey] = useState<'value' | 'change24h'>('value');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const toggleSort = (key: 'value' | 'change24h') => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const sortedAssets = [...assets].sort((a, b) => {
    const multiplier = sortDirection === 'asc' ? 1 : -1;
    return (a[sortKey] - b[sortKey]) * multiplier;
  });

  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);

  if (isLoading) {
    return (
      <Card className="bg-stargazer-card border-stargazer-muted/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">Portfolio</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="px-6">
            <Table>
              <TableHeader>
                <TableRow className="border-stargazer-muted/20">
                  <TableHead className="w-[200px]">Asset</TableHead>
                  <TableHead className="text-right">Holdings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(3)].map((_, i) => (
                  <TableRow key={i} className="border-stargazer-muted/20">
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-full bg-stargazer-muted/30" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-16 bg-stargazer-muted/30" />
                          <Skeleton className="h-3 w-24 bg-stargazer-muted/20" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right py-4">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-20 bg-stargazer-muted/30 ml-auto" />
                        <Skeleton className="h-3 w-14 bg-stargazer-muted/20 ml-auto" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            <Separator className="my-4 bg-stargazer-muted/20" />
            
            <div className="py-4 flex justify-between items-center">
              <Skeleton className="h-5 w-16 bg-stargazer-muted/30" />
              <Skeleton className="h-5 w-24 bg-stargazer-muted/30" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-stargazer-card border-stargazer-muted/40 animate-fade-in">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Portfolio</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {assets.length === 0 ? (
          <div className="py-8 text-center text-white/50">
            <p>No assets found</p>
          </div>
        ) : (
          <div>
            <Table>
              <TableHeader>
                <TableRow className="border-stargazer-muted/20">
                  <TableHead className="w-[200px]">Asset</TableHead>
                  <TableHead 
                    className="text-right cursor-pointer group"
                    onClick={() => toggleSort('value')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      Holdings
                      {sortKey === 'value' ? (
                        sortDirection === 'desc' ? (
                          <ChevronDown className="w-4 h-4 text-violet-400" />
                        ) : (
                          <ChevronUp className="w-4 h-4 text-violet-400" />
                        )
                      ) : (
                        <SortAsc className="w-4 h-4 opacity-0 group-hover:opacity-40" />
                      )}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAssets.map((asset) => {
                  // Get logo URL from our helper or use provided icon
                  const logoUrl = asset.icon || getCryptoLogoUrl(asset.symbol);
                  
                  return (
                    <TableRow key={asset.symbol} className="border-stargazer-muted/20">
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400/20 to-violet-600/20 border border-violet-500/20">
                            {logoUrl ? (
                              <AvatarImage src={logoUrl} alt={asset.symbol} className="p-1.5" />
                            ) : (
                              <AvatarFallback className="text-violet-400 bg-transparent">
                                {asset.symbol.charAt(0)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <div className="font-medium">{asset.symbol}</div>
                            <div className="text-sm text-white/60">{asset.name}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right py-4">
                        <div className="font-medium">{asset.balance}</div>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className={`text-sm ${asset.change24h >= 0 ? 'text-stargazer-green' : 'text-stargazer-red'}`}>
                            {asset.change24h >= 0 ? (
                              <ArrowUpRight className="w-3 h-3 inline mr-0.5" />
                            ) : (
                              <ArrowDownRight className="w-3 h-3 inline mr-0.5" />
                            )}
                            {Math.abs(asset.change24h).toFixed(2)}%
                          </span>
                          <span className="text-sm text-white/80">
                            ${asset.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            
            <Separator className="my-2 bg-stargazer-muted/20" />
            
            <div className="py-4 px-6 flex justify-between items-center font-medium">
              <span className="text-white/70">Total Value</span>
              <span>${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AssetList;
