
import { NetworkType, AddressData, Asset, Transaction } from "@/utils/types";
import { 
  generateMockAssets,
  generateMockTransactions,
  generateRandomAddress
} from "./mockData/mockDataHelpers";

// Helper function to generate mock data
export const generateMockData = (address: string, network: NetworkType): AddressData => {
  // Use the address as a seed for pseudo-random data
  let seedValue = parseInt(address.substring(2, 10), 16) || 12345;
  const random = (min: number, max: number) => {
    const x = Math.sin(seedValue++) * 10000;
    return min + (x - Math.floor(x)) * (max - min);
  };
  
  // Generate balance data
  const nativeBalance = random(0.1, 100).toFixed(network === 'bitcoin' ? 8 : 4);
  const usdValue = random(100, 50000);
  
  // Network-specific assets
  const assets: Asset[] = generateMockAssets(network, nativeBalance, random);
  
  // Generate transactions for the Arkham-like visualization
  const transactions: Transaction[] = generateMockTransactions(address, network, random);
  
  return {
    balance: {
      native: nativeBalance,
      usd: usdValue,
    },
    assets,
    transactions,
  };
};
