
import React from 'react';
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronDown, ChevronUp, SortAsc } from "lucide-react";

interface AssetListHeaderProps {
  sortKey: 'value' | 'change24h';
  sortDirection: 'asc' | 'desc';
  toggleSort: (key: 'value' | 'change24h') => void;
}

const AssetListHeader: React.FC<AssetListHeaderProps> = ({ sortKey, sortDirection, toggleSort }) => {
  return (
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
  );
};

export default AssetListHeader;
