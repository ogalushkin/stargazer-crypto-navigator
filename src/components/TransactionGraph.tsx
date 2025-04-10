
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Transaction, FilterState } from '@/utils/graphTypes';
import { NetworkType } from '@/utils/types';
import GraphContainer from './graph/GraphContainer';
import TransactionFilters from './TransactionFilters';
import TransactionTable from './TransactionTable';
import CytoscapeGraph, { CytoscapeGraphRef } from './graph/CytoscapeGraph';
import { useGraphData } from './graph/useGraphData';
import { MAX_TRANSACTIONS } from '@/utils/graphUtils';
import { Button } from './ui/button';
import { ExternalLink } from 'lucide-react';

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

  // Graph control functions
  const zoomIn = () => cytoscapeRef.current?.zoomIn();
  const zoomOut = () => cytoscapeRef.current?.zoomOut();
  const fitGraph = () => cytoscapeRef.current?.fitGraph();
  const rebuildGraph = () => cytoscapeRef.current?.rebuildGraph();
  const exportGraph = () => cytoscapeRef.current?.exportGraph();

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleTransactionSelect = (hash: string | null) => {
    setSelectedTransaction(hash);
  };

  const handleTryAnotherClick = () => {
    navigate('/');
  };
  
  const handleFullViewClick = () => {
    navigate(`/graph/${network}/${address}`);
  };

  // Empty transactions check
  const isEmpty = !transactions || transactions.length === 0;
  const transactionCount = transactions.length;

  return (
    <GraphContainer
      title="Transaction Graph"
      fullPage={fullPage}
      isLoading={isLoading}
      isEmpty={isEmpty}
      transactionCount={transactionCount}
      showFilters={showFilters}
      setShowFilters={setShowFilters}
      zoomIn={zoomIn}
      zoomOut={zoomOut}
      fitGraph={fitGraph}
      rebuildGraph={rebuildGraph}
      exportGraph={exportGraph}
      onTryAnotherClick={handleTryAnotherClick}
    >
      {showFilters && !isEmpty && !isLoading && (
        <TransactionFilters 
          filters={filters} 
          onFilterChange={handleFilterChange}
        />
      )}
      
      <div className={`relative ${fullPage ? 'h-[calc(100vh-270px)]' : 'h-[424px]'} p-0 overflow-hidden grid ${fullPage ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
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
          
          {!fullPage && !isEmpty && !isLoading && (
            <Button 
              className="absolute bottom-4 right-4 bg-violet-600 hover:bg-violet-700 flex items-center gap-2"
              onClick={handleFullViewClick}
            >
              <ExternalLink size={16} />
              Full View
            </Button>
          )}
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
      </div>
      
      {fullPage && (
        <div className="border-t border-stargazer-muted/30 lg:hidden block">
          <TransactionTable 
            transactions={processedData.edges}
            selectedTransaction={selectedTransaction}
            onSelectTransaction={handleTransactionSelect}
          />
        </div>
      )}
    </GraphContainer>
  );
};

export default TransactionGraph;
