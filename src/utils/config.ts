
/**
 * Configuration file with API keys
 */
export const API_KEYS = {
  // Ethereum blockchain explorers
  etherscan: 'TP1JNPYJCVRBZG9X226C68YZ1ASFS5F1HE', // Etherscan API key
  infura: 'YourInfuraApiKey',       // Get from https://infura.io
  
  // Bitcoin blockchain explorers
  blockstream: '',                  // Most Blockstream endpoints don't require API keys
  blockchair: 'YourBlockchairApiKey', // Get from https://blockchair.com/api
  
  // Solana blockchain explorers
  solana: '54c6cc54-e178-45d7-8894-1c5275ce6682', // Helius API key
  solscan: 'YourSolscanApiKey',     // Get from https://public-api.solscan.io
  
  // TON blockchain explorers
  toncenter: '0535a464fa107609917c5cbf66d66d036a657402a189df0a7cad436c59fad8fad21c2', // Toncenter API key
  
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
  solana: 'https://api.helius-rpc.com',
  solscan: 'https://public-api.solscan.io/account',
  ton: 'https://toncenter.com/api/v2',
  
  // Price APIs
  coingecko: 'https://api.coingecko.com/api/v3',
  coinmarketcap: 'https://pro-api.coinmarketcap.com/v1',
};
