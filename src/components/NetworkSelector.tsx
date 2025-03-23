
import React from 'react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronDown } from "lucide-react";
import { cn } from '@/lib/utils';

export type NetworkType = 'ethereum' | 'bitcoin' | 'solana' | 'ton';

interface NetworkOption {
  id: NetworkType;
  name: string;
  icon: React.ReactNode;
}

const networks: NetworkOption[] = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11.9979 2L11.8391 2.53055V16.0857L11.9979 16.2446L18.2525 12.5575L11.9979 2Z" fill="#8A92B2" fillOpacity="0.35"/>
        <path d="M11.9979 2L5.74329 12.5575L11.9979 16.2446V9.6475V2Z" fill="#8A92B2"/>
        <path d="M11.9979 17.5677L11.9081 17.6785V22.6801L11.9979 22.945L18.2566 13.8823L11.9979 17.5677Z" fill="#8A92B2" fillOpacity="0.35"/>
        <path d="M11.9979 22.945V17.5677L5.74329 13.8823L11.9979 22.945Z" fill="#8A92B2"/>
        <path d="M11.9979 16.2446L18.2525 12.5575L11.9979 9.6475V16.2446Z" fill="#8A92B2" fillOpacity="0.15"/>
        <path d="M5.74329 12.5575L11.9979 16.2446V9.6475L5.74329 12.5575Z" fill="#8A92B2" fillOpacity="0.35"/>
      </svg>
    )
  },
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M23.6409 14.9029C22.0381 21.3315 15.5262 25.2438 9.09606 23.6407C2.66863 22.038 -1.24415 15.5265 0.359423 9.09837C1.96159 2.67029 8.47343 -1.24248 14.9016 0.359856C21.33 1.96361 25.2438 8.47442 23.6409 14.9029Z" fill="#F7931A" fillOpacity="0.35"/>
        <path d="M17.2905 10.4705C17.5219 8.8579 16.2599 7.9929 14.5239 7.4319L15.0629 5.3129L13.7559 5.0039L13.2329 7.0649C12.8979 6.9789 12.5529 6.8989 12.2109 6.8199L12.7379 4.7449L11.4319 4.4359L10.8919 6.5539C10.6109 6.4899 10.3349 6.4269 10.0679 6.3609L10.0699 6.3529L8.22391 5.9349L7.89591 7.3439C7.89591 7.3439 8.86791 7.5669 8.84791 7.5819C9.32691 7.6969 9.41391 8.0099 9.39591 8.2569L8.77591 10.6969C8.81291 10.7069 8.86091 10.7219 8.91291 10.7449C8.86991 10.7339 8.82291 10.7219 8.77391 10.7099L7.91291 14.0559C7.85391 14.1909 7.70291 14.3869 7.36391 14.3079C7.37691 14.3279 6.41291 14.0729 6.41291 14.0729L5.79791 15.5839L7.54691 15.9799C7.85391 16.0599 8.15391 16.1439 8.44891 16.2229L7.90291 18.3679L9.20791 18.6769L9.74691 16.5569C10.0939 16.6509 10.4299 16.7369 10.7569 16.8179L10.2199 18.9299L11.5269 19.2389L12.0729 17.0969C14.3829 17.5259 16.1349 17.3279 16.9149 15.2329C17.5469 13.5479 16.9049 12.6209 15.6919 12.0049C16.5999 11.8029 17.2879 11.1909 17.2779 10.1349C17.2919 10.2429 17.2905 10.4705 17.2905 10.4705ZM14.6409 14.3409C14.1879 16.0259 11.4249 15.1079 10.4379 14.8899L11.1709 12.0399C12.1579 12.2589 15.1179 12.5569 14.6409 14.3409ZM15.0939 10.1559C14.6789 11.6879 12.3599 10.9029 11.5339 10.7209L12.1999 8.1299C13.0259 8.3119 15.5289 8.5399 15.0939 10.1559Z" fill="#F7931A"/>
      </svg>
    )
  },
  {
    id: 'solana',
    name: 'Solana',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.8055 10.9895C17.6914 10.8692 17.5335 10.7995 17.3681 10.7995H7.52408C7.26089 10.7995 7.12929 11.1152 7.32346 11.3187L8.25971 12.3075C8.37379 12.4277 8.53165 12.4975 8.69709 12.4975H18.5411C18.8043 12.4975 18.9359 12.1817 18.7417 11.9782L17.8055 10.9895Z" fill="#9945FF" fillOpacity="0.35"/>
        <path d="M8.25971 15.7106C8.37379 15.5903 8.53165 15.5206 8.69709 15.5206H18.5411C18.8043 15.5206 18.9359 15.8363 18.7417 16.0398L17.8055 17.0285C17.6914 17.1488 17.5335 17.2186 17.3681 17.2186H7.52408C7.26089 17.2186 7.12929 16.9028 7.32346 16.6993L8.25971 15.7106Z" fill="#9945FF" fillOpacity="0.35"/>
        <path d="M8.25971 6.67938C8.37379 6.55913 8.53165 6.48938 8.69709 6.48938H18.5411C18.8043 6.48938 18.9359 6.80514 18.7417 7.00863L17.8055 7.99738C17.6914 8.11763 17.5335 8.18738 17.3681 8.18738H7.52408C7.26089 8.18738 7.12929 7.87163 7.32346 7.66813L8.25971 6.67938Z" fill="#9945FF"/>
      </svg>
    )
  },
  {
    id: 'ton',
    name: 'TON',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM16.5 7.5C16.5 7.10218 16.342 6.72064 16.0607 6.43934C15.7794 6.15804 15.3978 6 15 6H9C8.60218 6 8.22064 6.15804 7.93934 6.43934C7.65804 6.72064 7.5 7.10218 7.5 7.5V15C7.5 15.3978 7.65804 15.7794 7.93934 16.0607C8.22064 16.342 8.60218 16.5 9 16.5H15C15.3978 16.5 15.7794 16.342 16.0607 16.0607C16.342 15.7794 16.5 15.3978 16.5 15V7.5ZM9.75 7.5C9.75 7.5 9.75 8.25 10.5 8.25H13.5C14.25 8.25 14.25 7.5 14.25 7.5H9.75ZM10.5 9.75C10.0858 9.75 9.75 10.0858 9.75 10.5C9.75 10.9142 10.0858 11.25 10.5 11.25H13.5C13.9142 11.25 14.25 10.9142 14.25 10.5C14.25 10.0858 13.9142 9.75 13.5 9.75H10.5ZM9.75 13.5C9.75 13.0858 10.0858 12.75 10.5 12.75H13.5C13.9142 12.75 14.25 13.0858 14.25 13.5C14.25 13.9142 13.9142 14.25 13.5 14.25H10.5C10.0858 14.25 9.75 13.9142 9.75 13.5Z" fill="#0098EA" fillOpacity="0.35"/>
      </svg>
    )
  }
];

