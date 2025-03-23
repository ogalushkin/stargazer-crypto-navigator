
import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import cytoscape from 'cytoscape';
import { GraphNode, GraphEdge } from '@/utils/graphTypes';
import { shortenAddress } from '@/utils/graphUtils';
import { toast } from 'sonner';
import { getCytoscapeStyles } from '../CytoscapeStyles';
import { getLayoutConfig, getPresetLayoutConfig } from '../CytoscapeLayoutConfig';
import { createGraphElements } from '../CytoscapeInitializer';
import { UseCytoscapeGraphReturn } from '../types/CytoscapeTypes';

export function useCytoscapeGraph(
  address: string,
  network: string,
  nodes: GraphNode[],
  edges: GraphEdge[],
  onSelectTransaction: (hash: string | null) => void,
  selectedTransaction: string | null
): UseCytoscapeGraphReturn {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const navigate = useNavigate();
  const [isRendering, setIsRendering] = useState(false);
  const [hasError, setHasError] = useState(false);

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
        // No need to explicitly set cyRef.current = null
        // as this will be overwritten below when we create a new instance
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

      // Properly set the cytoscape instance
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
        // Not setting cyRef.current = null in cleanup as it's a read-only property
      }
    };
  }, [address, network, JSON.stringify(nodes), JSON.stringify(edges)]);

  return {
    containerRef,
    cyRef,
    isRendering,
    hasError,
    initializeGraph,
    highlightTransaction,
    handleNodeClick,
    setHasError
  };
}
