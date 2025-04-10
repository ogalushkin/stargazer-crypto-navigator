
import cytoscape from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';
import { GraphNode, GraphEdge } from '@/utils/graphTypes';
import { shortenAddress } from '@/utils/graphUtils';

// Register the layout extension only once
if (!cytoscape.prototype.hasOwnProperty('hasInitializedCoseBilkent')) {
  try {
    cytoscape.use(coseBilkent);
    // Mark as initialized to avoid multiple registrations
    cytoscape.prototype.hasInitializedCoseBilkent = true;
    console.log("coseBilkent layout registered successfully");
  } catch (e) {
    console.error("Failed to register coseBilkent layout:", e);
  }
}

// Create elements for the cytoscape graph
export const createGraphElements = (nodes: GraphNode[], edges: GraphEdge[]) => {
  const elements = [];
  
  // Add nodes with improved positioning
  for (const node of nodes) {
    const position = node.isTarget ? 
      { x: 0, y: 0 } : 
      node.isIncoming ? 
        { x: -250 + (Math.random() * 50), y: -100 + (Math.random() * 200) } :
        { x: 250 - (Math.random() * 50), y: -100 + (Math.random() * 200) };
        
    elements.push({
      data: { 
        id: node.id, 
        label: node.label || shortenAddress(node.id),
        isTarget: node.isTarget || false,
        isIncoming: node.isIncoming || false,
        isOutgoing: node.isOutgoing || false,
        category: node.category || 'uncategorized'
      },
      position: position,
      group: 'nodes'
    });
  }
  
  // Add edges with improved weight calculation
  for (const edge of edges) {
    elements.push({
      data: { 
        id: edge.id, 
        source: edge.source, 
        target: edge.target, 
        label: edge.label || '',
        value: edge.value || 0,
        width: edge.value ? (Math.log10(edge.value + 1) * 2.5) : 1,
        isIncoming: edge.isIncoming || false,
        isSelfTransfer: edge.isSelfTransfer || false,
        hash: edge.hash,
        timestamp: edge.timestamp
      },
      group: 'edges'
    });
  }
  
  return elements;
};
