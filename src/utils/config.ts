
/**
 * Configuration file with API keys
 * Replace these with actual API keys when ready for production
 */
export const API_KEYS = {
  // Ethereum blockchain explorers
  etherscan: 'YourEtherscanApiKey', // Get from https://etherscan.io/apis
  infura: 'YourInfuraApiKey',       // Get from https://infura.io
  
  // Bitcoin blockchain explorers
  blockstream: '',                  // Most Blockstream endpoints don't require API keys
  blockchair: 'YourBlockchairApiKey', // Get from https://blockchair.com/api
  
  // Solana blockchain explorers
  solana: 'YourSolanaApiKey',       // Get from https://solana.fm
  solscan: 'YourSolscanApiKey',     // Get from https://public-api.solscan.io
  
  // TON blockchain explorers
  toncenter: 'YourToncenterApiKey', // Get from https://toncenter.com
  
  // Price APIs
  coingecko: '',                    // Basic tier doesn't require API key
  coinmarketcap: 'YourCoinMarketCapApiKey', // Get from https://coinmarketcap.com/api
};

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  // Blockchain explorers
  etherscan: 'https://api.etherscan.io/api',
  infura: 'https://mainnet.infura.io/v3',
  blockstream: 'https://blockstream.info/api',
  blockchair: 'https://api.blockchair.com',
  solana: 'https://api.solana.fm',
  solscan: 'https://public-api.solscan.io/account',
  ton: 'https://toncenter.com/api/v2',
  
  // Price APIs
  coingecko: 'https://api.coingecko.com/api/v3',
  coinmarketcap: 'https://pro-api.coinmarketcap.com/v1',
};
