import type { Event, Participant, CertificateTemplate } from './types';

export const mockEvents: Event[] = [
  {
    id: 'evt1',
    title: 'Web3 & Blockchain Summit 2024',
    description: 'A deep dive into the future of decentralized technologies, with hands-on workshops and expert panels.',
    date: '2024-09-15',
    category: 'Tech',
    participantCount: 128,
  },
  {
    id: 'evt2',
    title: 'Future of Leadership Conference',
    description: 'Explore modern leadership strategies and network with top executives from various industries.',
    date: '2024-10-20',
    category: 'Business',
    participantCount: 256,
  },
  {
    id: 'evt3',
    title: 'Digital Arts & Creative Coding Fest',
    description: 'A vibrant festival celebrating the intersection of art and technology, featuring interactive installations.',
    date: '2024-11-05',
    category: 'Art',
    participantCount: 94,
  },
  {
    id: 'evt4',
    title: 'Advanced AI in Education Workshop',
    description: 'Learn how to implement cutting-edge AI tools in educational settings to enhance student learning.',
    date: '2024-11-22',
    category: 'Education',
    participantCount: 72,
  },
];

export const mockParticipants: Participant[] = [
  { id: 'par1', name: 'Alice Johnson', email: 'alice@example.com', phone: '123-456-7890', eventId: 'evt1', certificateStatus: 'Sent' },
  { id: 'par2', name: 'Bob Williams', email: 'bob@example.com', phone: '234-567-8901', eventId: 'evt1', certificateStatus: 'Sent' },
  { id: 'par3', name: 'Charlie Brown', email: 'charlie@example.com', phone: '345-678-9012', eventId: 'evt2', certificateStatus: 'Not Sent' },
  { id: 'par4', name: 'Diana Prince', email: 'diana@example.com', phone: '456-789-0123', organization: 'Themyscira Inc.', jobTitle: 'Ambassador', eventId: 'evt2', certificateStatus: 'Not Sent' },
  { id: 'par5', name: 'Ethan Hunt', email: 'ethan@example.com', phone: '567-890-1234', eventId: 'evt3', certificateStatus: 'Failed' },
  { id: 'par6', name: 'Fiona Glenanne', email: 'fiona@example.com', phone: '678-901-2345', eventId: 'evt4', certificateStatus: 'Sent' },
];

export const certificateTemplates: CertificateTemplate[] = [
    {
        id: 'classic',
        name: 'Classic Professional',
        description: 'A timeless design for formal recognition.',
        theme: 'blue',
        orientation: 'portrait',
    },
    {
        id: 'modern',
        name: 'Modern Minimalist',
        description: 'A sleek, dark-themed design for contemporary events.',
        theme: 'dark',
        orientation: 'portrait',
    },
    {
        id: 'web3',
        name: 'Web3 Verifiable',
        description: 'Includes a QR code and hash for blockchain verification.',
        theme: 'green',
        orientation: 'landscape',
    },
    {
        id: 'creative',
        name: 'Creative Design',
        description: 'A vibrant and artistic template for creative achievements.',
        theme: 'pink',
        orientation: 'portrait',
    },
];
