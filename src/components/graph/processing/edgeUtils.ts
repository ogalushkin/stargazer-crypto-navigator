
import { 
  Transaction, 
  GraphEdge
} from '@/utils/graphTypes';

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
