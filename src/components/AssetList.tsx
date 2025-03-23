
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

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

const AssetList: React.FC<AssetListProps> = ({ assets, isLoading = false }) => {
  if (isLoading) {
    return (
      <Card className="bg-stargazer-card border-stargazer-muted/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">Assets</CardTitle>
        </CardHeader>
        <CardContent>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-t border-stargazer-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-stargazer-muted/50 loading-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 w-16 bg-stargazer-muted/50 rounded loading-pulse"></div>
                  <div className="h-3 w-24 bg-stargazer-muted/30 rounded loading-pulse"></div>
                </div>
              </div>
              <div className="space-y-2 text-right">
                <div className="h-4 w-20 bg-stargazer-muted/50 rounded loading-pulse ml-auto"></div>
                <div className="h-3 w-14 bg-stargazer-muted/30 rounded loading-pulse ml-auto"></div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-stargazer-card border-stargazer-muted/40 animate-fade-in">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Assets</CardTitle>
      </CardHeader>
      <CardContent>
        {assets.length === 0 ? (
          <div className="py-8 text-center text-white/50">
            <p>No assets found</p>
          </div>
        ) : (
          assets.map((asset, index) => (
            <div key={asset.symbol} className={`flex items-center justify-between py-3 ${index > 0 ? 'border-t border-stargazer-muted/30' : ''}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400/20 to-violet-600/20 flex items-center justify-center overflow-hidden">
                  {asset.icon ? (
                    <img src={asset.icon} alt={asset.symbol} className="w-6 h-6" />
                  ) : (
                    <div className="text-xl font-bold text-violet-400">{asset.symbol.charAt(0)}</div>
                  )}
                </div>
                <div>
                  <div className="font-medium">{asset.symbol}</div>
                  <div className="text-sm text-white/60">{asset.name}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">{asset.balance}</div>
                <div className={`text-sm flex items-center justify-end gap-1 ${asset.change24h >= 0 ? 'text-stargazer-green' : 'text-stargazer-red'}`}>
                  {asset.change24h >= 0 ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  <span>${asset.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default AssetList;
