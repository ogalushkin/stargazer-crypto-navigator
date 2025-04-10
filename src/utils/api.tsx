
import { NetworkType, AddressData } from "@/utils/types";
import { fetchEthereumData } from "./network/ethereum";
import { fetchBitcoinData } from "./network/bitcoin";
import { fetchSolanaData } from "./network/solana";
import { fetchTonData } from "./network/ton";
import { generateMockData } from "./mockData";
import { toast } from 'sonner';

/**
 * Fetch address data (balance, assets, transactions) from the appropriate API
 * This function uses hardcoded API keys for simplicity
 */
export const fetchAddressData = async (
  address: string,
  network: NetworkType
): Promise<AddressData> => {
  try {
    console.log(`Fetching data for ${network} address: ${address}`);
    // Call the appropriate API based on network
    const data = await fetchRealData(address, network);
    
    // Verify the data before returning
    if (!data.transactions || data.transactions.length === 0) {
      console.warn(`No transactions found for ${address}. Using mock data.`);
      toast.info("No real transactions found. Showing simulated data.");
      return generateMockData(address, network);
    }
    
    console.log(`Successfully fetched ${data.transactions.length} transactions`);
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
