
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
  };
  
  return tokenMap[symbol] || '';
};
