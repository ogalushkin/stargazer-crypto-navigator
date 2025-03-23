
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import GraphLegend from './GraphLegend';

interface CytoscapeErrorBoundaryProps {
  hasError: boolean;
  retry: () => void;
}

const CytoscapeErrorBoundary: React.FC<CytoscapeErrorBoundaryProps> = ({ hasError, retry }) => {
  if (!hasError) return null;
  
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-stargazer-card/30">
      <AlertTriangle className="w-10 h-10 text-yellow-500 mb-3" />
      <p className="text-white/70 mb-4">Failed to render the graph</p>
      <button 
        className="px-4 py-2 bg-stargazer-muted/50 hover:bg-stargazer-muted text-white rounded-md"
        onClick={retry}
      >
        Try Again
      </button>
      <GraphLegend showCategories={true} />
    </div>
  );
};

export default CytoscapeErrorBoundary;
