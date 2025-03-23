
import { useState, useEffect } from 'react';
import { 
  Transaction, 
  GraphNode, 
  GraphEdge, 
  FilterState, 
  ProcessedGraphData 
} from '@/utils/graphTypes';
import { 
  MAX_TRANSACTIONS, 
  shortenAddress, 
  getCategoryForAddress,
  calculateEdgeWidth 
} from '@/utils/graphUtils';

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
      let filteredTransactions = [...transactions];
      const now = Date.now();
      
      if (filters.timeRange === '24h') {
        filteredTransactions = filteredTransactions.filter(tx => 
          (now - tx.timestamp) < 24 * 60 * 60 * 1000
        );
      } else if (filters.timeRange === '7d') {
        filteredTransactions = filteredTransactions.filter(tx => 
          (now - tx.timestamp) < 7 * 24 * 60 * 60 * 1000
        );
      }
  
      // Apply sort
      if (filters.sortBy === 'time') {
        filteredTransactions.sort((a, b) => b.timestamp - a.timestamp);
      } else if (filters.sortBy === 'amount') {
        filteredTransactions.sort((a, b) => {
          const valueA = parseFloat(a.value.split(' ')[0]) || 0;
          const valueB = parseFloat(b.value.split(' ')[0]) || 0;
          return valueB - valueA;
        });
      } else if (filters.sortBy === 'direction') {
        filteredTransactions.sort((a, b) => {
          const aIsIncoming = a.to === address;
          const bIsIncoming = b.to === address;
          if (aIsIncoming && !bIsIncoming) return -1;
          if (!aIsIncoming && bIsIncoming) return 1;
          return 0;
        });
      }
      
      // Limit transactions to prevent performance issues
      const limitedTransactions = filteredTransactions.length > MAX_TRANSACTIONS 
        ? filteredTransactions.slice(0, MAX_TRANSACTIONS)
        : filteredTransactions;
      
      console.log("Using limited transactions:", limitedTransactions.length);
      
      // Create target node
      const nodes: GraphNode[] = [{ 
        id: address, 
        label: shortenAddress(address), 
        isTarget: true 
      }];
      
      const edges: GraphEdge[] = [];
      const nodeSet = new Set<string>([address]);
      
      // First pass: identify all nodes
      limitedTransactions.forEach(tx => {
        if (!tx.from || !tx.to) {
          console.warn("Skipping transaction with missing from/to", tx);
          return;
        }
        
        const fromIsTarget = tx.from === address;
        const toIsTarget = tx.to === address;
        const isSelfTransfer = tx.from === tx.to;
        
        // Add 'from' node if it doesn't exist
        if (!nodeSet.has(tx.from)) {
          const category = getCategoryForAddress(tx.from);
          nodes.push({ 
            id: tx.from, 
            label: shortenAddress(tx.from),
            isOutgoing: fromIsTarget,
            isIncoming: !fromIsTarget && toIsTarget,
            category
          });
          nodeSet.add(tx.from);
        }
        
        // Add 'to' node if it doesn't exist
        if (!nodeSet.has(tx.to)) {
          const category = getCategoryForAddress(tx.to);
          nodes.push({ 
            id: tx.to, 
            label: shortenAddress(tx.to),
            isOutgoing: toIsTarget && !fromIsTarget,
            isIncoming: toIsTarget,
            category
          });
          nodeSet.add(tx.to);
        }
      });
      
      // Second pass: create all individual edges (one per transaction)
      limitedTransactions.forEach((tx, index) => {
        if (!tx.from || !tx.to || !tx.hash) {
          console.warn("Skipping transaction with missing data", tx);
          return;
        }
        
        // Extract numerical value from transaction
        const valueStr = tx.value?.split(' ')[0] || '0'; // Extracts just the number part
        const numValue = parseFloat(valueStr) || 0;
        
        // Add individual edge for this transaction
        const isIncoming = tx.to === address;
        const isSelfTransfer = tx.from === tx.to;
        
        edges.push({
          id: `e${index}-${tx.hash.substring(0, 8)}`,
          source: tx.from,
          target: tx.to,
          label: tx.value || '0',
          value: numValue,
          isIncoming,
          isSelfTransfer,
          hash: tx.hash,
          timestamp: tx.timestamp
        });
      });
  
      // Apply category and flow filters
      const filteredNodes = nodes.filter(node => {
        if (node.isTarget) return true; // Always include target node
        
        const category = node.category || 'uncategorized';
        const categoryFilter = filters.categoryFilters[category];
        
        if (!categoryFilter || !categoryFilter.enabled) return false;
        
        // Filter by flow direction
        if (categoryFilter.flow === 'in' && !node.isIncoming) return false;
        if (categoryFilter.flow === 'out' && !node.isOutgoing) return false;
        if (categoryFilter.flow === 'self') {
          // Only include nodes involved in self-transfers
          const hasSelfTransfer = edges.some(e => 
            e.isSelfTransfer && (e.source === node.id || e.target === node.id)
          );
          if (!hasSelfTransfer) return false;
        }
        
        return true;
      });
      
      // Only include edges that connect to visible nodes
      const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
      const filteredEdges = edges.filter(edge => {
        if (!filteredNodeIds.has(edge.source) || !filteredNodeIds.has(edge.target)) return false;
        
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);
        
        if (!sourceNode || !targetNode) return false;
        
        const sourceCategory = sourceNode.category || 'uncategorized';
        const targetCategory = targetNode.category || 'uncategorized';
        
        // Check source category filter
        const sourceCategoryFilter = filters.categoryFilters[sourceCategory];
        if (!sourceCategoryFilter?.enabled) return false;
        
        // Check target category filter
        const targetCategoryFilter = filters.categoryFilters[targetCategory];
        if (!targetCategoryFilter?.enabled) return false;
        
        // Filter by flow direction for self transfers
        if (edge.isSelfTransfer) {
          // Only show self transfers if at least one category has self flow enabled
          const selfFlowEnabled = Object.values(filters.categoryFilters).some(
            cf => cf?.enabled && cf.flow === 'self'
          );
          return selfFlowEnabled;
        }
        
        // Filter by flow direction
        if (sourceCategoryFilter.flow === 'in' && !edge.isIncoming) return false;
        if (sourceCategoryFilter.flow === 'out' && edge.isIncoming) return false;
        if (targetCategoryFilter.flow === 'in' && !edge.isIncoming) return false;
        if (targetCategoryFilter.flow === 'out' && edge.isIncoming) return false;
        
        return true;
      });
  
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
