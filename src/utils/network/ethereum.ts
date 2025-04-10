
import { AddressData, Asset, Transaction } from "@/utils/types";
import { API_ENDPOINTS, API_KEYS } from "@/utils/config";
import { generateMockData } from "../mockData";

export const fetchEthereumData = async (address: string): Promise<AddressData> => {
  try {
    console.log(`Fetching Ethereum data for address: ${address}`);
    
    // Etherscan API call for ETH balance
    const balanceResponse = await fetch(
      `${API_ENDPOINTS.etherscan}?module=account&action=balance&address=${address}&tag=latest&apikey=${API_KEYS.etherscan}`
    );
    const balanceData = await balanceResponse.json();
    console.log("Balance data response:", balanceData);
    
    // Get token transactions (ERC-20 tokens)
    const tokenTxResponse = await fetch(
      `${API_ENDPOINTS.etherscan}?module=account&action=tokentx&address=${address}&sort=desc&apikey=${API_KEYS.etherscan}`
    );
    const tokenTxData = await tokenTxResponse.json();
    console.log("Token transaction count:", tokenTxData?.result?.length || 0);

    // Get normal transactions
    const txResponse = await fetch(
      `${API_ENDPOINTS.etherscan}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${API_KEYS.etherscan}`
    );
    const txData = await txResponse.json();
    console.log("Regular transaction count:", txData?.result?.length || 0);
    
    // Process the responses
    if (balanceData.status === '1') {
      // Convert wei to ETH (1 ETH = 10^18 wei)
      const ethBalance = (parseInt(balanceData.result) / 1e18).toFixed(4);
      
      // Get current ETH price from CoinGecko
      const ethPriceResponse = await fetch(
        `${API_ENDPOINTS.coingecko}/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true`
      );
      const ethPriceData = await ethPriceResponse.json();
      const ethUsdPrice = ethPriceData.ethereum?.usd || 2000; // Fallback price
      const ethUsdChange = ethPriceData.ethereum?.usd_24h_change || 0;
      
      // Calculate USD value
      const usdValue = parseFloat(ethBalance) * ethUsdPrice;
      
      // Create assets array
      const assets: Asset[] = [
        {
          symbol: 'ETH',
          name: 'Ethereum',
          balance: ethBalance,
          value: usdValue,
          price: ethUsdPrice,
          change24h: ethUsdChange,
          icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png'
        }
      ];

      // Process ERC-20 token transactions to extract unique tokens
      const processedTokens = new Map<string, Asset>();
      
      if (tokenTxData.status === '1' && tokenTxData.result.length > 0) {
        // Get the last transaction for each token to determine current balance
        for (const tx of tokenTxData.result) {
          const symbol = tx.tokenSymbol;
          if (!processedTokens.has(symbol) && tx.tokenSymbol !== 'ETH') {
            // For simplicity, we're not calculating actual token balances here
            // In a real app, you would sum inputs/outputs or use a balance API
            const tokenDecimals = parseInt(tx.tokenDecimal) || 18;
            const rawBalance = (Math.random() * 1000).toFixed(2); // Placeholder for demo
            
            // Add the token to our assets list
            processedTokens.set(symbol, {
              symbol,
              name: tx.tokenName,
              balance: rawBalance,
              value: parseFloat(rawBalance) * (Math.random() * 10), // Placeholder for demo
              price: Math.random() * 10, // Placeholder price
              change24h: (Math.random() * 20) - 10, // Random change between -10% and +10%
              icon: `https://cryptologos.cc/logos/${symbol.toLowerCase()}-${symbol.toLowerCase()}-logo.png`
            });
          }
        }
      }
      
      // Add tokens to assets array
      processedTokens.forEach(token => assets.push(token));
      
      // Sort assets by value (highest first)
      assets.sort((a, b) => b.value - a.value);
      
      // Process transactions
      const transactions: Transaction[] = [];
      
      if (txData.status === '1' && txData.result.length > 0) {
        // Increase transaction limit to get more data
        const maxTx = Math.min(txData.result.length, 100);
        console.log(`Processing ${maxTx} out of ${txData.result.length} transactions`);
        
        for (let i = 0; i < maxTx; i++) {
          const tx = txData.result[i];
          const valueInEth = (parseInt(tx.value) / 1e18).toFixed(4);
          
          transactions.push({
            hash: tx.hash,
            from: tx.from,
            to: tx.to,
            value: `${valueInEth} ETH`,
            timestamp: parseInt(tx.timeStamp) * 1000, // Convert to milliseconds
          });
        }
      } else {
        console.warn("No transaction data found or API error:", txData);
      }
      
      console.log(`Processed ${transactions.length} transactions for address ${address}`);
      
      return {
        balance: {
          native: ethBalance,
          usd: usdValue,
        },
        assets,
        transactions,
      };
    }
    
    // If we couldn't get the data, throw an error
    throw new Error(`Etherscan API error: ${balanceData.message || 'Unknown error'}`);
  } catch (error) {
    console.error("Error fetching Ethereum data:", error);
    // Fall back to mock data
    return generateMockData(address, 'ethereum');
  }
};
