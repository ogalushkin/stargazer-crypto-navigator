
import React from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Asset } from "@/utils/types";
import { getCryptoLogoUrl } from "@/utils/logoUtils";

interface AssetItemProps {
  asset: Asset;
}

const AssetItem: React.FC<AssetItemProps> = ({ asset }) => {
  // Get logo URL from our helper or use provided icon
  const logoUrl = asset.icon || getCryptoLogoUrl(asset.symbol);
  
  return (
    <TableRow className="border-stargazer-muted/20">
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
        <div className="text-sm text-white/80">
          ${asset.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </TableCell>
      <TableCell className="text-right py-4">
        <div className={`flex items-center justify-end gap-1 ${asset.change24h >= 0 ? 'text-stargazer-green' : 'text-stargazer-red'}`}>
          {asset.change24h >= 0 ? (
            <ArrowUpRight className="w-3 h-3 inline mr-0.5" />
          ) : (
            <ArrowDownRight className="w-3 h-3 inline mr-0.5" />
          )}
          {Math.abs(asset.change24h).toFixed(2)}%
        </div>
      </TableCell>
    </TableRow>
  );
};

export default AssetItem;
