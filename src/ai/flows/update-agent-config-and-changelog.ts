'use server';
/**
 * @fileOverview A Genkit flow for updating an existing Retell Agent configuration and Account Memo JSON based on new onboarding information.
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
  prompt: `You are an expert automation engineer. Update the existing Retell Agent configuration (v1) and Account Memo (v1) to v2 based on the onboarding transcript.

Instructions:
1. Generate 'v2AccountMemo' by applying updates from the transcript to v1.
2. Generate 'v2AgentSpec' with 'version' set to "v2".
3. Update the 'system_prompt' and flows based on new routing rules or business hours.
4. Create a detailed Markdown 'changelog' listing old vs new values for every change.

Account ID: {{{account_id}}}

V1 Account Memo:
{{{v1AccountMemo}}}

V1 Retell Agent Spec:
{{{v1AgentSpec}}}

Onboarding Transcript:
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
