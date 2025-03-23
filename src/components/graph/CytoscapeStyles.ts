import { CATEGORY_COLORS, INCOMING_COLOR, OUTGOING_COLOR, SELF_TRANSFER_COLOR } from '@/utils/graphUtils';

// Define the cytoscape styles in a separate file to keep the main component cleaner
export const getCytoscapeStyles = () => {
  return [
    // Base node styles
    {
      selector: 'node',
      style: {
        'background-color': '#000000',
        'border-color': '#454560',
        'border-width': 1,
        'width': 42,
        'height': 42,
        'label': 'data(label)',
        'color': '#FFFFFF',
        'text-background-color': '#1A1A25',
        'text-background-opacity': 0.7,
        'text-background-padding': '2px',
        'text-valign': 'bottom',
        'text-halign': 'center' as const,
        'font-size': '11px',
        'text-margin-y': 6,
        'font-family': 'system-ui, -apple-system, sans-serif',
        'text-outline-width': 1,
        'text-outline-color': '#131118',
        'text-outline-opacity': 0.8
      }
    },
    // Target node styles
    {
      selector: 'node[isTarget]',
      style: {
        'background-color': '#000000',
        'border-color': '#9b87f5',
        'border-width': 2,
        'width': 55,
        'height': 55,
        'font-weight': 'bold',
        'font-size': '12px',
        'text-background-color': '#4C1D95',
        'z-index': 10
      }
    },
    // Category styles
    {
      selector: 'node[category="exchange"]',
      style: {
        'border-color': CATEGORY_COLORS.exchange
      }
    },
    {
      selector: 'node[category="deposit"]',
      style: {
        'border-color': CATEGORY_COLORS.deposit
      }
    },
    {
      selector: 'node[category="individual"]',
      style: {
        'border-color': CATEGORY_COLORS.individual
      }
    },
    {
      selector: 'node[category="dex"]',
      style: {
        'border-color': CATEGORY_COLORS.dex
      }
    },
    {
      selector: 'node[category="lending"]',
      style: {
        'border-color': CATEGORY_COLORS.lending
      }
    },
    {
      selector: 'node[category="uncategorized"]',
      style: {
        'border-color': CATEGORY_COLORS.uncategorized
      }
    },
    // Edge styles
    {
      selector: 'edge',
      style: {
        'width': 'data(width)',
        'line-color': OUTGOING_COLOR,
        'target-arrow-color': OUTGOING_COLOR,
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier',
        'target-endpoint': 'outside-to-node',
        'source-endpoint': 'outside-to-node',
        'edge-distances': 'node-position',
        'control-point-step-size': 40,
        'control-point-weight': 0.5,
        'label': '',
        'font-size': '8px',
        'color': '#E2E8F0',
        'text-background-color': '#1A1A25',
        'text-background-opacity': 0.7,
        'text-background-padding': '2px',
        'text-rotation': 'autorotate',
        'arrow-scale': 1.3,
        'line-style': 'solid',
        'z-index': 1
      }
    },
    {
      selector: 'edge[isIncoming]',
      style: {
        'line-color': INCOMING_COLOR,
        'target-arrow-color': INCOMING_COLOR
      }
    },
    {
      selector: 'edge[isSelfTransfer]',
      style: {
        'line-color': SELF_TRANSFER_COLOR,
        'target-arrow-color': SELF_TRANSFER_COLOR,
        'line-style': 'dashed'
      }
    },
    {
      selector: 'edge.highlighted',
      style: {
        'line-color': '#FFFFFF',
        'target-arrow-color': '#FFFFFF',
        'line-style': 'solid',
        'z-index': 999,
        // Use a larger width for emphasis
        'width': function(ele) {
          // Get original width and add 2px for emphasis
          const originalWidth = ele.data('width') || 1;
          return originalWidth + 2;
        },
        'opacity': 1
      }
    },
    {
      selector: 'node[isIncoming]',
      style: {
        'background-color': '#000000',
        'border-color': INCOMING_COLOR
      }
    },
    {
      selector: 'node[isOutgoing]',
      style: {
        'background-color': '#000000',
        'border-color': OUTGOING_COLOR
      }
    }
  ] as any; // Return as any to resolve type issues with Cytoscape styles
};
