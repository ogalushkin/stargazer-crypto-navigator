
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import TransactionCount from './TransactionCount';
import GraphControls from './GraphControls';
import LoadingGraphState from './LoadingGraphState';
import EmptyGraphState from './EmptyGraphState';

interface GraphContainerProps {
  title: string;
  fullPage?: boolean;
  isLoading?: boolean;
  isEmpty?: boolean;
  transactionCount?: number;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  fitGraph: () => void;
  rebuildGraph: () => void;
  exportGraph: () => void;
  onTryAnotherClick?: () => void;
  children: React.ReactNode;
}

const GraphContainer: React.FC<GraphContainerProps> = ({
  title,
  fullPage = false,
  isLoading = false,
  isEmpty = false,
  transactionCount = 0,
  showFilters,
  setShowFilters,
  zoomIn,
  zoomOut,
  fitGraph,
  rebuildGraph,
  exportGraph,
  onTryAnotherClick,
  children
}) => {
  return (
    <Card className={`bg-stargazer-card border-stargazer-muted/40 animate-fade-in ${fullPage ? 'w-full h-[calc(100vh-80px)]' : ''}`}>
      <CardHeader className="pb-3 flex flex-row justify-between items-center">
        <div>
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
          <TransactionCount count={transactionCount} />
        </div>
        <GraphControls 
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          zoomIn={zoomIn}
          zoomOut={zoomOut}
          fitGraph={fitGraph}
          rebuildGraph={rebuildGraph}
          exportGraph={exportGraph}
        />
      </CardHeader>
      
      {isLoading && (
        <CardContent className={`${fullPage ? 'h-[calc(100vh-140px)]' : 'h-[524px]'} flex items-center justify-center`}>
          <LoadingGraphState />
        </CardContent>
      )}
      
      {!isLoading && isEmpty && (
        <CardContent className={`${fullPage ? 'h-[calc(100vh-140px)]' : 'h-[524px]'} flex items-center justify-center`}>
          <EmptyGraphState onTryAnotherClick={onTryAnotherClick} />
        </CardContent>
      )}
      
      {!isLoading && !isEmpty && children}
    </Card>
  );
};

export default GraphContainer;
