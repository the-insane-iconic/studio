
'use server';
/**
 * @fileOverview AI flow for generating unique certificate visual designs.
 *
 * - generateCertificateDesign - A function that creates a visual design based on a text prompt.
 * - GenerateCertificateDesignInput - The input type for the function.
 * - GenerateCertificateDesignOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const GenerateCertificateDesignInputSchema = z.object({
  prompt: z.string().describe('A creative prompt to guide the AI in generating the certificate background design.'),
});
export type GenerateCertificateDesignInput = z.infer<typeof GenerateCertificateDesignInputSchema>;

export const GenerateCertificateDesignOutputSchema = z.object({
  designDataUrl: z
    .string()
    .describe(
      "The generated certificate background image as a data URI, using Base64 encoding. Expected format: 'data:image/png;base64,<encoded_data>'."
    ),
});
export type GenerateCertificateDesignOutput = z.infer<typeof GenerateCertificateDesignOutputSchema>;

export async function generateCertificateDesign(input: GenerateCertificateDesignInput): Promise<GenerateCertificateDesignOutput> {
  return generateCertificateDesignFlow(input);
}

const generateCertificateDesignFlow = ai.defineFlow(
  {
    name: 'generateCertificateDesignFlow',
    inputSchema: GenerateCertificateDesignInputSchema,
    outputSchema: GenerateCertificateDesignOutputSchema,
  },
  async ({ prompt }) => {
    const finalPrompt = `A visually appealing certificate background for an event. The design should be abstract and professional, suitable for a certificate of achievement. Do not include any text, letters, or numbers in the image. Theme: ${prompt}`;
    
    const { media } = await ai.generate({
        // Using a fast image generation model for quick previews
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: finalPrompt,
        config: {
            // Requesting a standard landscape aspect ratio
            aspectRatio: '16:9',
        },
    });

    if (!media.url) {
      throw new Error('AI failed to generate a design. Please try a different prompt.');
    }

    return { designDataUrl: media.url };
  }
);
