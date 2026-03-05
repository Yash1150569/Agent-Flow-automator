'use server';

import { generatePreliminaryAgentConfig } from '@/ai/flows/generate-preliminary-agent-config';
import { updateAgentConfigAndChangelog } from '@/ai/flows/update-agent-config-and-changelog';
import { accountStorage, AccountData } from '@/lib/storage';
import { revalidatePath } from 'next/cache';

export async function processDemoTranscript(transcript: string) {
  try {
    const result = await generatePreliminaryAgentConfig({ transcript });
    
    const accountData: AccountData = {
      account_id: result.accountMemo.account_id,
      company_name: result.accountMemo.company_name,
      status: 'demo_processed',
      v1: {
        memo: result.accountMemo,
        agent: result.retellAgentConfig,
        timestamp: new Date().toISOString(),
      }
    };

    accountStorage.saveAccount(accountData);
    revalidatePath('/');
    return { success: true, accountId: accountData.account_id };
  } catch (error: any) {
    console.error('Demo Processing Error:', error);
    return { success: false, error: error.message };
  }
}

export async function processOnboardingTranscript(accountId: string, onboardingTranscript: string) {
  try {
    const existing = accountStorage.getAccount(accountId);
    if (!existing) throw new Error('Account not found in system.');

    const result = await updateAgentConfigAndChangelog({
      account_id: accountId,
      onboardingTranscript,
      v1AccountMemo: existing.v1.memo as any,
      v1AgentSpec: existing.v1.agent as any,
    });

    const updated = accountStorage.updateAccount(accountId, {
      status: 'onboarding_processed',
      v2: {
        memo: result.v2AccountMemo,
        agent: result.v2AgentSpec,
        changelog: result.changelog,
        timestamp: new Date().toISOString(),
      }
    });

    revalidatePath('/');
    return { success: true, accountId };
  } catch (error: any) {
    console.error('Onboarding Processing Error:', error);
    return { success: false, error: error.message };
  }
}

export async function getAccounts() {
  return accountStorage.getAllAccounts();
}