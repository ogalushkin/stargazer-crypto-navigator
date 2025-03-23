
import { AddressData, Asset, Transaction } from "@/utils/types";
import { API_ENDPOINTS, API_KEYS } from "@/utils/config";
import { generateMockData } from "../mockData";

export const fetchTonData = async (address: string): Promise<AddressData> => {
  try {
    // Get TON balance using TonCenter API
    const balanceResponse = await fetch(
      `${API_ENDPOINTS.ton}/getAddressBalance?api_key=${API_KEYS.toncenter}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: address
        }),
      }
    );
    
    const balanceData = await balanceResponse.json();
    
    // Get transactions
    const txResponse = await fetch(
      `${API_ENDPOINTS.ton}/getTransactions?api_key=${API_KEYS.toncenter}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: address,
          limit: 20
        }),
      }
    );
    
    const txData = await txResponse.json();
    
    // Get TON price from CoinGecko
    const tonPriceResponse = await fetch(
      `${API_ENDPOINTS.coingecko}/simple/price?ids=the-open-network&vs_currencies=usd&include_24hr_change=true`
    );
    const tonPriceData = await tonPriceResponse.json();
    const tonUsdPrice = tonPriceData['the-open-network']?.usd || 3; // Fallback price
    const tonUsdChange = tonPriceData['the-open-network']?.usd_24h_change || 0;
    
    // Process balance (convert nanoTON to TON - 1 TON = 1,000,000,000 nanoTON)
    const balance = balanceData.result ? parseInt(balanceData.result) / 1e9 : 0;
    const formattedBalance = balance.toFixed(4);
    const usdValue = balance * tonUsdPrice;
    
    // Create assets array
    const assets: Asset[] = [
      {
        symbol: 'TON',
        name: 'Toncoin',
        balance: formattedBalance,
        value: usdValue,
        price: tonUsdPrice,
        change24h: tonUsdChange,
        icon: 'https://cryptologos.cc/logos/toncoin-ton-logo.png'
      }
    ];
    
    // Process transactions
    const transactions: Transaction[] = [];
    
    if (txData.result) {
      for (const tx of txData.result) {
        // Determine direction (in or out)
        const isIncoming = tx.in_msg?.destination === address;
        const from = isIncoming ? tx.in_msg?.source || 'Unknown' : address;
        const to = isIncoming ? address : tx.out_msgs[0]?.destination || 'Unknown';
        
        // Get value
        const value = isIncoming 
          ? (tx.in_msg?.value || 0) / 1e9 
          : (tx.out_msgs[0]?.value || 0) / 1e9;
        
        transactions.push({
          hash: tx.transaction_id.hash || '',
          from,
          to,
          value: `${value.toFixed(4)} TON`,
          timestamp: tx.utime * 1000, // Convert to milliseconds
        });
      }
    }
    
    return {
      balance: {
        native: formattedBalance,
        usd: usdValue,
      },
      assets,
      transactions,
    };
  } catch (error) {
    console.error("Error fetching TON data:", error);
    // Fall back to mock data
    return generateMockData(address, 'ton');
  }
};
