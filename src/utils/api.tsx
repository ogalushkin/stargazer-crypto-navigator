
import { NetworkType, AddressData } from "@/utils/types";
import { fetchEthereumData } from "./network/ethereum";
import { fetchBitcoinData } from "./network/bitcoin";
import { fetchSolanaData } from "./network/solana";
import { fetchTonData } from "./network/ton";
import { generateMockData } from "./mockData";
import { toast } from 'sonner';

// Cache API responses
const apiCache = new Map<string, {
  data: AddressData,
  timestamp: number
}>();

// Cache lifetime in milliseconds (10 minutes)
const CACHE_LIFETIME = 10 * 60 * 1000;

/**
 * Fetch address data (balance, assets, transactions) from the appropriate API
 * This function uses hardcoded API keys for simplicity
 */
export const fetchAddressData = async (
  address: string,
  network: NetworkType
): Promise<AddressData> => {
  try {
    // Normalize address to lowercase for consistent caching
    const normalizedAddress = address.toLowerCase();
    
    // Create a cache key combining network and address
    const cacheKey = `${network}:${normalizedAddress}`;
    
    // Check cache first
    const cachedData = apiCache.get(cacheKey);
    if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_LIFETIME) {
      console.log(`Using cached data for ${network} address: ${normalizedAddress}`);
      return cachedData.data;
    }
    
    console.log(`Fetching data for ${network} address: ${normalizedAddress}`);
    
    // Show toast to indicate loading is happening
    toast.info(`Loading ${network} address data...`, {
      id: `loading-${normalizedAddress}`,
      duration: 10000 // 10 seconds
    });
    
    // Call the appropriate API based on network
    const data = await fetchRealData(normalizedAddress, network);
    
    // Verify the data before returning
    if (!data.transactions || data.transactions.length === 0) {
      console.warn(`No transactions found for ${normalizedAddress}. Using mock data.`);
      toast.info("No real transactions found. Showing simulated data.");
      return generateMockData(normalizedAddress, network);
    }
    
    console.log(`Successfully fetched ${data.transactions.length} transactions and ${data.assets.length} assets`);
    
    // Dismiss the loading toast
    toast.dismiss(`loading-${normalizedAddress}`);
    
    // Cache the successful result
    apiCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    
    return data;
  } catch (error) {
    console.error(`Error fetching real data for ${network}:`, error);
    
    // Fall back to mock data on error
    console.log(`Falling back to mock data for ${address}`);
    toast.error("Error fetching blockchain data. Showing simulated data.");
    return generateMockData(address, network);
  }
};

/**
 * Fetch real data from blockchain APIs
 * This uses the hardcoded API keys from config
 */
const fetchRealData = async (
  address: string,
  network: NetworkType
): Promise<AddressData> => {
  // Implementation for real API calls
  switch (network) {
    case 'ethereum':
      return await fetchEthereumData(address);
    case 'bitcoin':
      return await fetchBitcoinData(address);
    case 'solana':
      return await fetchSolanaData(address);
    case 'ton':
      return await fetchTonData(address);
    default:
      throw new Error(`Unsupported network: ${network}`);
  }
};
