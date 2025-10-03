
"use client"

import React from 'react';
import { Award, Star, PenSquare, Calendar, Building, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CertificateTemplate } from '@/lib/types';
import { certificateTemplates } from '@/lib/data';

interface CertificatePreviewProps {
  templateId: CertificateTemplate['id'] | '';
  fields: string[];
}

const themeClasses = {
    blue: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-500',
        text: 'text-blue-800 dark:text-blue-300',
        accent: 'text-blue-600 dark:text-blue-400',
        title: 'font-serif',
    },
    dark: {
        bg: 'bg-gray-800',
        border: 'border-gray-500',
        text: 'text-gray-100',
        accent: 'text-white',
        title: 'font-sans font-thin uppercase tracking-widest',
    },
    green: {
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-600',
        text: 'text-green-900 dark:text-green-300',
        accent: 'text-green-700 dark:text-green-400',
        title: 'font-mono',
    },
    pink: {
        bg: 'bg-pink-50 dark:bg-pink-900/20',
        border: 'border-pink-400',
        text: 'text-pink-800 dark:text-pink-300',
        accent: 'text-pink-500 dark:text-pink-400',
        title: 'font-serif italic',
    }
}

const FieldIcon = ({ fieldId }: { fieldId: string }) => {
    const icons: { [key: string]: React.ReactNode } = {
        score: <Star className="w-3 h-3" />,
        duration: <Calendar className="w-3 h-3" />,
        signature: <PenSquare className="w-3 h-3" />,
        issuer: <Building className="w-3 h-3" />,
        web3: <ShieldCheck className="w-3 h-3" />,
    };
    return icons[fieldId] || null;
}

export default function CertificatePreview({ templateId, fields }: CertificatePreviewProps) {
  const template = certificateTemplates.find(t => t.id === templateId);

  if (!template) {
    return (
      <div className="aspect-[1/1.414] w-full bg-muted rounded-lg flex flex-col items-center justify-center text-muted-foreground text-center p-4">
        <Award className="w-8 h-8 mb-2" />
        <p>Select a template to see a preview</p>
      </div>
    );
  }

  const theme = themeClasses[template.theme];
  const isLandscape = template.orientation === 'landscape';

  return (
    <div className={cn(
        "w-full rounded-lg flex flex-col p-4 shadow-md",
        theme.bg,
        isLandscape ? 'aspect-video' : 'aspect-[1/1.414]'
    )}>
        <div className={cn("w-full h-full border-2 rounded-md flex flex-col p-4 md:p-6", theme.border)}>
            <div className="text-center">
                <p className={cn("text-sm", theme.text)}>Certificate of Achievement</p>
                <h2 className={cn("my-2 text-2xl md:text-3xl font-bold", theme.accent, theme.title)}>
                    {fields.includes('eventName') ? 'Event Name' : 'Achievement'}
                </h2>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center my-4 text-center">
                <p className={cn("text-sm mb-1", theme.text)}>This certifies that</p>
                <p className={cn("text-xl md:text-2xl font-bold", theme.accent)}>
                    {fields.includes('name') ? 'Participant Name' : '...'}
                </p>
                <p className={cn("mt-2 text-sm max-w-xs", theme.text)}>
                    has successfully completed the aforementioned event on {fields.includes('date') ? new Date().toLocaleDateString() : 'this day'}.
                </p>
            </div>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                {fields.filter(f => !['name', 'eventName', 'date'].includes(f)).map(field => (
                     <div key={field} className={cn("flex items-center gap-1.5", theme.text)}>
                        <FieldIcon fieldId={field} />
                        <span className="font-semibold capitalize">{field}:</span>
                        <span className="truncate">Sample Data</span>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
}
