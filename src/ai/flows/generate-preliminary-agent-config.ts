'use server';
/**
 * @fileOverview This file implements a Genkit flow for generating a preliminary Retell Agent configuration (v1) and a structured Account Memo JSON from a demo call transcript.
 *
 * - generatePreliminaryAgentConfig - A function that orchestrates the extraction and generation process.
 * - GeneratePreliminaryAgentConfigInput - The input type for the generatePreliminaryAgentConfig function.
 * - GeneratePreliminaryAgentConfigOutput - The return type for the generatePreliminaryAgentConfig function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input Schema for the flow
const GeneratePreliminaryAgentConfigInputSchema = z.object({
  transcript:
    z.string().describe('The full transcript of the demo call for analysis.'),
});
export type GeneratePreliminaryAgentConfigInput = z.infer<
  typeof GeneratePreliminaryAgentConfigInputSchema
>;

// Account Memo JSON Schema
const AccountMemoOutputSchema = z.object({
  account_id: z
    .string()
    .describe(
      'A unique identifier for the account, generated if not explicitly mentioned.'
    ),
  company_name: z.string().describe('The name of the company.'),
  business_hours: z
    .object({
      days:
        z.string().describe('Days of the week when the business is open (e.g., "Mon-Fri").'),
      start: z.string().describe('Opening time (e.g., "9 AM").'),
      end: z.string().describe('Closing time (e.g., "5 PM").'),
      timezone:
        z.string().describe('Timezone of the business (e.g., "America/New_York").'),
    })
    .describe('Operating hours of the business.'),
  office_address: z
    .string()
    .optional()
    .describe('The physical address of the office, if present in the transcript.'),
  services_supported: z
    .array(z.string())
    .describe('List of services the company supports.'),
  emergency_definition: z
    .array(z.string())
    .describe('List of triggers that define an emergency situation.'),
  emergency_routing_rules: z
    .string()
    .describe('Rules for routing emergency calls (who to call, order, fallback).'),
  non_emergency_routing_rules: z
    .string()
    .describe('Rules for routing non-emergency calls.'),
  call_transfer_rules: z
    .string()
    .describe('Rules for call transfers (timeouts, retries, what to say if fails).'),
  integration_constraints: z
    .string()
    .describe(
      'Specific constraints or rules related to integrations (e.g., "never create sprinkler jobs in ServiceTrade").'
    ),
  after_hours_flow_summary: z
    .string()
    .describe('Summary of the call flow for after-hours calls.'),
  office_hours_flow_summary: z
    .string()
    .describe('Summary of the call flow for calls during office hours.'),
  questions_or_unknowns: z
    .array(z.string())
    .describe(
      'A list of questions or truly missing information that could not be extracted.'
    ),
  notes:
    z.string().describe('Short, concise notes related to the account or demo call.'),
});
export type AccountMemoOutput = z.infer<typeof AccountMemoOutputSchema>;

// Retell Agent Draft Spec Schema
const RetellAgentConfigOutputSchema = z.object({
  agent_name: z.string().describe('The name for the Retell AI agent.'),
  voice_style:
    z.literal('basic').describe('The voice style for the agent, must be "basic".'),
  system_prompt: z
    .string()
    .describe(
      'The comprehensive system prompt for the agent, adhering to strict hygiene rules.'
    ),
  key_variables: z
    .object({
      timezone: z.string().describe('The agent operates in this timezone.'),
      business_hours: z
        .string()
        .describe('Summary of the business hours for agent reference.'),
      address:
        z.string().optional().describe('The primary address for agent reference.'),
      emergency_routing: z
        .string()
        .describe('Summary of emergency routing rules for agent reference.'),
    })
    .describe('Key variables for the agent to reference.'),
  tool_invocation_placeholders: z
    .array(z.string())
    .describe(
      'Abstract placeholders for tools the agent might invoke (e.g., "transfer_call", "create_ticket").'
    ),
  call_transfer_protocol: z
    .string()
    .describe('Detailed protocol for transferring calls.'),
  fallback_protocol_if_transfer_fails: z
    .string()
    .describe('Detailed protocol for handling failed call transfers.'),
  version:
    z.literal('v1').describe('The version of the agent configuration, initially "v1".'),
});
export type RetellAgentConfigOutput = z.infer<
  typeof RetellAgentConfigOutputSchema
>;

// Combined Output Schema for the flow
const GeneratePreliminaryAgentConfigOutputSchema = z.object({
  accountMemo: AccountMemoOutputSchema,
  retellAgentConfig: RetellAgentConfigOutputSchema,
});
export type GeneratePreliminaryAgentConfigOutput = z.infer<
  typeof GeneratePreliminaryAgentConfigOutputSchema
>;

/**
 * Orchestrates the generation of a preliminary Retell Agent configuration and an Account Memo JSON
 * from a demo call transcript.
 *
 * @param input - The input containing the demo call transcript.
 * @returns A promise that resolves to the generated Account Memo and Retell Agent configuration.
 */
