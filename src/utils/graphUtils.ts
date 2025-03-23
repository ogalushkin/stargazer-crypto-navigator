
import { AddressCategory } from "@/components/TransactionGraph";

// Category colors matching Arkham style
export const CATEGORY_COLORS = {
  exchange: '#FF6B6B',     // Soft Red for centralized exchanges
  deposit: '#FFD166',      // Soft Yellow for deposit addresses
  individual: '#06D6A0',   // Soft Green for individuals & funds
  dex: '#118AB2',          // Soft Blue for decentralized exchanges
  lending: '#9D4EDD',      // Soft Purple for lending protocols
  uncategorized: '#8E9196' // Soft Gray for uncategorized
};

// Edge colors
export const INCOMING_COLOR = '#00FF41'; // Bright green
export const OUTGOING_COLOR = '#FF3864'; // Bright red/pink
export const SELF_TRANSFER_COLOR = '#AAAAAA'; // Light gray

// Max number of transactions to display to prevent performance issues
export const MAX_TRANSACTIONS = 100;

// Utility function to shorten address for display
export const shortenAddress = (addr: string): string => {
  return addr.length > 14
    ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
    : addr;
};

// Calculate edge width based on transaction value using logarithmic scale
export const calculateEdgeWidth = (value: number): number => {
  if (value <= 0) return 1;
  
  // Logarithmic scaling with a multiplier of 2.5
  // Using Math.log10 to get better scaling for crypto transaction values
  const width = Math.log10(value + 1) * 2.5;
  
  // Clamp between min 1px and max 10px
  return Math.min(Math.max(width, 1), 10);
};

// Mock function to get category for address - in real app would come from API/DB
export const getCategoryForAddress = (addr: string): AddressCategory => {
  // Using a hash function to consistently assign categories based on address
  const hash = addr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const categories: AddressCategory[] = ['exchange', 'deposit', 'individual', 'dex', 'lending', 'uncategorized'];
  // Make uncategorized more common
  if (hash % 10 > 7) return 'uncategorized';
  return categories[hash % 5];
};
