
import { NetworkType } from "@/components/NetworkSelector";
import { Asset } from "@/components/AssetList";
import { Transaction } from "@/components/TransactionGraph";

interface AddressData {
  balance: {
    native: string;
    usd: number;
  };
  assets: Asset[];
  transactions: Transaction[];
}

/**
 * Fetch address data (balance, assets, transactions) from the appropriate API
 * This is a mock implementation that returns dummy data
 */
export const fetchAddressData = async (
  address: string,
  network: NetworkType
): Promise<AddressData> => {
  // In a real app, this would call different APIs based on the network
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Generate mock data based on network
  const mockData = generateMockData(address, network);
  
  return mockData;
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
  
  // Generate mock transactions
  const transactions: Transaction[] = [];
  const txCount = Math.floor(random(10, 20));
  
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
