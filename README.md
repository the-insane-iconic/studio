
# EventChain Pro: Certificate Automation Hub

EventChain Pro is a comprehensive, modern web application designed to streamline event and certificate management. It empowers administrators to create events, manage participants, and automate the generation and distribution of secure, verifiable certificates with ease.

The application leverages a modern tech stack, including Next.js, Firebase, and Genkit for AI-powered features, to provide a seamless and professional user experience.

![EventChain Pro Dashboard](https://storage.googleapis.com/llm-assets/studio-docs/eventchain-screenshot.png)

## Key Features

- **Full Event Lifecycle Management**: Create, view, and manage events, including details like title, description, date, and category.
- **Participant Registration**: Easily add and track participants for each event, with a live-updating list and status view.
- **5-Step Certificate Workflow**: An intuitive, step-by-step process to generate and distribute certificates efficiently.
- **AI-Powered Design & Suggestions**:
    - **AI Template Suggestions**: Get intelligent recommendations for certificate templates based on event details.
    - **AI Background Generation**: Create unique, professional certificate backgrounds from a simple text prompt using generative AI.
- **Multiple Certificate Templates**: Choose from several pre-designed templates (Classic, Modern, etc.) or use the AI-generated design for a unique look.
- **Automated Email Delivery**: Certificates are automatically sent to participants' email inboxes via a secure, integrated email flow.
- **QR Code Verification System**:
    - Admins can generate a unique QR code for each event.
    - Participants can scan the QR code to access a public verification page.
    - By entering their email, participants can securely find and download their specific certificate.
- **Real-time Data with Firestore**: All data for events, participants, and certificates is stored in Firestore and updated in the UI in real-time.
- **Secure Authentication**: The application uses Firebase Authentication for secure access.

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS with ShadCN UI for a modern, responsive component library.
- **Database**: Firebase Firestore for real-time, scalable data storage.
- **Authentication**: Firebase Authentication (Anonymous Sign-In).
- **Generative AI**: Google's Genkit for creating AI flows (image generation, suggestions).
- **Email**: Nodemailer integrated into a Genkit flow for sending emails via Gmail.
- **Deployment**: Configured for Firebase App Hosting.

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn

### 1. Set Up Environment Variables

The application requires environment variables for the email sending functionality to work. Create a `.env` file in the root of the project and add the following:

```
# Your Gmail address used for sending certificates
EMAIL_USER=your-email@gmail.com

# An App Password generated from your Google Account
# See: https://myaccount.google.com/apppasswords
EMAIL_PASS=your16characterapppassword
```

**Note**: To generate an `EMAIL_PASS`, you must have 2-Factor Authentication enabled on your Google account.

### 2. Install Dependencies

Open your terminal and run:

```bash
npm install
```

### 3. Run the Development Server

To start the Next.js application, run:

```bash
npm run dev
```

The application will be available at `http://localhost:9002`.

### 4. Run the Genkit AI Flows

The AI features (like certificate design and email sending) are powered by Genkit. To enable them, you need to run the Genkit development server in a separate terminal:

```bash
npm run genkit:dev
```

This will start the Genkit development UI, typically on `http://localhost:4000`, where you can monitor and test your AI flows.
