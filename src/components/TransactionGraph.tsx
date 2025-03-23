
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Loader2, NetworkIcon, ZoomIn, ZoomOut, Download, RefreshCcw, Filter, Eye, EyeOff } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import cytoscape from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import TransactionTable from '@/components/TransactionTable';
import TransactionFilters from '@/components/TransactionFilters';
import { NetworkType } from '@/utils/types';

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
  category?: AddressCategory;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  value: number;
  isIncoming?: boolean;
  isSelfTransfer?: boolean;
  hash: string;
  timestamp: number;
}

export type AddressCategory = 
  | 'exchange' 
  | 'deposit' 
  | 'individual' 
  | 'dex' 
  | 'lending' 
  | 'uncategorized';

export type SortOption = 'time' | 'amount' | 'direction';
export type TimeRangeOption = 'all' | '24h' | '7d' | 'custom';
export type FlowDirection = 'in' | 'out' | 'all' | 'self';

export interface FilterState {
  sortBy: SortOption;
  timeRange: TimeRangeOption;
  categoryFilters: {
    [key in AddressCategory]: {
      enabled: boolean;
      flow: FlowDirection;
    };
  };
}

interface TransactionGraphProps {
  address: string;
  network: string;
  transactions: Transaction[];
  isLoading?: boolean;
  fullPage?: boolean;
}

// Max number of transactions to display to prevent performance issues
const MAX_TRANSACTIONS = 100;

// Arkham-style colors - bright green for incoming, bright red/pink for outgoing
const INCOMING_COLOR = '#00FF41'; // Bright green
const OUTGOING_COLOR = '#FF3864'; // Bright red/pink
const SELF_TRANSFER_COLOR = '#AAAAAA'; // Light gray

// Category colors matching Arkham style
const CATEGORY_COLORS = {
  exchange: '#FF6B6B',     // Soft Red for centralized exchanges
  deposit: '#FFD166',      // Soft Yellow for deposit addresses
  individual: '#06D6A0',   // Soft Green for individuals & funds
  dex: '#118AB2',          // Soft Blue for decentralized exchanges
  lending: '#9D4EDD',      // Soft Purple for lending protocols
  uncategorized: '#8E9196' // Soft Gray for uncategorized
};

