
import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import cytoscape from 'cytoscape';
import { GraphNode, GraphEdge } from '@/utils/graphTypes';
import { shortenAddress } from '@/utils/graphUtils';
import { toast } from 'sonner';
import { getCytoscapeStyles } from '../CytoscapeStyles';
import { getLayoutConfig, getPresetLayoutConfig, getPostInteractionLayoutConfig } from '../CytoscapeLayoutConfig';
import { createGraphElements } from '../CytoscapeInitializer';
import { UseCytoscapeGraphReturn } from '../types/CytoscapeTypes';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';

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
  const tooltipRef = useRef<any>(null);

  const handleNodeClick = (nodeId: string) => {
    if (nodeId !== address) {
      navigate(`/graph/${network}/${nodeId}`);
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

  const rebalanceLayout = () => {
    if (!cyRef.current) return;
    
    // Apply a gentle layout to rebalance the graph after interactions
    const layout = cyRef.current.layout(getPostInteractionLayoutConfig(address) as any);
    layout.run();
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
      }

      // Create graph elements 
      const elements = createGraphElements(nodes, edges);
      console.log("Creating cytoscape with elements:", elements.length);

      // Initialize cytoscape with a preset layout for initial positioning
      const cy = cytoscape({
        container: containerRef.current,
        elements: elements,
        style: getCytoscapeStyles() as any,
        layout: getPresetLayoutConfig(),
        wheelSensitivity: 0.3,
        minZoom: 0.2,
        maxZoom: 3.0,
        panningEnabled: true,
        boxSelectionEnabled: false,
        autoungrabify: false
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
      
      // Enhanced drag behavior for better node movement
      cy.on('dragfree', function(evt) {
        setTimeout(rebalanceLayout, 300);
      });

      // Fix for tooltips: use DOM element for tooltip container instead of popperRef
      cy.on('mouseover', 'edge', function(evt) {
        const edge = evt.target;
        edge.addClass('hover');
        
        const amount = edge.data('label');
        const from = shortenAddress(edge.data('source'));
        const to = shortenAddress(edge.data('target'));
        const timestamp = edge.data('timestamp') ? new Date(edge.data('timestamp') * 1000).toLocaleString() : 'Unknown';
        
        const content = `
          <div style="text-align: left; font-size: 12px; padding: 5px;">
            <div><strong>Amount:</strong> ${amount}</div>
            <div><strong>From:</strong> ${from}</div>
            <div><strong>To:</strong> ${to}</div>
            <div><strong>Time:</strong> ${timestamp}</div>
          </div>
        `;
        
        if (tooltipRef.current) {
          tooltipRef.current.destroy();
        }
        
        // Create a div element for the tooltip to attach to
        const renderedNode = edge.renderer().hoverData.capture;
        if (!renderedNode) return;
        
        // Create a tooltip instance
        if (containerRef.current) {
          tooltipRef.current = tippy(containerRef.current, {
            content: content,
            placement: 'right',
            arrow: true,
            theme: 'stargazer',
            appendTo: document.body,
            trigger: 'manual',
            interactive: true,
            allowHTML: true,
            getReferenceClientRect: () => {
              // Use mouse position for tooltip positioning
              const renderedPosition = edge.renderedMidpoint();
              const containerRect = containerRef.current?.getBoundingClientRect() || new DOMRect();
              
              return {
                width: 0,
                height: 0,
                top: containerRect.top + renderedPosition.y,
                left: containerRect.left + renderedPosition.x,
                right: containerRect.left + renderedPosition.x,
                bottom: containerRect.top + renderedPosition.y
              };
            }
          });
          
          tooltipRef.current.show();
        }
      });
      
      cy.on('mouseout', 'edge', function(evt) {
        evt.target.removeClass('hover');
        if (tooltipRef.current) {
          tooltipRef.current.destroy();
          tooltipRef.current = null;
        }
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
      }
      
      if (tooltipRef.current) {
        tooltipRef.current.destroy();
        tooltipRef.current = null;
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
    setHasError,
    rebalanceLayout
  };
}
