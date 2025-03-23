
import { 
  Transaction, 
  FilterState, 
  TimeRangeOption,
  SortOption
} from '@/utils/graphTypes';

// Filter transactions based on time range
export const filterTransactionsByTime = (
  transactions: Transaction[], 
  timeRange: TimeRangeOption
): Transaction[] => {
  if (timeRange === 'all') return [...transactions];
  
  const now = Date.now();
  let filteredTransactions = [...transactions];
  
  if (timeRange === '24h') {
    return filteredTransactions.filter(tx => 
      (now - tx.timestamp) < 24 * 60 * 60 * 1000
    );
  } else if (timeRange === '7d') {
    return filteredTransactions.filter(tx => 
      (now - tx.timestamp) < 7 * 24 * 60 * 60 * 1000
    );
  }
  
  return filteredTransactions;
};

// Sort transactions based on sort option
export const sortTransactions = (
  transactions: Transaction[], 
  sortBy: SortOption,
  address: string
): Transaction[] => {
  const sortedTransactions = [...transactions];
  
  if (sortBy === 'time') {
    sortedTransactions.sort((a, b) => b.timestamp - a.timestamp);
  } else if (sortBy === 'amount') {
    sortedTransactions.sort((a, b) => {
      const valueA = parseFloat(a.value.split(' ')[0]) || 0;
      const valueB = parseFloat(b.value.split(' ')[0]) || 0;
      return valueB - valueA;
    });
  } else if (sortBy === 'direction') {
    sortedTransactions.sort((a, b) => {
      const aIsIncoming = a.to === address;
      const bIsIncoming = b.to === address;
      if (aIsIncoming && !bIsIncoming) return -1;
      if (!aIsIncoming && bIsIncoming) return 1;
      return 0;
    });
  }
  
  return sortedTransactions;
};
