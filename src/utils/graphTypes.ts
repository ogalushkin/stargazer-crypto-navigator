
export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
}

export interface GraphNode {
  id: string;
  label: string;
  isTarget?: boolean;
  isIncoming?: boolean;
  isOutgoing?: boolean;
  category?: AddressCategory;
}

export interface GraphEdge {
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

export interface ProcessedGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