export async function generatePreliminaryAgentConfig(
  input: GeneratePreliminaryAgentConfigInput
): Promise<GeneratePreliminaryAgentConfigOutput> {
  return generatePreliminaryAgentConfigFlow(input);
}

// Prompt definition
const generatePreliminaryAgentPrompt = ai.definePrompt({
  name: 'generatePreliminaryAgentPrompt',
  input: {schema: GeneratePreliminaryAgentConfigInputSchema},
  output: {schema: GeneratePreliminaryAgentConfigOutputSchema},
  prompt: `You are an expert at extracting structured information from call transcripts and drafting AI agent configurations.
Your task is to analyze the provided demo call transcript and generate a single JSON object that contains two top-level keys: 'accountMemo' and 'retellAgentConfig'. Each of these keys will map to its respective JSON object as described below.

Instructions for Account Memo JSON:
- Extract all requested fields from the transcript.
- For 'account_id', if a specific ID is not mentioned in the transcript, generate a unique placeholder based on the company name (e.g., 'COMPANY_NAME_DEMO_YYYYMMDD_V1') and include 'Account ID generated as placeholder' in 'questions_or_unknowns'.
- If a detail is truly missing and cannot be inferred, leave the corresponding string field blank ("") or an empty array ([]) for array fields. Do NOT hallucinate information.
- For 'business_hours', extract days, start time, end time, and timezone.
- For 'emergency_definition', list triggers.
- For routing rules and transfer rules, summarize the protocols discussed.
- For 'integration_constraints', provide any specific rules or limitations mentioned.
- For 'after_hours_flow_summary' and 'office_hours_flow_summary', summarize the discussed flow for these scenarios.
- Keep 'notes' short and concise.

Instructions for Retell Agent Draft Spec:
- The 'agent_name' should reflect the company name or primary service from the transcript.
- The 'voice_style' must be "basic".
- The 'system_prompt' is critical and must adhere to the following hygiene rules for an AI agent interacting with callers:
    - **Overall Tone**: Be helpful, professional, and clear.
    - **Business hours flow**: Must include a polite greeting, state the purpose of the call, ask to collect the caller's name and number, explain how the call will be routed or transferred, describe what happens if a transfer fails, confirm next steps, offer further assistance ("anything else"), and end the call politely.
    - **After hours flow**: Must include a polite greeting, state the purpose of the call, confirm if the situation is an emergency, if it is an emergency, immediately ask to collect the caller's name, number, and address, explain that an attempt will be made to transfer the call, describe what happens if a transfer fails, assure the caller of a quick followup, offer further assistance ("anything else"), and end the call politely.
    - **Questioning**: Must NOT ask too many questions in succession. Only collect the absolutely essential information needed for routing and dispatch.
    - **Tool Mentions**: Must NOT mention "function calls", "tools", "APIs", or "automations" directly to the caller. The agent's actions should appear seamless.
    - **Call Transfer Protocol**: Clearly define what the agent says or does when initiating a call transfer.
    - **Transfer-Fail Protocol**: Clearly define what the agent says or does if a call transfer attempt fails, including what alternatives are offered.
- 'key_variables' should summarize important contextual variables for the agent (e.g., timezone, business hours summary, primary office address, emergency routing rules summary).
- 'tool_invocation_placeholders' should list any abstract tools the agent might eventually use (e.g., 'transfer_call', 'create_ticket', 'lookup_FAQ'), representing potential actions without detailed implementation.
- 'version' MUST be "v1".

Demo Call Transcript:
{{{transcript}}}
`,
});

// Flow definition
const generatePreliminaryAgentConfigFlow = ai.defineFlow(
  {
    name: 'generatePreliminaryAgentConfigFlow',
    inputSchema: GeneratePreliminaryAgentConfigInputSchema,
    outputSchema: GeneratePreliminaryAgentConfigOutputSchema,
  },
  async (input) => {
    const {output} = await generatePreliminaryAgentPrompt(input);
    if (!output) {
      throw new Error('Failed to generate preliminary agent config and account memo.');
    }
    return output;
  }
);
