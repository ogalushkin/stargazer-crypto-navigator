
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';

// Define which API keys we need
export type ApiKeyType = 'etherscan' | 'blockstream' | 'solana' | 'toncenter';

// Store API keys in localStorage
export const getApiKey = (type: ApiKeyType): string => {
  return localStorage.getItem(`stargazer_${type}_api_key`) || '';
};

export const setApiKey = (type: ApiKeyType, key: string): void => {
  localStorage.setItem(`stargazer_${type}_api_key`, key);
};

const formSchema = z.object({
  etherscan: z.string().min(0).optional(),
  blockstream: z.string().min(0).optional(),
  solana: z.string().min(0).optional(),
  toncenter: z.string().min(0).optional(),
});

const ApiKeyManager: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      etherscan: '',
      blockstream: '',
      solana: '',
      toncenter: '',
    },
  });
  
  // Load existing API keys on mount
  useEffect(() => {
    form.setValue('etherscan', getApiKey('etherscan'));
    form.setValue('blockstream', getApiKey('blockstream'));
    form.setValue('solana', getApiKey('solana'));
    form.setValue('toncenter', getApiKey('toncenter'));
  }, [form, isOpen]);
  
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Save API keys to localStorage
    if (values.etherscan) setApiKey('etherscan', values.etherscan);
    if (values.blockstream) setApiKey('blockstream', values.blockstream);
    if (values.solana) setApiKey('solana', values.solana);
    if (values.toncenter) setApiKey('toncenter', values.toncenter);
    
    toast.success('API keys saved successfully');
    setIsOpen(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Settings className="h-5 w-5" />
          <span className="sr-only">API Key Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-stargazer-darkbg border-stargazer-muted/40 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl">API Keys</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="etherscan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Etherscan API Key</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your Etherscan API key" 
                      {...field} 
                      className="bg-stargazer-card"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="blockstream"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Blockstream API Key</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your Blockstream API key" 
                      {...field} 
                      className="bg-stargazer-card"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="solana"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Solana API Key</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your Solana.fm or Solscan API key" 
                      {...field} 
                      className="bg-stargazer-card"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="toncenter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>TON API Key</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your Toncenter or TonAPI key" 
                      {...field} 
                      className="bg-stargazer-card"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="pt-4">
              <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700">
                Save API Keys
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyManager;
