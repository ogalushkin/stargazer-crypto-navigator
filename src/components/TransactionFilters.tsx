
import React from 'react';
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Filter, ArrowUpDown, Clock, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddressCategory, FilterState, FlowDirection, SortOption, TimeRangeOption } from './TransactionGraph';

interface TransactionFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

// Category colors matching Arkham style
const CATEGORY_COLORS = {
  exchange: '#FF6B6B',     // Soft Red for centralized exchanges
  deposit: '#FFD166',      // Soft Yellow for deposit addresses
  individual: '#06D6A0',   // Soft Green for individuals & funds
  dex: '#118AB2',          // Soft Blue for decentralized exchanges
  lending: '#9D4EDD',      // Soft Purple for lending protocols
  uncategorized: '#8E9196' // Soft Gray for uncategorized
};

const CATEGORY_LABELS = {
  exchange: 'Centralized Exchanges',
  deposit: 'Deposit Addresses',
  individual: 'Individuals & Funds',
  dex: 'Decentralized Exchanges',
  lending: 'Lending Protocols',
  uncategorized: 'Uncategorized'
};

const FLOW_DIRECTIONS: {[key in FlowDirection]: string} = {
  'in': 'Flow In',
  'out': 'Flow Out',
  'all': 'Flow All',
  'self': 'Flow Self'
};

const TransactionFilters: React.FC<TransactionFiltersProps> = ({ filters, onFilterChange }) => {
  // Handle sort by change
  const handleSortChange = (value: SortOption) => {
    onFilterChange({
      ...filters,
      sortBy: value
    });
  };

  // Handle time range change
  const handleTimeRangeChange = (value: TimeRangeOption) => {
    onFilterChange({
      ...filters,
      timeRange: value
    });
  };

  // Handle category filter toggle
  const handleCategoryToggle = (category: AddressCategory) => {
    onFilterChange({
      ...filters,
      categoryFilters: {
        ...filters.categoryFilters,
        [category]: {
          ...filters.categoryFilters[category],
          enabled: !filters.categoryFilters[category].enabled
        }
      }
    });
  };

  // Handle flow direction change
  const handleFlowChange = (category: AddressCategory, flow: FlowDirection) => {
    onFilterChange({
      ...filters,
      categoryFilters: {
        ...filters.categoryFilters,
        [category]: {
          ...filters.categoryFilters[category],
          flow
        }
      }
    });
  };

  // Reset all filters to default
  const handleResetFilters = () => {
    onFilterChange({
      sortBy: 'time',
      timeRange: 'all',
      categoryFilters: {
        exchange: { enabled: true, flow: 'all' },
        deposit: { enabled: true, flow: 'all' },
        individual: { enabled: true, flow: 'all' },
        dex: { enabled: true, flow: 'all' },
        lending: { enabled: true, flow: 'all' },
        uncategorized: { enabled: true, flow: 'all' }
      }
    });
  };

  return (
    <Card className="m-0 p-0 bg-transparent border-none shadow-none">
      <CardContent className="p-3 border-t border-b border-stargazer-muted/30">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center">
            <Filter className="w-4 h-4 mr-2 text-white/50" />
            <span className="text-sm text-white/70">Filters:</span>
          </div>
          
          {/* Sort By Dropdown */}
          <div className="flex items-center rounded-md bg-stargazer-muted/30 h-8 mr-2">
            <div className="flex items-center px-3 border-r border-stargazer-muted/40">
              <ArrowUpDown className="w-3.5 h-3.5 mr-1 text-white/50" />
              <span className="text-xs text-white/70">Sort:</span>
            </div>
            <Select
              value={filters.sortBy}
              onValueChange={(value) => handleSortChange(value as SortOption)}
            >
              <SelectTrigger className="border-0 h-8 bg-transparent focus:ring-0 focus-visible:ring-0 p-0 pl-2 pr-2 w-[85px] font-normal text-xs">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-stargazer-card border-stargazer-muted/40 text-white/90">
                <SelectItem value="time" className="text-xs">Time</SelectItem>
                <SelectItem value="amount" className="text-xs">Amount</SelectItem>
                <SelectItem value="direction" className="text-xs">Direction</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Time Range Dropdown */}
          <div className="flex items-center rounded-md bg-stargazer-muted/30 h-8 mr-2">
            <div className="flex items-center px-3 border-r border-stargazer-muted/40">
              <Clock className="w-3.5 h-3.5 mr-1 text-white/50" />
              <span className="text-xs text-white/70">Time:</span>
            </div>
            <Select
              value={filters.timeRange}
              onValueChange={(value) => handleTimeRangeChange(value as TimeRangeOption)}
            >
              <SelectTrigger className="border-0 h-8 bg-transparent focus:ring-0 focus-visible:ring-0 p-0 pl-2 pr-2 w-[100px] font-normal text-xs">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent className="bg-stargazer-card border-stargazer-muted/40 text-white/90">
                <SelectItem value="all" className="text-xs">All time</SelectItem>
                <SelectItem value="24h" className="text-xs">Last 24h</SelectItem>
                <SelectItem value="7d" className="text-xs">Last 7d</SelectItem>
                <SelectItem value="custom" className="text-xs" disabled>Custom range</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Reset Filters Button */}
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs bg-stargazer-muted/30 hover:bg-stargazer-muted border-none text-white/70"
            onClick={handleResetFilters}
          >
            <X className="w-3.5 h-3.5 mr-1" />
            Reset Filters
          </Button>
        </div>
        
        {/* Category Filters */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-3">
          {(Object.keys(filters.categoryFilters) as Array<AddressCategory>).map((category) => (
            <div 
              key={category} 
              className={`rounded-md overflow-hidden bg-stargazer-muted/20 border border-stargazer-muted/30 ${!filters.categoryFilters[category].enabled ? 'opacity-50' : 'opacity-100'}`}
            >
              <div 
                className="flex items-center justify-between p-2 cursor-pointer"
                onClick={() => handleCategoryToggle(category)}
              >
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: CATEGORY_COLORS[category] }}
                  ></div>
                  <span className="text-xs text-white/80">{CATEGORY_LABELS[category]}</span>
                </div>
                <div className="w-4 h-4 flex items-center justify-center">
                  {filters.categoryFilters[category].enabled ? (
                    <div className="w-3 h-3 rounded-sm bg-violet-400"></div>
                  ) : (
                    <div className="w-3 h-3 rounded-sm border border-white/30"></div>
                  )}
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full h-7 rounded-none text-xs px-2 py-0 border-t border-stargazer-muted/30 bg-transparent text-white/60 hover:bg-stargazer-muted/40 justify-between"
                  >
                    {FLOW_DIRECTIONS[filters.categoryFilters[category].flow]}
                    <ArrowUpDown className="w-3 h-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-stargazer-card border-stargazer-muted/40 text-white/90 min-w-0 w-auto">
                  {(Object.keys(FLOW_DIRECTIONS) as Array<FlowDirection>).map((flow) => (
                    <DropdownMenuItem 
                      key={flow}
                      className="text-xs justify-center"
                      onClick={() => handleFlowChange(category, flow)}
                    >
                      {FLOW_DIRECTIONS[flow]}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionFilters;
