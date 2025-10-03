
'use server';
/**
 * @fileOverview A flow for sending a certificate to a participant via email.
 *
 * - sendCertificateEmail - The main function to trigger the email sending process.
 * - SendCertificateEmailInput - The input type for the sendCertificateEmail function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import * as nodemailer from 'nodemailer';

const SendCertificateEmailInputSchema = z.object({
  recipientEmail: z.string().email().describe('The email address of the certificate recipient.'),
  recipientName: z.string().describe('The name of the certificate recipient.'),
  eventName: z.string().describe('The name of the event.'),
  certificateDataUrl: z.string().describe("The certificate image as a data URI. This will be sent as an attachment.").optional(),
});
export type SendCertificateEmailInput = z.infer<typeof SendCertificateEmailInputSchema>;

export async function sendCertificateEmail(input: SendCertificateEmailInput): Promise<{ success: boolean; message: string }> {
  return sendCertificateEmailFlow(input);
}

const sendCertificateEmailFlow = ai.defineFlow(
  {
    name: 'sendCertificateEmailFlow',
    inputSchema: SendCertificateEmailInputSchema,
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
    }),
  },
  async (input) => {
    console.log('Starting email flow for:', input.recipientEmail);

    // This checks if the required environment variables for email are set.
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        const errorMessage = "Email service is not configured. Please set EMAIL_USER and EMAIL_PASS in your .env file.";
        console.error(errorMessage);
        return {
            success: false,
            message: errorMessage,
        };
    }

    // This transporter is configured for Gmail.
    // It securely uses environment variables for your credentials.
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // use SSL
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: process.env.EMAIL_PASS, // Your Gmail "App Password"
      },
    });

    const mailOptions = {
      from: `"EventChain Pro" <${process.env.EMAIL_USER}>`,
      to: input.recipientEmail,
      subject: `Your Certificate for ${input.eventName} is Here!`,
      html: `
        <h1>Congratulations, ${input.recipientName}!</h1>
        <p>Thank you for participating in <strong>${input.eventName}</strong>.</p>
        <p>Your certificate of completion is attached to this email.</p>
        <p>Best regards,<br>The EventChain Pro Team</p>
      `,
      attachments: input.certificateDataUrl ? [
        {
          filename: 'certificate.png',
          path: input.certificateDataUrl,
        }
      ] : [],
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully. Message ID:', info.messageId);
      
      return {
        success: true,
        message: `Email successfully sent to ${input.recipientEmail}.`,
      };
    } catch (error: any) {
      console.error('Failed to send email:', error);
      return {
        success: false,
        message: `Failed to send email: ${error.message}`,
      };
    }
  }
);
