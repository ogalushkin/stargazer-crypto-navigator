
import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  TooltipProvider, 
  Tooltip, 
  TooltipTrigger, 
  TooltipContent 
} from "@/components/ui/tooltip";
import { ZoomIn, ZoomOut, RefreshCcw, Download, Eye, EyeOff } from "lucide-react";

interface GraphControlsProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  fitGraph: () => void;
  rebuildGraph: () => void;
  exportGraph: () => void;
}

const GraphControls: React.FC<GraphControlsProps> = ({
  showFilters,
  setShowFilters,
  zoomIn,
  zoomOut,
  fitGraph,
  rebuildGraph,
  exportGraph
}) => {
  return (
    <div className="flex gap-1.5">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-stargazer-muted/70 hover:bg-stargazer-muted border-stargazer-muted/80"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{showFilters ? "Hide Filters" : "Show Filters"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-stargazer-muted/70 hover:bg-stargazer-muted border-stargazer-muted/80"
              onClick={rebuildGraph}
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Rebuild Graph</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-stargazer-muted/70 hover:bg-stargazer-muted border-stargazer-muted/80"
              onClick={zoomIn}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Zoom In</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-stargazer-muted/70 hover:bg-stargazer-muted border-stargazer-muted/80"
              onClick={zoomOut}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Zoom Out</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-stargazer-muted/70 hover:bg-stargazer-muted border-stargazer-muted/80"
              onClick={fitGraph}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 21V14M3 14H10M3 14L9 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 3H14M14 3V10M14 3L20 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Fit to Screen</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-stargazer-muted/70 hover:bg-stargazer-muted border-stargazer-muted/80"
              onClick={exportGraph}
            >
              <Download className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Export as PNG</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default GraphControls;
