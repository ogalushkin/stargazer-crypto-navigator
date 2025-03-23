
import { useState, useEffect } from 'react';
import { 
  Transaction, 
  GraphNode, 
  GraphEdge, 
  FilterState, 
  ProcessedGraphData 
} from '@/utils/graphTypes';
import { MAX_TRANSACTIONS } from '@/utils/graphUtils';
import { 
  filterTransactionsByTime,
  sortTransactions,
  createGraphNodes,
  createGraphEdges,
  applyFiltersToNodes,
  applyFiltersToEdges
} from './graphProcessing';

export function useGraphData(
  address: string, 
  transactions: Transaction[], 
  filters: FilterState
): ProcessedGraphData {
  const [processedData, setProcessedData] = useState<ProcessedGraphData>({ nodes: [], edges: [] });
  
  useEffect(() => {
    // Process transactions into nodes and edges
    const processGraphData = () => {
      if (!address || transactions.length === 0) {
        return { nodes: [], edges: [] };
      }
      
      console.log("Processing graph data for", {
        address,
        transactionsCount: transactions.length,
        filters
      });
      
      // Apply time range filter
      let filteredTransactions = filterTransactionsByTime(transactions, filters.timeRange);
      
      // Apply sort
      filteredTransactions = sortTransactions(filteredTransactions, filters.sortBy, address);
      
      // Limit transactions to prevent performance issues
      const limitedTransactions = filteredTransactions.length > MAX_TRANSACTIONS 
        ? filteredTransactions.slice(0, MAX_TRANSACTIONS)
        : filteredTransactions;
      
      console.log("Using limited transactions:", limitedTransactions.length);
      
      // Create target node and all transaction nodes
      const nodes = createGraphNodes(address, limitedTransactions);
      
      // Create all individual edges (one per transaction)
      const edges = createGraphEdges(address, limitedTransactions);
  
      // Apply filters to nodes and edges
      const filteredNodes = applyFiltersToNodes(nodes, filters);
      const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
      const filteredEdges = applyFiltersToEdges(edges, filteredNodeIds, nodes, filters);
  
      console.log("Processed graph data:", { 
        nodes: filteredNodes.length, 
        edges: filteredEdges.length 
      });
      
      return { nodes: filteredNodes, edges: filteredEdges };
    };

    const data = processGraphData();
    setProcessedData(data);
  }, [address, transactions, filters]);

  return processedData;
}
