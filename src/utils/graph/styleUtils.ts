
// Edge colors
export const INCOMING_COLOR = '#00FF41'; // Bright green
export const OUTGOING_COLOR = '#FF3864'; // Bright red/pink
export const SELF_TRANSFER_COLOR = '#AAAAAA'; // Light gray

// Calculate edge width based on transaction value using logarithmic scale
export const calculateEdgeWidth = (value: number): number => {
  if (value <= 0) return 0.5;
  
  // Improved logarithmic scaling with better limits for crypto values
  // For values from 0.001 to 1000, this gives a nice range of widths
  const width = Math.log10(value + 0.001) * 2.0 + 0.5;
  
  // Clamp between min 0.5px and max 8px for better performance with many edges
  return Math.min(Math.max(width, 0.5), 8);
};

// Calculate position offsets for multiple edges between the same nodes
export const calculateEdgeOffset = (index: number, total: number): number => {
  if (total <= 1) return 0;
  
  // Reduce the offset for better performance and less visual clutter
  const maxOffset = Math.min(total * 2, 10); // Limit max offset to 10px
  const offset = ((index / (total - 1)) - 0.5) * maxOffset;
  return offset;
};

// Calculate the optimal curve style based on the number of edges
export const getCurveStyle = (edgeCount: number): string => {
  // Use simpler curve styles for better performance on large graphs
  if (edgeCount > 500) return 'straight';
  if (edgeCount > 200) return 'unbundled-bezier';
  return 'bezier';
};
