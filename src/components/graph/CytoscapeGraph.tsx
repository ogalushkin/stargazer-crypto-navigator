
import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { useNavigate } from 'react-router-dom';
import cytoscape from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';
import { Loader2, AlertTriangle } from 'lucide-react';
import { GraphNode, GraphEdge } from '@/utils/graphTypes';
import { NetworkType } from '@/utils/types';
import { 
  INCOMING_COLOR, 
  OUTGOING_COLOR, 
  SELF_TRANSFER_COLOR, 
  shortenAddress,
  CATEGORY_COLORS
} from '@/utils/graphUtils';
import GraphLegend from './GraphLegend';
import { toast } from 'sonner';

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

      // Create graph elements with safer defaults
      const elements = [];
      
      // Add nodes with safe defaults
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
      
      // Add edges with safe defaults
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

      console.log("Creating cytoscape with elements:", elements.length);

      // Initialize cytoscape with a preset layout for initial positioning
      const cy = cytoscape({
        container: containerRef.current,
        elements: elements,
        style: [
          {
            selector: 'node',
            style: {
              'background-color': '#000000',
              'border-color': '#454560',
              'border-width': 1,
              'width': 42,
              'height': 42,
              'label': 'data(label)',
              'color': '#FFFFFF',
              'text-background-color': '#1A1A25',
              'text-background-opacity': 0.7,
              'text-background-padding': '2px',
              'text-valign': 'bottom',
              'text-halign': 'center',
              'font-size': '11px',
              'text-margin-y': 6,
              'font-family': 'system-ui, -apple-system, sans-serif',
              'text-outline-width': 1,
              'text-outline-color': '#131118',
              'text-outline-opacity': 0.8
            }
          },
          {
            selector: 'node[isTarget]',
            style: {
              'background-color': '#000000',
              'border-color': '#9b87f5',
              'border-width': 2,
              'width': 55,
              'height': 55,
              'font-weight': 'bold',
              'font-size': '12px',
              'text-background-color': '#4C1D95',
              'z-index': 10
            }
          },
          // Category styles
          {
            selector: 'node[category="exchange"]',
            style: {
              'border-color': CATEGORY_COLORS.exchange
            }
          },
          {
            selector: 'node[category="deposit"]',
            style: {
              'border-color': CATEGORY_COLORS.deposit
            }
          },
          {
            selector: 'node[category="individual"]',
            style: {
              'border-color': CATEGORY_COLORS.individual
            }
          },
          {
            selector: 'node[category="dex"]',
            style: {
              'border-color': CATEGORY_COLORS.dex
            }
          },
          {
            selector: 'node[category="lending"]',
            style: {
              'border-color': CATEGORY_COLORS.lending
            }
          },
          {
            selector: 'node[category="uncategorized"]',
            style: {
              'border-color': CATEGORY_COLORS.uncategorized
            }
          },
          // Edge styles
          {
            selector: 'edge',
            style: {
              'width': 'data(width)',
              'line-color': OUTGOING_COLOR,
              'target-arrow-color': OUTGOING_COLOR,
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier',
              'target-endpoint': 'outside-to-node',
              'source-endpoint': 'outside-to-node',
              'edge-distances': 'node-position',
              'control-point-step-size': 40,
              'control-point-weight': 0.5,
              'label': '',
              'font-size': '8px',
              'color': '#E2E8F0',
              'text-background-color': '#1A1A25',
              'text-background-opacity': 0.7,
              'text-background-padding': '2px',
              'text-rotation': 'autorotate',
              'arrow-scale': 1.3,
              'line-style': 'solid',
              'z-index': 1
            }
          },
          {
            selector: 'edge[isIncoming]',
            style: {
              'line-color': INCOMING_COLOR,
              'target-arrow-color': INCOMING_COLOR
            }
          },
          {
            selector: 'edge[isSelfTransfer]',
            style: {
              'line-color': SELF_TRANSFER_COLOR,
              'target-arrow-color': SELF_TRANSFER_COLOR,
              'line-style': 'dashed'
            }
          },
          {
            selector: 'edge.highlighted',
            style: {
              'line-color': '#FFFFFF',
              'target-arrow-color': '#FFFFFF',
              'line-style': 'solid',
              'width': 'data(width)',
              'z-index': 999,
              // Remove the shadow-color property that's causing the error
              // 'shadow-color': '#FFFFFF',
              // 'shadow-opacity': 0.5
              // Instead, use a larger width for emphasis
              'width': function(ele) {
                // Get original width and add 2px for emphasis
                const originalWidth = ele.data('width') || 1;
                return originalWidth + 2;
              },
              'opacity': 1
            }
          },
          {
            selector: 'node[isIncoming]',
            style: {
              'background-color': '#000000',
              'border-color': INCOMING_COLOR
            }
          },
          {
            selector: 'node[isOutgoing]',
            style: {
              'background-color': '#000000',
              'border-color': OUTGOING_COLOR
            }
          }
        ],
        layout: {
          name: 'preset',
          fit: true
        }
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
      const layout = cy.layout({
        name: 'cose-bilkent',
        fit: true,
        padding: 50,
        nodeDimensionsIncludeLabels: true,
        nodeRepulsion: 8000,
        idealEdgeLength: 150,
        edgeElasticity: 0.45,
        nestingFactor: 0.1,
        gravity: 0.25,
        randomize: false,
        animate: true,
        animationDuration: 700,
        animationEasing: 'ease-in-out-cubic',
        // Place nodes smartly
        position: function(node) {
          const data = node.data();
          if (data.isTarget) {
            return { x: 0, y: 0 };
          }
          if (data.isIncoming) {
            return { x: -200 - (Math.random() * 100), y: -100 + (Math.random() * 200) };
          }
          return { x: 200 + (Math.random() * 100), y: -100 + (Math.random() * 200) };
        },
        fixedNodeConstraint: [{ nodeId: address, position: { x: 0, y: 0 } }]
      } as any);
      
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

  if (hasError) {
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center bg-stargazer-card/30">
        <AlertTriangle className="w-10 h-10 text-yellow-500 mb-3" />
        <p className="text-white/70 mb-4">Failed to render the graph</p>
        <button 
          className="px-4 py-2 bg-stargazer-muted/50 hover:bg-stargazer-muted text-white rounded-md"
          onClick={() => {
            setHasError(false);
            initializeGraph();
          }}
        >
          Try Again
        </button>
        <GraphLegend showCategories={true} />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full" ref={containerRef}>
      {isRendering && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-stargazer-card/80">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
        </div>
      )}
      
      {!isRendering && nodes.length > 0 && edges.length > 0 && (
        <GraphLegend showCategories={true} />
      )}
    </div>
  );
});

CytoscapeGraph.displayName = 'CytoscapeGraph';

export default CytoscapeGraph;
