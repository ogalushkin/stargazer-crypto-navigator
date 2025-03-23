
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Loader2, NetworkIcon } from "lucide-react";
import { NetworkType } from '@/utils/types';
import { Transaction, FilterState } from '@/utils/graphTypes';
import GraphControls from './graph/GraphControls';
import TransactionTable from './TransactionTable';
import TransactionFilters from './TransactionFilters';
import CytoscapeGraph, { CytoscapeGraphRef } from './graph/CytoscapeGraph';
import { useGraphData } from './graph/useGraphData';
import { MAX_TRANSACTIONS } from '@/utils/graphUtils';

// Export types from the original file to maintain backward compatibility
export type { 
  Transaction,
  AddressCategory,
  SortOption,
  TimeRangeOption,
  FlowDirection,
  FilterState
} from '@/utils/graphTypes';

interface TransactionGraphProps {
  address: string;
  network: string;
  transactions: Transaction[];
  isLoading?: boolean;
  fullPage?: boolean;
}

const TransactionGraph: React.FC<TransactionGraphProps> = ({
  address,
  network,
  transactions = [],
  isLoading = false,
  fullPage = false
}) => {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
  const cytoscapeRef = useRef<CytoscapeGraphRef>(null);
  
  // Filter and sort state
  const [filters, setFilters] = useState<FilterState>({
    sortBy: 'time',
    timeRange: 'all',
    categoryFilters: {
      exchange: { enabled: true, flow: 'all' },
      deposit: { enabled: true, flow: 'all' },
      individual: { enabled: true, flow: 'all' },
      dex: { enabled: true, flow: 'all' },
      lending: { enabled: true, flow: 'all' },
      uncategorized: { enabled: true, flow: 'all' }
    }
  });

  // Process graph data using the custom hook
  const processedData = useGraphData(address, transactions, filters);

  console.log("TransactionGraph component rendering with:", {
    address,
    network,
    transactionsCount: transactions.length,
    processedData: {
      nodes: processedData.nodes.length,
      edges: processedData.edges.length
    },
    fullPage
  });

  // Graph control functions
  const zoomIn = () => {
    if (cytoscapeRef.current) {
      cytoscapeRef.current.zoomIn();
    }
  };

  const zoomOut = () => {
    if (cytoscapeRef.current) {
      cytoscapeRef.current.zoomOut();
    }
  };

  const fitGraph = () => {
    if (cytoscapeRef.current) {
      cytoscapeRef.current.fitGraph();
    }
  };

  const rebuildGraph = () => {
    if (cytoscapeRef.current) {
      cytoscapeRef.current.rebuildGraph();
    }
  };

  const exportGraph = () => {
    if (cytoscapeRef.current) {
      cytoscapeRef.current.exportGraph();
    }
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleTransactionSelect = (hash: string | null) => {
    setSelectedTransaction(hash);
  };

  // Show loading state
  if (isLoading) {
    return (
      <Card className={`bg-stargazer-card border-stargazer-muted/40 ${fullPage ? 'w-full h-[calc(100vh-80px)]' : 'h-[600px]'}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">Transaction Graph</CardTitle>
        </CardHeader>
        <CardContent className={`${fullPage ? 'h-[calc(100vh-140px)]' : 'h-[524px]'} flex items-center justify-center`}>
          <div className="flex flex-col items-center">
            <Loader2 className="w-10 h-10 text-violet-500 animate-spin mb-3" />
            <p className="text-white/70">Loading transaction data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show empty state if no transactions
  if (!transactions || transactions.length === 0) {
    return (
      <Card className={`bg-stargazer-card border-stargazer-muted/40 ${fullPage ? 'w-full h-[calc(100vh-80px)]' : 'h-[600px]'}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">Transaction Graph</CardTitle>
        </CardHeader>
        <CardContent className={`${fullPage ? 'h-[calc(100vh-140px)]' : 'h-[524px]'} flex items-center justify-center`}>
          <div className="flex flex-col items-center">
            <NetworkIcon className="w-10 h-10 text-white/30 mb-3" />
            <p className="text-white/70 mb-4">No transactions found for this address</p>
            <Button 
              variant="outline" 
              className="bg-stargazer-muted/70 hover:bg-stargazer-muted border-stargazer-muted/80 text-white/80"
              onClick={() => navigate('/')}
            >
              Try Another Address
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Add transaction count and info if we had to limit them
  const transactionCount = transactions.length;
  const isTruncated = transactionCount > MAX_TRANSACTIONS;

  return (
    <Card className={`bg-stargazer-card border-stargazer-muted/40 animate-fade-in ${fullPage ? 'w-full h-[calc(100vh-80px)]' : ''}`}>
      <CardHeader className="pb-3 flex flex-row justify-between items-center">
        <div>
          <CardTitle className="text-lg font-medium">Transaction Graph</CardTitle>
          {isTruncated && (
            <p className="text-xs text-white/50 mt-1">
              Showing {MAX_TRANSACTIONS} of {transactionCount} transactions for better performance
            </p>
          )}
        </div>
        <GraphControls 
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          zoomIn={zoomIn}
          zoomOut={zoomOut}
          fitGraph={fitGraph}
          rebuildGraph={rebuildGraph}
          exportGraph={exportGraph}
        />
      </CardHeader>
      
      {showFilters && (
        <TransactionFilters 
          filters={filters} 
          onFilterChange={handleFilterChange}
        />
      )}
      
      <CardContent className={`relative ${fullPage ? 'h-[calc(100vh-270px)]' : 'h-[424px]'} p-0 overflow-hidden grid ${fullPage ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
        <div className={`relative ${fullPage ? 'w-full h-full col-span-1 lg:col-span-2' : 'w-full h-full'}`}>
          <CytoscapeGraph 
            ref={cytoscapeRef}
            address={address}
            network={network as NetworkType}
            nodes={processedData.nodes}
            edges={processedData.edges}
            selectedTransaction={selectedTransaction}
            onSelectTransaction={handleTransactionSelect}
          />
        </div>
        
        {fullPage && (
          <div className="h-full border-l border-stargazer-muted/30 lg:block hidden">
            <TransactionTable 
              transactions={processedData.edges}
              selectedTransaction={selectedTransaction}
              onSelectTransaction={handleTransactionSelect}
            />
          </div>
        )}
      </CardContent>
      
      {fullPage && (
        <div className="border-t border-stargazer-muted/30 lg:hidden block">
          <TransactionTable 
            transactions={processedData.edges}
            selectedTransaction={selectedTransaction}
            onSelectTransaction={handleTransactionSelect}
          />
        </div>
      )}
    </Card>
  );
};

export default TransactionGraph;
