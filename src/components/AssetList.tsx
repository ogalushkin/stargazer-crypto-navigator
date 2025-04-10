
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody } from "@/components/ui/table";
import { Asset } from "@/utils/types";
import AssetItem from './AssetItem';
import AssetListSkeleton from './AssetListSkeleton';
import AssetListHeader from './AssetListHeader';

interface AssetListProps {
  assets: Asset[];
  isLoading?: boolean;
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
          <AssetListSkeleton />
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
              <AssetListHeader 
                sortKey={sortKey}
                sortDirection={sortDirection}
                toggleSort={toggleSort}
              />
              <TableBody>
                {sortedAssets.map((asset) => (
                  <AssetItem key={asset.symbol} asset={asset} />
                ))}
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
