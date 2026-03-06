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

// Account Memo JSON Schema (Aligned with Clara v1 requirements)
const AccountMemoOutputSchema = z.object({
  account_id: z.string().describe('A unique identifier for the account (slugified company name).'),
  company_name: z.string().describe('The name of the company.'),
  contact_person: z.string().nullable().describe('Primary contact person name.'),
  contact_phone: z.string().nullable().describe('Primary contact phone number.'),
  contact_email: z.string().nullable().describe('Primary contact email address.'),
  business_email: z.string().nullable().describe('Main business email address.'),
  business_hours: z.string().nullable().describe('Operating hours (e.g., "Mon-Fri 9AM-5PM").'),
  office_address: z.string().nullable().describe('Physical office address.'),
  timezone: z.string().nullable().describe('Timezone (e.g., "America/New_York").'),
  services_supported: z.array(z.string()).describe('List of services supported.'),
  emergency_definition: z.array(z.string()).describe('Triggers for emergency routing.'),
  emergency_routing_rules: z.string().nullable().describe('Rules for emergency calls.'),
  non_emergency_routing_rules: z.string().nullable().describe('Rules for non-emergency calls.'),
  call_transfer_rules: z.object({
    timeout_seconds: z.string().nullable(),
    retry_attempts: z.string().nullable(),
  }),
  integration_constraints: z.array(z.string()).describe('Technical or policy constraints.'),
  after_hours_flow_summary: z.string().nullable(),
  office_hours_flow_summary: z.string().nullable(),
  questions_or_unknowns: z.array(z.string()).describe('Missing information items.'),
  notes: z.string().describe('Internal extraction notes.'),
});

// Retell Agent Draft Spec Schema (Aligned with Clara v1 requirements)
const RetellAgentConfigOutputSchema = z.object({
  agent_name: z.string().describe('The name for the Retell AI agent.'),
  version: z.literal('v1').describe('The version of the agent configuration.'),
  voice_style: z.string().describe('Voice personality.'),
  variables: z.object({
    company_name: z.string(),
    contact_person: z.string(),
    phone: z.string(),
  }).describe('Key dynamic variables for the agent.'),
  system_prompt: z.string().describe('Core AI behavior instructions.'),
  business_hours_flow: z.array(z.string()).describe('Step-by-step logic for office hours.'),
  after_hours_flow: z.array(z.string()).describe('Step-by-step logic for after hours.'),
  call_transfer_protocol: z.object({
    method: z.string(),
    timeout_seconds: z.string(),
    retry_attempts: z.string(),
  }),
  fallback_protocol: z.string().describe('Logic if transfers fail.'),
});

// Combined Output Schema
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
  prompt: `You are an expert at extracting structured information from call transcripts for the "Clara AI" pipeline.
Analyze the provided demo call transcript and generate a JSON object with 'accountMemo' and 'retellAgentConfig'.

Instructions for Account Memo:
- 'account_id' should be the slugified company name (e.g., 'gm_pressure_washing').
- 'services_supported' should list what they do.
- List all missing fields explicitly in 'questions_or_unknowns'. Do not hallucinate values.

Instructions for Retell Agent Spec:
- 'agent_name' format: "[Company Name] Clara Agent".
- 'voice_style' should be "professional, helpful, calm".
- 'system_prompt' must introduce the agent as "Clara, the AI receptionist".
- flows should be step-by-step arrays of strings.

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
