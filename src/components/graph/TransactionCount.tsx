
import React from 'react';
import { MAX_TRANSACTIONS } from '@/utils/graphUtils';

interface TransactionCountProps {
  count: number;
}

const TransactionCount: React.FC<TransactionCountProps> = ({ count }) => {
  const isTruncated = count > MAX_TRANSACTIONS;
  
  if (!isTruncated) {
    return null;
  }
  
  return (
    <p className="text-xs text-white/50 mt-1">
      Showing {MAX_TRANSACTIONS} of {count} transactions for better performance
    </p>
  );
};

export default TransactionCount;
