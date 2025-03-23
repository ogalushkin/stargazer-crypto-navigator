
import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  TooltipProvider, 
  Tooltip, 
  TooltipTrigger, 
  TooltipContent 
} from "@/components/ui/tooltip";
import { ZoomIn, ZoomOut, RefreshCcw, Download, Eye, EyeOff, MaximizeIcon } from "lucide-react";

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
              <MaximizeIcon className="h-4 w-4" />
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
