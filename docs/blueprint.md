# **App Name**: AgentFlow Automator

## Core Features:

- Transcript Submission & Account Management: Allows users to upload demo or onboarding call transcripts (text format) to initiate the processing pipeline for creating or updating an account's agent configuration. Includes basic account listing and management.
- AI-Powered Configuration Generation Tool: Generates a preliminary Retell Agent configuration (v1, including system prompt, key settings, and tool invocation placeholders) and a structured Account Memo JSON from demo call transcripts using zero-cost LLMs. This tool analyzes conversations for key information.
- AI-Powered Configuration Update Tool: Updates an existing Retell Agent configuration (v2) and Account Memo JSON based on onboarding call transcripts or forms, creating a clear changelog and diff/patch using zero-cost LLMs.
- Structured Output Viewer: Provides a clean, readable interface to view the generated and updated Account Memo JSON and Retell Agent Draft Specifications (v1 & v2).
- Version History & Diff Display: Enables side-by-side comparison of different versions of the Account Memo and Agent Specification, clearly highlighting all modifications made between iterations.
- Pipeline Status Dashboard: Displays the current processing status for each submitted transcript and associated account, including any errors or pending actions.
- Data Export Capabilities: Allows for the easy download of generated Account Memo JSON, Retell Agent Draft Spec (JSON/YAML), and Changelog files for local use or manual integration.

## Style Guidelines:

- Light color scheme, prioritizing clarity and a professional, systematic feel. Primary brand color: A calm, professional blue (#2E66B3), chosen for its evocation of reliability, intelligence, and modern efficiency in a business context.
- Background color: A very light, desaturated grey-blue (#EBF0F4), providing a clean and understated canvas that enhances readability and minimizes eye strain.
- Accent color: A vibrant, clear aqua (#5ED5ED), used sparingly for interactive elements, highlights, and status indicators, providing visual punctuation and guiding user attention without being distracting.
- Headlines and prominent text will use 'Space Grotesk' (sans-serif) for a modern, slightly techy and assertive feel, suitable for an automation and engineering platform.
- Body text and detailed descriptions will use 'Inter' (sans-serif) for its excellent legibility across various screen sizes and its neutral, objective appearance, which is ideal for displaying structured data and technical content.
- Minimalist, crisp vector icons will be employed to clearly represent actions (e.g., upload, download, compare), processing statuses (e.g., pending, completed, error), and various document types (e.g., JSON, YAML), ensuring quick visual comprehension.
- A clean, data-centric layout with highly structured content areas. Utilize two-column or multi-panel views extensively, particularly for version comparisons and displaying detailed configurations, optimizing for efficient information absorption and analysis.
- Subtle, functional animations will be incorporated for transitions, loading states, and user feedback. Examples include a smooth fade-in for newly generated content or a brief, understated pulse for updated data, enhancing usability without distraction.