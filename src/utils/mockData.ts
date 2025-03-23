
import { NetworkType, AddressData, Asset, Transaction } from "@/utils/types";

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
  const assets: Asset[] = getNetworkAssets(network, nativeBalance, random);
  
  // Sort assets by value in descending order
  assets.sort((a, b) => b.value - a.value);
  
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

// Generate network-specific assets
const getNetworkAssets = (network: NetworkType, nativeBalance: string, random: (min: number, max: number) => number): Asset[] => {
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
        icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png'
      },
      {
        symbol: 'USDT',
        name: 'Tether USD',
        balance: random(100, 10000).toFixed(2),
        value: random(100, 10000),
        price: random(0.98, 1.02),
        change24h: random(-1, 1),
        icon: 'https://cryptologos.cc/logos/tether-usdt-logo.png'
      },
      {
        symbol: 'LINK',
        name: 'Chainlink',
        balance: random(10, 1000).toFixed(2),
        value: random(100, 5000),
        price: random(5, 20),
        change24h: random(-10, 15),
        icon: 'https://cryptologos.cc/logos/chainlink-link-logo.png'
      },
      {
        symbol: 'UNI',
        name: 'Uniswap',
        balance: random(5, 500).toFixed(2),
        value: random(50, 2000),
        price: random(3, 12),
        change24h: random(-8, 12),
        icon: 'https://cryptologos.cc/logos/uniswap-uni-logo.png'
      },
      {
        symbol: 'AAVE',
        name: 'Aave',
        balance: random(1, 100).toFixed(2),
        value: random(50, 1000),
        price: random(30, 120),
        change24h: random(-12, 18),
        icon: 'https://cryptologos.cc/logos/aave-aave-logo.png'
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
        icon: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png'
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
        icon: 'https://cryptologos.cc/logos/solana-sol-logo.png'
      },
      {
        symbol: 'USDC',
        name: 'USD Coin',
        balance: random(100, 5000).toFixed(2),
        value: random(100, 5000),
        price: random(0.99, 1.01),
        change24h: random(-0.5, 0.5),
        icon: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png'
      },
      {
        symbol: 'RAY',
        name: 'Raydium',
        balance: random(50, 2000).toFixed(2),
        value: random(50, 1000),
        price: random(0.5, 2),
        change24h: random(-15, 25),
        icon: 'https://cryptologos.cc/logos/raydium-ray-logo.png'
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
        icon: 'https://cryptologos.cc/logos/toncoin-ton-logo.png'
      },
      {
        symbol: 'JETTON',
        name: 'Sample Jetton',
        balance: random(1000, 50000).toFixed(2),
        value: random(100, 2000),
        price: random(0.02, 0.2),
        change24h: random(-20, 30)
      }
    );
  }
  
  return assets;
};

// Generate mock transactions
const generateMockTransactions = (
  address: string, 
  network: NetworkType, 
  random: (min: number, max: number) => number
): Transaction[] => {
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
  
  return transactions;
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
