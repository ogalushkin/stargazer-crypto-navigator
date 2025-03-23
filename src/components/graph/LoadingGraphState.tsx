
import React from 'react';
import { Loader2 } from "lucide-react";

const LoadingGraphState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <Loader2 className="w-10 h-10 text-violet-500 animate-spin mb-3" />
      <p className="text-white/70">Loading transaction data...</p>
    </div>
  );
};

export default LoadingGraphState;
