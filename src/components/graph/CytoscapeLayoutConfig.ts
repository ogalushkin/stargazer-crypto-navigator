
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
    // Place nodes smartly
    position: function(node: any) {
      const data = node.data();
      if (data.isTarget) {
        return { x: 0, y: 0 };
      }
      if (data.isIncoming) {
        return { x: -200 - (Math.random() * 100), y: -100 + (Math.random() * 200) };
      }
      return { x: 200 + (Math.random() * 100), y: -100 + (Math.random() * 200) };
    },
    fixedNodeConstraint: [{ nodeId: targetNodeId, position: { x: 0, y: 0 } }]
  };
};

// Simple preset layout for initial positioning before main layout runs
export const getPresetLayoutConfig = () => {
  return {
    name: 'preset',
    fit: true
  };
};
