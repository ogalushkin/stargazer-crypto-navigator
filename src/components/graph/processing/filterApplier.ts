
import { 
  GraphNode, 
  GraphEdge, 
  FilterState
} from '@/utils/graphTypes';

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
