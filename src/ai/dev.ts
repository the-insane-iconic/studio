import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-certificate-template.ts';
import '@/ai/flows/generate-certificate-design.ts';
import '@/ai/flows/send-certificate-email.ts';
import '@/ai/flows/clean-name.ts';
