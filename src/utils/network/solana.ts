
import { AddressData, Asset, Transaction } from "@/utils/types";
import { API_ENDPOINTS, API_KEYS } from "@/utils/config";
import { generateMockData } from "../mockData";

export const fetchSolanaData = async (address: string): Promise<AddressData> => {
  try {
    // Helius API for Solana data
    const response = await fetch(`${API_ENDPOINTS.solana}/${API_KEYS.solana}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'helius-test',
        method: 'getAssetsByOwner',
        params: {
          ownerAddress: address,
          displayOptions: {
            showFungible: true,
          },
        },
      }),
    });
    
    const data = await response.json();
    
    // Also get balance using getBalance method
    const balanceResponse = await fetch(`${API_ENDPOINTS.solana}/${API_KEYS.solana}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'helius-balance',
        method: 'getBalance',
        params: [address],
      }),
    });
    
    const balanceData = await balanceResponse.json();
    
    // Get transactions
    const txResponse = await fetch(`${API_ENDPOINTS.solana}/${API_KEYS.solana}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'helius-transactions',
        method: 'getSignaturesForAddress',
        params: [address, { limit: 20 }],
      }),
    });
    
    const txData = await txResponse.json();
    
    // Get SOL price from CoinGecko
    const solPriceResponse = await fetch(
      `${API_ENDPOINTS.coingecko}/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true`
    );
    const solPriceData = await solPriceResponse.json();
    const solUsdPrice = solPriceData.solana?.usd || 100; // Fallback price
    const solUsdChange = solPriceData.solana?.usd_24h_change || 0;
    
    // Process balance (convert lamports to SOL - 1 SOL = 1,000,000,000 lamports)
    const solBalance = (balanceData.result?.value || 0) / 1e9;
    const formattedSolBalance = solBalance.toFixed(4);
    const usdValue = solBalance * solUsdPrice;
    
    // Process assets
    const assets: Asset[] = [
      {
        symbol: 'SOL',
        name: 'Solana',
        balance: formattedSolBalance,
        value: usdValue,
        price: solUsdPrice,
        change24h: solUsdChange,
        icon: 'https://cryptologos.cc/logos/solana-sol-logo.png'
      }
    ];
    
    // Add token assets if available
    if (data.result?.items) {
      // Add token assets (fungible tokens)
      for (const item of data.result.items) {
        if (item.interface === 'FungibleToken' || item.interface === 'FungibleAsset') {
          const tokenBalance = parseFloat(item.token_info?.amount || '0') / Math.pow(10, item.token_info?.decimals || 9);
          const tokenPrice = 1; // Placeholder for token price (would need price API)
          
          assets.push({
            symbol: item.content?.metadata?.symbol || 'Unknown',
            name: item.content?.metadata?.name || 'Unknown Token',
            balance: tokenBalance.toFixed(4),
            value: tokenBalance * tokenPrice,
            price: tokenPrice,
            change24h: 0, // Placeholder
            icon: item.content?.links?.image || ''
          });
        }
      }
    }
    
    // Sort assets by value
    assets.sort((a, b) => b.value - a.value);
    
    // Process transactions
    const transactions: Transaction[] = [];
    
    if (txData.result) {
      for (const sig of txData.result) {
        // We would need to get transaction details for each signature
        // For this example, creating simplified transaction records
        transactions.push({
          hash: sig.signature,
          from: 'Unknown', // Would need transaction details
          to: address,
          value: '? SOL', // Would need transaction details
          timestamp: sig.blockTime ? sig.blockTime * 1000 : Date.now(),
        });
      }
    }
    
    return {
      balance: {
        native: formattedSolBalance,
        usd: usdValue,
      },
      assets,
      transactions,
    };
  } catch (error) {
    console.error("Error fetching Solana data:", error);
    // Fall back to mock data
    return generateMockData(address, 'solana');
  }
};
