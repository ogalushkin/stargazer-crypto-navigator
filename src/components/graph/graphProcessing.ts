
import { 
  Transaction, 
  GraphNode, 
  GraphEdge, 
  FilterState, 
  SortOption,
  TimeRangeOption
} from '@/utils/graphTypes';
import { 
  shortenAddress, 
  getCategoryForAddress,
  calculateEdgeWidth 
} from '@/utils/graphUtils';

// Filter transactions based on time range
export const filterTransactionsByTime = (
  transactions: Transaction[], 
  timeRange: TimeRangeOption
): Transaction[] => {
  if (timeRange === 'all') return [...transactions];
  
  const now = Date.now();
  let filteredTransactions = [...transactions];
  
  if (timeRange === '24h') {
    return filteredTransactions.filter(tx => 
      (now - tx.timestamp) < 24 * 60 * 60 * 1000
    );
  } else if (timeRange === '7d') {
    return filteredTransactions.filter(tx => 
      (now - tx.timestamp) < 7 * 24 * 60 * 60 * 1000
    );
  }
  
  return filteredTransactions;
};

// Sort transactions based on sort option
export const sortTransactions = (
  transactions: Transaction[], 
  sortBy: SortOption,
  address: string
): Transaction[] => {
  const sortedTransactions = [...transactions];
  
  if (sortBy === 'time') {
    sortedTransactions.sort((a, b) => b.timestamp - a.timestamp);
  } else if (sortBy === 'amount') {
    sortedTransactions.sort((a, b) => {
      const valueA = parseFloat(a.value.split(' ')[0]) || 0;
      const valueB = parseFloat(b.value.split(' ')[0]) || 0;
      return valueB - valueA;
    });
  } else if (sortBy === 'direction') {
    sortedTransactions.sort((a, b) => {
      const aIsIncoming = a.to === address;
      const bIsIncoming = b.to === address;
      if (aIsIncoming && !bIsIncoming) return -1;
      if (!aIsIncoming && bIsIncoming) return 1;
      return 0;
    });
  }
  
  return sortedTransactions;
};

// Create graph nodes from transactions
export const createGraphNodes = (
  address: string,
  transactions: Transaction[]
): GraphNode[] => {
  // Create target node
  const nodes: GraphNode[] = [{ 
    id: address, 
    label: shortenAddress(address), 
    isTarget: true 
  }];
  
  const nodeSet = new Set<string>([address]);
  
  // First pass: identify all nodes
  transactions.forEach(tx => {
    if (!tx.from || !tx.to) {
      console.warn("Skipping transaction with missing from/to", tx);
      return;
    }
    
    const fromIsTarget = tx.from === address;
    const toIsTarget = tx.to === address;
    
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
  
  return nodes;
};

// Create graph edges from transactions
export const createGraphEdges = (
  address: string,
  transactions: Transaction[]
): GraphEdge[] => {
  const edges: GraphEdge[] = [];
  
  // Create all individual edges (one per transaction)
  transactions.forEach((tx, index) => {
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
  
  return edges;
};

// Apply filters to graph nodes
export const applyFiltersToNodes = (
  nodes: GraphNode[],
  filters: FilterState
): GraphNode[] => {
  return nodes.filter(node => {
    if (node.isTarget) return true; // Always include target node
    
    const category = node.category || 'uncategorized';
    const categoryFilter = filters.categoryFilters[category];
    
    if (!categoryFilter || !categoryFilter.enabled) return false;
    
    // Filter by flow direction
    if (categoryFilter.flow === 'in' && !node.isIncoming) return false;
    if (categoryFilter.flow === 'out' && !node.isOutgoing) return false;
    if (categoryFilter.flow === 'self') {
      // Only include nodes involved in self-transfers
      // This requires edge data, which will be handled in applyFiltersToEdges
      return true;
    }
    
    return true;
  });
};

// Apply filters to graph edges based on filtered nodes
export const applyFiltersToEdges = (
  edges: GraphEdge[],
  filteredNodeIds: Set<string>,
  nodes: GraphNode[],
  filters: FilterState
): GraphEdge[] => {
  return edges.filter(edge => {
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
};
