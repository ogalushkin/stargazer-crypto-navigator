
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

const AssetListSkeleton: React.FC = () => {
  return (
    <div className="px-6">
      <Table>
        <TableHeader>
          <TableRow className="border-stargazer-muted/20">
            <TableHead className="w-[200px]">Asset</TableHead>
            <TableHead className="text-right">Holdings</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(3)].map((_, i) => (
            <TableRow key={i} className="border-stargazer-muted/20">
              <TableCell className="py-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full bg-stargazer-muted/30" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16 bg-stargazer-muted/30" />
                    <Skeleton className="h-3 w-24 bg-stargazer-muted/20" />
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right py-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20 bg-stargazer-muted/30 ml-auto" />
                  <Skeleton className="h-3 w-14 bg-stargazer-muted/20 ml-auto" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <Separator className="my-4 bg-stargazer-muted/20" />
      
      <div className="py-4 flex justify-between items-center">
        <Skeleton className="h-5 w-16 bg-stargazer-muted/30" />
        <Skeleton className="h-5 w-24 bg-stargazer-muted/30" />
      </div>
    </div>
  );
};

export default AssetListSkeleton;
