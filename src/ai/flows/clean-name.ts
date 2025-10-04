
'use server';
/**
 * @fileOverview An AI flow for cleaning and standardizing person names.
 *
 * - cleanName - A function that takes a potentially messy name and returns a standardized version.
 * - CleanNameInput - The input type for the function.
 * - CleanNameOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CleanNameInputSchema = z.object({
  name: z.string().describe('A person\'s name that may have inconsistent capitalization or formatting.'),
});
export type CleanNameInput = z.infer<typeof CleanNameInputSchema>;

const CleanNameOutputSchema = z.object({
  cleanedName: z.string().describe('The name after standardizing capitalization (e.g., "jOHN sMiTH" -> "John Smith").'),
});
export type CleanNameOutput = z.infer<typeof CleanNameOutputSchema>;

export async function cleanName(input: CleanNameInput): Promise<CleanNameOutput> {
  return cleanNameFlow(input);
}

const cleanNameFlow = ai.defineFlow(
  {
    name: 'cleanNameFlow',
    inputSchema: CleanNameInputSchema,
    outputSchema: CleanNameOutputSchema,
  },
  async ({ name }) => {
    const { output } = await ai.generate({
      prompt: `Clean and standardize the following name by applying proper title case capitalization. For example, "aNupAM yaDaV" should become "Anupam Yadav". Name: "${name}"`,
      output: {
        schema: CleanNameOutputSchema
      },
    });
    
    return output!;
  }
);
