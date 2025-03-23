
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
    const nodes: GraphNode[] = [{ id: address, label: shortenAddress(address), isTarget: true }];
    const edges: GraphEdge[] = [];
    const nodeSet = new Set<string>([address]);
    
    const incomingNodes = new Set<string>();
    const outgoingNodes = new Set<string>();

    // First pass: identify incoming and outgoing nodes
    transactions.forEach(tx => {
      if (tx.to === address) {
        incomingNodes.add(tx.from);
      } else if (tx.from === address) {
        outgoingNodes.add(tx.to);
      }
    });

    // Second pass: create nodes with proper type
    transactions.forEach((tx, index) => {
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

  // Calculate edge width based on transaction value
  const calculateEdgeWidth = (value: number, edges: GraphEdge[]): number => {
    if (value <= 0) return 1;
    
    // Get min and max values (excluding zero values)
    const values = edges.map(e => e.value).filter(v => v > 0);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    
    // Use logarithmic scaling for better visualization
    // Map to range 1px - 8px
    if (minValue === maxValue) return 3; // Default midpoint if all values are the same
    
    // Logarithmic scaling - better for crypto values with high variability
    const logMin = Math.log(Math.max(0.000001, minValue));
    const logMax = Math.log(maxValue);
    const logValue = Math.log(Math.max(0.000001, value));
    
    // Scale to 1-8px range
    const normalizedValue = (logValue - logMin) / (logMax - logMin);
    return 1 + normalizedValue * 7; // Scale to range 1-8px
  };

  useEffect(() => {
    if (!containerRef.current || isLoading || transactions.length === 0) return;

    setIsRendering(true);
    
    const { nodes, edges } = processGraphData();

    try {
      // Initialize cytoscape with a basic layout first
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
            }
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
              'background-color': '#2D2D3D',
              'border-color': '#454560',
              'border-width': 1,
              'width': 40,
              'height': 40,
              'label': 'data(label)',
              'color': '#E2E8F0',
              'text-background-color': '#1A1A25',
              'text-background-opacity': 0.7,
              'text-background-padding': '2px',
              'text-valign': 'bottom',
              'text-halign': 'center',
              'font-size': '10px',
              'text-margin-y': 6
            }
          },
          {
            selector: 'node[isTarget]',
            style: {
              'background-color': '#8B5CF6',
              'border-color': '#A78BFA',
              'border-width': 2,
              'width': 50,
              'height': 50,
              'font-weight': 'bold',
              'text-background-color': '#4C1D95'
            }
          },
          {
            selector: 'edge',
            style: {
              'width': 'data(width)',
              'line-color': '#EA384C',
              'target-arrow-color': '#EA384C',
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier',
              'label': '',  // Don't show labels on edges, we'll use tooltips
              'font-size': '8px',
              'color': '#E2E8F0',
              'text-background-color': '#1A1A25',
              'text-background-opacity': 0.7,
              'text-background-padding': '2px',
              'text-rotation': 'autorotate'
            }
          },
          {
            selector: 'edge[isIncoming]',
            style: {
              'line-color': '#10B981',
              'target-arrow-color': '#10B981'
            }
          },
          {
            selector: 'node[isIncoming]',
            style: {
              'background-color': '#065F46',
              'border-color': '#10B981'
            }
          },
          {
            selector: 'node[isOutgoing]',
            style: {
              'background-color': '#7F1D1D',
              'border-color': '#EF4444'
            }
          }
        ],
        layout: {
          name: 'grid', // Start with a simple layout
          fit: true
        }
      });

      // Add tooltips to edges
      cy.on('mouseover', 'edge', function(event) {
        const edge = event.target;
        const sourceNode = edge.source().data('label');
        const targetNode = edge.target().data('label');
        const value = edge.data('label');
        const direction = edge.data('isIncoming') ? 'Incoming' : 'Outgoing';
        const color = edge.data('isIncoming') ? 'green' : 'red';
        
        // Use native tooltip (simpler implementation)
        edge.popperRefObj = edge.popper({
          content: () => {
            const content = document.createElement('div');
            content.innerHTML = `
              <div style="background-color: #1A1A25; color: white; padding: 8px 12px; border-radius: 4px; 
                          border: 1px solid #454560; font-size: 12px; max-width: 200px;
                          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)">
                <div style="margin-bottom: 4px; display: flex; align-items: center;">
                  <span style="display: inline-block; width: 8px; height: 8px; 
                               background-color: ${color}; border-radius: 50%; margin-right: 6px;"></span>
                  <span style="font-weight: 600;">${direction} Transaction</span>
                </div>
                <div style="margin-bottom: 4px;">
                  <span style="color: #A1A1AA;">Amount:</span> 
                  <span style="font-weight: 500;">${value}</span>
                </div>
                <div style="font-size: 11px; color: #A1A1AA;">
                  ${sourceNode} → ${targetNode}
                </div>
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

      // After initialization, run a more complex layout that separates incoming and outgoing nodes
      try {
        const layout = cy.layout({
          name: 'coseBilkent',
          fit: true,
          padding: 50,
          // Use positions to manipulate the layout:
          // Target in the center, incoming nodes on the left, outgoing on the right
          positions: function(node) {
            // Using any here to allow additional properties
            const nodeData = node.data() as any;
            if (nodeData.isTarget) {
              // Center
              return { x: 0, y: 0 };
            } else if (node.data('isIncoming')) {
              // Left side (incoming)
              return { x: -200, y: Math.random() * 200 - 100 };
            } else {
              // Right side (outgoing)
              return { x: 200, y: Math.random() * 200 - 100 };
            }
          },
          // TypeScript doesn't know about additional coseBilkent-specific options
          // so we need to use type assertion
          nodeDimensionsIncludeLabels: true,
          randomize: false,
          nodeRepulsion: 8000,
          idealEdgeLength: 150,
          edgeElasticity: 0.45,
          nestingFactor: 0.1,
          gravity: 0.25,
          numIter: 2500
        } as cytoscape.LayoutOptions);
        
        layout.run();
        console.log("coseBilkent layout run successfully");
      } catch (layoutError) {
        console.error("Error running coseBilkent layout:", layoutError);
        // Fallback to grid layout if coseBilkent fails
        cy.layout({ name: 'grid', fit: true }).run();
      }

      // Add click event to nodes
      cy.on('tap', 'node', function(evt) {
        const nodeId = evt.target.id();
        handleNodeClick(nodeId);
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

  return (
    <Card className="bg-stargazer-card border-stargazer-muted/40 animate-fade-in">
      <CardHeader className="pb-3 flex flex-row justify-between items-center">
        <CardTitle className="text-lg font-medium">Transaction Graph</CardTitle>
        <div className="flex gap-1.5">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 bg-stargazer-muted/70 hover:bg-stargazer-muted border-stargazer-muted/80"
            onClick={zoomIn}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 bg-stargazer-muted/70 hover:bg-stargazer-muted border-stargazer-muted/80"
            onClick={zoomOut}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="relative h-[424px] p-0 overflow-hidden">
        {isRendering && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-stargazer-card/80">
            <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
          </div>
        )}
        <div className="w-full h-full" ref={containerRef} />
      </CardContent>
    </Card>
  );
};

export default TransactionGraph;
