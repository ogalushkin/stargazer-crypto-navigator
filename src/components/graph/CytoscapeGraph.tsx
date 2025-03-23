import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import cytoscape from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';
import { Loader2 } from 'lucide-react';
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

// Register the layout extension only once
try {
  // Check if the coseBilkent layout is not already registered
  if (!cytoscape.prototype.hasInitializedCoseBilkent) {
    cytoscape.use(coseBilkent);
    // Mark as initialized to avoid multiple registrations
    cytoscape.prototype.hasInitializedCoseBilkent = true;
    console.log("coseBilkent layout registered successfully");
  }
} catch (e) {
  console.error("Failed to register coseBilkent layout:", e);
}

interface CytoscapeGraphProps {
  address: string;
  network: NetworkType;
  nodes: GraphNode[];
  edges: GraphEdge[];
  onSelectTransaction: (hash: string | null) => void;
  selectedTransaction: string | null;
}

const CytoscapeGraph: React.FC<CytoscapeGraphProps> = ({
  address,
  network,
  nodes,
  edges,
  onSelectTransaction,
  selectedTransaction
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const navigate = useNavigate();
  const [isRendering, setIsRendering] = useState(false);
  
  const handleNodeClick = (nodeId: string) => {
    if (nodeId !== address) {
      navigate(`/address/${network}/${nodeId}`);
    }
  };

  const zoomIn = () => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 1.2);
    }
  };

  const zoomOut = () => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 0.8);
    }
  };

  const fitGraph = () => {
    if (cyRef.current) {
      cyRef.current.fit(undefined, 50);
    }
  };

  const rebuildGraph = () => {
    if (cyRef.current) {
      cyRef.current.destroy();
      cyRef.current = null;
      initializeGraph();
    }
  };

  const exportGraph = () => {
    if (!cyRef.current) return;
    
    // Create a PNG image of the graph
    const png = cyRef.current.png({
      output: 'blob',
      scale: 2, // Higher resolution
      bg: '#131118', // Match background color
      full: true // Capture the full graph
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
    
    try {
      // Clean up previous instance if it exists
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }

      // Initialize cytoscape with a layout that immediately positions nodes
      const cy = cytoscape({
        container: containerRef.current,
        elements: [
          ...nodes.map(node => ({
            data: { 
              id: node.id, 
              label: node.label,
              isTarget: node.isTarget || false,
              isIncoming: node.isIncoming || false,
              isOutgoing: node.isOutgoing || false,
              category: node.category || 'uncategorized'
            },
            // Pre-position nodes for immediate visual layout
            position: node.isTarget ? 
              { x: 0, y: 0 } : // Center for target node
              node.isIncoming ? 
                { x: -250 + (Math.random() * 50), y: -100 + (Math.random() * 200) } : // Left for incoming
                { x: 250 - (Math.random() * 50), y: -100 + (Math.random() * 200) } // Right for outgoing
          })),
          ...edges.map(edge => ({
            data: { 
              id: edge.id, 
              source: edge.source, 
              target: edge.target, 
              label: edge.label,
              value: edge.value,
              width: edge.value ? (Math.log10(edge.value + 1) * 2.5) : 1,
              isIncoming: edge.isIncoming || false,
              isSelfTransfer: edge.isSelfTransfer || false,
              hash: edge.hash,
              timestamp: edge.timestamp
            }
          }))
        ],
        style: [
          {
            selector: 'node',
            style: {
              'background-color': '#000000', // Black fill for nodes
              'border-color': '#454560',     // Subtle border
              'border-width': 1,
              'width': 42,
              'height': 42,
              'label': 'data(label)',
              'color': '#FFFFFF',            // White text
              'text-background-color': '#1A1A25',
              'text-background-opacity': 0.7,
              'text-background-padding': '2px',
              'text-valign': 'bottom',
              'text-halign': 'center',
              'font-size': '11px',
              'text-margin-y': 6,
              'font-family': 'system-ui, -apple-system, sans-serif', // Clean font
              'text-outline-width': 1,
              'text-outline-color': '#131118',
              'text-outline-opacity': 0.8
            } as cytoscape.Css.Node
          },
          {
            selector: 'node[isTarget]',
            style: {
              'background-color': '#000000',
              'border-color': '#9b87f5',    // Purple border for target node
              'border-width': 2,
              'width': 55,
              'height': 55,
              'font-weight': 'bold',
              'font-size': '12px',
              'text-background-color': '#4C1D95',
              'z-index': 10 // Ensure target node is on top
            } as cytoscape.Css.Node
          },
          {
            selector: 'node[category="exchange"]',
            style: {
              'border-color': CATEGORY_COLORS.exchange
            } as cytoscape.Css.Node
          },
          {
            selector: 'node[category="deposit"]',
            style: {
              'border-color': CATEGORY_COLORS.deposit
            } as cytoscape.Css.Node
          },
          {
            selector: 'node[category="individual"]',
            style: {
              'border-color': CATEGORY_COLORS.individual
            } as cytoscape.Css.Node
          },
          {
            selector: 'node[category="dex"]',
            style: {
              'border-color': CATEGORY_COLORS.dex
            } as cytoscape.Css.Node
          },
          {
            selector: 'node[category="lending"]',
            style: {
              'border-color': CATEGORY_COLORS.lending
            } as cytoscape.Css.Node
          },
          {
            selector: 'node[category="uncategorized"]',
            style: {
              'border-color': CATEGORY_COLORS.uncategorized
            } as cytoscape.Css.Node
          },
          {
            selector: 'edge',
            style: {
              'width': 'data(width)',
              'line-color': OUTGOING_COLOR,  // Outgoing edge color
              'target-arrow-color': OUTGOING_COLOR,
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier',
              // Key improvements for center-aligned edges
              'target-endpoint': 'center',  // Force edges to connect at center
              'source-endpoint': 'center',  // Force edges to connect at center
              'edge-distances': 'node-position', // Calculate from node centers
              'control-point-step-size': 40, // Add spacing between parallel edges
              'control-point-weight': 0.5,   // Control bezier curve
              'label': '',                   // No labels on edges by default
              'font-size': '8px',
              'color': '#E2E8F0',
              'text-background-color': '#1A1A25',
              'text-background-opacity': 0.7,
              'text-background-padding': '2px',
              'text-rotation': 'autorotate',
              'arrow-scale': 1.3,
              'line-style': 'solid',
              'z-index': 1
            } as cytoscape.Css.Edge
          },
          {
            selector: 'edge[isIncoming]',
            style: {
              'line-color': INCOMING_COLOR,  // Incoming edge color
              'target-arrow-color': INCOMING_COLOR
            } as cytoscape.Css.Edge
          },
          {
            selector: 'edge[isSelfTransfer]',
            style: {
              'line-color': SELF_TRANSFER_COLOR,  // Self-transfer color
              'target-arrow-color': SELF_TRANSFER_COLOR,
              'line-style': 'dashed'
            } as cytoscape.Css.Edge
          },
          {
            selector: 'edge.highlighted',
            style: {
              'line-color': '#FFFFFF',
              'target-arrow-color': '#FFFFFF',
              'line-style': 'solid',
              'width': 'data(width)',
              'z-index': 999,
              'shadow-blur': 10,
              'shadow-color': '#FFFFFF',
              'shadow-opacity': 0.5
            } as cytoscape.Css.Edge
          },
          {
            selector: 'node[isIncoming]',
            style: {
              'background-color': '#000000',
              'border-color': INCOMING_COLOR  // Green border for incoming nodes
            } as cytoscape.Css.Node
          },
          {
            selector: 'node[isOutgoing]',
            style: {
              'background-color': '#000000',
              'border-color': OUTGOING_COLOR  // Red border for outgoing nodes
            } as cytoscape.Css.Node
          }
        ],
        layout: {
          name: 'preset', // Use preset for initial positioning
          fit: true
        }
      });

      // Add CSS classes for shadow/glow effects
      cy.nodes().forEach(node => {
        if (node.data('isTarget')) {
          node.addClass('node-glow');
        }
      });
      
      cy.edges().forEach(edge => {
        if (edge.data('isIncoming')) {
          edge.addClass('edge-glow-incoming');
        } else if (edge.data('isSelfTransfer')) {
          edge.addClass('edge-glow-self');
        } else {
          edge.addClass('edge-glow-outgoing');
        }
      });

      // Set up tooltips on hover - show only the transaction amount
      cy.on('mouseover', 'edge', function(event) {
        const edge = event.target;
        const value = edge.data('label'); // Transaction amount
        let color = edge.data('isSelfTransfer') 
          ? SELF_TRANSFER_COLOR 
          : edge.data('isIncoming') ? INCOMING_COLOR : OUTGOING_COLOR;
        
        // Create minimalist tooltip
        edge.popperRefObj = edge.popper({
          content: () => {
            const content = document.createElement('div');
            content.innerHTML = `
              <div style="background-color: #1A1A25; color: white; padding: 8px 12px; border-radius: 6px; 
                          border: 1px solid ${color}; font-size: 12px; font-weight: 500; 
                          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); text-align: center;
                          font-family: system-ui, -apple-system, sans-serif;">
                ${value}
              </div>
            `;
            document.body.appendChild(content);
            return content;
          },
          popper: {
            placement: 'top',
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [0, 8],
                },
              },
              {
                name: 'preventOverflow',
                options: {
                  padding: 8,
                },
              },
            ],
          }
        });
        
        edge.popperRefObj.update();
      });
      
      cy.on('mouseout', 'edge', function(event) {
        const edge = event.target;
        if (edge.popperRefObj) {
          edge.popperRefObj.destroy();
          edge.popperRefObj = null;
        }
      });

      // Apply coseBilkent layout with constraints to maintain the left/right grouping
      const layout = cy.layout({
        name: 'coseBilkent',
        fit: true,
        padding: 50,
        nodeDimensionsIncludeLabels: true,
        nodeRepulsion: 8000,
        idealEdgeLength: 150,
        edgeElasticity: 0.45,
        nestingFactor: 0.1,
        gravity: 0.25,
        // Using preset positions as a starting point
        randomize: false,
        animate: true, // Enable animation
        animationDuration: 700, // Animation duration in ms
        animationEasing: 'ease-in-out-cubic', // Smooth animation curve
        // Keep the target node centered
        position: function(node) {
          // Fix target node at center
          if (node.data('isTarget')) {
            return { x: 0, y: 0 };
          }
          
          // Keep incoming nodes to the left
          if (node.data('isIncoming')) {
            return { x: -200 - (Math.random() * 100), y: -100 + (Math.random() * 200) };
          }
          
          // Keep outgoing nodes to the right
          return { x: 200 + (Math.random() * 100), y: -100 + (Math.random() * 200) };
        },
        // Lock the target node in place to keep it centered
        fixedNodeConstraint: [{ nodeId: address, position: { x: 0, y: 0 } }]
      } as cytoscape.LayoutOptions);
      
      layout.run();
      
      // Fit to container after layout completes
      cy.on('layoutstop', function() {
        cy.fit(undefined, 50);
        console.log("Layout completed and fitted to view");
      });

      // Add click event to nodes for navigation
      cy.on('tap', 'node', function(evt) {
        const nodeId = evt.target.id();
        handleNodeClick(nodeId);
      });
      
      // Add click event to edges for highlighting
      cy.on('tap', 'edge', function(evt) {
        const hash = evt.target.data('hash');
        highlightTransaction(hash);
      });

      // Set cursor style when hovering over nodes
      cy.on('mouseover', 'node', function() {
        if (containerRef.current) {
          containerRef.current.style.cursor = 'pointer';
        }
      });
      
      cy.on('mouseout', 'node', function() {
        if (containerRef.current) {
          containerRef.current.style.cursor = 'default';
        }
      });

      // Set cursor style when hovering over edges
      cy.on('mouseover', 'edge', function() {
        if (containerRef.current) {
          containerRef.current.style.cursor = 'pointer';
        }
      });
      
      cy.on('mouseout', 'edge', function() {
        if (containerRef.current) {
          containerRef.current.style.cursor = 'default';
        }
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
    } catch (e) {
      console.error("Error initializing cytoscape:", e);
    } finally {
      setIsRendering(false);
    }
  };

  // Initialize or update the graph when component mounts or data changes
  useEffect(() => {
    initializeGraph();
    
    return () => {
      if (cyRef.current) {
        console.log("Cleaning up cytoscape instance");
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [address, network, nodes, edges, selectedTransaction]);

  return (
    <div className="relative w-full h-full" ref={containerRef}>
      {isRendering && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-stargazer-card/80">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
        </div>
      )}
      <GraphLegend />
    </div>
  );
};

export default CytoscapeGraph;
