
import { AddressData, Asset, Transaction } from "@/utils/types";
import { API_ENDPOINTS } from "@/utils/config";
import { generateMockData } from "../mockData";

export const fetchBitcoinData = async (address: string): Promise<AddressData> => {
  try {
    // Fetch address info from Blockstream API
    const addressResponse = await fetch(
      `${API_ENDPOINTS.blockstream}/address/${address}`
    );
    
    // Fetch transactions
    const txsResponse = await fetch(
      `${API_ENDPOINTS.blockstream}/address/${address}/txs`
    );
    
    if (!addressResponse.ok || !txsResponse.ok) {
      throw new Error('Failed to fetch Bitcoin data');
    }
    
    const addressData = await addressResponse.json();
    const txsData = await txsResponse.json();
    
    // Get current BTC price from CoinGecko
    const btcPriceResponse = await fetch(
      `${API_ENDPOINTS.coingecko}/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true`
    );
    const btcPriceData = await btcPriceResponse.json();
    const btcUsdPrice = btcPriceData.bitcoin?.usd || 40000; // Fallback price
    const btcUsdChange = btcPriceData.bitcoin?.usd_24h_change || 0;
    
    // Calculate balances
    // Convert satoshis to BTC (1 BTC = 100,000,000 satoshis)
    const btcBalance = (addressData.chain_stats.funded_txo_sum - addressData.chain_stats.spent_txo_sum) / 1e8;
    const formattedBtcBalance = btcBalance.toFixed(8);
    const usdValue = btcBalance * btcUsdPrice;
    
    // Create assets array
    const assets: Asset[] = [
      {
        symbol: 'BTC',
        name: 'Bitcoin',
        balance: formattedBtcBalance,
        value: usdValue,
        price: btcUsdPrice,
        change24h: btcUsdChange,
        icon: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png'
      }
    ];
    
    // Process transactions
    const transactions: Transaction[] = [];
    
    // Limit to 50 transactions for performance
    const maxTx = Math.min(txsData.length, 50);
    
    for (let i = 0; i < maxTx; i++) {
      const tx = txsData[i];
      
      // Find the relevant inputs and outputs for this address
      let from = '';
      let to = '';
      let value = 0;
      
      // For simplicity, we'll just use the first input and output
      // In a real app, you'd want to analyze all inputs and outputs
      if (tx.vin && tx.vin.length > 0 && tx.vout && tx.vout.length > 0) {
        from = tx.vin[0].prevout?.scriptpubkey_address || 'Unknown';
        
        // Find an output to our address
        const ourOutput = tx.vout.find(output => 
          output.scriptpubkey_address === address
        );
        
        if (ourOutput) {
          to = ourOutput.scriptpubkey_address;
          value = ourOutput.value / 1e8; // Convert satoshis to BTC
        } else {
          to = tx.vout[0].scriptpubkey_address || 'Unknown';
          value = tx.vout[0].value / 1e8;
        }
      }
      
      transactions.push({
        hash: tx.txid,
        from,
        to,
        value: `${value.toFixed(8)} BTC`,
        timestamp: tx.status.block_time ? tx.status.block_time * 1000 : Date.now(), // Convert to milliseconds
      });
    }
    
    return {
      balance: {
        native: formattedBtcBalance,
        usd: usdValue,
      },
      assets,
      transactions,
    };
  } catch (error) {
    console.error("Error fetching Bitcoin data:", error);
    // Fall back to mock data
    return generateMockData(address, 'bitcoin');
  }
};
