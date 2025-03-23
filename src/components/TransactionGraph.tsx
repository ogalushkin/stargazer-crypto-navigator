import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Loader2, NetworkIcon, ZoomIn, ZoomOut } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import cytoscape from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
}

interface GraphNode {
  id: string;
  label: string;
  isTarget?: boolean;
  isIncoming?: boolean;
  isOutgoing?: boolean;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  value: number;
  isIncoming?: boolean;
}

interface TransactionGraphProps {
  address: string;
  network: string;
  transactions: Transaction[];
  isLoading?: boolean;
}

// Max number of transactions to display to prevent performance issues
const MAX_TRANSACTIONS = 20;

const TransactionGraph: React.FC<TransactionGraphProps> = ({
  address,
  network,
  transactions,
  isLoading = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const navigate = useNavigate();
  const [isRendering, setIsRendering] = useState(false);

  // Process transactions into nodes and edges
  const processGraphData = () => {
    // Limit transactions to prevent performance issues
    const limitedTransactions = transactions.length > MAX_TRANSACTIONS 
      ? transactions.slice(0, MAX_TRANSACTIONS)
      : transactions;
    
    const nodes: GraphNode[] = [{ id: address, label: shortenAddress(address), isTarget: true }];
    const edges: GraphEdge[] = [];
    const nodeSet = new Set<string>([address]);
    
    const incomingNodes = new Set<string>();
    const outgoingNodes = new Set<string>();

    // First pass: identify incoming and outgoing nodes
    limitedTransactions.forEach(tx => {
      if (tx.to === address) {
        incomingNodes.add(tx.from);
      } else if (tx.from === address) {
        outgoingNodes.add(tx.to);
      }
    });

    // Second pass: create nodes with proper type
    limitedTransactions.forEach((tx, index) => {
      // Add nodes if they don't exist
      if (!nodeSet.has(tx.from)) {
        nodes.push({ 
          id: tx.from, 
          label: shortenAddress(tx.from),
          isIncoming: tx.to === address,
          isOutgoing: tx.from === address
        });
        nodeSet.add(tx.from);
      }
      
      if (!nodeSet.has(tx.to)) {
        nodes.push({ 
          id: tx.to, 
          label: shortenAddress(tx.to),
          isIncoming: tx.to === address,
          isOutgoing: tx.from === address
        });
        nodeSet.add(tx.to);
      }
      
      // Convert transaction value to number
      const numValue = parseFloat(tx.value) || 0;
      
      // Add edge
      const isIncoming = tx.to === address;
      edges.push({
        id: `e${index}`,
        source: tx.from,
        target: tx.to,
        label: tx.value,
        value: numValue,
        isIncoming
      });
    });

    return { nodes, edges };
  };

  const shortenAddress = (addr: string): string => {
    return addr.length > 14
      ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
      : addr;
  };

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

  // Calculate edge width based on transaction value using logarithmic scale
  const calculateEdgeWidth = (value: number, edges: GraphEdge[]): number => {
    if (value <= 0) return 1;
    
    // Get min and max values (excluding zero values)
    const values = edges.map(e => e.value).filter(v => v > 0);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    
    // Use logarithmic scaling for better visualization
    // Map to range 1.5px - 8px for better visibility
    if (minValue === maxValue) return 3; // Default midpoint if all values are the same
    
    // Logarithmic scaling - better for crypto values with high variability
    const logMin = Math.log(Math.max(0.000001, minValue));
    const logMax = Math.log(maxValue);
    const logValue = Math.log(Math.max(0.000001, value));
    
    // Scale to 1.5-8px range
    const normalizedValue = (logValue - logMin) / (logMax - logMin);
    return 1.5 + normalizedValue * 6.5; // Scale to range 1.5-8px
  };

  useEffect(() => {
    if (!containerRef.current || isLoading || transactions.length === 0) return;

    setIsRendering(true);
    
    const { nodes, edges } = processGraphData();

    try {
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
              isOutgoing: node.isOutgoing || false
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
              width: calculateEdgeWidth(edge.value, edges),
              isIncoming: edge.isIncoming || false
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
            // Add shadow effect to target node using class instead
            selector: 'node[isTarget]',
            style: {
              'text-background-color': '#4C1D95',
              'z-index': 10 // Ensure target node is on top
            } as cytoscape.Css.Node
          },
          {
            selector: 'edge',
            style: {
              'width': 'data(width)',
              'line-color': '#D946EF',       // Fuchsia for outgoing
              'target-arrow-color': '#D946EF',
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier',
              'label': '',                    // No labels on edges
              'font-size': '8px',
              'color': '#E2E8F0',
              'text-background-color': '#1A1A25',
              'text-background-opacity': 0.7,
              'text-background-padding': '2px',
              'text-rotation': 'autorotate',
              'arrow-scale': 1.3,
              'line-style': 'solid',
              'target-endpoint': '0deg',
              'source-endpoint': '180deg',
              'z-index': 1
            } as cytoscape.Css.Edge
          },
          {
            selector: 'edge[isIncoming]',
            style: {
              'line-color': '#0EA5E9',       // Teal blue for incoming
              'target-arrow-color': '#0EA5E9'
            } as cytoscape.Css.Edge
          },
          {
            selector: 'node[isIncoming]',
            style: {
              'background-color': '#000000',
              'border-color': '#0EA5E9'      // Blue border for incoming nodes
            } as cytoscape.Css.Node
          },
          {
            selector: 'node[isOutgoing]',
            style: {
              'background-color': '#000000',
              'border-color': '#D946EF'      // Pink border for outgoing nodes
            } as cytoscape.Css.Node
          }
        ],
        layout: {
          name: 'preset', // Use preset for initial positioning
          fit: true
        }
      });

      // Apply CSS classes to add shadow effects after creation
      cy.style()
        .selector('node[isTarget]')
        .addClass('node-glow')
        .selector('edge[isIncoming]')
        .addClass('edge-glow-incoming')
        .selector('edge:not([isIncoming])')
        .addClass('edge-glow-outgoing')
        .update();

      // Set up tooltips on hover - show only the transaction amount
      cy.on('mouseover', 'edge', function(event) {
        const edge = event.target;
        const value = edge.data('label'); // Transaction amount
        const color = edge.data('isIncoming') ? '#0EA5E9' : '#D946EF';
        
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

      // Add a more sophisticated layout logic for better immediate visualization
      try {
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
          // Fix nodes in their respective hemispheres (left/right)
          // Using preset positions as a starting point
          randomize: false,
          animate: false,
          // Keep the target node centered
          position: function(node) {
            if (node.data('isTarget')) {
              return { x: 0, y: 0 };
            }
            
            // Keep incoming nodes to the left
            if (node.data('isIncoming')) {
              return { x: -200 - (Math.random() * 100), y: -100 + (Math.random() * 200) };
            }
            
            // Keep outgoing nodes to the right
            return { x: 200 + (Math.random() * 100), y: -100 + (Math.random() * 200) };
          }
        } as cytoscape.LayoutOptions);
        
        layout.run();
        
        // Apply final adjustments and fit to container
        cy.fit(undefined, 50);
      } catch (layoutError) {
        console.error("Error running coseBilkent layout:", layoutError);
        // Fallback to concentric layout if coseBilkent fails
        const fallbackLayout = cy.layout({ 
          name: 'concentric',
          concentric: function(node) {
            if (node.data('isTarget')) return 10;
            if (node.data('isIncoming')) return 5;
            return 0;
          },
          levelWidth: function() { return 2; },
          minNodeSpacing: 50,
          animate: false
        });
        
        fallbackLayout.run();
      }

      // Add click event to nodes for navigation
      cy.on('tap', 'node', function(evt) {
        const nodeId = evt.target.id();
        handleNodeClick(nodeId);
      });

      // Set cursor style when hovering over nodes
      cy.on('mouseover', 'node', function() {
        containerRef.current!.style.cursor = 'pointer';
      });
      
      cy.on('mouseout', 'node', function() {
        containerRef.current!.style.cursor = 'default';
      });

      // Set cursor style when hovering over edges
      cy.on('mouseover', 'edge', function() {
        containerRef.current!.style.cursor = 'default';
      });

      cyRef.current = cy;
    } catch (e) {
      console.error("Error initializing cytoscape:", e);
    } finally {
      setIsRendering(false);
    }

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [containerRef, address, transactions, isLoading, network]);

  // Show loading state
  if (isLoading) {
    return (
      <Card className="bg-stargazer-card border-stargazer-muted/40 h-[500px]">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">Transaction Graph</CardTitle>
        </CardHeader>
        <CardContent className="h-[424px] flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="w-10 h-10 text-violet-500 animate-spin mb-3" />
            <p className="text-white/70">Loading transaction data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show empty state if no transactions
  if (transactions.length === 0) {
    return (
      <Card className="bg-stargazer-card border-stargazer-muted/40 h-[500px]">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">Transaction Graph</CardTitle>
        </CardHeader>
        <CardContent className="h-[424px] flex items-center justify-center">
          <div className="flex flex-col items-center">
            <NetworkIcon className="w-10 h-10 text-white/30 mb-3" />
            <p className="text-white/70 mb-4">No transactions found for this address</p>
            <Button 
              variant="outline" 
              className="bg-stargazer-muted/70 hover:bg-stargazer-muted border-stargazer-muted/80 text-white/80"
              onClick={() => navigate('/')}
            >
              Try Another Address
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Add transaction count and info if we had to limit them
  const transactionCount = transactions.length;
  const isTruncated = transactionCount > MAX_TRANSACTIONS;

  return (
    <Card className="bg-stargazer-card border-stargazer-muted/40 animate-fade-in">
      <CardHeader className="pb-3 flex flex-row justify-between items-center">
        <div>
          <CardTitle className="text-lg font-medium">Transaction Graph</CardTitle>
          {isTruncated && (
            <p className="text-xs text-white/50 mt-1">
              Showing {MAX_TRANSACTIONS} of {transactionCount} transactions for better performance
            </p>
          )}
        </div>
        <div className="flex gap-1.5">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 bg-stargazer-muted/70 hover:bg-stargazer-muted border-stargazer-muted/80"
                  onClick={zoomIn}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Zoom In</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 bg-stargazer-muted/70 hover:bg-stargazer-muted border-stargazer-muted/80"
                  onClick={zoomOut}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Zoom Out</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 bg-stargazer-muted/70 hover:bg-stargazer-muted border-stargazer-muted/80"
                  onClick={fitGraph}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 21V14M3 14H10M3 14L9 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 3H14M14 3V10M14 3L20 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Fit to Screen</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="relative h-[424px] p-0 overflow-hidden">
        {isRendering && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-stargazer-card/80">
            <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
          </div>
        )}
        <div className="relative w-full h-full" ref={containerRef}>
          <div className="absolute bottom-3 left-3 flex items-center gap-4 z-10 p-2 bg-stargazer-card/80 rounded-md">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-[#0EA5E9] rounded-full mr-2"></div>
              <span className="text-xs text-white/70">Incoming</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-[#D946EF] rounded-full mr-2"></div>
              <span className="text-xs text-white/70">Outgoing</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionGraph;
