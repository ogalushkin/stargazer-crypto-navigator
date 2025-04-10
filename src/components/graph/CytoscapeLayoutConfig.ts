
// Define layout configuration options in a separate file
export const getLayoutConfig = (targetNodeId: string) => {
  return {
    name: 'cose-bilkent',
    fit: true,
    padding: 50,
    nodeDimensionsIncludeLabels: true,
    nodeRepulsion: 8000,
    idealEdgeLength: 150,
    edgeElasticity: 0.45,
    nestingFactor: 0.1,
    gravity: 0.25,
    randomize: false,
    animate: true,
    animationDuration: 700,
    animationEasing: 'ease-in-out-cubic',
    // Position nodes in a directional flow based on transaction direction
    position: function(node: any) {
      const data = node.data();
      if (data.isTarget) {
        return { x: 0, y: 0 };
      }
      if (data.isIncoming) {
        return { x: -250 - (Math.random() * 100), y: -100 + (Math.random() * 200) };
      }
      return { x: 250 + (Math.random() * 100), y: -100 + (Math.random() * 200) };
    },
    // Fix the target node in the center
    fixedNodeConstraint: [{ nodeId: targetNodeId, position: { x: 0, y: 0 } }],
    // Align nodes based on transaction direction
    alignmentConstraint: { vertical: [
      { node: targetNodeId, position: 'center' }
    ]},
    // Group related nodes for smoother dragging
    groupCompoundNodes: true,
    // Improve edge placement
    edgeEndpoint: function(edge: any) {
      return {
        source: 'outside-to-node',
        target: 'outside-to-node'
      };
    }
  };
};

// Simple preset layout for initial positioning before main layout runs
export const getPresetLayoutConfig = () => {
  return {
    name: 'preset',
    fit: true
  };
};

// Function to adjust layout after user interactions
export const getPostInteractionLayoutConfig = (targetNodeId: string) => {
  return {
    name: 'cose-bilkent',
    fit: false,
    padding: 50,
    nodeDimensionsIncludeLabels: true,
    nodeRepulsion: 6000,
    idealEdgeLength: 120,
    edgeElasticity: 0.5,
    nestingFactor: 0.1,
    gravity: 0.3,
    randomize: false,
    animate: true,
    animationDuration: 500,
    animationEasing: 'ease-out-cubic',
    fixedNodeConstraint: [{ nodeId: targetNodeId, position: { x: 0, y: 0 } }],
    alignmentConstraint: { vertical: [
      { node: targetNodeId, position: 'center' }
    ]},
    groupCompoundNodes: true
  };
};
