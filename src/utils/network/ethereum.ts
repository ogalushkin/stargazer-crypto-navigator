
import { AddressData, Asset, Transaction } from "@/utils/types";
import { API_ENDPOINTS, API_KEYS } from "@/utils/config";
import { generateMockData } from "../mockData";
import { ethereumTokenAddressToSymbol, getTokenInfoByAddress } from "../logoUtils";

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

    // Try to get token balances using more reliable method - ERC-20 token balances
    const tokenBalancesResponse = await fetch(
      `${API_ENDPOINTS.etherscan}?module=account&action=tokenbalance&address=${address}&tag=latest&apikey=${API_KEYS.etherscan}`
    );
    const tokenBalancesData = await tokenBalancesResponse.json();
    console.log("Token balances response:", tokenBalancesData);

    // Get normal transactions
    const txResponse = await fetch(
      `${API_ENDPOINTS.etherscan}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${API_KEYS.etherscan}`
    );
    const txData = await txResponse.json();
    console.log("Regular transaction count:", txData?.result?.length || 0);
    
    // Process the responses
    if (balanceData.status === '1') {
      // Convert wei to ETH (1 ETH = 10^18 wei)
      const ethBalance = (parseInt(balanceData.result) / 1e18).toFixed(8);
      
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

      // Track unique token contract addresses from transactions
      const processedTokens = new Map<string, { 
        symbol: string, 
        name: string, 
        decimals: number,
        contractAddress: string,
        lastBalance: string
      }>();
      
      if (tokenTxData.status === '1' && tokenTxData.result && tokenTxData.result.length > 0) {
        // Extract unique tokens from transactions
        for (const tx of tokenTxData.result) {
          const contractAddress = tx.contractAddress.toLowerCase();
          
          // If we haven't processed this token yet
          if (!processedTokens.has(contractAddress)) {
            // Try to get known token info from our mapping
            const tokenInfo = getTokenInfoByAddress(contractAddress);
            const symbol = tx.tokenSymbol || tokenInfo.symbol;
            const name = tx.tokenName || tokenInfo.name;
            
            processedTokens.set(contractAddress, {
              symbol,
              name,
              decimals: parseInt(tx.tokenDecimal) || 18,
              contractAddress,
              lastBalance: '0'
            });
          }
        }
        
        // Fetch the balance for each token contract
        for (const [contractAddress, tokenInfo] of processedTokens.entries()) {
          try {
            // Query token balance using Etherscan API for ERC-20 tokens
            const tokenBalanceResponse = await fetch(
              `${API_ENDPOINTS.etherscan}?module=account&action=tokenbalance&contractaddress=${tokenInfo.contractAddress}&address=${address}&tag=latest&apikey=${API_KEYS.etherscan}`
            );
            const tokenBalanceData = await tokenBalanceResponse.json();
            
            if (tokenBalanceData.status === '1') {
              // Convert raw balance to decimal based on token decimals
              const rawBalance = tokenBalanceData.result;
              const formattedBalance = (parseInt(rawBalance) / Math.pow(10, tokenInfo.decimals)).toFixed(8);
              tokenInfo.lastBalance = formattedBalance;
              console.log(`${tokenInfo.symbol} balance:`, formattedBalance);
            }
          } catch (err) {
            console.error(`Error fetching balance for token ${tokenInfo.symbol}:`, err);
          }
        }
      }
      
      // Get price data for tokens from CoinGecko
      // Create a mapping of symbols to CoinGecko IDs for more reliable price lookups
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
      
      const tokenSymbols = Array.from(processedTokens.values()).map(t => t.symbol.toLowerCase());
      const coinIds = tokenSymbols
        .map(symbol => symbolToCoinGeckoId[symbol] || symbol)
        .filter(id => id !== 'unknown')
        .join(',');
      
      let tokenPrices: Record<string, any> = {};
      
      // Only fetch prices if we have tokens
      if (coinIds) {
        try {
          const priceResponse = await fetch(
            `${API_ENDPOINTS.coingecko}/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true`
          );
          tokenPrices = await priceResponse.json();
          console.log("Token price data:", tokenPrices);
        } catch (error) {
          console.error("Error fetching token prices:", error);
        }
      }
      
      // Process token assets with their balances
      for (const tokenInfo of processedTokens.values()) {
        const balance = tokenInfo.lastBalance;
        
        // Skip tokens with zero balance
        if (parseFloat(balance) === 0) continue;
        
        const symbol = tokenInfo.symbol;
        const lowerSymbol = symbol.toLowerCase();
        const coinGeckoId = symbolToCoinGeckoId[lowerSymbol] || lowerSymbol;
        
        const priceData = tokenPrices[coinGeckoId];
        const price = priceData?.usd || 0;
        const change24h = priceData?.usd_24h_change || 0;
        const value = parseFloat(balance) * price;
        
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
      if (txData.status === '1' && txData.result && txData.result.length > 0) {
        // Process normal ETH transactions
        const maxTx = Math.min(txData.result.length, 200);
        console.log(`Processing ${maxTx} out of ${txData.result.length} normal transactions`);
        
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
      
      // Add token transactions too
      if (tokenTxData.status === '1' && tokenTxData.result && tokenTxData.result.length > 0) {
        const maxTokenTx = Math.min(tokenTxData.result.length, 200);
        console.log(`Processing ${maxTokenTx} out of ${tokenTxData.result.length} token transactions`);
        
        for (let i = 0; i < maxTokenTx; i++) {
          const tx = tokenTxData.result[i];
          const decimals = parseInt(tx.tokenDecimal) || 18;
          const valueInTokens = (parseInt(tx.value) / Math.pow(10, decimals)).toFixed(8);
          
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
