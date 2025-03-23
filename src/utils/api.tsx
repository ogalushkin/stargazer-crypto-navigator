
import { NetworkType, AddressData, Asset, Transaction } from "@/utils/types";
import { API_KEYS, API_ENDPOINTS } from "@/utils/config";

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
    return await fetchRealData(address, network);
  } catch (error) {
    console.error(`Error fetching real data for ${network}:`, error);
    // Fall back to mock data on error
    console.log(`Falling back to mock data for ${address}`);
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
      // Example Etherscan API call
      const ethResponse = await fetch(
        `${API_ENDPOINTS.etherscan}?module=account&action=balance&address=${address}&tag=latest&apikey=${API_KEYS.etherscan}`
      );
      const ethData = await ethResponse.json();
      
      // Process the response and convert to AddressData format
      // This is a placeholder and needs to be implemented properly
      if (ethData.status === '1') {
        // For now, we're still returning mock data but in the future
        // you would parse the real API response
        return generateMockData(address, network);
      }
      console.log('Etherscan API error:', ethData);
      throw new Error(`Etherscan API error: ${ethData.message}`);
      
    case 'bitcoin':
      // Example Blockstream API call (most don't require API keys)
      const btcResponse = await fetch(
        `${API_ENDPOINTS.blockstream}/address/${address}`
      );
      // Process BTC data...
      return generateMockData(address, network);
      
    case 'solana':
      // Example Solana API call
      // Process Solana data...
      return generateMockData(address, network);
      
    case 'ton':
      // Example TON API call
      // Process TON data...
      return generateMockData(address, network);
      
    default:
      throw new Error(`Unsupported network: ${network}`);
  }
};

// Helper function to generate mock data
const generateMockData = (address: string, network: NetworkType): AddressData => {
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
  const assets: Asset[] = [];
  
  if (network === 'ethereum') {
    assets.push(
      {
        symbol: 'ETH',
        name: 'Ethereum',
        balance: nativeBalance,
        value: parseFloat(nativeBalance) * random(1500, 2500),
        price: random(1500, 2500),
        change24h: random(-5, 8),
      },
      {
        symbol: 'USDT',
        name: 'Tether USD',
        balance: random(100, 10000).toFixed(2),
        value: random(100, 10000),
        price: random(0.98, 1.02),
        change24h: random(-1, 1),
      },
      {
        symbol: 'LINK',
        name: 'Chainlink',
        balance: random(10, 1000).toFixed(2),
        value: random(100, 5000),
        price: random(5, 20),
        change24h: random(-10, 15),
      }
    );
  } else if (network === 'bitcoin') {
    assets.push(
      {
        symbol: 'BTC',
        name: 'Bitcoin',
        balance: nativeBalance,
        value: parseFloat(nativeBalance) * random(25000, 40000),
        price: random(25000, 40000),
        change24h: random(-7, 10),
      }
    );
  } else if (network === 'solana') {
    assets.push(
      {
        symbol: 'SOL',
        name: 'Solana',
        balance: nativeBalance,
        value: parseFloat(nativeBalance) * random(40, 150),
        price: random(40, 150),
        change24h: random(-12, 20),
      },
      {
        symbol: 'USDC',
        name: 'USD Coin',
        balance: random(100, 5000).toFixed(2),
        value: random(100, 5000),
        price: random(0.99, 1.01),
        change24h: random(-0.5, 0.5),
      }
    );
  } else if (network === 'ton') {
    assets.push(
      {
        symbol: 'TON',
        name: 'Toncoin',
        balance: nativeBalance,
        value: parseFloat(nativeBalance) * random(2, 5),
        price: random(2, 5),
        change24h: random(-15, 25),
      },
      {
        symbol: 'JETTON',
        name: 'Sample Jetton',
        balance: random(1000, 50000).toFixed(2),
        value: random(100, 2000),
        price: random(0.02, 0.2),
        change24h: random(-20, 30),
      }
    );
  }
  
  // Generate more transactions for the Arkham-like visualization
  const transactions: Transaction[] = [];
  // Increase transaction count to create a more dense, realistic graph
  const txCount = Math.floor(random(25, 50));
  
  console.log(`Generating ${txCount} mock transactions for ${address}`);
  
  for (let i = 0; i < txCount; i++) {
    const isIncoming = random(0, 1) > 0.5;
    const txValue = random(0.01, 10).toFixed(network === 'bitcoin' ? 8 : 4);
    
    let currencySymbol = '';
    switch (network) {
      case 'ethereum': currencySymbol = 'ETH'; break;
      case 'bitcoin': currencySymbol = 'BTC'; break;
      case 'solana': currencySymbol = 'SOL'; break;
      case 'ton': currencySymbol = 'TON'; break;
    }
    
    transactions.push({
      hash: `0x${Math.random().toString(16).substring(2, 66)}`,
      from: isIncoming ? generateRandomAddress(network) : address,
      to: isIncoming ? address : generateRandomAddress(network),
      value: `${txValue} ${currencySymbol}`,
      timestamp: Date.now() - 86400000 * Math.floor(random(1, 30)), // Random time in the last 30 days
    });
  }
  
  return {
    balance: {
      native: nativeBalance,
      usd: usdValue,
    },
    assets,
    transactions,
  };
};

// Generate a random address for the given network
const generateRandomAddress = (network: NetworkType): string => {
  switch (network) {
    case 'ethereum':
      return `0x${Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    case 'bitcoin':
      return `bc1${Array.from({length: 40}, () => Math.floor(Math.random() * 36).toString(36)).join('')}`;
    case 'solana':
      return Array.from({length: 43}, () => Math.floor(Math.random() * 36).toString(36)).join('');
    case 'ton':
      return `EQ${Array.from({length: 48}, () => Math.floor(Math.random() * 36).toString(36)).join('')}`;
    default:
      return '';
  }
};
