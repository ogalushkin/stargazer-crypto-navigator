
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

// Mock function to get category for address - in real app would come from API/DB
export const getCategoryForAddress = (addr: string): AddressCategory => {
  // Using a hash function to consistently assign categories based on address
  const hash = addr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const categories: AddressCategory[] = ['exchange', 'deposit', 'individual', 'dex', 'lending', 'uncategorized'];
  // Make uncategorized more common
  if (hash % 10 > 7) return 'uncategorized';
  return categories[hash % 5];
};
