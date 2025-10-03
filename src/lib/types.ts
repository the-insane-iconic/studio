
export type Event = {
  id: string;
  title: string;
  description: string;
  date: string;
  category: 'Tech' | 'Business' | 'Education' | 'Art';
  participantCount: number;
};

export type Participant = {
  id: string;
  name: string;
  email: string;
  phone: string;
  organization?: string;
  jobTitle?: string;
  eventId: string;
  certificateStatus: 'Not Sent' | 'Sent' | 'Failed';
};

export type Certificate = {
    id: string;
    eventId: string;
    userId: string;
    participantName: string; // Added to easily display name
    templateId: string;
    issueDate: any;
    web3Hash: string;
    deliveryMethod: string;
    deliveryStatus: string;
    designDataUrl?: string; // To store AI-generated design
}

export type CertificateTemplate = {
  id: 'classic' | 'modern' | 'web3' | 'creative' | 'ai';
  name: string;
  description: string;
  theme: 'blue' | 'dark' | 'green' | 'pink' | 'ai';
  orientation: 'portrait' | 'landscape';
};

export const availableFields = [
  { id: 'name', label: 'Participant Name', required: true },
  { id: 'eventName', label: 'Event Name', required: true },
  { id: 'date', label: 'Completion Date', required: true },
  { id: 'issuer', label: 'Issuer', required: false },
  { id: 'web3', label: 'Web3 Hash', required: false },
  { id: 'score', label: 'Score/Grade', required: false },
  { id: 'duration', label: 'Event Duration', required: false },
  { id: 'signature', label: 'Digital Signature', required: false },
];
