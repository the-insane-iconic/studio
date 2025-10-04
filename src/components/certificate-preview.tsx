
"use client"

import React from 'react';
import { Award, Star, PenSquare, Calendar, Building, ShieldCheck, Medal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CertificateTemplate } from '@/lib/types';
import { certificateTemplates } from '@/lib/data';

interface CertificatePreviewProps {
  templateId: CertificateTemplate['id'] | '';
  fields: string[];
  aiDesignUrl?: string | null;
  previewData?: {
    name: string;
    eventName: string;
    date: string;
  }
}

const themeClasses = {
    blue: {
        bg: 'bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30',
        border: 'border-blue-500',
        outerBorder: 'border-blue-200 dark:border-blue-800',
        text: 'text-blue-900 dark:text-blue-200',
        accent: 'text-blue-700 dark:text-blue-300',
        title: 'font-serif tracking-wide',
        seal: 'text-blue-500'
    },
    dark: {
        bg: 'bg-gradient-to-br from-gray-800 to-gray-900',
        border: 'border-gray-500',
        outerBorder: 'border-gray-700',
        text: 'text-gray-200',
        accent: 'text-white',
        title: 'font-sans font-thin uppercase tracking-widest',
        seal: 'text-gray-400'
    },
    green: {
        bg: 'bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30',
        border: 'border-green-600',
        outerBorder: 'border-green-200 dark:border-green-800',
        text: 'text-green-900 dark:text-green-200',
        accent: 'text-green-700 dark:text-green-400',
        title: 'font-mono uppercase',
        seal: 'text-green-600'
    },
    pink: {
        bg: 'bg-gradient-to-br from-pink-50 to-rose-100 dark:from-pink-900/30 dark:to-rose-900/30',
        border: 'border-pink-400',
        outerBorder: 'border-pink-200 dark:border-rose-800',
        text: 'text-pink-900 dark:text-pink-200',
        accent: 'text-pink-600 dark:text-pink-300',
        title: 'font-serif italic',
        seal: 'text-pink-500'
    },
    ai: { // For AI Generated
        bg: 'bg-background', // Will be covered by image
        border: 'border-white/50',
        outerBorder: 'border-white/20',
        text: 'text-white',
        accent: 'text-white',
        title: 'font-serif tracking-wide',
        seal: 'text-white/80'
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

const defaultPreviewData = {
    name: 'Participant Name',
    eventName: 'Event Name',
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
};

export default function CertificatePreview({ templateId, fields, aiDesignUrl, previewData }: CertificatePreviewProps) {
  const template = certificateTemplates.find(t => t.id === templateId);
  const data = previewData || defaultPreviewData;

  if (!template) {
    return (
      <div className="aspect-video w-full bg-muted rounded-lg flex flex-col items-center justify-center text-muted-foreground text-center p-4">
        <Award className="w-8 h-8 mb-2" />
        <p>Select a template to see a preview</p>
      </div>
    );
  }

  const theme = themeClasses[template.theme];

  return (
    <div className={cn(
        "w-full rounded-lg flex flex-col p-2 shadow-md relative overflow-hidden",
        theme.bg,
        'aspect-video'
    )}>
        {template.id === 'ai' && aiDesignUrl && (
            <img src={aiDesignUrl} alt="AI Generated Certificate Background" className="absolute inset-0 w-full h-full object-cover z-0" />
        )}
        {/* Adds a semi-transparent overlay for AI images to ensure text is readable */}
        {template.id === 'ai' && <div className="absolute inset-0 bg-black/40 z-0"/>}
        
        <div className={cn(
            "w-full h-full border rounded-md flex flex-col p-1 z-10", 
            theme.outerBorder
        )}>
            <div className={cn(
                "w-full h-full border rounded-sm flex flex-col items-center justify-between p-4 text-center",
                theme.border
            )}>
                
                <div className="w-full">
                    <p className={cn("text-sm tracking-wider", theme.text)}>Certificate of Completion</p>
                    <div className="w-2/3 h-[1px] mx-auto my-1 bg-current" style={{opacity: 0.5}} />
                    <p className={cn("text-base font-semibold", theme.accent)}>This certificate is awarded to</p>
                </div>

                <div className="my-2">
                    <h2 className={cn("text-4xl font-bold", theme.accent, theme.title)}>
                        {fields.includes('name') ? data.name : '...'}
                    </h2>
                    <p className={cn("mt-1 text-sm max-w-xs", theme.text)}>
                        For successfully completing the
                    </p>
                     <p className={cn("mt-1 text-lg font-bold", theme.accent)}>
                        {fields.includes('eventName') ? data.eventName : '...'}
                    </p>
                </div>
                
                <div className="w-full text-xs">
                     <p className={cn("", theme.text)}>
                        on {fields.includes('date') ? data.date : '...'}
                    </p>
                    <div className="mt-4 flex justify-between items-end gap-4">
                        <div className="flex flex-col items-center gap-1 w-1/3">
                            <p className={cn("border-b w-full text-center pb-1 font-semibold", theme.border)}>
                                {fields.includes('issuer') ? 'Issuer Name' : '...'}
                            </p>
                            <p className={cn("text-xs", theme.text)}>Event Issuer</p>
                        </div>
                        <div className={cn("w-1/3", theme.seal)}>
                            <Medal className="w-12 h-12 mx-auto" />
                        </div>
                        <div className="flex flex-col items-center gap-1 w-1/3">
                            <p className={cn("border-b w-full text-center pb-1 font-semibold", theme.border)}>
                                 {fields.includes('signature') ? 'Digital Signature' : '...'}
                            </p>
                            <p className={cn("text-xs", theme.text)}>Signature</p>
                        </div>
                    </div>
                     <div className="grid grid-cols-3 gap-x-2 gap-y-1 text-xs mt-2">
                        {fields.filter(f => !['name', 'eventName', 'date', 'issuer', 'signature'].includes(f)).map(field => (
                             <div key={field} className={cn("flex items-center justify-center gap-1.5", theme.text)}>
                                <FieldIcon fieldId={field} />
                                <span className="font-semibold capitalize">{field}:</span>
                                <span className="truncate">Sample</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    </div>
  );
}

    