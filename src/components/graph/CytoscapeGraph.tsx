
import React, { forwardRef, useImperativeHandle } from 'react';
import { CytoscapeGraphProps, CytoscapeGraphRef } from './types/CytoscapeTypes';
import { useCytoscapeGraph } from './hooks/useCytoscapeGraph';
import CytoscapeGraphContent from './CytoscapeGraphContent';

// Re-export the CytoscapeGraphRef type for external use
export type { CytoscapeGraphRef } from './types/CytoscapeTypes';

const CytoscapeGraph = forwardRef<CytoscapeGraphRef, CytoscapeGraphProps>(({
  address,
  network,
  nodes,
  edges,
  onSelectTransaction,
  selectedTransaction
}, ref) => {
  const graphHook = useCytoscapeGraph(
    address, 
    network, 
    nodes, 
    edges, 
    onSelectTransaction, 
    selectedTransaction
  );
  
  // Expose methods for the parent component using the proper forwardRef pattern
  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      if (graphHook.cyRef.current) {
        graphHook.cyRef.current.zoom(graphHook.cyRef.current.zoom() * 1.2);
      }
    },
    zoomOut: () => {
      if (graphHook.cyRef.current) {
        graphHook.cyRef.current.zoom(graphHook.cyRef.current.zoom() * 0.8);
      }
    },
    fitGraph: () => {
      if (graphHook.cyRef.current) {
        graphHook.cyRef.current.fit(undefined, 50);
      }
    },
    rebuildGraph: () => {
      // Fixed: Don't directly assign to the current property
      // Instead, call the proper initialization method
      if (graphHook.cyRef.current) {
        graphHook.cyRef.current.destroy();
      }
      graphHook.setHasError(false);
      graphHook.initializeGraph();
    },
    exportGraph: () => {
      if (!graphHook.cyRef.current) return;
      
      // Create a PNG image of the graph
      const png = graphHook.cyRef.current.png({
        output: 'blob',
        scale: 2,
        bg: '#131118',
        full: true
      });
      
      // Create a download link
      const url = URL.createObjectURL(png);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${network}-${address.substring(0, 6)}...${address.substring(address.length - 4)}-graph.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }));

  return (
    <CytoscapeGraphContent 
      graphHook={graphHook}
      nodes={nodes}
      edges={edges}
    />
  );
});

CytoscapeGraph.displayName = 'CytoscapeGraph';

export default CytoscapeGraph;
