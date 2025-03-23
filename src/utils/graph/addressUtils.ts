
// Utility function to shorten address for display
export const shortenAddress = (addr: string): string => {
  return addr.length > 14
    ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
    : addr;
};
