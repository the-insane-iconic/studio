'use server';

/**
 * @fileOverview AI-powered certificate template suggestion flow.
 *
 * - suggestCertificateTemplate - A function that suggests certificate templates based on event details.
 * - SuggestCertificateTemplateInput - The input type for the suggestCertificateTemplate function.
 * - SuggestCertificateTemplateOutput - The return type for the suggestCertificateTemplate function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestCertificateTemplateInputSchema = z.object({
  eventTitle: z.string().describe('The title of the event.'),
  eventDescription: z.string().describe('The description of the event.'),
});
export type SuggestCertificateTemplateInput = z.infer<typeof SuggestCertificateTemplateInputSchema>;

const SuggestCertificateTemplateOutputSchema = z.object({
  templateSuggestion: z
    .string()
    .describe(
      'The suggested certificate template based on the event details. Options: Classic Professional, Modern Minimalist, Web3 Verifiable, Creative Design.'
    ),
  reasoning: z.string().describe('The AI reasoning for the template suggestion.'),
});
export type SuggestCertificateTemplateOutput = z.infer<typeof SuggestCertificateTemplateOutputSchema>;

export async function suggestCertificateTemplate(
  input: SuggestCertificateTemplateInput
): Promise<SuggestCertificateTemplateOutput> {
  return suggestCertificateTemplateFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestCertificateTemplatePrompt',
  input: {schema: SuggestCertificateTemplateInputSchema},
  output: {schema: SuggestCertificateTemplateOutputSchema},
  prompt: `You are an AI assistant that suggests the best certificate template based on the event title and description.

You must choose one of the following templates:
- Classic Professional
- Modern Minimalist
- Web3 Verifiable
- Creative Design

Based on the event title and description, suggest the most appropriate template and provide a brief reasoning for your choice.

Event Title: {{{eventTitle}}}
Event Description: {{{eventDescription}}}

Template Suggestion:`, // Ensure the output is captured correctly
});

const suggestCertificateTemplateFlow = ai.defineFlow(
  {
    name: 'suggestCertificateTemplateFlow',
    inputSchema: SuggestCertificateTemplateInputSchema,
    outputSchema: SuggestCertificateTemplateOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
