
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

    // Get token balances directly 
    const tokenBalanceResponse = await fetch(
      `${API_ENDPOINTS.etherscan}?module=account&action=tokenbalance&address=${address}&tag=latest&apikey=${API_KEYS.etherscan}`
    );
    const tokenBalanceData = await tokenBalanceResponse.json();
    console.log("Token balance response:", tokenBalanceData);

    // Get normal transactions
    const txResponse = await fetch(
      `${API_ENDPOINTS.etherscan}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${API_KEYS.etherscan}`
    );
    const txData = await txResponse.json();
    console.log("Regular transaction count:", txData?.result?.length || 0);
    
    // Process the responses
    if (balanceData.status === '1') {
      // Convert wei to ETH (1 ETH = 10^18 wei)
      const ethBalance = (parseInt(balanceData.result) / 1e18).toFixed(6);
      
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
      const processedTokens = new Map<string, { 
        symbol: string, 
        name: string, 
        decimals: number,
        contractAddress: string,
        lastBalance: string
      }>();
      
      if (tokenTxData.status === '1' && tokenTxData.result.length > 0) {
        // Extract unique tokens from transactions
        for (const tx of tokenTxData.result) {
          const symbol = tx.tokenSymbol;
          if (!processedTokens.has(symbol) && tx.tokenSymbol !== 'ETH') {
            processedTokens.set(symbol, {
              symbol,
              name: tx.tokenName,
              decimals: parseInt(tx.tokenDecimal) || 18,
              contractAddress: tx.contractAddress,
              lastBalance: '0'
            });
          }
        }
        
        // Now calculate token balances by querying each token contract
        for (const [symbol, tokenInfo] of processedTokens.entries()) {
          try {
            // Query token balance using Etherscan API
            const tokenBalanceResponse = await fetch(
              `${API_ENDPOINTS.etherscan}?module=account&action=tokenbalance&contractaddress=${tokenInfo.contractAddress}&address=${address}&tag=latest&apikey=${API_KEYS.etherscan}`
            );
            const tokenBalanceData = await tokenBalanceResponse.json();
            
            if (tokenBalanceData.status === '1') {
              // Convert raw balance to decimal based on token decimals
              const rawBalance = tokenBalanceData.result;
              const formattedBalance = (parseInt(rawBalance) / Math.pow(10, tokenInfo.decimals)).toFixed(4);
              tokenInfo.lastBalance = formattedBalance;
              console.log(`${symbol} balance:`, formattedBalance);
            }
          } catch (err) {
            console.error(`Error fetching balance for token ${symbol}:`, err);
          }
        }
      }
      
      // Get price data for tokens from CoinGecko
      const tokenSymbols = Array.from(processedTokens.keys()).map(s => s.toLowerCase());
      let tokenPrices: Record<string, any> = {};
      
      if (tokenSymbols.length > 0) {
        try {
          // Convert token symbols to CoinGecko IDs
          // This is a simplified mapping - in production you'd use a more comprehensive mapping
          const coinIds = {
            'link': 'chainlink',
            'usdt': 'tether',
            'usdc': 'usd-coin',
            'dai': 'dai',
            'aave': 'aave',
            'uni': 'uniswap',
            'weth': 'weth',
            // Add more mappings as needed
          };
          
          // Build a list of coin IDs to query
          const coinIdList = tokenSymbols
            .map(symbol => coinIds[symbol.toLowerCase()] || symbol.toLowerCase())
            .join(',');
            
          if (coinIdList) {
            const priceResponse = await fetch(
              `${API_ENDPOINTS.coingecko}/simple/price?ids=${coinIdList}&vs_currencies=usd&include_24hr_change=true`
            );
            tokenPrices = await priceResponse.json();
            console.log("Token price data:", tokenPrices);
          }
        } catch (error) {
          console.error("Error fetching token prices:", error);
        }
      }
      
      // Add tokens to assets array with accurate balances
      for (const [symbol, tokenInfo] of processedTokens.entries()) {
        const balance = tokenInfo.lastBalance;
        
        // Skip tokens with zero balance
        if (parseFloat(balance) === 0) continue;
        
        // Try to get price data - for simplicity using a direct mapping
        // In production you'd have a more robust token ID mapping
        const coinGeckoId = symbol.toLowerCase() === 'link' ? 'chainlink' : 
                            symbol.toLowerCase() === 'usdt' ? 'tether' :
                            symbol.toLowerCase() === 'usdc' ? 'usd-coin' :
                            symbol.toLowerCase() === 'dai' ? 'dai' :
                            symbol.toLowerCase() === 'aave' ? 'aave' :
                            symbol.toLowerCase() === 'uni' ? 'uniswap' :
                            symbol.toLowerCase();
                            
        const priceData = tokenPrices[coinGeckoId];
        const price = priceData?.usd || 0;
        const change24h = priceData?.usd_24h_change || 0;
        const value = parseFloat(balance) * price;
        
        // Add the token to our assets list if it has any balance
        if (parseFloat(balance) > 0) {
          assets.push({
            symbol,
            name: tokenInfo.name,
            balance,
            value,
            price,
            change24h,
            icon: `https://cryptologos.cc/logos/${symbol.toLowerCase()}-${symbol.toLowerCase()}-logo.png`
          });
        }
      }
      
      // Sort assets by value (highest first)
      assets.sort((a, b) => b.value - a.value);
      
      // Process transactions
      const transactions: Transaction[] = [];
      
      // Process both normal and token transactions
      if (txData.status === '1' && txData.result.length > 0) {
        // Process normal ETH transactions
        const maxTx = Math.min(txData.result.length, 200); // Increase limit to get more data
        console.log(`Processing ${maxTx} out of ${txData.result.length} normal transactions`);
        
        for (let i = 0; i < maxTx; i++) {
          const tx = txData.result[i];
          const valueInEth = (parseInt(tx.value) / 1e18).toFixed(6);
          
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
      
      // Add token transactions too
      if (tokenTxData.status === '1' && tokenTxData.result.length > 0) {
        const maxTokenTx = Math.min(tokenTxData.result.length, 200);
        console.log(`Processing ${maxTokenTx} out of ${tokenTxData.result.length} token transactions`);
        
        for (let i = 0; i < maxTokenTx; i++) {
          const tx = tokenTxData.result[i];
          const decimals = parseInt(tx.tokenDecimal) || 18;
          const valueInTokens = (parseInt(tx.value) / Math.pow(10, decimals)).toFixed(6);
          
          transactions.push({
            hash: tx.hash,
            from: tx.from,
            to: tx.to,
            value: `${valueInTokens} ${tx.tokenSymbol}`,
            timestamp: parseInt(tx.timeStamp) * 1000, // Convert to milliseconds
          });
        }
      }
      
      // Sort all transactions by timestamp, most recent first
      transactions.sort((a, b) => b.timestamp - a.timestamp);
      
      console.log(`Processed ${transactions.length} transactions for address ${address}`);
      console.log(`Found ${assets.length} assets for address ${address}`);
      
      // Calculate total USD value from all assets
      const totalUsdValue = assets.reduce((total, asset) => total + asset.value, 0);
      
      return {
        balance: {
          native: ethBalance,
          usd: totalUsdValue,
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
