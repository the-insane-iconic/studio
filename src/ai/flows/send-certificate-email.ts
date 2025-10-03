
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

    // IMPORTANT: CONFIGURE YOUR EMAIL TRANSPORT HERE
    // You must replace the following with your actual email service credentials.
    // It's highly recommended to use environment variables for security.
    // Example for Gmail with an "App Password":
    // const transporter = nodemailer.createTransport({
    //   host: 'smtp.gmail.com',
    //   port: 465,
    //   secure: true, // use SSL
    //   auth: {
    //     user: process.env.EMAIL_USER, // Your Gmail address
    //     pass: process.env.EMAIL_PASS, // Your Gmail App Password
    //   },
    // });
    
    // For this example, we'll use a "mock" transporter that doesn't actually send emails
    // but lets us verify the logic. Replace this with a real transporter.
    const transporter = nodemailer.createTransport({
        jsonTransport: true // This captures the email content without sending it
    });

    const mailOptions = {
      from: `"EventEye Platform" <no-reply@eventeye.com>`,
      to: input.recipientEmail,
      subject: `Your Certificate for ${input.eventName} is Here!`,
      html: `
        <h1>Congratulations, ${input.recipientName}!</h1>
        <p>Thank you for participating in <strong>${input.eventName}</strong>.</p>
        <p>Your certificate of completion is attached to this email.</p>
        <p>Best regards,<br>The EventEye Team</p>
      `,
      attachments: input.certificateDataUrl ? [
        {
          filename: 'certificate.png',
          path: input.certificateDataUrl,
          cid: 'certificate-image' 
        }
      ] : [],
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Email preparation successful. Message data:', (info as any).message);
      
      // In a real scenario, info.messageId would confirm sending.
      // With jsonTransport, info.message contains the email data.
      return {
        success: true,
        message: `Email prepared for ${input.recipientEmail}. In a real setup, this would be sent.`,
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
