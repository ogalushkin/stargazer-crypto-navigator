
import React from 'react';
import { Button } from "@/components/ui/button";
import { NetworkIcon } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface EmptyGraphStateProps {
  onTryAnotherClick?: () => void;
}

const EmptyGraphState: React.FC<EmptyGraphStateProps> = ({ onTryAnotherClick }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (onTryAnotherClick) {
      onTryAnotherClick();
    } else {
      navigate('/');
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center">
      <NetworkIcon className="w-10 h-10 text-white/30 mb-3" />
      <p className="text-white/70 mb-4">No transactions found for this address</p>
      <Button 
        variant="outline" 
        className="bg-stargazer-muted/70 hover:bg-stargazer-muted border-stargazer-muted/80 text-white/80"
        onClick={handleClick}
      >
        Try Another Address
      </Button>
    </div>
  );
};

export default EmptyGraphState;
