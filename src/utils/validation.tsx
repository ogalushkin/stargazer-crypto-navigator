
import { NetworkType } from "@/components/NetworkSelector";

/**
 * Validates if the provided string is a valid address for the specified network
 */
export const validateAddress = async (
  address: string,
  network: NetworkType
): Promise<boolean> => {
  // Basic validation patterns
  const patterns = {
    ethereum: /^0x[a-fA-F0-9]{40}$/,
    bitcoin: /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/,
    solana: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
    ton: /^(?:-1|0):[\da-fA-F]{64}$|^EQ[\w-]{48}$/
  };

  // Simple pattern validation
  if (!patterns[network].test(address)) {
    return false;
  }

  // For a real application, this would include additional validation:
  // 1. Ethereum: checksum validation
  // 2. Bitcoin: checksum validation in base58 addresses
  // 3. Solana: check if it's a valid ed25519 public key
  // 4. TON: validate checksum in the user-friendly format

  // Simulate network lookup delay for demo purposes
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return true;
};

/**
 * Shortens an address for display purposes
 */
export const shortenAddress = (address: string, startChars = 6, endChars = 4): string => {
  if (!address) return '';
  
  if (address.length <= startChars + endChars) {
    return address;
  }
  
  // For TON addresses like 'EQ...', preserve the prefix
  if (address.startsWith('EQ') && address.length > startChars + endChars + 2) {
    return `EQ${address.substring(2, startChars)}...${address.substring(address.length - endChars)}`;
  }
  
  return `${address.substring(0, startChars)}...${address.substring(address.length - endChars)}`;
};
