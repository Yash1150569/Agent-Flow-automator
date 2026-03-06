import type { AccountMemoOutput, RetellAgentConfigOutput } from '@/ai/flows/generate-preliminary-agent-config';

export type AccountData = {
  account_id: string;
  company_name: string;
  v1: {
    memo: any; // Using any to stay flexible with schema evolution
    agent: any;
    timestamp: string;
  };
  v2?: {
    memo: any; 
    agent: any; 
    changelog: string;
    timestamp: string;
  };
  status: 'demo_processed' | 'onboarding_processed';
};

class Storage {
  private accounts: Map<string, AccountData> = new Map();

  constructor() {
    // In-memory storage for the prototype
  }

  saveAccount(data: AccountData) {
    this.accounts.set(data.account_id, data);
    return data;
  }

  getAccount(id: string) {
    return this.accounts.get(id);
  }

  getAllAccounts() {
    return Array.from(this.accounts.values()).sort((a, b) => 
      new Date(b.v1.timestamp).getTime() - new Date(a.v1.timestamp).getTime()
    );
  }

  updateAccount(id: string, updates: Partial<AccountData>) {
    const existing = this.accounts.get(id);
    if (!existing) throw new Error('Account not found');
    const updated = { ...existing, ...updates };
    this.accounts.set(id, updated);
    return updated;
  }
}

export const accountStorage = new Storage();
