
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDistanceToNow } from 'date-fns';
import { ArrowUp, ArrowDown, ChevronsRight, ChevronsLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TableTransaction {
  id: string;
  source: string;
  target: string;
  label: string;
  value: number;
  isIncoming?: boolean;
  isSelfTransfer?: boolean;
  hash: string;
  timestamp: number;
}

interface TransactionTableProps {
  transactions: TableTransaction[];
  selectedTransaction: string | null;
  onSelectTransaction: (hash: string | null) => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ 
  transactions, 
  selectedTransaction,
  onSelectTransaction
}) => {
  const [page, setPage] = React.useState(1);
  const rowsPerPage = 10;
  
  const shortenAddress = (addr: string): string => {
    return addr.length > 14
      ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
      : addr;
  };
  
  const shortenHash = (hash: string): string => {
    return hash.length > 10
      ? `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`
      : hash;
  };
  
  // Sort transactions by timestamp (most recent first)
  const sortedTransactions = [...transactions].sort((a, b) => b.timestamp - a.timestamp);
  
  // Paginate transactions
  const paginatedTransactions = sortedTransactions.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );
  
  const totalPages = Math.ceil(sortedTransactions.length / rowsPerPage);
  
  const handleNextPage = () => {
    setPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };
  
  const handlePrevPage = () => {
    setPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-stargazer-muted/30 flex justify-between items-center">
        <h3 className="text-sm font-medium text-white/90">Transaction List</h3>
        <div className="text-xs text-white/50">
          {sortedTransactions.length} transactions
        </div>
      </div>
      
      <div className="flex-grow overflow-auto">
        <Table>
          <TableHeader className="bg-stargazer-muted/20 sticky top-0">
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs text-white/50 font-normal w-[90px]">Time</TableHead>
              <TableHead className="text-xs text-white/50 font-normal">From/To</TableHead>
              <TableHead className="text-xs text-white/50 font-normal text-right">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-white/50 text-sm">
                  No transactions to display
                </TableCell>
              </TableRow>
            ) : (
              paginatedTransactions.map((tx) => (
                <TableRow 
                  key={tx.id}
                  className={`cursor-pointer hover:bg-stargazer-muted/30 ${selectedTransaction === tx.hash ? 'bg-stargazer-muted/50' : ''}`}
                  onClick={() => onSelectTransaction(selectedTransaction === tx.hash ? null : tx.hash)}
                >
                  <TableCell className="text-white/80 text-xs py-2">
                    {formatDistanceToNow(new Date(tx.timestamp), { addSuffix: true })}
                  </TableCell>
                  <TableCell className="text-xs py-2">
                    <div className="flex items-center">
                      {tx.isSelfTransfer ? (
                        <div className="flex items-center text-gray-400">
                          <span className="text-white/70">{shortenAddress(tx.source)}</span>
                          <ArrowUp className="mx-1 h-3 w-3 text-gray-500" />
                          <ArrowDown className="mr-1 h-3 w-3 text-gray-500" />
                          <span className="text-white/70">{shortenAddress(tx.target)}</span>
                        </div>
                      ) : tx.isIncoming ? (
                        <div className="flex items-center text-emerald-500">
                          <span className="text-white/70">{shortenAddress(tx.source)}</span>
                          <ArrowDown className="mx-1 h-3 w-3" />
                          <span className="text-white/70 font-medium">You</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-rose-500">
                          <span className="text-white/70 font-medium">You</span>
                          <ArrowUp className="mx-1 h-3 w-3" />
                          <span className="text-white/70">{shortenAddress(tx.target)}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-[10px] text-white/40 mt-0.5">
                      {shortenHash(tx.hash)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs py-2">
                    <div className={`font-medium ${tx.isIncoming ? 'text-emerald-500' : tx.isSelfTransfer ? 'text-gray-400' : 'text-rose-500'}`}>
                      {tx.label}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {totalPages > 1 && (
        <div className="p-3 border-t border-stargazer-muted/30 flex justify-between items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrevPage}
            disabled={page === 1}
            className="h-7 px-2 text-xs"
          >
            <ChevronsLeft className="h-4 w-4 mr-1" />
            Prev
          </Button>
          
          <div className="text-xs text-white/60">
            Page {page} of {totalPages}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNextPage}
            disabled={page === totalPages}
            className="h-7 px-2 text-xs"
          >
            Next
            <ChevronsRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default TransactionTable;
