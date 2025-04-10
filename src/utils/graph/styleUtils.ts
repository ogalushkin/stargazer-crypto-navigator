
// Edge colors
export const INCOMING_COLOR = '#00FF41'; // Bright green
export const OUTGOING_COLOR = '#FF3864'; // Bright red/pink
export const SELF_TRANSFER_COLOR = '#AAAAAA'; // Light gray

// Calculate edge width based on transaction value using logarithmic scale
export const calculateEdgeWidth = (value: number): number => {
  if (value <= 0) return 1;
  
  // Logarithmic scaling with a multiplier of 2.5
  // Using Math.log10 to get better scaling for crypto transaction values
  const width = Math.log10(value + 1) * 2.5;
  
  // Clamp between min 1px and max 10px
  return Math.min(Math.max(width, 1), 10);
};

// Calculate position offsets for multiple edges between the same nodes
export const calculateEdgeOffset = (index: number, total: number): number => {
  if (total <= 1) return 0;
  const offset = ((index / (total - 1)) - 0.5) * 20;
  return offset;
};
