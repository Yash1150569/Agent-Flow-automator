'use server';
/**
 * @fileOverview A Genkit flow for updating an existing Retell Agent configuration and Account Memo JSON based on new onboarding information.
 *
 * - updateAgentConfigAndChangelog - A function that handles the update process and generates a changelog.
 * - UpdateAgentConfigAndChangelogInput - The input type for the updateAgentConfigAndChangelog function.
 * - UpdateAgentConfigAndChangelogOutput - The return type for the updateAgentConfigAndChangelog function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BusinessHoursSchema = z.object({
  days: z.string().describe('Days of the week, e.g., "Monday-Friday"'),
  start: z.string().describe('Start time, e.g., "9:00 AM"'),
  end: z.string().describe('End time, e.g., "5:00 PM"'),
  timezone: z.string().describe('Timezone, e.g., "America/Los_Angeles"'),
}).describe('Business hours details, including days, start/end times, and timezone.');

const EmergencyRoutingRulesSchema = z.object({
  who_to_call: z.string().describe('Who to call for emergency routing.'),
  order: z.string().describe('Order of contact attempts, e.g., "first responder, then manager"'),
  fallback: z.string().describe('Fallback action if no one is reached.'),
}).describe('Rules for routing emergency calls.');

const CallTransferRulesSchema = z.object({
  timeouts: z.string().describe('Timeout duration for call transfer.'),
  retries: z.string().describe('Number of retries for failed transfers.'),
  what_to_say_if_fails: z.string().describe('Message to play if transfer fails.'),
}).describe('Rules for handling call transfers.');

const KeyVariablesSchema = z.object({
  timezone: z.string().optional().describe('Timezone for the agent.'),
  business_hours: z.string().optional().describe('Formatted business hours string.'),
  address: z.string().optional().describe('Office address.'),
  emergency_routing: z.string().optional().describe('Summary of emergency routing logic.'),
}).describe('Key variables that can be used in the agent system prompt.');

const AccountMemoSchema = z.object({
  account_id: z.string().describe('Unique identifier for the account.'),
  company_name: z.string().describe('Name of the company.'),
  business_hours: BusinessHoursSchema.optional().describe('Operational business hours.'),
  office_address: z.string().optional().describe('Physical office address.'),
  services_supported: z.array(z.string()).optional().describe('List of services the company supports.'),
  emergency_definition: z.array(z.string()).optional().describe('Definition of what constitutes an emergency.'),
  emergency_routing_rules: EmergencyRoutingRulesSchema.optional().describe('Rules for routing emergency calls.'),
  non_emergency_routing_rules: z.string().optional().describe('Rules for routing non-emergency calls.'),
  call_transfer_rules: CallTransferRulesSchema.optional().describe('Rules for handling call transfers.'),
  integration_constraints: z.array(z.string()).optional().describe('Constraints related to system integrations.'),
  after_hours_flow_summary: z.string().optional().describe('Summary of the after-hours call flow.'),
  office_hours_flow_summary: z.string().optional().describe('Summary of the office-hours call flow.'),
  questions_or_unknowns: z.array(z.string()).optional().describe('List of questions or unknown details.'),
  notes: z.string().optional().describe('Short additional notes.'),
}).describe('Structured JSON for an account memo, containing key operational details for an agent.');

const RetellAgentDraftSpecSchema = z.object({
  agent_name: z.string().describe('Name of the Retell agent.'),
  voice_style: z.string().describe('Basic voice style setting.').optional(),
  system_prompt: z.string().describe('The generated system prompt for the Retell agent.'),
  key_variables: KeyVariablesSchema.optional().describe('Key variables that can be used in the agent system prompt.'),
  tool_invocation_placeholders: z.array(z.string()).optional().describe('Placeholders for tool invocations within the agent logic.'),
  call_transfer_protocol: z.string().optional().describe('Protocol to follow for initiating a call transfer.'),
  fallback_protocol_if_transfer_fails: z.string().optional().describe('Protocol to follow if a call transfer attempt fails.'),
  version: z.union([z.literal('v1'), z.literal('v2')]).describe('The version of the agent specification.'),
}).describe('Structured JSON for a Retell Agent Draft Specification, including system prompt and key settings.');

const UpdateAgentConfigAndChangelogInputSchema = z.object({
  account_id: z.string().describe('The unique identifier for the account.'),
  onboardingTranscript: z.string().describe('The transcript of the onboarding call or form response, containing updates for the agent configuration.'),
  v1AccountMemo: z.any().describe('The existing v1 Account Memo JSON object.'),
  v1AgentSpec: z.any().describe('The existing v1 Retell Agent Draft Spec JSON object.'),
}).describe('Input for updating an agent configuration and generating a changelog.');

export type UpdateAgentConfigAndChangelogInput = z.infer<typeof UpdateAgentConfigAndChangelogInputSchema>;

const UpdateAgentConfigAndChangelogOutputSchema = z.object({
  v2AccountMemo: AccountMemoSchema.describe('The updated v2 Account Memo JSON object.'),
  v2AgentSpec: RetellAgentDraftSpecSchema.extend({ version: z.literal('v2') }).describe('The updated v2 Retell Agent Draft Spec JSON object.'),
  changelog: z.string().describe('A detailed changelog in Markdown format, describing all modifications between v1 and v2 of the Account Memo and Agent Spec.'),
}).describe('Output containing the updated agent configuration, memo, and changelog.');

export type UpdateAgentConfigAndChangelogOutput = z.infer<typeof UpdateAgentConfigAndChangelogOutputSchema>;

export async function updateAgentConfigAndChangelog(input: UpdateAgentConfigAndChangelogInput): Promise<UpdateAgentConfigAndChangelogOutput> {
  return updateAgentConfigAndChangelogFlow(input);
}

const prompt = ai.definePrompt({
  name: 'updateAgentConfigAndChangelogPrompt',
  input: { schema: UpdateAgentConfigAndChangelogInputSchema },
  output: { schema: UpdateAgentConfigAndChangelogOutputSchema },
  prompt: `You are an expert automation engineer assistant. Your task is to update an existing Retell Agent configuration (v1) and its associated Account Memo JSON (v1) to a new version (v2) based on an onboarding call transcript. You must also generate a detailed changelog in Markdown format highlighting all modifications.

**Instructions:**
1.  **Analyze and Update:** Carefully review the provided 'Existing V1 Account Memo', 'Existing V1 Retell Agent Spec', and the 'Onboarding Transcript'.
2.  **Extract Information:** Identify any new or changed information in the 'Onboarding Transcript' relevant to the Account Memo and Agent Spec.
3.  **Generate V2 Account Memo:** Create a new JSON object for the 'V2 Account Memo'. Start with the 'Existing V1 Account Memo' and apply all relevant updates from the 'Onboarding Transcript'.
    *   If a detail is clearly modified or newly provided, update it.
    *   If a detail is missing from the transcript and was present in V1, retain the V1 value.
    *   If a detail is truly unknown or ambiguous from the transcript, either leave the field blank or add it to the 'questions_or_unknowns' array. Do not hallucinate.
    *   Ensure the JSON structure strictly follows the schema described for Account Memo.
4.  **Generate V2 Retell Agent Spec:** Create a new JSON object for the 'V2 Retell Agent Spec'. Start with the 'Existing V1 Retell Agent Spec' and apply all relevant updates.
    *   The 'version' field MUST be "v2".
    *   **System Prompt Generation:** The 'system_prompt' field must be comprehensively updated or re-generated based on the onboarding transcript and the following strict hygiene rules:
        *   **Business hours flow:** Must include greeting, purpose, instructions to collect name and number, how to route or transfer, fallback if transfer fails, confirmation of next steps, options for "anything else", and a closing.
        *   **After hours flow:** Must include greeting, purpose, confirmation of emergency status, instructions to immediately collect name, number, and address if emergency, attempt transfer, fallback if transfer fails, assurance of quick follow-up, options for "anything else", and a closing.
        *   **Efficiency:** Must not ask too many questions. Only collect what is needed for routing and dispatch.
        *   **Transparency:** Must not mention "function calls" to the caller.
        *   **Protocols:** Must include a clear call transfer protocol and a transfer-fail protocol.
    *   If a detail is missing from the transcript and was present in V1, retain the V1 value.
    *   If a detail is truly unknown or ambiguous from the transcript, either leave the field blank or add it to tool invocation placeholders if appropriate. Do not hallucinate.
    *   Ensure the JSON structure strictly follows the schema described for Retell Agent Draft Spec.
5.  **Generate Changelog:** Create a detailed changelog in Markdown format. This changelog should clearly list all changes made to both the Account Memo and the Retell Agent Spec from v1 to v2. For each change, clearly state:
    *   The specific field that changed.
    *   The old value (from v1).
    *   The new value (in v2).
    *   A brief explanation or context for the change, referencing the onboarding transcript if applicable.
    *   If a new item was added, indicate "N/A" for the old value. If an item was removed, indicate "N/A" for the new value.

**Account ID:** {{{account_id}}}

**Existing V1 Account Memo:**

\`\`\`json
{{{v1AccountMemo}}}
\`\`\`

**Existing V1 Retell Agent Spec:**

\`\`\`json
{{{v1AgentSpec}}}
\`\`\`

**Onboarding Transcript:**

\`\`\`
{{{onboardingTranscript}}}
\`\`\`

**Your Output (JSON object containing v2AccountMemo, v2AgentSpec, and changelog):**`,
});

const updateAgentConfigAndChangelogFlow = ai.defineFlow(
  {
    name: 'updateAgentConfigAndChangelogFlow',
    inputSchema: UpdateAgentConfigAndChangelogInputSchema,
    outputSchema: UpdateAgentConfigAndChangelogOutputSchema,
  },
  async (input) => {
    // Stringify objects for the prompt template to avoid parsing issues and Handlebars object output
    const {output} = await prompt({
      ...input,
      v1AccountMemo: JSON.stringify(input.v1AccountMemo, null, 2),
      v1AgentSpec: JSON.stringify(input.v1AgentSpec, null, 2),
    });
    return output!;
  },
);
