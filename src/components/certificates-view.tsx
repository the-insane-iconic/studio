
"use client";

import React, { useState, useMemo } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronsUpDown, Mail, Send, CheckCircle, XCircle, Loader2, Sparkles, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
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
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    eventId: '',
    templateId: '',
    customFields: availableFields.filter(f => f.required).map(f => f.id),
    deliveryMethods: [],
    aiDesignUrl: null,
    aiPrompt: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generationStatus, setGenerationStatus] = useState<'success' | 'failed' | null>(null);

  const firestore = useFirestore();
  const { toast } = useToast();

  const eventsQuery = useMemoFirebase(() => collection(firestore, 'events'), [firestore]);
  const { data: events, isLoading: isLoadingEvents } = useCollection<Event>(eventsQuery);

  const selectedEvent = useMemo(() => events?.find(e => e.id === formData.eventId), [events, formData.eventId]);

  const participantsQuery = useMemoFirebase(() => 
    formData.eventId ? query(collection(firestore, 'participants'), where('eventId', '==', formData.eventId)) : null
  , [firestore, formData.eventId]);
  const { data: participantsForEvent, isLoading: isLoadingParticipants } = useCollection<Participant>(participantsQuery);


  const handleNext = () => setStep(prev => Math.min(prev + 1, 5));
  const handlePrev = () => setStep(prev => Math.max(prev - 1, 1));

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

    setIsProcessing(true);
    setGenerationStatus(null);
    let processedCount = 0;

    toast({
        title: 'Processing Started!',
        description: `${participantsForEvent.length} certificates are being generated in the background.`,
    });

    const certificatesCollection = collection(firestore, 'certificates');
    
    participantsForEvent.forEach(participant => {
        // 1. Create a new certificate document (non-blocking)
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

        // 2. Update the participant's certificate status (non-blocking)
        const participantRef = doc(firestore, 'participants', participant.id);
        updateDocumentNonBlocking(participantRef, { certificateStatus: 'Sent' });

        // 3. Trigger email sending flow if selected (non-blocking)
        if (formData.deliveryMethods.includes('email')) {
             sendCertificateEmail({
                recipientEmail: participant.email,
                recipientName: participant.name,
                eventName: selectedEvent.title,
                certificateDataUrl: formData.templateId === 'ai' ? formData.aiDesignUrl : undefined,
             }).then(result => {
                if (result.success) {
                    console.log(`Email flow triggered for ${participant.email}`);
                } else {
                    console.error(`Email flow failed for ${participant.email}: ${result.message}`);
                    // Optionally, update participant status to 'Failed'
                    updateDocumentNonBlocking(participantRef, { certificateStatus: 'Failed' });
                }
             });
        }
        
        processedCount++;
        setProgress((processedCount / participantsForEvent.length) * 100);
    });

    // Since operations are non-blocking, we can immediately show completion
    setGenerationStatus('success');
    setIsProcessing(false); // Update UI to show completion
  };
  
  const resetWorkflow = () => {
    setStep(1);
    setFormData({ eventId: '', templateId: '', customFields: availableFields.filter(f => f.required).map(f => f.id), deliveryMethods: [], aiDesignUrl: null, aiPrompt: '' });
    setIsProcessing(false);
    setProgress(0);
    setGenerationStatus(null);
  };


  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Certificate Generation Workflow</CardTitle>
        <CardDescription>Step {step} of 5: {
            ['Event Selection', 'Template Selection', 'Field Customization', 'Delivery Methods', 'Generate & Track'][step - 1]
        }</CardDescription>
        {step < 5 && <div className="pt-2">
            <Progress value={step * 20} className="w-full" />
        </div>}
      </CardHeader>
      <CardContent>
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Select an Event</h3>
            <Select onValueChange={(value) => setFormData(prev => ({ ...prev, eventId: value }))} value={formData.eventId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an event..." />
              </SelectTrigger>
              <SelectContent>
                {isLoadingEvents && <div className="flex items-center justify-center p-4"><Loader2 className="h-5 w-5 animate-spin"/></div>}
                {events?.map(event => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.title} ({event.participantCount} participants)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedEvent && <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>}
          </div>
        )}
        
        {step === 2 && (
            <div>
                <h3 className="font-semibold mb-4">Select a Template</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {certificateTemplates.map(template => (
                        <Card 
                            key={template.id} 
                            onClick={() => setFormData(p => ({...p, templateId: template.id}))}
                            className={`cursor-pointer transition-all ${formData.templateId === template.id ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
                        >
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
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
        )}

        {step === 3 && (
            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <h3 className="font-semibold mb-4">Customize Certificate Fields</h3>
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
                    <h3 className="font-semibold mb-4">Live Preview</h3>
                    <CertificatePreview templateId={formData.templateId} fields={formData.customFields} aiDesignUrl={formData.aiDesignUrl} />
                </div>
            </div>
        )}
        
        {step === 4 && (
            <div>
                <h3 className="font-semibold mb-4">Choose Delivery Methods</h3>
                <div className="space-y-4">
                     <div className="flex items-center space-x-3 p-4 border rounded-md has-[:checked]:bg-accent/20 has-[:checked]:border-accent">
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
                    <div className="flex items-center space-x-3 p-4 border rounded-md has-[:checked]:bg-accent/20 has-[:checked]:border-accent">
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
        )}

        {step === 5 && (
            <div className="text-center">
                {!isProcessing && !generationStatus && (
                    <>
                        <h3 className="font-semibold mb-2">Ready to Generate?</h3>
                        <p className="text-muted-foreground mb-4">A summary of your selections:</p>
                        <div className="text-left max-w-md mx-auto bg-muted/50 rounded-lg p-4 space-y-2 mb-6">
                            <p><strong>Event:</strong> {selectedEvent?.title || 'N/A'}</p>
                            <p><strong>Participants:</strong> {isLoadingParticipants ? <Loader2 className="h-4 w-4 animate-spin inline-flex"/> : (participantsForEvent?.length ?? 0)}</p>
                            <p><strong>Template:</strong> {certificateTemplates.find(t => t.id === formData.templateId)?.name || 'N/A'}</p>
                            <p><strong>Delivery Methods:</strong> {formData.deliveryMethods.map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(', ') || 'N/A'}</p>
                        </div>
                        <Button size="lg" onClick={handleGenerate} disabled={!formData.eventId || !formData.templateId || (formData.templateId === 'ai' && !formData.aiDesignUrl) || formData.deliveryMethods.length === 0 || isLoadingParticipants || (participantsForEvent?.length ?? 0) === 0}>
                            Generate {(participantsForEvent?.length ?? 0)} Certificates
                        </Button>
                    </>)}
                {isProcessing && (
                     <div className="flex flex-col items-center gap-4">
                        <Loader2 className="size-16 text-primary animate-spin" />
                        <h3 className="text-xl font-semibold">Processing...</h3>
                        <p className="text-muted-foreground">Your certificates are being generated and sent.</p>
                        <Progress value={progress} className="w-1/2" />
                    </div>
                )}
                {generationStatus === 'success' && !isProcessing && (
                    <div className="flex flex-col items-center gap-4">
                        <CheckCircle className="size-16 text-green-500" />
                        <h3 className="text-xl font-semibold">Generation Complete!</h3>
                        <p className="text-muted-foreground">{(participantsForEvent?.length ?? 0)} certificates have been processed.</p>
                        <Button onClick={resetWorkflow}>Start a New Batch</Button>
                    </div>
                )}
                {generationStatus === 'failed' && (
                     <div className="flex flex-col items-center gap-4">
                        <XCircle className="size-16 text-destructive" />
                        <h3 className="text-xl font-semibold">Generation Failed</h3>
                        <p className="text-muted-foreground">Something went wrong. Please check the console and try again.</p>
                        <Button onClick={handleGenerate} variant="destructive">Try Again</Button>
                    </div>
                )}
            </div>
        )}

        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={handlePrev} disabled={step === 1 || isProcessing || !!generationStatus}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          {step < 5 ? (
            <Button onClick={handleNext} disabled={(step === 1 && !formData.eventId) || (step === 2 && !formData.templateId) || (step === 2 && formData.templateId === 'ai' && !formData.aiDesignUrl) || (step === 4 && formData.deliveryMethods.length === 0)}>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : <div/>}
        </div>
      </CardContent>
    </Card>
  );
}
