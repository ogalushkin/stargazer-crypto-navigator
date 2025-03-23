
import { 
  Transaction, 
  GraphNode
} from '@/utils/graphTypes';
import { 
  shortenAddress, 
  getCategoryForAddress
} from '@/utils/graphUtils';

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
