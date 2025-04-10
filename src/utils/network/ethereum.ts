
import { AddressData, Asset, Transaction } from "@/utils/types";
import { API_ENDPOINTS, API_KEYS } from "@/utils/config";
import { generateMockData } from "../mockData";
import { ethereumTokenAddressToSymbol, getTokenInfoByAddress } from "../logoUtils";

// Cache for Ethereum data to prevent redundant API calls
const ethereumDataCache = new Map<string, {
  data: AddressData,
  timestamp: number
}>();
const CACHE_LIFETIME = 5 * 60 * 1000; // 5 minutes

export const fetchEthereumData = async (address: string): Promise<AddressData> => {
  try {
    // Check if we have cached data first
    const cachedData = ethereumDataCache.get(address);
    if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_LIFETIME) {
      console.log(`Using cached data for ${address}`);
      return cachedData.data;
    }

    console.log(`Fetching Ethereum data for address: ${address}`);
    
    // Prepare all the API calls to run in parallel
    const balancePromise = fetch(
      `${API_ENDPOINTS.etherscan}?module=account&action=balance&address=${address}&tag=latest&apikey=${API_KEYS.etherscan}`
    ).then(res => res.json());
    
    const txPromise = fetch(
      `${API_ENDPOINTS.etherscan}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${API_KEYS.etherscan}`
    ).then(res => res.json());
    
    const tokenTxPromise = fetch(
      `${API_ENDPOINTS.etherscan}?module=account&action=tokentx&address=${address}&sort=desc&apikey=${API_KEYS.etherscan}`
    ).then(res => res.json());
    
    const ethPricePromise = fetch(
      `${API_ENDPOINTS.coingecko}/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true`
    ).then(res => res.json());
    
    // Wait for all API calls to complete
    const [balanceData, txData, tokenTxData, ethPriceData] = await Promise.all([
      balancePromise, 
      txPromise, 
      tokenTxPromise, 
      ethPricePromise
    ]);
    
    console.log("Balance data response:", balanceData);
    console.log("Regular transaction count:", txData?.result?.length || 0);
    console.log("Token transaction count:", tokenTxData?.result?.length || 0);
    
    // Process the responses
    if (balanceData.status === '1') {
      // Convert wei to ETH (1 ETH = 10^18 wei)
      const ethBalance = (parseInt(balanceData.result) / 1e18).toFixed(8);
      
      // Get ETH price
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

      // Process transactions - limit to reduce processing time
      const transactions: Transaction[] = [];
      
      // Process normal ETH transactions
      if (txData.status === '1' && txData.result && txData.result.length > 0) {
        // Limit to 100 transactions for better performance
        const maxTx = Math.min(txData.result.length, 100);
        
        for (let i = 0; i < maxTx; i++) {
          const tx = txData.result[i];
          const valueInEth = (parseInt(tx.value) / 1e18).toFixed(8);
          
          if (parseInt(tx.value) > 0) { // Only add transactions with actual value
            transactions.push({
              hash: tx.hash,
              from: tx.from,
              to: tx.to,
              value: `${valueInEth} ETH`,
              timestamp: parseInt(tx.timeStamp) * 1000, // Convert to milliseconds
            });
          }
        }
      }
      
      // Process token transactions
      if (tokenTxData.status === '1' && tokenTxData.result && tokenTxData.result.length > 0) {
        // Track unique token contract addresses
        const processedTokens = new Map<string, { 
          symbol: string, 
          name: string, 
          decimals: number,
          contractAddress: string
        }>();
        
        // Limit to 100 token transactions for better performance
        const maxTokenTx = Math.min(tokenTxData.result.length, 100);
        
        // Track known tokens for asset list
        for (let i = 0; i < maxTokenTx; i++) {
          const tx = tokenTxData.result[i];
          const contractAddress = tx.contractAddress.toLowerCase();
          
          // Extract token info from transactions
          if (!processedTokens.has(contractAddress)) {
            // Try to get known token info
            const tokenInfo = getTokenInfoByAddress(contractAddress);
            const symbol = tx.tokenSymbol || tokenInfo.symbol;
            const name = tx.tokenName || tokenInfo.name;
            
            processedTokens.set(contractAddress, {
              symbol,
              name,
              decimals: parseInt(tx.tokenDecimal) || 18,
              contractAddress
            });
          }
          
          // Add token transaction
          const tokenInfo = processedTokens.get(contractAddress)!;
          const decimals = tokenInfo.decimals;
          const valueInTokens = (parseInt(tx.value) / Math.pow(10, decimals)).toFixed(8);
          
          transactions.push({
            hash: tx.hash,
            from: tx.from,
            to: tx.to,
            value: `${valueInTokens} ${tokenInfo.symbol}`,
            timestamp: parseInt(tx.timeStamp) * 1000, // Convert to milliseconds
          });
        }
        
        // Fetch simple token balances from the transaction data (estimate)
        // This avoids additional API calls for token balances which can be slow
        const tokenBalances = new Map<string, {
          symbol: string,
          name: string,
          balance: number,
          icon?: string
        }>();
        
        // Estimate balances from transactions
        for (const tx of tokenTxData.result.slice(0, 100)) {
          const contractAddress = tx.contractAddress.toLowerCase();
          const tokenInfo = processedTokens.get(contractAddress);
          if (!tokenInfo) continue;
          
          const { symbol, name, decimals } = tokenInfo;
          const amount = parseInt(tx.value) / Math.pow(10, decimals);
          
          if (!tokenBalances.has(symbol)) {
            tokenBalances.set(symbol, {
              symbol,
              name,
              balance: 0,
              icon: `https://cryptologos.cc/logos/${symbol.toLowerCase()}-${symbol.toLowerCase()}-logo.png`
            });
          }
          
          // Modify the balance based on transaction direction
          const currentTokenBalance = tokenBalances.get(symbol)!;
          if (tx.to.toLowerCase() === address.toLowerCase()) {
            // Incoming transaction
            currentTokenBalance.balance += amount;
          } else if (tx.from.toLowerCase() === address.toLowerCase()) {
            // Outgoing transaction
            currentTokenBalance.balance -= amount;
          }
        }
        
        // Get price data for major tokens
        const symbolToCoinGeckoId: Record<string, string> = {
          'link': 'chainlink',
          'usdt': 'tether',
          'usdc': 'usd-coin',
          'dai': 'dai',
          'aave': 'aave',
          'uni': 'uniswap',
          'weth': 'weth',
          'wbtc': 'wrapped-bitcoin',
          'shib': 'shiba-inu',
          'ape': 'apecoin',
          'matic': 'matic-network',
          'cro': 'crypto-com-chain',
          'atom': 'cosmos',
          'avax': 'avalanche-2',
          'ftm': 'fantom',
          'near': 'near',
          'doge': 'dogecoin'
        };
        
        // Only get prices for the top 10 tokens we actually have
        const tokenSymbols = Array.from(tokenBalances.values())
          .filter(t => t.balance > 0)
          .map(t => t.symbol.toLowerCase());
        
        const coinIds = tokenSymbols
          .map(symbol => symbolToCoinGeckoId[symbol] || symbol)
          .filter(id => id !== 'unknown')
          .slice(0, 10)  // Limit to 10 tokens for better performance
          .join(',');
        
        let tokenPrices: Record<string, any> = {};
        
        // Only fetch prices if we have tokens
        if (coinIds) {
          try {
            const priceResponse = await fetch(
              `${API_ENDPOINTS.coingecko}/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true`
            );
            tokenPrices = await priceResponse.json();
          } catch (error) {
            console.error("Error fetching token prices:", error);
          }
        }
        
        // Add token assets to our assets array
        for (const [symbol, tokenData] of tokenBalances.entries()) {
          if (tokenData.balance <= 0) continue; // Skip tokens with zero/negative balance
          
          const lowerSymbol = symbol.toLowerCase();
          const coinGeckoId = symbolToCoinGeckoId[lowerSymbol] || lowerSymbol;
          
          const priceData = tokenPrices[coinGeckoId];
          const price = priceData?.usd || 0;
          const change24h = priceData?.usd_24h_change || 0;
          const value = tokenData.balance * price;
          
          assets.push({
            symbol,
            name: tokenData.name,
            balance: tokenData.balance.toFixed(8),
            value,
            price,
            change24h,
            icon: tokenData.icon
          });
        }
      }
      
      // Sort assets by value (highest first)
      assets.sort((a, b) => b.value - a.value);
      
      // Sort transactions by timestamp (most recent first)
      transactions.sort((a, b) => b.timestamp - a.timestamp);
      
      console.log(`Successfully fetched ${transactions.length} transactions and ${assets.length} assets`);
      
      // Calculate total USD value from all assets
      const totalUsdValue = assets.reduce((total, asset) => total + asset.value, 0);
      
      const result = {
        balance: {
          native: ethBalance,
          usd: totalUsdValue,
        },
        assets,
        transactions,
      };
      
      // Cache the result
      ethereumDataCache.set(address, {
        data: result,
        timestamp: Date.now()
      });
      
      // If ETH balance seems unrealistically high, show a warning
      if (parseFloat(ethBalance) > 10) {
        console.warn("Potentially inaccurate ETH balance detected. Verifying against on-chain data.");
        toast.warning("ETH balance might be inaccurate due to API limitations. Verify with blockchain explorers.");
      }
      
      return result;
    }
    
    // If we couldn't get the data, throw an error
    throw new Error(`Etherscan API error: ${balanceData.message || 'Unknown error'}`);
  } catch (error) {
    console.error("Error fetching Ethereum data:", error);
    // Fall back to mock data
    return generateMockData(address, 'ethereum');
  }
};
