
// Helper function to get correct crypto logo URLs
export const getCryptoLogoUrl = (symbol: string): string => {
  const tokenMap: Record<string, string> = {
    'ETH': 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
    'BTC': 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
    'USDT': 'https://cryptologos.cc/logos/tether-usdt-logo.png',
    'USDC': 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
    'DAI': 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png',
    'LINK': 'https://cryptologos.cc/logos/chainlink-link-logo.png',
    'SOL': 'https://cryptologos.cc/logos/solana-sol-logo.png',
    'AAVE': 'https://cryptologos.cc/logos/aave-aave-logo.png',
    'UNI': 'https://cryptologos.cc/logos/uniswap-uni-logo.png',
    'TON': 'https://cryptologos.cc/logos/toncoin-ton-logo.png',
    'SHIB': 'https://cryptologos.cc/logos/shiba-inu-shib-logo.png',
    'WETH': 'https://cryptologos.cc/logos/ethereum-eth-logo.png', // Wrapped ETH uses ETH logo
    'cbBTC': 'https://cryptologos.cc/logos/bitcoin-btc-logo.png', // Coinbase wrapped BTC uses BTC logo
    'APE': 'https://cryptologos.cc/logos/apecoin-ape-logo.png',
    'PEPE': 'https://cryptologos.cc/logos/pepe-pepe-logo.png',
    'MATIC': 'https://cryptologos.cc/logos/polygon-matic-logo.png',
    'CRO': 'https://cryptologos.cc/logos/cronos-cro-logo.png',
    'ATOM': 'https://cryptologos.cc/logos/cosmos-atom-logo.png',
    'AVAX': 'https://cryptologos.cc/logos/avalanche-avax-logo.png',
    'AXS': 'https://cryptologos.cc/logos/axie-infinity-axs-logo.png',
    'FTM': 'https://cryptologos.cc/logos/fantom-ftm-logo.png',
    'NEAR': 'https://cryptologos.cc/logos/near-protocol-near-logo.png',
    'DOGE': 'https://cryptologos.cc/logos/dogecoin-doge-logo.png'
  };
  
  return tokenMap[symbol] || '';
};

// Map token contract addresses to their symbols for Ethereum
export const ethereumTokenAddressToSymbol: Record<string, string> = {
  '0x514910771af9ca656af840dff83e8264ecf986ca': 'LINK', // Chainlink
  '0xdac17f958d2ee523a2206206994597c13d831ec7': 'USDT', // Tether
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 'USDC', // USD Coin
  '0x6b175474e89094c44da98b954eedeac495271d0f': 'DAI',  // Dai
  '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9': 'AAVE', // Aave
  '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984': 'UNI',  // Uniswap
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': 'WETH', // Wrapped Ether
  '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': 'WBTC', // Wrapped Bitcoin
  '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce': 'SHIB', // Shiba Inu
  '0x4d224452801aced8b2f0aebe155379bb5d594381': 'APE',  // ApeCoin
  '0x6982508145454ce325ddbe47a25d4ec3d2311933': 'PEPE', // Pepe
  '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0': 'MATIC' // Polygon
};

// Helper to get token info by contract address
export const getTokenInfoByAddress = (address: string): { symbol: string; name: string; } => {
  const lowerAddress = address.toLowerCase();
  const symbol = ethereumTokenAddressToSymbol[lowerAddress];
  
  // Default mapping of symbols to names
  const nameMap: Record<string, string> = {
    'LINK': 'Chainlink',
    'USDT': 'Tether',
    'USDC': 'USD Coin',
    'DAI': 'Dai',
    'AAVE': 'Aave',
    'UNI': 'Uniswap',
    'WETH': 'Wrapped Ether',
    'WBTC': 'Wrapped Bitcoin',
    'SHIB': 'Shiba Inu',
    'APE': 'ApeCoin',
    'PEPE': 'Pepe',
    'MATIC': 'Polygon'
  };
  
  if (symbol) {
    return {
      symbol,
      name: nameMap[symbol] || symbol
    };
  }
  
  // Unknown token
  return {
    symbol: 'UNKNOWN',
    name: 'Unknown Token'
  };
};