interface NetworkSelectorProps {
  selectedNetwork: NetworkType;
  onNetworkChange: (network: NetworkType) => void;
  className?: string;
}

const NetworkSelector: React.FC<NetworkSelectorProps> = ({
  selectedNetwork,
  onNetworkChange,
  className
}) => {
  const selectedOption = networks.find(network => network.id === selectedNetwork);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          role="combobox" 
          className={cn(
            "w-full flex justify-between items-center h-12 px-4 bg-stargazer-muted/70 backdrop-blur-md border-stargazer-muted/80 hover:bg-stargazer-muted/90 transition-all-cubic",
            className
          )}
        >
          <div className="flex items-center gap-2">
            {selectedOption?.icon}
            <span>{selectedOption?.name}</span>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 bg-stargazer-card border-stargazer-muted/80">
        <div className="max-h-60 overflow-auto p-1">
          {networks.map((network) => (
            <Button
              key={network.id}
              variant="ghost"
              onClick={() => onNetworkChange(network.id)}
              className={cn(
                "w-full flex items-center justify-start gap-2 px-3 py-2 hover:bg-stargazer-muted/50 rounded-md transition-all-cubic",
                selectedNetwork === network.id && "bg-violet-500/20 text-violet-200"
              )}
            >
              {network.icon}
              <span>{network.name}</span>
              {selectedNetwork === network.id && (
                <Check className="ml-auto h-4 w-4 text-violet-500" />
              )}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NetworkSelector;