const TransactionGraph: React.FC<TransactionGraphProps> = ({
  address,
  network,
  transactions = [],
  isLoading = false,
  fullPage = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const navigate = useNavigate();
  const [isRendering, setIsRendering] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
  const [processedData, setProcessedData] = useState<{nodes: GraphNode[], edges: GraphEdge[]}>({ nodes: [], edges: [] });
  
  // Filter and sort state
  const [filters, setFilters] = useState<FilterState>({
    sortBy: 'time',
    timeRange: 'all',
    categoryFilters: {
      exchange: { enabled: true, flow: 'all' },
      deposit: { enabled: true, flow: 'all' },
      individual: { enabled: true, flow: 'all' },
      dex: { enabled: true, flow: 'all' },
      lending: { enabled: true, flow: 'all' },
      uncategorized: { enabled: true, flow: 'all' }
    }
  });

  console.log("TransactionGraph component rendering with:", {
    address,
    network,
    transactionsCount: transactions.length,
    fullPage
  });

  // Get a random category for an address - in a real app this would come from a database or API
  const getCategoryForAddress = (addr: string): AddressCategory => {
    // Using a hash function to consistently assign categories based on address
    const hash = addr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const categories: AddressCategory[] = ['exchange', 'deposit', 'individual', 'dex', 'lending', 'uncategorized'];
    // Make uncategorized more common
    if (hash % 10 > 7) return 'uncategorized';
    return categories[hash % 5];
  };

  // Process transactions into nodes and edges
  const processGraphData = () => {
    // Apply time range filter
    let filteredTransactions = [...transactions];
    const now = Date.now();
    
    if (filters.timeRange === '24h') {
      filteredTransactions = filteredTransactions.filter(tx => 
        (now - tx.timestamp) < 24 * 60 * 60 * 1000
      );
    } else if (filters.timeRange === '7d') {
      filteredTransactions = filteredTransactions.filter(tx => 
        (now - tx.timestamp) < 7 * 24 * 60 * 60 * 1000
      );
    }

    // Apply sort
    if (filters.sortBy === 'time') {
      filteredTransactions.sort((a, b) => b.timestamp - a.timestamp);
    } else if (filters.sortBy === 'amount') {
      filteredTransactions.sort((a, b) => {
        const valueA = parseFloat(a.value.split(' ')[0]) || 0;
        const valueB = parseFloat(b.value.split(' ')[0]) || 0;
        return valueB - valueA;
      });
    } else if (filters.sortBy === 'direction') {
      filteredTransactions.sort((a, b) => {
        const aIsIncoming = a.to === address;
        const bIsIncoming = b.to === address;
        if (aIsIncoming && !bIsIncoming) return -1;
        if (!aIsIncoming && bIsIncoming) return 1;
        return 0;
      });
    }
    
    // Limit transactions to prevent performance issues
    const limitedTransactions = filteredTransactions.length > MAX_TRANSACTIONS 
      ? filteredTransactions.slice(0, MAX_TRANSACTIONS)
      : filteredTransactions;
    
    console.log("Processing graph data with transactions:", limitedTransactions.length);
    
    const nodes: GraphNode[] = [{ 
      id: address, 
      label: shortenAddress(address), 
      isTarget: true 
    }];
    
    const edges: GraphEdge[] = [];
    const nodeSet = new Set<string>([address]);
    
    // First pass: identify all nodes
    limitedTransactions.forEach(tx => {
      const fromIsTarget = tx.from === address;
      const toIsTarget = tx.to === address;
      const isSelfTransfer = tx.from === tx.to;
      
      // Add 'from' node if it doesn't exist
      if (!nodeSet.has(tx.from)) {
        const category = getCategoryForAddress(tx.from);
        nodes.push({ 
          id: tx.from, 
          label: shortenAddress(tx.from),
          isOutgoing: fromIsTarget,
          isIncoming: !fromIsTarget && toIsTarget,
          category
        });
        nodeSet.add(tx.from);
      }
      
      // Add 'to' node if it doesn't exist
      if (!nodeSet.has(tx.to)) {
        const category = getCategoryForAddress(tx.to);
        nodes.push({ 
          id: tx.to, 
          label: shortenAddress(tx.to),
          isOutgoing: toIsTarget && !fromIsTarget,
          isIncoming: toIsTarget,
          category
        });
        nodeSet.add(tx.to);
      }
    });
    
    // Second pass: create all individual edges (one per transaction)
    limitedTransactions.forEach((tx, index) => {
      // Extract numerical value from transaction
      const valueStr = tx.value.split(' ')[0]; // Extracts just the number part
      const numValue = parseFloat(valueStr) || 0;
      
      // Add individual edge for this transaction
      const isIncoming = tx.to === address;
      const isSelfTransfer = tx.from === tx.to;
      
      edges.push({
        id: `e${index}-${tx.hash.substring(0, 8)}`,
        source: tx.from,
        target: tx.to,
        label: tx.value,
        value: numValue,
        isIncoming,
        isSelfTransfer,
        hash: tx.hash,
        timestamp: tx.timestamp
      });
    });

    // Apply category and flow filters
    const filteredNodes = nodes.filter(node => {
      if (node.isTarget) return true; // Always include target node
      
      const category = node.category || 'uncategorized';
      const categoryFilter = filters.categoryFilters[category];
      
      if (!categoryFilter.enabled) return false;
      
      // Filter by flow direction
      if (categoryFilter.flow === 'in' && !node.isIncoming) return false;
      if (categoryFilter.flow === 'out' && !node.isOutgoing) return false;
      if (categoryFilter.flow === 'self') {
        // Only include nodes involved in self-transfers
        const hasSelfTransfer = edges.some(e => 
          e.isSelfTransfer && (e.source === node.id || e.target === node.id)
        );
        if (!hasSelfTransfer) return false;
      }
      
      return true;
    });
    
    // Only include edges that connect to visible nodes
    const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredEdges = edges.filter(edge => {
      if (!filteredNodeIds.has(edge.source) || !filteredNodeIds.has(edge.target)) return false;
      
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      
      if (!sourceNode || !targetNode) return false;
      
      const sourceCategory = sourceNode.category || 'uncategorized';
      const targetCategory = targetNode.category || 'uncategorized';
      
      // Check source category filter
      const sourceCategoryFilter = filters.categoryFilters[sourceCategory];
      if (!sourceCategoryFilter.enabled) return false;
      
      // Check target category filter
      const targetCategoryFilter = filters.categoryFilters[targetCategory];
      if (!targetCategoryFilter.enabled) return false;
      
      // Filter by flow direction for self transfers
      if (edge.isSelfTransfer) {
        // Only show self transfers if at least one category has self flow enabled
        const selfFlowEnabled = Object.values(filters.categoryFilters).some(
          cf => cf.enabled && cf.flow === 'self'
        );
        return selfFlowEnabled;
      }
      
      // Filter by flow direction
      if (sourceCategoryFilter.flow === 'in' && !edge.isIncoming) return false;
      if (sourceCategoryFilter.flow === 'out' && edge.isIncoming) return false;
      if (targetCategoryFilter.flow === 'in' && !edge.isIncoming) return false;
      if (targetCategoryFilter.flow === 'out' && edge.isIncoming) return false;
      
      return true;
    });

    console.log("Processed graph data:", { 
      nodes: filteredNodes.length, 
      edges: filteredEdges.length 
    });
    
    setProcessedData({ nodes: filteredNodes, edges: filteredEdges });
    return { nodes: filteredNodes, edges: filteredEdges };
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

  // Calculate edge width based on transaction value using logarithmic scale
  const calculateEdgeWidth = (value: number): number => {
    if (value <= 0) return 1;
    
    // Logarithmic scaling with a multiplier of 2.5
    // Using Math.log10 to get better scaling for crypto transaction values
    const width = Math.log10(value + 1) * 2.5;
    
    // Clamp between min 1px and max 10px
    return Math.min(Math.max(width, 1), 10);
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
    
    setSelectedTransaction(hash);
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    // Rebuild graph with new filters
    if (cyRef.current) {
      cyRef.current.destroy();
      cyRef.current = null;
    }
  };

  const initializeGraph = () => {
    if (!containerRef.current || isLoading || !transactions || transactions.length === 0) {
      console.log("Skipping graph initialization:", { 
        hasContainer: !!containerRef.current, 
        isLoading, 
        transactionsLength: transactions?.length 
      });
      return;
    }

    console.log("Initializing graph with transactions:", transactions.length);
    setIsRendering(true);
    
    const { nodes, edges } = processGraphData();

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
              width: calculateEdgeWidth(edge.value),
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

      cyRef.current = cy;
      console.log("Cytoscape graph initialized successfully");
    } catch (e) {
      console.error("Error initializing cytoscape:", e);
    } finally {
      setIsRendering(false);
    }
  };

  // Initialize or update the graph when the component mounts or filters change
  useEffect(() => {
    initializeGraph();
    
    return () => {
      if (cyRef.current) {
        console.log("Cleaning up cytoscape instance");
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [containerRef, address, transactions, isLoading, network, filters]);

  // Show loading state
  if (isLoading) {
    return (
      <Card className={`bg-stargazer-card border-stargazer-muted/40 ${fullPage ? 'w-full h-[calc(100vh-80px)]' : 'h-[600px]'}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">Transaction Graph</CardTitle>
        </CardHeader>
        <CardContent className={`${fullPage ? 'h-[calc(100vh-140px)]' : 'h-[524px]'} flex items-center justify-center`}>
          <div className="flex flex-col items-center">
            <Loader2 className="w-10 h-10 text-violet-500 animate-spin mb-3" />
            <p className="text-white/70">Loading transaction data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show empty state if no transactions
  if (!transactions || transactions.length === 0) {
    return (
      <Card className={`bg-stargazer-card border-stargazer-muted/40 ${fullPage ? 'w-full h-[calc(100vh-80px)]' : 'h-[600px]'}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">Transaction Graph</CardTitle>
        </CardHeader>
        <CardContent className={`${fullPage ? 'h-[calc(100vh-140px)]' : 'h-[524px]'} flex items-center justify-center`}>
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
    <Card className={`bg-stargazer-card border-stargazer-muted/40 animate-fade-in ${fullPage ? 'w-full h-[calc(100vh-80px)]' : ''}`}>
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
                  onClick={() => setShowFilters(!showFilters)}
                >
                  {showFilters ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{showFilters ? "Hide Filters" : "Show Filters"}</p>
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
                  onClick={rebuildGraph}
                >
                  <RefreshCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Rebuild Graph</p>
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
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 bg-stargazer-muted/70 hover:bg-stargazer-muted border-stargazer-muted/80"
                  onClick={exportGraph}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Export as PNG</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      
      {showFilters && (
        <TransactionFilters 
          filters={filters} 
          onFilterChange={handleFilterChange}
        />
      )}
      
      <CardContent className={`relative ${fullPage ? 'h-[calc(100vh-270px)]' : 'h-[424px]'} p-0 overflow-hidden grid ${fullPage ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {isRendering && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-stargazer-card/80">
            <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
          </div>
        )}
        
        <div className={`relative ${fullPage ? 'w-full h-full col-span-1 lg:col-span-2' : 'w-full h-full'}`} ref={containerRef}>
          <div className="absolute bottom-3 left-3 flex items-center gap-4 z-10 p-2 bg-stargazer-card/80 rounded-md">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: INCOMING_COLOR }}></div>
              <span className="text-xs text-white/70">Incoming</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: OUTGOING_COLOR }}></div>
              <span className="text-xs text-white/70">Outgoing</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: SELF_TRANSFER_COLOR }}></div>
              <span className="text-xs text-white/70">Self</span>
            </div>
          </div>
        </div>
        
        {fullPage && (
          <div className="h-full border-l border-stargazer-muted/30 lg:block hidden">
            <TransactionTable 
              transactions={processedData.edges}
              selectedTransaction={selectedTransaction}
              onSelectTransaction={highlightTransaction}
            />
          </div>
        )}
      </CardContent>
      
      {fullPage && (
        <div className="border-t border-stargazer-muted/30 lg:hidden block">
          <TransactionTable 
            transactions={processedData.edges}
            selectedTransaction={selectedTransaction}
            onSelectTransaction={highlightTransaction}
          />
        </div>
      )}
    </Card>
  );
};

export default TransactionGraph;
