
import React from 'react';
import { INCOMING_COLOR, OUTGOING_COLOR, SELF_TRANSFER_COLOR } from '@/utils/graphUtils';

const GraphLegend: React.FC = () => {
  return (
    <div className="absolute bottom-3 left-3 flex items-center gap-4 z-10 p-2 bg-stargazer-card/80 rounded-md">
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
  );
};

export default GraphLegend;
