import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Loader2, NetworkIcon, ZoomIn, ZoomOut } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import cytoscape from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';

// Register the cose-bilkent layout
if (!cytoscape.use) {
  console.error("Cytoscape.use is not available");
} else {
  cytoscape.use(coseBilkent);
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
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
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

    transactions.forEach((tx, index) => {
      // Add nodes if they don't exist
      if (!nodeSet.has(tx.from)) {
        nodes.push({ id: tx.from, label: shortenAddress(tx.from) });
        nodeSet.add(tx.from);
      }
      
      if (!nodeSet.has(tx.to)) {
        nodes.push({ id: tx.to, label: shortenAddress(tx.to) });
        nodeSet.add(tx.to);
      }
      
      // Add edge
      const isIncoming = tx.to === address;
      edges.push({
        id: `e${index}`,
        source: tx.from,
        target: tx.to,
        label: tx.value,
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

  useEffect(() => {
    if (!containerRef.current || isLoading || transactions.length === 0) return;

    setIsRendering(true);
    
    const { nodes, edges } = processGraphData();

    // Initialize cytoscape
    const cy = cytoscape({
      container: containerRef.current,
      elements: [
        ...nodes.map(node => ({
          data: { 
            id: node.id, 
            label: node.label,
            isTarget: node.isTarget || false
          }
        })),
        ...edges.map(edge => ({
          data: { 
            id: edge.id, 
            source: edge.source, 
            target: edge.target, 
            label: edge.label,
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
            // Removed shadow properties as they're not supported in this version of Cytoscape
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 1.5,
            'line-color': '#EA384C',
            'target-arrow-color': '#EA384C',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(label)',
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
        }
      ],
      layout: {
        name: 'coseBilkent',
        animate: true,
        animationDuration: 500,
        padding: 50,
        fit: true,
        nodeDimensionsIncludeLabels: true,
        randomize: false,
        nodeRepulsion: 8000,
        idealEdgeLength: 100,
        edgeElasticity: 0.45,
        nestingFactor: 0.1,
        gravity: 0.25,
        numIter: 2500
      } as any
    });

    // Add click event to nodes
    cy.on('tap', 'node', function(evt) {
      const nodeId = evt.target.id();
      handleNodeClick(nodeId);
    });

    cyRef.current = cy;
    setIsRendering(false);

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
