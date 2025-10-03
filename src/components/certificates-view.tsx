
"use client";

import React, { useState, useMemo } from 'react';
import { Users, ArrowLeft, ArrowRight, Check, ChevronsUpDown, Mail, Send, CheckCircle, XCircle, Loader2, Sparkles, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { certificateTemplates } from '@/lib/data';
import { availableFields, CertificateTemplate as TemplateType, Event, Participant } from '@/lib/types';
import AiSuggestion from './ai-suggestion';
import CertificatePreview from './certificate-preview';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, serverTimestamp, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { generateCertificateDesign } from '@/ai/flows/generate-certificate-design';
import { sendCertificateEmail } from '@/ai/flows/send-certificate-email';


type FormData = {
  eventId: string;
  templateId: TemplateType['id'] | '';
  customFields: string[];
  deliveryMethods: ('email' | 'whatsapp')[];
  aiDesignUrl: string | null;
  aiPrompt: string;
};

function AiDesignGenerator({ event, onDesignGenerated }: { event: Event, onDesignGenerated: (url: string) => void }) {
    const [prompt, setPrompt] = useState(`A professional, abstract design for the event: "${event.title}"`);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleGenerateDesign = async () => {
        setIsLoading(true);
        try {
            const result = await generateCertificateDesign({ prompt });
            onDesignGenerated(result.designDataUrl);
            toast({
                title: "AI Design Generated!",
                description: "Your unique certificate background is ready.",
            });
        } catch (e: any) {
            toast({
                title: "AI Design Error",
                description: e.message || "Failed to generate design. Try a different prompt.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mt-4 p-4 border rounded-lg bg-background space-y-4">
            <h4 className="font-semibold">Generate a Unique Background</h4>
            <p className="text-sm text-muted-foreground">Describe the visual theme you want for the certificate background. The AI will generate an image based on your prompt.</p>
            <Textarea 
                placeholder="e.g., 'A futuristic geometric pattern with blue and gold colors'"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
            />
            <Button onClick={handleGenerateDesign} disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Generate Design
            </Button>
        </div>
    );
}


export default function CertificatesView() {
  const [formData, setFormData] = useState<FormData>({
    eventId: '',
    templateId: '',
    customFields: availableFields.filter(f => f.required).map(f => f.id),
    deliveryMethods: [],
    aiDesignUrl: null,
    aiPrompt: '',
  });
  
  const firestore = useFirestore();
  const { toast } = useToast();

  const eventsQuery = useMemoFirebase(() => collection(firestore, 'events'), [firestore]);
  const { data: events, isLoading: isLoadingEvents } = useCollection<Event>(eventsQuery);

  const selectedEvent = useMemo(() => events?.find(e => e.id === formData.eventId), [events, formData.eventId]);

  const participantsQuery = useMemoFirebase(() => 
    formData.eventId ? query(collection(firestore, 'participants'), where('eventId', '==', formData.eventId)) : null
  , [firestore, formData.eventId]);
  const { data: participantsForEvent, isLoading: isLoadingParticipants } = useCollection<Participant>(participantsQuery);


  const handleFieldChange = (fieldId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      customFields: checked ? [...prev.customFields, fieldId] : prev.customFields.filter(id => id !== fieldId),
    }));
  };
  
  const handleDeliveryChange = (method: 'email' | 'whatsapp', checked: boolean) => {
    setFormData(prev => ({
        ...prev,
        deliveryMethods: checked ? [...prev.deliveryMethods, method] : prev.deliveryMethods.filter(m => m !== method),
    }));
  };

  const handleGenerate = () => {
    if (!firestore || !participantsForEvent || participantsForEvent.length === 0 || !selectedEvent) {
      toast({ title: 'No participants to process or event not selected', variant: 'destructive' });
      return;
    }

    toast({
        title: 'Processing Started!',
        description: `${participantsForEvent.length} certificates are being generated in the background.`,
    });

    const certificatesCollection = collection(firestore, 'certificates');
    
    participantsForEvent.forEach(participant => {
        addDocumentNonBlocking(certificatesCollection, {
            eventId: formData.eventId,
            userId: participant.id,
            templateId: formData.templateId,
            issueDate: serverTimestamp(),
            web3Hash: `0x${[...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
            deliveryMethod: formData.deliveryMethods.join(', '),
            deliveryStatus: 'Sent',
            designDataUrl: formData.templateId === 'ai' ? formData.aiDesignUrl : null,
        });

        const participantRef = doc(firestore, 'participants', participant.id);
        updateDocumentNonBlocking(participantRef, { certificateStatus: 'Sent' });

        if (formData.deliveryMethods.includes('email')) {
             sendCertificateEmail({
                recipientEmail: participant.email,
                recipientName: participant.name,
                eventName: selectedEvent.title,
                certificateDataUrl: formData.templateId === 'ai' ? formData.aiDesignUrl ?? undefined : undefined,
             }).then(result => {
                if (result.success) {
                    console.log(`Email flow triggered for ${participant.email}`);
                } else {
                    console.error(`Email flow failed for ${participant.email}: ${result.message}`);
                    updateDocumentNonBlocking(participantRef, { certificateStatus: 'Failed' });
                }
             });
        }
    });

     toast({
        title: 'Processing Complete!',
        description: `${participantsForEvent.length} certificates have been queued for delivery.`,
    });
  };

  return (
    <div className="space-y-8">
        <div className="p-8 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground">
            <h2 className="text-3xl font-bold">Secure, Automated, and Verifiable.</h2>
            <p className="mt-2 text-lg opacity-90">Follow the 5-step process to distribute hundreds of certificates in minutes.</p>
        </div>

        <div className="space-y-6 p-6 border rounded-lg">
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 flex-grow-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">1</div>
                <div className="w-full">
                    <h3 className="font-semibold text-lg">Select Event & Participants</h3>
                     <div className="space-y-4 mt-4">
                        <Select onValueChange={(value) => setFormData(prev => ({ ...prev, eventId: value }))} value={formData.eventId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose an event..." />
                          </SelectTrigger>
                          <SelectContent>
                            {isLoadingEvents && <div className="flex items-center justify-center p-4"><Loader2 className="h-5 w-5 animate-spin"/></div>}
                            {events?.map(event => (
                              <SelectItem key={event.id} value={event.id}>
                                {event.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="p-3 rounded-md bg-muted/50 text-sm text-muted-foreground flex items-center gap-2">
                            <Users className="h-4 w-4"/>
                             <span>{isLoadingParticipants ? <Loader2 className="h-4 w-4 animate-spin"/> : `${participantsForEvent?.length ?? 0} participants registered`}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="space-y-6 p-6 border rounded-lg">
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 flex-grow-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">2</div>
                <div className="w-full">
                    <h3 className="font-semibold text-lg">Choose Template & Get AI Field Suggestions 💡</h3>
                     <div className="mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                            {certificateTemplates.map(template => (
                                <Card 
                                    key={template.id} 
                                    onClick={() => setFormData(p => ({...p, templateId: template.id}))}
                                    className={`cursor-pointer transition-all ${formData.templateId === template.id ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
                                >
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-base">
                                            {formData.templateId === template.id && <Check className="text-primary" />}
                                             {template.id === 'ai' ? <Sparkles className="text-accent" /> : null}
                                            {template.name}
                                        </CardTitle>
                                        <CardDescription>{template.description}</CardDescription>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>

                        {formData.templateId === 'ai' && selectedEvent && (
                            <AiDesignGenerator event={selectedEvent} onDesignGenerated={(url) => setFormData(p => ({ ...p, aiDesignUrl: url }))} />
                        )}

                        {formData.templateId !== 'ai' && selectedEvent && <AiSuggestion eventTitle={selectedEvent.title} eventDescription={selectedEvent.description} />}
                    </div>
                </div>
            </div>
        </div>

        <div className="space-y-6 p-6 border rounded-lg">
            <div className="flex items-start gap-4">
                 <div className="flex-shrink-0 flex-grow-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">3</div>
                 <div className="w-full">
                    <h3 className="font-semibold text-lg">Customize Certificate Fields</h3>
                    <div className="grid md:grid-cols-2 gap-8 mt-4">
                        <div>
                            <div className="space-y-3">
                                {availableFields.map(field => (
                                    <div key={field.id} className="flex items-center space-x-2">
                                        <Checkbox 
                                            id={field.id} 
                                            checked={formData.customFields.includes(field.id)}
                                            onCheckedChange={(checked) => handleFieldChange(field.id, !!checked)}
                                            disabled={field.required}
                                        />
                                        <label htmlFor={field.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                            {field.label} {field.required && <span className="text-destructive">*</span>}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4 text-muted-foreground">Live Preview</h4>
                            <CertificatePreview templateId={formData.templateId} fields={formData.customFields} aiDesignUrl={formData.aiDesignUrl} />
                        </div>
                    </div>
                 </div>
            </div>
        </div>
        
        <div className="space-y-6 p-6 border rounded-lg">
            <div className="flex items-start gap-4">
                 <div className="flex-shrink-0 flex-grow-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">4</div>
                 <div className="w-full">
                    <h3 className="font-semibold text-lg">Choose Delivery Methods</h3>
                    <div className="space-y-4 mt-4">
                         <div className="flex items-center space-x-3 p-4 border rounded-md has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                            <Checkbox id="email-delivery" onCheckedChange={(checked) => handleDeliveryChange('email', !!checked)} checked={formData.deliveryMethods.includes('email')}/>
                            <label htmlFor="email-delivery" className="w-full cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <Mail className="text-primary"/>
                                    <div>
                                        <p className="font-medium">Email Delivery</p>
                                        <p className="text-sm text-muted-foreground">Send certificates directly to participants' inboxes.</p>
                                    </div>
                                </div>
                            </label>
                        </div>
                        <div className="flex items-center space-x-3 p-4 border rounded-md has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                            <Checkbox id="whatsapp-delivery" onCheckedChange={(checked) => handleDeliveryChange('whatsapp', !!checked)} checked={formData.deliveryMethods.includes('whatsapp')}/>
                             <label htmlFor="whatsapp-delivery" className="w-full cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <Send className="text-primary"/>
                                    <div>
                                        <p className="font-medium">WhatsApp Delivery (Simulated)</p>
                                        <p className="text-sm text-muted-foreground">Generate a shareable link for WhatsApp.</p>
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>
                 </div>
            </div>
        </div>

        <div className="space-y-6 p-6 border rounded-lg">
             <div className="flex items-start gap-4">
                <div className="flex-shrink-0 flex-grow-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">5</div>
                <div className="w-full">
                     <h3 className="font-semibold text-lg">Generate & Track</h3>
                     <div className="text-center mt-4">
                        <p className="text-muted-foreground mb-4">You are about to generate and send certificates to {isLoadingParticipants ? '...' : (participantsForEvent?.length ?? 0)} participants.</p>
                        <Button size="lg" onClick={handleGenerate} disabled={!formData.eventId || !formData.templateId || (formData.templateId === 'ai' && !formData.aiDesignUrl) || formData.deliveryMethods.length === 0 || isLoadingParticipants || (participantsForEvent?.length ?? 0) === 0}>
                            Generate Certificates
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}

