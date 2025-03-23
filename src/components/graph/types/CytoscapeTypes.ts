
import { GraphNode, GraphEdge } from '@/utils/graphTypes';
import { NetworkType } from '@/utils/types';
import cytoscape from 'cytoscape';

export interface CytoscapeGraphProps {
  address: string;
  network: NetworkType;
  nodes: GraphNode[];
  edges: GraphEdge[];
  onSelectTransaction: (hash: string | null) => void;
  selectedTransaction: string | null;
}

// Define the ref type for the CytoscapeGraph
export interface CytoscapeGraphRef {
  zoomIn: () => void;
  zoomOut: () => void;
  fitGraph: () => void;
  rebuildGraph: () => void;
  exportGraph: () => void;
}

export interface UseCytoscapeGraphReturn {
  containerRef: React.RefObject<HTMLDivElement>;
  cyRef: React.RefObject<cytoscape.Core | null>;
  isRendering: boolean;
  hasError: boolean;
  initializeGraph: () => void;
  highlightTransaction: (hash: string | null) => void;
  handleNodeClick: (nodeId: string) => void;
  setHasError: (hasError: boolean) => void;
}
