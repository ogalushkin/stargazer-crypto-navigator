
import React from 'react';
import { Loader2 } from 'lucide-react';
import GraphLegend from './GraphLegend';
import CytoscapeErrorBoundary from './CytoscapeErrorBoundary';
import { UseCytoscapeGraphReturn } from './types/CytoscapeTypes';

interface CytoscapeGraphContentProps {
  graphHook: UseCytoscapeGraphReturn;
  nodes: any[];
  edges: any[];
}

const CytoscapeGraphContent: React.FC<CytoscapeGraphContentProps> = ({
  graphHook,
  nodes,
  edges
}) => {
  const { 
    containerRef, 
    isRendering, 
    hasError,
    setHasError,
    initializeGraph
  } = graphHook;

  return (
    <div className="relative w-full h-full" ref={containerRef}>
      <CytoscapeErrorBoundary 
        hasError={hasError}
        retry={() => {
          setHasError(false);
          initializeGraph();
        }}
      />
      
      {isRendering && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-stargazer-card/80">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
        </div>
      )}
      
      {!isRendering && nodes.length > 0 && edges.length > 0 && !hasError && (
        <GraphLegend showCategories={true} />
      )}
    </div>
  );
};

export default CytoscapeGraphContent;
