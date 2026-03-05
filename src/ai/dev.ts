import { config } from 'dotenv';
config();

import '@/ai/flows/update-agent-config-and-changelog.ts';
import '@/ai/flows/generate-preliminary-agent-config.ts';