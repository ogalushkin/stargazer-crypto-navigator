
// Network types
export type NetworkType = 'ethereum' | 'bitcoin' | 'solana' | 'ton';

// Asset type definition
export interface Asset {
  symbol: string;
  name: string;
  balance: string;
  value: number;
  price: number;
  change24h: number;
}

// Transaction type definition
export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
}

// Address data type
export interface AddressData {
  balance: {
    native: string;
    usd: number;
  };
  assets: Asset[];
  transactions: Transaction[];
}
