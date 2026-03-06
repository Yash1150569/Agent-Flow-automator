'use server';
/**
 * @fileOverview A Genkit flow for updating an existing Retell Agent configuration and Account Memo JSON based on new onboarding information (Pipeline B).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const UpdateAgentConfigAndChangelogInputSchema = z.object({
  account_id: z.string().describe('The unique identifier for the account.'),
  onboardingTranscript: z.string().describe('The transcript of the onboarding call.'),
  v1AccountMemo: z.any().describe('The existing v1 Account Memo JSON object.'),
  v1AgentSpec: z.any().describe('The existing v1 Retell Agent Draft Spec JSON object.'),
});

const UpdateAgentConfigAndChangelogOutputSchema = z.object({
  v2AccountMemo: z.any().describe('The updated v2 Account Memo JSON object.'),
  v2AgentSpec: z.any().describe('The updated v2 Retell Agent Draft Spec JSON object.'),
  changelog: z.string().describe('A detailed changelog in Markdown format.'),
});

export type UpdateAgentConfigAndChangelogInput = z.infer<typeof UpdateAgentConfigAndChangelogInputSchema>;
export type UpdateAgentConfigAndChangelogOutput = z.infer<typeof UpdateAgentConfigAndChangelogOutputSchema>;

export async function updateAgentConfigAndChangelog(input: UpdateAgentConfigAndChangelogInput): Promise<UpdateAgentConfigAndChangelogOutput> {
  return updateAgentConfigAndChangelogFlow(input);
}

const prompt = ai.definePrompt({
  name: 'updateAgentConfigAndChangelogPrompt',
  input: { schema: UpdateAgentConfigAndChangelogInputSchema },
  output: { schema: UpdateAgentConfigAndChangelogOutputSchema },
  prompt: `You are an expert automation engineer for the Clara AI Pipeline. Your task is to transition an account from v1 (Preliminary) to v2 (Production-Ready) based on onboarding feedback.

Instructions:
1. Generate 'v2AccountMemo' by merging onboarding data into the v1 memo. Ensure 'version' is set to "v2" or noted.
2. Generate 'v2AgentSpec' by updating prompts, variables, and flows. 'version' MUST be "v2".
3. If no onboarding data is relevant, create the v2 placeholder as requested in the Clara specs.
4. Create a Markdown 'changelog' showing exactly what was added, removed, or modified.

Account ID: {{{account_id}}}

V1 Account Memo:
{{{v1AccountMemo}}}

V1 Retell Agent Spec:
{{{v1AgentSpec}}}

Onboarding Transcript/Feedback:
{{{onboardingTranscript}}}
`,
});

const updateAgentConfigAndChangelogFlow = ai.defineFlow(
  {
    name: 'updateAgentConfigAndChangelogFlow',
    inputSchema: UpdateAgentConfigAndChangelogInputSchema,
    outputSchema: UpdateAgentConfigAndChangelogOutputSchema,
  },
  async (input) => {
    const {output} = await prompt({
      ...input,
      v1AccountMemo: JSON.stringify(input.v1AccountMemo, null, 2),
      v1AgentSpec: JSON.stringify(input.v1AgentSpec, null, 2),
    });
    return output!;
  },
);
