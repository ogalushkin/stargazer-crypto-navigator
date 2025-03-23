import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { useNavigate } from 'react-router-dom';
import cytoscape from 'cytoscape';
import { Loader2 } from 'lucide-react';
import { GraphNode, GraphEdge } from '@/utils/graphTypes';
import { NetworkType } from '@/utils/types';
import { shortenAddress } from '@/utils/graphUtils';
import GraphLegend from './GraphLegend';
import { toast } from 'sonner';
import { getCytoscapeStyles } from './CytoscapeStyles';
import { getLayoutConfig, getPresetLayoutConfig } from './CytoscapeLayoutConfig';
import { createGraphElements } from './CytoscapeInitializer';
import CytoscapeErrorBoundary from './CytoscapeErrorBoundary';

interface CytoscapeGraphProps {
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

const CytoscapeGraph = forwardRef<CytoscapeGraphRef, CytoscapeGraphProps>(({
  address,
  network,
  nodes,
  edges,
  onSelectTransaction,
  selectedTransaction
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const navigate = useNavigate();
  const [isRendering, setIsRendering] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  // Expose methods for the parent component using the proper forwardRef pattern
  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      if (cyRef.current) {
        cyRef.current.zoom(cyRef.current.zoom() * 1.2);
      }
    },
    zoomOut: () => {
      if (cyRef.current) {
        cyRef.current.zoom(cyRef.current.zoom() * 0.8);
      }
    },
    fitGraph: () => {
      if (cyRef.current) {
        cyRef.current.fit(undefined, 50);
      }
    },
    rebuildGraph: () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
      setHasError(false);
      initializeGraph();
    },
    exportGraph: () => {
      if (!cyRef.current) return;
      
      // Create a PNG image of the graph
      const png = cyRef.current.png({
        output: 'blob',
        scale: 2,
        bg: '#131118',
        full: true
      });
      
      // Create a download link
      const url = URL.createObjectURL(png);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${network}-${shortenAddress(address)}-graph.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }));
  
  const handleNodeClick = (nodeId: string) => {
    if (nodeId !== address) {
      navigate(`/address/${network}/${nodeId}`);
    }
  };

  const highlightTransaction = (hash: string | null) => {
    if (!cyRef.current) return;
    
    // Reset all edges first
    cyRef.current.edges().removeClass('highlighted');
    
    if (hash) {
      // Find and highlight the specific edge
      const edge = cyRef.current.edges().filter(e => e.data('hash') === hash);
      if (edge.length > 0) {
        edge.addClass('highlighted');
        
        // Center the view on this edge
        cyRef.current.fit(edge, 100);
      }
    }
    
    onSelectTransaction(hash);
  };

  const initializeGraph = () => {
    if (!containerRef.current || !nodes.length) {
      console.log("Skipping graph initialization:", { 
        hasContainer: !!containerRef.current, 
        nodesLength: nodes.length 
      });
      return;
    }

    console.log("Initializing graph with nodes/edges:", nodes.length, edges.length);
    setIsRendering(true);
    setHasError(false);
    
    try {
      // Clean up previous instance if it exists
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }

      // Create graph elements 
      const elements = createGraphElements(nodes, edges);
      console.log("Creating cytoscape with elements:", elements.length);

      // Initialize cytoscape with a preset layout for initial positioning
      const cy = cytoscape({
        container: containerRef.current,
        elements: elements,
        style: getCytoscapeStyles() as any, // Use 'any' temporarily to fix the type issue
        layout: getPresetLayoutConfig()
      });

      console.log("Cytoscape instance created successfully");

      // Add events after initialization
      cy.on('tap', 'node', function(evt) {
        const nodeId = evt.target.id();
        handleNodeClick(nodeId);
      });
      
      cy.on('tap', 'edge', function(evt) {
        const hash = evt.target.data('hash');
        highlightTransaction(hash);
      });
      
      // Cursor styles
      cy.on('mouseover', 'node, edge', function() {
        if (containerRef.current) {
          containerRef.current.style.cursor = 'pointer';
        }
      });
      
      cy.on('mouseout', 'node, edge', function() {
        if (containerRef.current) {
          containerRef.current.style.cursor = 'default';
        }
      });

      // Apply layout after initialization
      const layout = cy.layout(getLayoutConfig(address) as any);
      layout.run();
      
      // Fit to container after layout completes
      cy.on('layoutstop', function() {
        cy.fit(undefined, 50);
        console.log("Layout completed and fitted to view");
      });

      // Highlight selected transaction
      if (selectedTransaction) {
        const edge = cy.edges().filter(e => e.data('hash') === selectedTransaction);
        if (edge.length > 0) {
          edge.addClass('highlighted');
        }
      }

      cyRef.current = cy;
      console.log("Cytoscape graph initialized successfully");
      
      // Add a small toast notification
      toast.success("Graph rendered successfully", {
        position: "bottom-right",
        duration: 2000,
      });
    } catch (error) {
      console.error("Error initializing cytoscape:", error);
      setHasError(true);
      toast.error("Failed to render graph. Try rebuilding.", {
        position: "bottom-right",
        duration: 4000,
      });
    } finally {
      setIsRendering(false);
    }
  };

  // Initialize or update the graph when component mounts or data changes
  useEffect(() => {
    console.log("CytoscapeGraph effect triggered", { 
      address, 
      nodesCount: nodes.length, 
      edgesCount: edges.length 
    });
    
    if (nodes.length > 0 && edges.length > 0) {
      initializeGraph();
    }
    
    return () => {
      if (cyRef.current) {
        console.log("Cleaning up cytoscape instance");
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [address, network, JSON.stringify(nodes), JSON.stringify(edges)]);

  return (
    <div className="relative w-full h-full" ref={containerRef}>
      <CytoscapeErrorBoundary 
        hasError={hasError}
        retry={() => {
          setHasError(false);
          initializeGraph();
        }}
      />
      
      {isRendering && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-stargazer-card/80">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
        </div>
      )}
      
      {!isRendering && nodes.length > 0 && edges.length > 0 && !hasError && (
        <GraphLegend showCategories={true} />
      )}
    </div>
  );
});

CytoscapeGraph.displayName = 'CytoscapeGraph';

export default CytoscapeGraph;
