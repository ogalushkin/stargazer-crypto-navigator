
import { AddressData } from "@/utils/types";
import { API_ENDPOINTS } from "@/utils/config";
import { generateMockData } from "../mockData";

export const fetchBitcoinData = async (address: string): Promise<AddressData> => {
  try {
    // Example Blockstream API call (most don't require API keys)
    const response = await fetch(
      `${API_ENDPOINTS.blockstream}/address/${address}`
    );
    
    if (response.ok) {
      const data = await response.json();
      console.log("Successfully fetched Bitcoin data:", data);
      // In the future, process the real data here
    }
    
    // For now, still returning mock data
    return generateMockData(address, 'bitcoin');
  } catch (error) {
    console.error("Error fetching Bitcoin data:", error);
    throw error;
  }
};
