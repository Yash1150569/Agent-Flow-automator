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
  contact_person: z.string().optional().describe('Primary contact person name.'),
  contact_phone: z.string().optional().describe('Primary contact phone number.'),
  contact_email: z.string().optional().describe('Primary contact email address.'),
  business_email: z.string().optional().describe('Main business email address.'),
  business_hours: z
    .object({
      days:
        z.string().describe('Days of the week when the business is open (e.g., "Mon-Fri").'),
      start: z.string().describe('Opening time (e.g., "9 AM").'),
      end: z.string().describe('Closing time (e.g., "5 PM").'),
      timezone:
        z.string().describe('Timezone of the business (e.g., "America/New_York").'),
    })
    .optional()
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
    .optional()
    .describe('Rules for routing emergency calls.'),
  non_emergency_routing_rules: z
    .string()
    .optional()
    .describe('Rules for routing non-emergency calls.'),
  call_transfer_rules: z
    .object({
      timeout_seconds: z.string().optional(),
      retry_attempts: z.string().optional(),
    })
    .optional()
    .describe('Rules for call transfers.'),
  integration_constraints: z
    .array(z.string())
    .describe(
      'Specific constraints or rules related to integrations.'
    ),
  after_hours_flow_summary: z
    .string()
    .optional()
    .describe('Summary of the call flow for after-hours calls.'),
  office_hours_flow_summary: z
    .string()
    .optional()
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
  version: z.literal('v1').describe('The version of the agent configuration.'),
  voice_style: z.string().describe('The voice style for the agent (e.g. "professional, helpful, calm").'),
  variables: z
    .record(z.string())
    .describe('Key variables for the agent to reference (company_name, contact_person, etc.).'),
  system_prompt: z
    .string()
    .describe(
      'The comprehensive system prompt for the agent.'
    ),
  business_hours_flow: z.array(z.string()).describe('Step-by-step logic for business hours calls.'),
  after_hours_flow: z.array(z.string()).describe('Step-by-step logic for after hours calls.'),
  call_transfer_protocol: z
    .object({
      method: z.string(),
      timeout_seconds: z.string(),
      retry_attempts: z.string(),
    })
    .describe('Detailed protocol for transferring calls.'),
  fallback_protocol: z
    .string()
    .describe('Detailed protocol for handling failed call transfers.'),
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

export async function generatePreliminaryAgentConfig(
  input: GeneratePreliminaryAgentConfigInput
): Promise<GeneratePreliminaryAgentConfigOutput> {
  return generatePreliminaryAgentConfigFlow(input);
}

const generatePreliminaryAgentPrompt = ai.definePrompt({
  name: 'generatePreliminaryAgentPrompt',
  input: {schema: GeneratePreliminaryAgentConfigInputSchema},
  output: {schema: GeneratePreliminaryAgentConfigOutputSchema},
  prompt: `You are an expert at extracting structured information from call transcripts and drafting AI agent configurations.
Analyze the provided demo call transcript and generate a JSON object with 'accountMemo' and 'retellAgentConfig'.

Instructions for Account Memo:
- Extract 'company_name', 'contact_person', 'contact_phone', 'contact_email', and 'business_email'.
- For 'account_id', slugify the company name (e.g., 'gm_pressure_washing').
- If a detail is missing, leave it as null or an empty array. Do NOT hallucinate.
- List missing fields in 'questions_or_unknowns'.

Instructions for Retell Agent Spec:
- 'agent_name' should follow the format "[Company Name] Clara Agent".
- 'voice_style' should be "professional, helpful, calm".
- 'version' must be "v1".
- 'business_hours_flow' and 'after_hours_flow' should be arrays of strings describing the interaction steps.
- 'system_prompt' should be a professional prompt introducing the agent as "Clara".

Demo Call Transcript:
{{{transcript}}}
`,
});

const generatePreliminaryAgentConfigFlow = ai.defineFlow(
  {
    name: 'generatePreliminaryAgentConfigFlow',
    inputSchema: GeneratePreliminaryAgentConfigInputSchema,
    outputSchema: GeneratePreliminaryAgentConfigOutputSchema,
  },
  async (input) => {
    const {output} = await generatePreliminaryAgentPrompt(input);
    if (!output) {
      throw new Error('Failed to generate preliminary agent config.');
    }
    return output;
  }
);
