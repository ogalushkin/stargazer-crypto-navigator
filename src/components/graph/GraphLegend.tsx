
import React from 'react';
import { INCOMING_COLOR, OUTGOING_COLOR, SELF_TRANSFER_COLOR, CATEGORY_COLORS } from '@/utils/graphUtils';

interface GraphLegendProps {
  showCategories?: boolean;
}

const GraphLegend: React.FC<GraphLegendProps> = ({ showCategories = false }) => {
  return (
    <div className="absolute bottom-3 left-3 flex flex-col gap-2 z-10 p-2 bg-stargazer-card/80 rounded-md">
      <div className="flex items-center gap-4">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: INCOMING_COLOR }}></div>
          <span className="text-xs text-white/70">Incoming</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: OUTGOING_COLOR }}></div>
          <span className="text-xs text-white/70">Outgoing</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: SELF_TRANSFER_COLOR }}></div>
          <span className="text-xs text-white/70">Self</span>
        </div>
      </div>
      
      {showCategories && (
        <div className="flex flex-wrap gap-x-4 gap-y-2 pt-1 border-t border-stargazer-muted/30">
          {Object.entries(CATEGORY_COLORS).map(([category, color]) => (
            <div key={category} className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: color }}></div>
              <span className="text-xs text-white/70 capitalize">{category}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GraphLegend;
