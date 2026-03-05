'use client';

import { AccountData } from '@/lib/storage';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { History, ChevronRight, FileText, CheckCircle2 } from 'lucide-react';

interface AccountListProps {
  accounts: AccountData[];
  onSelect: (account: AccountData) => void;
  selectedId?: string;
}

export function AccountList({ accounts, onSelect, selectedId }: AccountListProps) {
  if (accounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-xl bg-card/50">
        <FileText className="w-12 h-12 mb-4 text-muted-foreground opacity-20" />
        <h3 className="text-lg font-semibold">No accounts processed yet</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
          Upload a demo call transcript to begin the automation pipeline.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Recent Projects</h2>
        <Badge variant="outline">{accounts.length} Total</Badge>
      </div>
      <div className="grid gap-3">
        {accounts.map((account) => (
          <Card 
            key={account.account_id}
            className={`cursor-pointer transition-all hover:shadow-md border-l-4 ${
              selectedId === account.account_id 
                ? 'ring-2 ring-primary bg-primary/5 border-l-primary' 
                : account.status === 'onboarding_processed' 
                  ? 'border-l-secondary' 
                  : 'border-l-muted'
            }`}
            onClick={() => onSelect(account)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg text-primary">{account.company_name}</span>
                    {account.status === 'onboarding_processed' && (
                      <CheckCircle2 className="w-4 h-4 text-secondary" />
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <History className="w-3 h-3" />
                    Last update: {new Date(account.v2?.timestamp || account.v1.timestamp).toLocaleDateString()}
                  </div>
                </div>
                <Badge variant={account.status === 'onboarding_processed' ? 'secondary' : 'outline'}>
                  {account.status === 'onboarding_processed' ? 'v2 Ready' : 'v1 Draft'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}